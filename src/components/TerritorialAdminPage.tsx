import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Cloud, FileArchive, FolderOpen, HelpCircle, Loader2, MapPinned, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TerritorialMapView from './TerritorialMapView';
import { isSupabaseConfigured } from '../supabaseClient';
import { parseTerritorialFiles, publishTerritorialMaps, type GeoJsonFeatureCollection } from '../utils/territorialMaps';

const LOGO_URL = 'https://blogger.googleusercontent.com/img/a/AVvXsEhy3dwaYQj6R2ws_jFzJAR7c3yKKTE6lbdml-nVgm4NwaM-W-5MXjgblPUVcqzs1KnN806FhXVXwvPsl9lJyYyGnbNbuSXyvXJCZvtlYw752K1uI63zBuNOHArFLhALPQPGLWy7TsYgi0UwtCxN_PFsTchZlW6fAPQ9sbzPwjfdBWoiwfiN2lywSte4Plw';

type FolderInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory?: string;
  directory?: string;
};

const TerritorialAdminPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [cantones, setCantones] = useState<GeoJsonFeatureCollection | null>(null);
  const [parroquias, setParroquias] = useState<GeoJsonFeatureCollection | null>(null);
  const [status, setStatus] = useState('Selecciona la carpeta completa o el archivo Base.zip.');
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
    if (!selected.length) return;

    setFiles(selected);
    setError('');
    setCantones(null);
    setParroquias(null);
    setProcessing(true);
    setStatus('Abriendo los archivos y preparando los mapas...');

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 80));
      const parsed = await parseTerritorialFiles(selected);
      setCantones(parsed.cantones);
      setParroquias(parsed.parroquias);
      setStatus(`¡Listo! Detecté ${parsed.cantones.features.length} cantones y ${parsed.parroquias.features.length} parroquias.`);
    } catch (err) {
      console.error('Error territorial:', err);
      setError(err instanceof Error ? err.message : 'No se pudieron leer los archivos territoriales.');
      setStatus('La carpeta no pudo prepararse. Revisa el mensaje de ayuda.');
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
      setError('Primero selecciona la carpeta y espera que aparezcan los dos mapas.');
      return;
    }

    setPublishing(true);
    setError('');
    setStatus('Guardando los mapas para que todos los estudiantes puedan verlos...');

    try {
      const result = await publishTerritorialMaps(cantones, parroquias);
      setStatus(
        result.storageMode === 'database'
          ? '¡Publicación completa! Como no existía el bucket, el sistema guardó los mapas directamente en la base de datos. Ya aparecerán en la bienvenida.'
          : '¡Publicación completa! Los mapas ya aparecerán en la bienvenida de los estudiantes.'
      );
    } catch (err) {
      console.error('Error de publicación:', err);
      setError(err instanceof Error ? err.message : 'No se pudieron publicar los mapas.');
      setStatus('Los mapas se leyeron, pero no se pudieron guardar en internet.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-cyan-200 via-violet-200 to-amber-200 p-4 text-slate-900 md:p-7">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle,white_2px,transparent_2px)] [background-size:30px_30px]" />

      <section className="relative z-10 mx-auto max-w-7xl space-y-5">
        <header className="rounded-[2.4rem] border-4 border-white bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 p-5 text-white shadow-2xl md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-[1.8rem] border-4 border-white bg-white p-2 shadow-xl">
                <img src={LOGO_URL} alt="Logo Misión Prevención" className="h-24 w-24 object-contain md:h-32 md:w-32" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[.24em] text-yellow-200">Taller de mapas</p>
                <h1 className="mt-1 text-4xl font-black leading-none md:text-6xl">Cantones y parroquias</h1>
                <p className="mt-3 max-w-3xl text-sm font-bold text-white/90 md:text-base">Carga Base.zip o la carpeta que contiene Cantones.* y Parroquias.*. El sistema los une, los dibuja y después los publica.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/admin/mapas')} className="inline-flex items-center gap-2 rounded-2xl border-2 border-white bg-white/20 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-white/30"><ArrowLeft size={16} /> Volver</button>
              <button onClick={() => navigate('/hub')} className="inline-flex items-center gap-2 rounded-2xl bg-yellow-300 px-4 py-3 text-xs font-black uppercase tracking-wider text-violet-900 hover:bg-yellow-200"><MapPinned size={16} /> Centro de mando</button>
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
          <div className="space-y-5">
            <div className="rounded-[2.2rem] border-4 border-white bg-white/90 p-5 shadow-xl">
              <div className="rounded-[1.8rem] border-4 border-dashed border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-100 p-5">
                <FolderOpen className="text-cyan-600" size={42} />
                <h2 className="mt-3 text-3xl font-black text-slate-900">1. Elige tus archivos</h2>
                <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">No separes los archivos. Cada nombre debe conservar su compañero: .shp, .dbf, .shx y .prj.</p>

                <div className="mt-5 grid gap-3">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:-translate-y-1">
                    <FolderOpen size={18} /> Elegir carpeta completa
                    <input {...folderProps} className="hidden" />
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:-translate-y-1">
                    <FileArchive size={18} /> Elegir Base.zip
                    <input type="file" accept=".zip" className="hidden" onChange={(event) => process(Array.from(event.currentTarget.files || []))} />
                  </label>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-5 gap-2 text-center">
                {Object.entries(detected).map(([key, value], index) => (
                  <div key={key} className={`rounded-2xl border-2 p-3 shadow-sm ${['bg-rose-100 border-rose-200','bg-cyan-100 border-cyan-200','bg-violet-100 border-violet-200','bg-amber-100 border-amber-200','bg-emerald-100 border-emerald-200'][index]}`}>
                    <div className="text-2xl font-black text-slate-900">{value}</div>
                    <div className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-600">.{key}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border-4 border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
                {processing ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> {status}</span> : status}
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border-4 border-red-200 bg-red-50 p-4 text-sm font-bold leading-relaxed text-red-800">
                  <div className="mb-2 flex items-center gap-2 text-red-600"><HelpCircle size={19} /> ¿Qué ocurrió?</div>
                  {error}
                </div>
              )}

              <button onClick={publish} disabled={!cantones || !parroquias || publishing || processing} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-4 py-5 text-xs font-black uppercase tracking-widest text-white shadow-xl transition hover:-translate-y-1 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35">
                {publishing ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                {publishing ? 'Publicando...' : '2. Publicar territorio'}
              </button>
            </div>

            <div className={`rounded-[2rem] border-4 p-5 shadow-lg ${isSupabaseConfigured ? 'border-emerald-200 bg-emerald-50' : 'border-orange-200 bg-orange-50'}`}>
              <div className="flex items-start gap-3">
                <Cloud className={isSupabaseConfigured ? 'text-emerald-600' : 'text-orange-600'} size={30} />
                <div>
                  <h3 className="text-xl font-black">¿Qué es Supabase?</h3>
                  <p className="mt-2 text-sm font-bold leading-relaxed text-slate-700">Es la caja fuerte en internet donde la página guarda los mapas. Tú solo eliges la carpeta y pulsas publicar. Estado actual: <strong>{isSupabaseConfigured ? 'conectado y listo' : 'falta configurar la conexión en Vercel'}</strong>.</p>
                  <p className="mt-2 text-xs font-bold text-slate-500">Si el bucket no existe, la página ahora usa automáticamente un método alternativo y guarda el mapa en la base de datos.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2.2rem] border-4 border-white bg-white/90 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-3"><CheckCircle2 className="text-rose-500" size={30} /><div><p className="text-xs font-black uppercase tracking-[.2em] text-rose-500">Vista provincial</p><h2 className="text-3xl font-black">Cantones de Tungurahua</h2></div></div>
              <TerritorialMapView collection={cantones} mode="cantones" />
            </div>

            <div className="rounded-[2.2rem] border-4 border-white bg-white/90 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={30} /><div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-600">Vista cantonal</p><h2 className="text-3xl font-black">Parroquias de Baños</h2></div></div>
              <TerritorialMapView collection={parroquias} mode="parroquias" />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
};

export default TerritorialAdminPage;
