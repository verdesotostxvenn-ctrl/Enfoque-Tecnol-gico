import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  FileArchive,
  ImagePlus,
  Layers3,
  Loader2,
  MapPin,
  UploadCloud,
  XCircle
} from 'lucide-react';
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
import {
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
  tifFile: File;
  raster: GeoTiffRaster;
  previewDataUrl: string;
  points: InstitutionPoint[];
};

const nextPaint = () => new Promise<void>((resolve) => {
  window.requestAnimationFrame(() => window.setTimeout(resolve, 35));
});

const FastMapAdminPage = () => {
  const navigate = useNavigate();
  const [selectedMapId, setSelectedMapId] = useState<MapResourceId>('inundaciones');
  const selectedResource = getMapResource(selectedMapId);
  const [files, setFiles] = useState<File[]>([]);
  const [raster, setRaster] = useState<GeoTiffRaster | null>(null);
  const [points, setPoints] = useState<InstitutionPoint[]>([]);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [status, setStatus] = useState('Selecciona la carpeta completa de Amenazas Naturales.');
  const [log, setLog] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const tifFile = useMemo(
    () => findResourceFile(files, selectedResource, /\.tiff?$/i),
    [files, selectedResource]
  );
  const tfwFile = useMemo(
    () => findResourceFile(files, selectedResource, /\.tfw$/i),
    [files, selectedResource]
  );
  const kmlFile = useMemo(() => files.find((file) => /\.kml$/i.test(file.name)), [files]);
  const positionedPoints = useMemo(
    () => points.filter((point) => point.insideMap && point.xRatio !== undefined && point.yRatio !== undefined),
    [points]
  );

  const detectedMaps = useMemo(
    () => MAP_RESOURCES.filter((resource) => files.some(
      (file) => /\.tiff?$/i.test(file.name) && fileMatchesResource(file, resource)
    )),
    [files]
  );

  const prepareMap = async (selected: File[], resource: MapResource): Promise<PreparedMap> => {
    const associatedFiles = findAssociatedFiles(selected, resource);
    const tif = findResourceFile(associatedFiles, resource, /\.tiff?$/i);

    if (!tif) throw new Error(`No encontré el archivo TIF de ${resource.shortTitle}.`);

    const tfw = findResourceFile(associatedFiles, resource, /\.tfw$/i);
    const kml = selected.find((file) => /\.kml$/i.test(file.name));
    const georeference = tfw ? parseWorldFileContent(await tfw.text()) : null;
    const loadedRaster = await loadGeoTiffRaster(tif, 1200, georeference);
    let finalRaster = loadedRaster;
    let parsedPoints: InstitutionPoint[] = [];

    if (kml) {
      parsedPoints = parseKmlInstitutions(await kml.text());
      parsedPoints = positionInstitutionPoints(parsedPoints, loadedRaster);
      finalRaster = { ...loadedRaster, points: parsedPoints };
    }

    return {
      resource,
      tifFile: tif,
      raster: finalRaster,
      previewDataUrl: renderRasterToDataUrl(finalRaster, susceptibilityLegend),
      points: parsedPoints
    };
  };

  const showPreview = async (selected: File[], resource = selectedResource) => {
    if (!selected.length) return;

    setFiles(selected);
    setProcessing(true);
    setError('');
    setLog([]);
    setRaster(null);
    setPoints([]);
    setPreviewDataUrl('');
    setStatus(`Leyendo ${resource.shortTitle}...`);

    try {
      await nextPaint();
      const prepared = await prepareMap(selected, resource);
      setRaster(prepared.raster);
      setPoints(prepared.points);
      setPreviewDataUrl(prepared.previewDataUrl);
      setStatus(`Vista previa lista. Encontré ${prepared.points.length} instituciones en el KML.`);
    } catch (reason) {
      console.error(reason);
      setError(reason instanceof Error ? reason.message : 'No se pudo leer el mapa.');
      setStatus('No se pudo preparar la vista previa.');
    } finally {
      setProcessing(false);
    }
  };

  const savePrepared = async (prepared: PreparedMap) => {
    await saveLocalHazardMap({
      id: prepared.resource.id,
      title: prepared.resource.title,
      description: prepared.resource.description,
      previewDataUrl: prepared.previewDataUrl,
      raster: rasterToPortablePayload(prepared.raster),
      updatedAt: new Date().toISOString()
    });
  };

  const publishOne = async () => {
    if (!files.length) {
      setError('Primero selecciona la carpeta completa.');
      return;
    }

    setPublishing(true);
    setError('');
    setStatus(`Guardando ${selectedResource.shortTitle}...`);

    try {
      await nextPaint();
      const prepared = raster && previewDataUrl && tifFile
        ? { resource: selectedResource, tifFile, raster, previewDataUrl, points }
        : await prepareMap(files, selectedResource);
      await savePrepared(prepared);
      setStatus(`${selectedResource.shortTitle} ya funciona en este navegador. Abre el mapa público para comprobarlo.`);
      window.dispatchEvent(new CustomEvent('hazardMapsUpdated', { detail: { id: selectedResource.id } }));
    } catch (reason) {
      console.error(reason);
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar el mapa.');
      setStatus('Ocurrió un error al guardar el mapa.');
    } finally {
      setPublishing(false);
    }
  };

  const publishAll = async () => {
    if (!files.length) {
      setError('Primero selecciona la carpeta completa.');
      return;
    }

    setPublishing(true);
    setError('');
    setLog([]);
    let completed = 0;
    let failed = 0;

    for (const resource of MAP_RESOURCES) {
      const exists = files.some(
        (file) => /\.tiff?$/i.test(file.name) && fileMatchesResource(file, resource)
      );

      if (!exists) {
        setLog((current) => [...current, `⚠️ ${resource.shortTitle}: no encontrado.`]);
        continue;
      }

      setStatus(`Procesando ${resource.shortTitle}...`);
      setLog((current) => [...current, `⏳ ${resource.shortTitle}: preparando...`]);
      await nextPaint();

      try {
        const prepared = await prepareMap(files, resource);
        await savePrepared(prepared);
        completed += 1;
        setLog((current) => [...current, `✅ ${resource.shortTitle}: guardado correctamente.`]);
      } catch (reason) {
        failed += 1;
        const message = reason instanceof Error ? reason.message : 'Error desconocido';
        console.error(reason);
        setLog((current) => [...current, `❌ ${resource.shortTitle}: ${message}`]);
      }
    }

    setStatus(
      failed
        ? `Proceso terminado: ${completed} mapas listos y ${failed} con error.`
        : `¡Proceso terminado! ${completed} mapas ya funcionan en este navegador.`
    );
    setPublishing(false);
    window.dispatchEvent(new Event('hazardMapsUpdated'));
  };

  const folderProps: FolderInputProps = {
    type: 'file',
    multiple: true,
    webkitdirectory: '',
    directory: '',
    onChange: (event) => showPreview(Array.from(event.currentTarget.files || []))
  };

  return (
    <main className="min-h-screen bg-[#010413] p-4 text-white md:p-6">
      <section className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl md:p-7">
          <div className="mb-5 flex flex-wrap gap-3">
            <button onClick={() => navigate('/mapas')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-wider"><ArrowLeft size={17} /> Ver mapa público</button>
            <button onClick={() => navigate('/hub')} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-wider">Volver al centro</button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[.28em] text-cyan-300">Administrador / Mapas GIS</p>
          <h1 className="mt-2 text-4xl font-black md:text-6xl">Publicar mapas sin bloqueos</h1>
          <p className="mt-3 max-w-3xl font-semibold text-slate-300">Esta versión guarda los mapas procesados en el navegador y evita la subida pesada que estaba dejando congelado el botón verde.</p>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          {MAP_RESOURCES.map((resource) => (
            <button
              key={resource.id}
              onClick={() => {
                setSelectedMapId(resource.id);
                setRaster(null);
                setPoints([]);
                setPreviewDataUrl('');
                setError('');
                setStatus(`Seleccionaste ${resource.shortTitle}.`);
              }}
              className={`rounded-[1.5rem] border p-4 text-left ${selectedMapId === resource.id ? 'border-cyan-300 bg-cyan-400/15' : 'border-white/10 bg-white/5'}`}
            >
              <div className={`mb-3 h-2 rounded-full bg-gradient-to-r ${resource.accent}`} />
              <p className="text-lg font-black">{resource.shortTitle}</p>
            </button>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[430px_1fr]">
          <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <label className="block rounded-[1.5rem] border-2 border-dashed border-cyan-300/35 bg-slate-950/60 p-6 text-center">
              <UploadCloud className="mx-auto mb-3 text-cyan-300" size={46} />
              <span className="block text-xl font-black">Elegir carpeta completa</span>
              <span className="mt-2 block text-sm font-semibold text-slate-400">Selecciona “Amenazas Naturales”.</span>
              <input {...folderProps} className="sr-only" />
            </label>

            <label className="block rounded-[1.5rem] border-2 border-dashed border-orange-300/35 bg-orange-400/10 p-5 text-center">
              <FileArchive className="mx-auto mb-2 text-orange-300" size={38} />
              <span className="font-black">Elegir archivos sueltos</span>
              <input type="file" multiple accept=".tif,.tiff,.tfw,.kml" onChange={(event) => showPreview(Array.from(event.currentTarget.files || []))} className="sr-only" />
            </label>

            <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-4">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-300">Detectados</p>
              <div className="space-y-2">
                {MAP_RESOURCES.map((resource) => (
                  <div key={resource.id} className={`rounded-xl border px-3 py-2 text-xs font-black ${detectedMaps.includes(resource) ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200' : 'border-white/10 text-slate-500'}`}>
                    {detectedMaps.includes(resource) ? '✅' : '—'} {resource.shortTitle}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-bold text-slate-300">{status}</p>
              {error && <p className="mt-3 flex gap-2 text-sm font-bold text-red-300"><XCircle size={18} className="shrink-0" />{error}</p>}
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-4 text-sm font-semibold text-slate-300">
              <p>Mapa activo: {selectedResource.shortTitle}</p>
              <p>Archivos: {files.length}</p>
              <p>GeoTIFF: {tifFile?.name || 'No encontrado'}</p>
              <p>World file: {tfwFile?.name || 'No encontrado'}</p>
              <p>KML: {kmlFile?.name || 'No encontrado'}</p>
              <p>Puntos dentro: {positionedPoints.length}/{points.length}</p>
            </div>

            <button onClick={publishAll} disabled={!files.length || processing || publishing} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black uppercase tracking-widest text-slate-950 disabled:opacity-40">
              {publishing ? <Loader2 className="animate-spin" size={19} /> : <Layers3 size={19} />}
              {publishing ? 'Procesando mapas...' : 'Publicar todos los detectados'}
            </button>
            <button onClick={publishOne} disabled={!files.length || processing || publishing} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black uppercase tracking-widest text-slate-950 disabled:opacity-40">
              <Database size={19} /> Publicar solo {selectedResource.shortTitle}
            </button>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Vista previa</p>
                <h2 className="text-2xl font-black">{selectedResource.title}</h2>
              </div>
              {raster && <span className="flex items-center gap-2 rounded-xl bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-200"><CheckCircle2 size={16} /> Lista</span>}
            </div>

            <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-[1.5rem] bg-white">
              {processing && <div className="text-center text-slate-900"><ImagePlus className="mx-auto mb-3 animate-pulse text-cyan-500" size={52} /><p className="font-black">Renderizando GeoTIFF...</p></div>}
              {!processing && previewDataUrl && (
                <div className="relative max-h-[70vh] max-w-full">
                  <img src={previewDataUrl} alt="Vista previa del mapa" className="max-h-[70vh] max-w-full object-contain" />
                  {positionedPoints.map((point) => (
                    <span key={point.id} title={point.name} className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-500" style={{ left: `${(point.xRatio || 0) * 100}%`, top: `${(point.yRatio || 0) * 100}%` }} />
                  ))}
                </div>
              )}
              {!processing && !previewDataUrl && <div className="p-8 text-center text-slate-600"><MapPin className="mx-auto mb-3 text-cyan-600" size={48} /><p className="text-xl font-black">Selecciona la carpeta para ver el mapa</p></div>}
            </div>

            {log.length > 0 && (
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-emerald-300">Registro</p>
                <div className="space-y-2">{log.map((item, index) => <p key={`${item}-${index}`} className="text-sm font-bold text-slate-300">{item}</p>)}</div>
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
};

export default FastMapAdminPage;
