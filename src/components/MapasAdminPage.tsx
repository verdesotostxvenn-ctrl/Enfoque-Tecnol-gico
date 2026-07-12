import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Database, FileArchive, ImagePlus, Layers3, MapPin, UploadCloud, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  MAP_RESOURCES,
  type MapResource,
  type MapResourceId,
  fileMatchesResource,
  findAssociatedFiles,
  findResourceFile,
  getMapResource
} from '../config/mapResources';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import {
  dataUrlToBlob,
  loadGeoTiffRaster,
  parseKmlInstitutions,
  parseWorldFileContent,
  positionInstitutionPoints,
  rasterToPortablePayload,
  renderRasterToDataUrl,
  susceptibilityLegend,
  type GeoTiffRaster,
  type InstitutionPoint
} from '../utils/geotiffRenderer';
import { saveLocalHazardMap } from '../utils/localMapStore';

type FolderInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory?: string;
  directory?: string;
};

type PreparedMap = {
  resource: MapResource;
  files: File[];
  tifFile: File;
  raster: GeoTiffRaster;
  previewDataUrl: string;
  points: InstitutionPoint[];
};

type PublishResult = {
  mode: 'remote' | 'local';
  warning?: string;
};

const cleanPath = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9._/-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^[-/]+|[-/]+$/g, '');

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error || 'Error desconocido');

