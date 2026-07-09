import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Database, FileArchive, ImagePlus, UploadCloud, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import {
  dataUrlToBlob,
  loadGeoTiffRaster,
  rasterToPortablePayload,
  renderRasterToDataUrl,
  susceptibilityLegend,
  type GeoTiffRaster
} from '../utils/geotiffRenderer';

type FolderInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory?: string;
  directory?: string;
};

const cleanPath = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._/-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-/]+|[-/]+$/g, '');
};

const MapasAdminPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [raster, setRaster] = useState<GeoTiffRaster | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [status, setStatus] = useState('Selecciona la carpeta o todos los archivos del mapa GIS.');
  const [isRendering, setIsRendering] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastError, setLastError] = useState('');

  const tifFile = useMemo(() => {
    return files.find((file) => /\.tiff?$/i.test(file.name));
  }, [files]);

  const folderInputProps: FolderInputProps = {
    type: 'file',
    multiple: true,
    webkitdirectory: '',
    directory: '',
    onChange: async (event) => {
      const selected = Array.from(event.currentTarget.files || []);
      setFiles(selected);
      setRaster(null);
      setPreviewDataUrl('');
      setLastError('');

      const tif = selected.find((file) => /\.tiff?$/i.test(file.name));

      if (!tif) {
        setStatus('No encontré un archivo .tif o .tiff dentro de la selección.');
        return;
      }

      setIsRendering(true);
      setStatus(`Leyendo ${tif.name}, extrayendo valores 1–5 y preparando vista web...`);

      try {
        const loadedRaster = await loadGeoTiffRaster(tif, 1200);
        setRaster(loadedRaster);
        setPreviewDataUrl(renderRasterToDataUrl(loadedRaster, susceptibilityLegend));
        setStatus('Vista previa lista. Se publicará PNG + raster.json para que /mapas sea interactivo.');
      } catch (error) {
        console.error(error);
        setLastError('No se pudo leer el GeoTIFF. Revisa que el .tif no esté dañado o comprimido en un formato no soportado por navegador.');
        setStatus('Error al renderizar el mapa.');
      } finally {
        setIsRendering(false);
      }
    }
  };

  const publicarMapa = async () => {
    if (!isSupabaseConfigured) {
      setLastError('Supabase no está configurado. Agrega las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel.');
      return;
    }

    if (!tifFile || !raster || !previewDataUrl) {
      setLastError('Primero selecciona la carpeta y espera la vista previa del .tif.');
      return;
    }

    setIsPublishing(true);
    setLastError('');
    setStatus('Subiendo archivos originales a Supabase Storage...');

    try {
      const folder = `inundaciones/${Date.now()}`;
      let tifStoragePath = '';

      for (const file of files) {
        const relativePath = (file as any).webkitRelativePath || file.name;
        const withoutRoot = relativePath.split('/').slice(1).join('/') || file.name;
        const storagePath = `${folder}/${cleanPath(withoutRoot)}`;

        const { error } = await supabase.storage.from('mapas').upload(storagePath, file, {
          upsert: true,
          contentType: file.type || 'application/octet-stream'
        });

        if (error) throw error;

        if (/\.tiff?$/i.test(file.name)) {
          tifStoragePath = storagePath;
        }
      }

      setStatus('Subiendo vista previa PNG optimizada...');
      const previewBlob = await dataUrlToBlob(previewDataUrl);
      const previewPath = `${folder}/preview-renderizado.png`;
      const { error: previewError } = await supabase.storage.from('mapas').upload(previewPath, previewBlob, {
        upsert: true,
        contentType: 'image/png'
      });

      if (previewError) throw previewError;

      setStatus('Subiendo raster.json para interacción rápida...');
      const rasterPayload = rasterToPortablePayload(raster);
      const rasterBlob = new Blob([JSON.stringify(rasterPayload)], { type: 'application/json' });
      const rasterPath = `${folder}/raster.json`;
      const { error: rasterError } = await supabase.storage.from('mapas').upload(rasterPath, rasterBlob, {
        upsert: true,
        contentType: 'application/json'
      });

      if (rasterError) throw rasterError;

      const { data: tifPublic } = supabase.storage.from('mapas').getPublicUrl(tifStoragePath);
      const { data: previewPublic } = supabase.storage.from('mapas').getPublicUrl(previewPath);

      setStatus('Guardando mapa publicado para los estudiantes...');
      const { error: dbError } = await supabase.from('mapas_recursos').upsert({
        id: 'inundaciones',
        titulo: 'Mapa de amenaza por inundaciones',
        descripcion: 'Mapa temático de susceptibilidad por inundaciones. El visor permite mover, acercar, identificar niveles de amenaza y cambiar la simbología.',
        tif_url: tifPublic.publicUrl,
        preview_url: previewPublic.publicUrl,
        storage_folder: folder,
        updated_at: new Date().toISOString()
      });

      if (dbError) throw dbError;

      setStatus('Mapa publicado correctamente. Ahora /mapas tendrá colores editables y tooltip de amenaza.');
    } catch (error) {
      console.error(error);
      setLastError('No se pudo publicar. Revisa que exista el bucket mapas, la tabla mapas_recursos y las políticas de Supabase.');
      setStatus('Error al publicar el mapa.');
    } finally {
      setIsPublishing(false);
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
            <button
              onClick={() => navigate('/mapas')}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 hover:bg-white/15"
            >
              <ArrowLeft size={16} /> Ver mapa público
            </button>
            <button
              onClick={() => navigate('/hub')}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 hover:bg-white/15"
            >
              Volver al hub
            </button>
          </div>

          <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.32em] mb-2">Administrador / Mapas GIS</p>
          <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-none">Publicar mapa GeoTIFF</h1>
          <p className="mt-4 max-w-3xl text-slate-300 font-semibold leading-relaxed">
            Este apartado es para ti. Los estudiantes no suben archivos: ellos solo entran a /mapas y ven el mapa que publiques aquí.
          </p>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5">
          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl space-y-4">
            <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-400/10 p-4">
              <div className="flex items-center gap-3 mb-3">
                <FileArchive className="text-cyan-300" />
                <h2 className="text-xl font-black">Archivos del mapa</h2>
              </div>
              <p className="text-sm text-slate-300 font-semibold leading-relaxed">
                Selecciona la carpeta o todos los archivos juntos: .tif, .tfw, .aux.xml, .ovr, .dbf, .cpg. El sistema publicará un raster.json para que los niños puedan interactuar sin cargar el .tif pesado.
              </p>
            </div>

            <label className="block rounded-[1.5rem] border border-dashed border-white/20 bg-slate-950/60 p-5 text-center hover:border-cyan-300/50 transition-colors">
              <UploadCloud className="mx-auto mb-3 text-cyan-300" size={44} />
              <span className="block text-lg font-black">Seleccionar carpeta del mapa</span>
              <span className="mt-2 block text-sm text-slate-400 font-semibold">También puedes seleccionar varios archivos a la vez.</span>
              <input {...folderInputProps} className="sr-only" />
            </label>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300 mb-2">Estado</p>
              <p className="text-sm font-bold text-slate-300">{status}</p>
              {lastError && (
                <p className="mt-3 flex items-start gap-2 text-sm font-bold text-red-300">
                  <XCircle className="shrink-0" size={18} /> {lastError}
                </p>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300 mb-2">Selección</p>
              <p className="text-sm font-semibold text-slate-300">Archivos: {files.length}</p>
              <p className="text-sm font-semibold text-slate-300">GeoTIFF: {tifFile ? tifFile.name : 'No encontrado'}</p>
              <p className="text-sm font-semibold text-slate-300">Raster web: {raster ? `${raster.width} × ${raster.height}` : 'Pendiente'}</p>
            </div>

            <button
              onClick={publicarMapa}
              disabled={!raster || !previewDataUrl || isRendering || isPublishing}
              className="w-full rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Database size={18} /> {isPublishing ? 'Publicando...' : 'Publicar para estudiantes'}
            </button>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">Vista previa</p>
                <h2 className="text-2xl font-black">Render por valores 1–5</h2>
              </div>
              {raster && (
                <div className="rounded-2xl bg-emerald-400/10 border border-emerald-300/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Lista
                </div>
              )}
            </div>

            <div className="relative min-h-[520px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-white flex items-center justify-center">
              {isRendering && (
                <div className="text-center">
                  <ImagePlus className="mx-auto mb-4 text-cyan-500 animate-pulse" size={54} />
                  <p className="text-lg font-black text-slate-900">Renderizando GeoTIFF...</p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">Puede tardar si el archivo es pesado.</p>
                </div>
              )}

              {!isRendering && previewDataUrl && (
                <img src={previewDataUrl} alt="Vista previa del mapa renderizado" className="max-h-[70vh] max-w-full object-contain" />
              )}

              {!isRendering && !previewDataUrl && (
                <div className="text-center p-8">
                  <ImagePlus className="mx-auto mb-4 text-slate-400" size={54} />
                  <p className="text-lg font-black text-slate-700">Aún no hay vista previa</p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">Selecciona la carpeta para generar el mapa de colores.</p>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-3">
              {susceptibilityLegend.map((item) => (
                <div key={item.value} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="h-8 rounded-xl border border-white/20 mb-2" style={{ backgroundColor: item.color }} />
                  <p className="text-xs font-black">{item.label}</p>
                  <p className="text-[10px] text-slate-500 font-bold">Valor {item.value}</p>
                  {raster && <p className="text-[10px] text-slate-400 font-bold">{raster.counts[item.value].toLocaleString('es-EC')} celdas</p>}
                </div>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
};

export default MapasAdminPage;
