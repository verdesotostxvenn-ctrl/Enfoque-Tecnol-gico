import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileArchive, FolderOpen, Loader2, MapPinned, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TerritorialMapView from './TerritorialMapView';
import {
  parseTerritorialFiles,
  publishTerritorialMaps,
  type GeoJsonFeatureCollection
} from '../utils/territorialMaps';

type FolderInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory?: string;
  directory?: string;
};

const TerritorialAdminPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [cantones, setCantones] = useState<GeoJsonFeatureCollection | null>(null);
  const [parroquias, setParroquias] = useState<GeoJsonFeatureCollection | null>(null);
  const [status, setStatus] = useState('Selecciona la carpeta completa o un ZIP con Cantones y Parroquias.');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const detected = useMemo(() => {
    const names = files.map((file) => file.name.toLowerCase());
    return {
      shp: names.filter((name) => name.endsWith('.shp')).length,
      dbf: names.filter((name) => name.endsWith('.dbf')).length,
      shx: names.filter((name) => name.endsWith('.shx')).length,
      prj: names.filter((name) => name.endsWith('.prj')).length,
      zip: names.filter((name) => name.endsWith('.zip')).length
    };
  }, [files]);

  const process = async (selected: File[]) => {
    setFiles(selected);
    setError('');
    setCantones(null);
    setParroquias(null);
    setProcessing(true);
    setStatus('Leyendo archivos territoriales...');
    try {
      const parsed = await parseTerritorialFiles(selected);
      setCantones(parsed.cantones);
      setParroquias(parsed.parroquias);
      setStatus(`Vista previa lista: ${parsed.cantones.features.length} cantones y ${parsed.parroquias.features.length} parroquias detectadas.`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudieron leer los archivos territoriales.');
      setStatus('No se pudo preparar la vista previa.');
    } finally {
      setProcessing(false);
    }
  };

  const folderProps: FolderInputProps = {
    type: 'file',
    multiple: true,
    webkitdirectory: '',
    directory: '',
    onChange: (event) => process(Array.from(event.currentTarget.files || []))
  };

  const publish = async () => {
    if (!cantones || !parroquias) {
      setError('Primero procesa la carpeta y espera la vista previa de ambos mapas.');
      return;
    }
    setPublishing(true);
    setError('');
    setStatus('Publicando mapas territoriales...');
    try {
      await publishTerritorialMaps(cantones, parroquias);
      setStatus('Mapas territoriales publicados. Ya aparecerán en la bienvenida de los estudiantes.');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudieron publicar los mapas.');
      setStatus('Error al publicar.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#010413] p-4 text-white md:p-6">
      <section className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl md:p-7">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/admin/mapas')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-white/15"><ArrowLeft size={16} /> Volver a mapas</button>
            <button onClick={() => navigate('/hub')} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-xs font-black uppercase tracking-wider text-cyan-100 hover:bg-cyan-400/20"><MapPinned size={16} /> Centro de mando</button>
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[.32em] text-cyan-300">Gestión territorial</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">Cantones y parroquias</h1>
          <p className="mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-slate-400 md:text-base">Sube la carpeta completa sin separar archivos. El sistema reúne cada .shp con sus .dbf, .shx, .prj y .cpg, convierte ambos mapas y los publica para la introducción interactiva.</p>
        </header>

        <section className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
              <div className="rounded-[1.5rem] border border-dashed border-cyan-300/30 bg-cyan-400/5 p-5">
                <FolderOpen className="text-cyan-300" size={34} />
                <h2 className="mt-4 text-2xl font-black">Carpeta completa</h2>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-400">Debe contener los grupos Cantones.* y Parroquias.*. También puedes subir un ZIP que conserve esos nombres.</p>
                <div className="mt-5 grid gap-3">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-cyan-200">
                    <FolderOpen size={18} /> Elegir carpeta
                    <input {...folderProps} className="hidden" />
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xs font-black uppercase tracking-widest hover:bg-white/10">
                    <FileArchive size={18} /> Elegir ZIP
                    <input type="file" accept=".zip" className="hidden" onChange={(event) => process(Array.from(event.currentTarget.files || []))} />
                  </label>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-5 gap-2 text-center">
                {Object.entries(detected).map(([key, value]) => <div key={key} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"><div className="text-xl font-black text-white">{value}</div><div className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-500">.{key}</div></div>)}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm font-semibold text-slate-300">{processing ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={17} /> {status}</span> : status}</div>
              {error && <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-100">{error}</div>}

              <button onClick={publish} disabled={!cantones || !parroquias || publishing} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-30">
                {publishing ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                {publishing ? 'Publicando...' : 'Publicar territorio'}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3"><CheckCircle2 className="text-red-400" /><div><p className="text-[10px] font-black uppercase tracking-[.25em] text-red-300">Vista provincial</p><h2 className="text-2xl font-black">Cantones de Tungurahua</h2></div></div>
              <TerritorialMapView collection={cantones} mode="cantones" />
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3"><CheckCircle2 className="text-emerald-400" /><div><p className="text-[10px] font-black uppercase tracking-[.25em] text-emerald-300">Vista cantonal</p><h2 className="text-2xl font-black">Parroquias de Baños</h2></div></div>
              <TerritorialMapView collection={parroquias} mode="parroquias" />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
};

export default TerritorialAdminPage;