const MapasAdminPage = () => {
  const navigate = useNavigate();
  const [selectedMapId, setSelectedMapId] = useState<MapResourceId>('inundaciones');
  const selectedResource = getMapResource(selectedMapId);
  const [files, setFiles] = useState<File[]>([]);
  const [raster, setRaster] = useState<GeoTiffRaster | null>(null);
  const [points, setPoints] = useState<InstitutionPoint[]>([]);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [status, setStatus] = useState('Elige el tipo de mapa o sube toda la carpeta completa de amenazas naturales.');
  const [bulkStatus, setBulkStatus] = useState<string[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isBulkPublishing, setIsBulkPublishing] = useState(false);
  const [lastError, setLastError] = useState('');

  const tifFile = useMemo(() => findResourceFile(files, selectedResource, /\.tiff?$/i), [files, selectedResource]);
  const tfwFile = useMemo(() => findResourceFile(files, selectedResource, /\.tfw$/i), [files, selectedResource]);
  const kmlFile = useMemo(() => files.find((file) => /\.kml$/i.test(file.name)), [files]);
  const positionedPoints = useMemo(() => points.filter((point) => point.insideMap && point.xRatio !== undefined && point.yRatio !== undefined), [points]);
  const detectedMaps = useMemo(() => MAP_RESOURCES.map((resource) => ({
    resource,
    tif: files.find((file) => /\.tiff?$/i.test(file.name) && fileMatchesResource(file, resource))
  })).filter((item) => Boolean(item.tif)), [files]);

  const resetPreview = () => {
    setRaster(null);
    setPoints([]);
    setPreviewDataUrl('');
    setLastError('');
    setBulkStatus([]);
  };

  const prepareMap = async (selected: File[], resource: MapResource): Promise<PreparedMap> => {
    const associatedFiles = findAssociatedFiles(selected, resource);
    const tif = findResourceFile(associatedFiles, resource, /\.tiff?$/i);

    if (!tif) throw new Error(`No encontré TIF para ${resource.shortTitle}.`);

    const tfw = findResourceFile(associatedFiles, resource, /\.tfw$/i);
    const kml = selected.find((file) => /\.kml$/i.test(file.name));
    const geoReference = tfw ? parseWorldFileContent(await tfw.text()) : null;
    const loadedRaster = await loadGeoTiffRaster(tif, 1200, geoReference);
    let finalRaster = loadedRaster;
    let parsedPoints: InstitutionPoint[] = [];

    if (kml) {
      parsedPoints = parseKmlInstitutions(await kml.text());
      parsedPoints = positionInstitutionPoints(parsedPoints, loadedRaster);
      finalRaster = { ...loadedRaster, points: parsedPoints };
    }

    return {
      resource,
      files: associatedFiles.length ? associatedFiles : selected,
      tifFile: tif,
      raster: finalRaster,
      previewDataUrl: renderRasterToDataUrl(finalRaster, susceptibilityLegend),
      points: parsedPoints
    };
  };

  const processSelectedFiles = async (selected: File[], resource = selectedResource) => {
    setFiles(selected);
    resetPreview();
    setIsRendering(true);
    setStatus(`Leyendo ${resource.shortTitle}...`);

    try {
      const prepared = await prepareMap(selected, resource);
      setRaster(prepared.raster);
      setPoints(prepared.points);
      setPreviewDataUrl(prepared.previewDataUrl);

      const insideCount = prepared.points.filter((point) => point.insideMap).length;
      const geoText = prepared.raster.geoReference ? `Georreferencia: ${prepared.raster.geoReference.source}.` : 'Sin georreferencia detectada.';
      const pointText = kmlFile || prepared.points.length ? ` Puntos KML: ${insideCount}/${prepared.points.length} dentro del mapa.` : ' Sin KML de instituciones.';
      setStatus(`Vista previa lista para ${resource.shortTitle}. ${geoText}${pointText}`);
    } catch (error) {
      console.error(error);
      setLastError(getErrorMessage(error));
      setStatus('Error al renderizar el mapa.');
    } finally {
      setIsRendering(false);
    }
  };

  const folderInputProps: FolderInputProps = {
    type: 'file',
    multiple: true,
    webkitdirectory: '',
    directory: '',
    onChange: async (event) => processSelectedFiles(Array.from(event.currentTarget.files || []))
  };

  const handleSelectMap = (id: MapResourceId) => {
    setSelectedMapId(id);
    resetPreview();
    setStatus(`Listo para revisar ${getMapResource(id).shortTitle}. Puedes elegir la carpeta completa o publicar todo de una.`);
  };

  const savePreparedMap = async (prepared: PreparedMap): Promise<PublishResult> => {
    const updatedAt = new Date().toISOString();
    const rasterPayload = rasterToPortablePayload(prepared.raster);

    await saveLocalHazardMap({
      id: prepared.resource.id,
      title: prepared.resource.title,
      description: prepared.resource.description,
      previewDataUrl: prepared.previewDataUrl,
      raster: rasterPayload,
      updatedAt
    });

    if (!isSupabaseConfigured) {
      return {
        mode: 'local',
        warning: 'Supabase no está configurado; el mapa quedó disponible en este navegador.'
      };
    }

    const folder = `${prepared.resource.storagePrefix}/${Date.now()}`;
    let tifStoragePath = '';

    try {
      for (const file of prepared.files) {
        const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
        const withoutRoot = relativePath.split('/').slice(1).join('/') || file.name;
        const storagePath = `${folder}/${cleanPath(withoutRoot)}`;

        const { error } = await supabase.storage.from('mapas').upload(storagePath, file, {
          upsert: true,
          contentType: file.type || 'application/octet-stream'
        });
        if (error) throw error;
        if (file === prepared.tifFile) tifStoragePath = storagePath;
      }

      const previewBlob = await dataUrlToBlob(prepared.previewDataUrl);
      const previewPath = `${folder}/preview-renderizado.png`;
      const { error: previewError } = await supabase.storage.from('mapas').upload(previewPath, previewBlob, {
        upsert: true,
        contentType: 'image/png'
      });
      if (previewError) throw previewError;

      const rasterBlob = new Blob([JSON.stringify(rasterPayload)], { type: 'application/json' });
      const rasterPath = `${folder}/raster.json`;
      const { error: rasterError } = await supabase.storage.from('mapas').upload(rasterPath, rasterBlob, {
        upsert: true,
        contentType: 'application/json'
      });
      if (rasterError) throw rasterError;

      const { data: tifPublic } = supabase.storage.from('mapas').getPublicUrl(tifStoragePath);
      const { data: previewPublic } = supabase.storage.from('mapas').getPublicUrl(previewPath);

      const { error: dbError } = await supabase.from('mapas_recursos').upsert({
        id: prepared.resource.id,
        titulo: prepared.resource.title,
        descripcion: prepared.resource.description,
        tif_url: tifPublic.publicUrl,
        preview_url: previewPublic.publicUrl,
        storage_folder: folder,
        updated_at: updatedAt
      });
      if (dbError) throw dbError;

      return { mode: 'remote' };
    } catch (error) {
      console.warn(`Publicación remota de ${prepared.resource.id} no disponible; se usará copia local:`, error);
      return {
        mode: 'local',
        warning: `La copia en internet no se pudo completar (${getErrorMessage(error)}), pero el mapa ya funciona en este navegador.`
      };
    }
  };

  const publicarMapa = async () => {
    setIsPublishing(true);
    setLastError('');
    setStatus(`Preparando ${selectedResource.shortTitle}...`);

    try {
      const prepared = raster && previewDataUrl && tifFile
        ? { resource: selectedResource, files: findAssociatedFiles(files, selectedResource), tifFile, raster, previewDataUrl, points }
        : await prepareMap(files, selectedResource);
      const result = await savePreparedMap(prepared);

      if (result.mode === 'remote') {
        setStatus(`${selectedResource.shortTitle} publicado correctamente. Los estudiantes ya lo verán en /mapas.`);
      } else {
        setStatus(`${selectedResource.shortTitle} ya está disponible en este navegador. ${result.warning || ''}`);
      }
    } catch (error) {
      console.error(error);
      setLastError(getErrorMessage(error));
      setStatus('No se pudo preparar el mapa.');
    } finally {
      setIsPublishing(false);
    }
  };

  const publicarTodos = async () => {
    if (!files.length) {
      setLastError('Primero selecciona la carpeta completa de Amenazas Naturales.');
      return;
    }

    setIsBulkPublishing(true);
    setLastError('');
    setBulkStatus([]);

    const log = (message: string) => setBulkStatus((previous) => [...previous, message]);
    let localCount = 0;
    let remoteCount = 0;

    try {
      for (const resource of MAP_RESOURCES) {
        const hasTif = files.some((file) => /\.tiff?$/i.test(file.name) && fileMatchesResource(file, resource));
        if (!hasTif) {
          log(`⚠️ ${resource.shortTitle}: no encontrado en la carpeta.`);
          continue;
        }

        setStatus(`Procesando ${resource.shortTitle}...`);
        log(`⏳ Procesando ${resource.shortTitle}...`);
        const prepared = await prepareMap(files, resource);
        const result = await savePreparedMap(prepared);
        const inside = (prepared.raster.points || []).filter((point) => point.insideMap).length;

        if (result.mode === 'remote') {
          remoteCount += 1;
          log(`✅ ${resource.shortTitle}: publicado en internet con ${inside} puntos.`);
        } else {
          localCount += 1;
          log(`✅ ${resource.shortTitle}: guardado en este navegador con ${inside} puntos.`);
        }
      }

      setStatus(
        remoteCount > 0
          ? `Listo: ${remoteCount} mapa(s) publicados y ${localCount} guardados localmente. Abre /mapas para revisarlos.`
          : `Listo: ${localCount} mapa(s) ya están disponibles en este navegador. Abre /mapas para revisarlos.`
      );
    } catch (error) {
      console.error(error);
      const message = getErrorMessage(error);
      setLastError(message);
      log(`❌ ${message}`);
      setStatus('Uno de los archivos no se pudo preparar. Los mapas anteriores sí quedaron guardados.');
    } finally {
      setIsBulkPublishing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#010413] text-white p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-44 -right-32 h-[34rem] w-[34rem] rounded-full bg-cyan-500/20 blur-[130px]" />
        <div className="absolute -bottom-44 -left-32 h-[34rem] w-[34rem] rounded-full bg-orange-500/18 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:34px_34px] opacity-35" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl space-y-5">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-5 md:p-7 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
          <div className="flex flex-wrap gap-3 mb-5">
            <button onClick={() => navigate('/mapas')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 hover:bg-white/15"><ArrowLeft size={16} /> Ver mapa público</button>
            <button onClick={() => navigate('/hub')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 hover:bg-white/15">Volver al hub</button>
          </div>
          <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.32em] mb-2">Administrador / Mapas GIS</p>
          <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-none">Publicar carpeta completa</h1>
          <p className="mt-4 max-w-3xl text-slate-300 font-semibold leading-relaxed">Sube una sola carpeta con todos los TIF/TFW/KML. Aunque Supabase no esté disponible, los mapas quedarán guardados en este navegador para poder probar la experiencia infantil.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MAP_RESOURCES.map((resource) => (
            <button key={resource.id} onClick={() => handleSelectMap(resource.id)} className={`rounded-[1.6rem] border p-4 text-left transition-all ${selectedMapId === resource.id ? 'border-cyan-300 bg-cyan-400/15' : 'border-white/10 bg-white/5 hover:border-cyan-300/40'}`}>
              <div className={`mb-4 h-2 rounded-full bg-gradient-to-r ${resource.accent}`} />
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Mapa de amenaza</p>
              <h2 className="mt-1 text-xl font-black">{resource.shortTitle}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-400">{resource.subtitle}</p>
            </button>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-5">
          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl space-y-4 xl:sticky xl:top-4 self-start">
            <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-400/10 p-4">
              <div className="flex items-center gap-3 mb-3"><FileArchive className="text-cyan-300" /><h2 className="text-xl font-black">Carpeta GIS completa</h2></div>
              <p className="text-sm text-slate-300 font-semibold leading-relaxed">Selecciona “Amenazas Naturales”. Luego publica un mapa individual o todos los encontrados.</p>
            </div>

            <label className="block rounded-[1.5rem] border border-dashed border-white/20 bg-slate-950/60 p-5 text-center hover:border-cyan-300/50 transition-colors">
              <UploadCloud className="mx-auto mb-3 text-cyan-300" size={44} />
              <span className="block text-lg font-black">Seleccionar carpeta completa</span>
              <span className="mt-2 block text-sm text-slate-400 font-semibold">Incluye todos los .tif, .tfw, .dbf, .ovr y el KML.</span>
              <input {...folderInputProps} className="sr-only" />
            </label>

            <label className="block rounded-[1.5rem] border border-dashed border-orange-300/25 bg-orange-400/10 p-4 text-center hover:border-orange-300/60 transition-colors">
              <MapPin className="mx-auto mb-2 text-orange-300" size={36} />
              <span className="block text-base font-black">O seleccionar archivos sueltos</span>
              <span className="mt-1 block text-xs text-slate-400 font-semibold">Sirve si los archivos están en carpetas diferentes.</span>
              <input type="file" multiple accept=".tif,.tiff,.tfw,.kml,.xml,.ovr,.dbf,.cpg,.shp,.shx,.prj,.sbn,.sbx" onChange={(event) => processSelectedFiles(Array.from(event.currentTarget.files || []))} className="sr-only" />
            </label>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-300 mb-2">Detectados en carpeta</p>
              <div className="grid grid-cols-1 gap-2">
                {MAP_RESOURCES.map((resource) => {
                  const found = detectedMaps.some((item) => item.resource.id === resource.id);
                  return <div key={resource.id} className={`rounded-xl border px-3 py-2 text-xs font-black ${found ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-slate-950/50 text-slate-500'}`}>{found ? '✅' : '—'} {resource.shortTitle}</div>;
                })}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300 mb-2">Estado</p>
              <p className="text-sm font-bold text-slate-300">{status}</p>
              {lastError && <p className="mt-3 flex items-start gap-2 text-sm font-bold text-red-300"><XCircle className="shrink-0" size={18} /> {lastError}</p>}
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300 mb-2">Vista individual</p>
              <p className="text-sm font-semibold text-slate-300">Mapa activo: {selectedResource.shortTitle}</p>
              <p className="text-sm font-semibold text-slate-300">Archivos: {files.length}</p>
              <p className="text-sm font-semibold text-slate-300">GeoTIFF: {tifFile ? tifFile.name : 'No encontrado'}</p>
              <p className="text-sm font-semibold text-slate-300">World file: {tfwFile ? tfwFile.name : 'No encontrado'}</p>
              <p className="text-sm font-semibold text-slate-300">KML: {kmlFile ? kmlFile.name : 'No encontrado'}</p>
              <p className="text-sm font-semibold text-slate-300">Puntos dentro: {positionedPoints.length}/{points.length}</p>
              <p className="text-sm font-semibold text-slate-300">Raster web: {raster ? `${raster.width} × ${raster.height}` : 'Pendiente'}</p>
            </div>

            <button onClick={publicarTodos} disabled={!files.length || isRendering || isPublishing || isBulkPublishing} className="w-full rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"><Layers3 size={18} /> {isBulkPublishing ? 'Preparando carpeta...' : 'Publicar todos los detectados'}</button>
            <button onClick={publicarMapa} disabled={!files.length || isRendering || isPublishing || isBulkPublishing} className="w-full rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"><Database size={18} /> {isPublishing ? 'Preparando...' : `Publicar solo ${selectedResource.shortTitle}`}</button>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">Vista previa individual</p><h2 className="text-2xl font-black">{selectedResource.title}</h2></div>{raster && <div className="rounded-2xl bg-emerald-400/10 border border-emerald-300/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-200 flex items-center gap-2"><CheckCircle2 size={16} /> Lista</div>}</div>

            <div className="relative min-h-[520px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-white flex items-center justify-center">
              {isRendering && <div className="text-center"><ImagePlus className="mx-auto mb-4 text-cyan-500 animate-pulse" size={54} /><p className="text-lg font-black text-slate-900">Renderizando GeoTIFF...</p><p className="mt-2 text-sm font-semibold text-slate-500">Puede tardar si el archivo es pesado.</p></div>}
              {!isRendering && previewDataUrl && <div className="relative max-h-[70vh] max-w-full"><img src={previewDataUrl} alt="Vista previa del mapa renderizado" className="max-h-[70vh] max-w-full object-contain" />{positionedPoints.map((point) => <span key={point.id} title={point.name} className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-500 shadow-lg" style={{ left: `${(point.xRatio || 0) * 100}%`, top: `${(point.yRatio || 0) * 100}%` }} />)}</div>}
              {!isRendering && !previewDataUrl && <div className="text-center p-8"><ImagePlus className="mx-auto mb-4 text-slate-400" size={54} /><p className="text-lg font-black text-slate-700">Aún no hay vista previa</p><p className="mt-2 text-sm font-semibold text-slate-500">Selecciona la carpeta completa. Después elige publicar uno o todos.</p></div>}
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-3">{susceptibilityLegend.map((item) => <div key={item.value} className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="h-8 rounded-xl border border-white/20 mb-2" style={{ backgroundColor: item.color }} /><p className="text-xs font-black">{item.label}</p><p className="text-[10px] text-slate-500 font-bold">Valor {item.value}</p>{raster && <p className="text-[10px] text-slate-400 font-bold">{raster.counts[item.value].toLocaleString('es-EC')} celdas</p>}</div>)}</div>

            {bulkStatus.length > 0 && <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300 mb-3">Registro de preparación</p><div className="space-y-2">{bulkStatus.map((item, index) => <p key={`${item}-${index}`} className="text-sm font-bold text-slate-300">{item}</p>)}</div></div>}
          </section>
        </section>
      </section>
    </main>
  );
};

export default MapasAdminPage;
