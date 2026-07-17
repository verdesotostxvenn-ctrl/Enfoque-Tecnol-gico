import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Cloud,
  FileArchive,
  FolderOpen,
  HelpCircle,
  Info,
  Loader2,
  MapPinned,
  ShieldCheck,
  UploadCloud
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TerritorialMapView from './TerritorialMapView';
import { isSupabaseConfigured } from '../supabaseClient';
import {
  parseTerritorialFiles,
  publishTerritorialMaps,
  type GeoJsonFeatureCollection,
  type TerritorialStorageMode
} from '../utils/territorialMaps';

const LOGO_URL = 'https://blogger.googleusercontent.com/img/a/AVvXsEhy3dwaYQj6R2ws_jFzJAR7c3yKKTE6lbdml-nVgm4NwaM-W-5MXjgblPUVcqzs1KnN806FhXVXwvPsl9lJyYyGnbNbuSXyvXJCZvtlYw752K1uI63zBuNOHArFLhALPQPGLWy7TsYgi0UwtCxN_PFsTchZlW6fAPQ9sbzPwjfdBWoiwfiN2lywSte4Plw';

type FolderInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory?: string;
  directory?: string;
};

type NoticeKind = 'info' | 'success' | 'warning';

const TerritorialAdminPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [cantones, setCantones] = useState<GeoJsonFeatureCollection | null>(null);
  const [parroquias, setParroquias] = useState<GeoJsonFeatureCollection | null>(null);
  const [status, setStatus] = useState('Selecciona la carpeta completa o el archivo Base.zip.');
  const [noticeKind, setNoticeKind] = useState<NoticeKind>('info');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [storageMode, setStorageMode] = useState<TerritorialStorageMode | null>(null);

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
    setStorageMode(null);
    setCantones(null);
    setParroquias(null);
    setProcessing(true);
    setNoticeKind('info');
    setStatus('Leyendo los archivos y preparando los dos mapas...');

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 80));
      const parsed = await parseTerritorialFiles(selected);
      setCantones(parsed.cantones);
      setParroquias(parsed.parroquias);
      setNoticeKind('success');
      setStatus(`¡Archivos listos! Detecté ${parsed.cantones.features.length} cantones y ${parsed.parroquias.features.length} parroquias.`);
    } catch (err) {
      console.error('Error territorial:', err);
      setError(err instanceof Error ? err.message : 'No se pudieron leer los archivos territoriales.');
      setStatus('La carpeta no pudo prepararse. Revisa el mensaje de ayuda.');
      setNoticeKind('warning');
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
    setNoticeKind('info');
    setStatus('Guardando los mapas para la bienvenida territorial...');

    try {
      const result = await publishTerritorialMaps(cantones, parroquias);
      setStorageMode(result.storageMode);

      if (result.storageMode === 'local') {
        setNoticeKind('warning');
        setStatus(`Los mapas ya funcionan en este navegador. ${result.warning || 'La publicación en Supabase quedó pendiente.'}`);
      } else if (result.storageMode === 'database') {
        setNoticeKind('success');
        setStatus('¡Publicado! Los mapas se guardaron en la base de datos y ya pueden aparecer en la bienvenida.');
      } else {
        setNoticeKind('success');
        setStatus('¡Publicado! Los mapas se guardaron en Storage y ya pueden aparecer en la bienvenida.');
      }
    } catch (err) {
      console.error('Error de publicación:', err);
      setError(err instanceof Error ? err.message : 'No se pudieron publicar los mapas.');
      setStatus('Los mapas se leyeron, pero no se pudieron guardar.');
      setNoticeKind('warning');
    } finally {
      setPublishing(false);
    }
  };

  const noticeClasses = {
    info: 'border-sky-200 bg-sky-50 text-sky-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900'
  }[noticeKind];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071D4A] p-4 text-slate-950 md:p-7">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1.5px,transparent_1.5px)] [background-size:28px_28px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-[1500px] space-y-5">
        <header className="overflow-hidden rounded-[2.5rem] border-4 border-white bg-gradient-to-r from-[#0B4BB3] via-[#176ED8] to-[#16B7D8] text-white shadow-2xl">
          <div className="grid gap-5 p-5 md:grid-cols-[auto_1fr_auto] md:items-center md:p-7">
            <div className="mission-logo-frame flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[6px] shadow-xl md:h-36 md:w-36">
              <img src={LOGO_URL} alt="Logo Misión Prevención" className="mission-logo-image" />
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[.24em] text-yellow-300">Panel territorial</p>
              <h1 className="mt-1 text-4xl font-black leading-none md:text-6xl">Cantones y parroquias</h1>
              <p className="mt-3 max-w-3xl text-sm font-bold text-cyan-50 md:text-base">Carga los archivos, revisa la vista previa y publica el territorio para la bienvenida de los estudiantes.</p>
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end">
              <button onClick={() => navigate('/admin/mapas')} className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 bg-white/15 px-4 py-3 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md hover:bg-white/25"><ArrowLeft size={17} /> Volver</button>
              <button onClick={() => navigate('/hub')} className="inline-flex items-center gap-2 rounded-2xl bg-yellow-300 px-4 py-3 text-xs font-black uppercase tracking-wider text-[#071D4A] shadow-lg hover:bg-yellow-200"><MapPinned size={17} /> Centro de mando</button>
            </div>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[410px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-[2.2rem] border-4 border-white bg-white p-5 shadow-[0_22px_65px_rgba(0,0,0,.22)]">
              <div className="rounded-[1.7rem] border-2 border-dashed border-sky-300 bg-sky-50 p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg"><FolderOpen size={30} /></div>
                <h2 className="mt-4 text-3xl font-black text-[#071D4A]">1. Selecciona</h2>
                <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">Mantén juntos los archivos .shp, .dbf, .shx y .prj de Cantones y Parroquias.</p>

                <div className="mt-5 grid gap-3">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#176ED8] px-4 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#0B4BB3]">
                    <FolderOpen size={18} /> Elegir carpeta completa
                    <input {...folderProps} className="hidden" />
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:-translate-y-1 hover:bg-violet-700">
                    <FileArchive size={18} /> Elegir Base.zip
                    <input type="file" accept=".zip" className="hidden" onChange={(event) => process(Array.from(event.currentTarget.files || []))} />
                  </label>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                {Object.entries(detected).map(([key, value], index) => (
                  <div key={key} className={`rounded-xl border-2 p-2.5 ${['border-rose-200 bg-rose-50','border-cyan-200 bg-cyan-50','border-violet-200 bg-violet-50','border-amber-200 bg-amber-50','border-emerald-200 bg-emerald-50'][index]}`}>
                    <div className="text-xl font-black text-[#071D4A]">{value}</div>
                    <div className="mt-1 text-[8px] font-black uppercase tracking-wider text-slate-500">.{key}</div>
                  </div>
                ))}
              </div>

              <div className={`mt-4 rounded-2xl border-2 p-4 text-sm font-bold leading-relaxed ${noticeClasses}`}>
                {processing ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> {status}</span> : status}
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-sm font-bold leading-relaxed text-red-800">
                  <div className="mb-2 flex items-center gap-2 text-red-600"><HelpCircle size={19} /> ¿Qué ocurrió?</div>
                  {error}
                </div>
              )}

              <button onClick={publish} disabled={!cantones || !parroquias || publishing || processing} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-4 py-5 text-xs font-black uppercase tracking-widest text-white shadow-xl transition hover:-translate-y-1 disabled:translate-y-0 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-35">
                {publishing ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                {publishing ? 'Publicando...' : '2. Publicar territorio'}
              </button>

              {storageMode && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
                  <ShieldCheck size={16} className="text-emerald-600" /> Modo de guardado: {storageMode === 'local' ? 'este navegador' : storageMode === 'database' ? 'base de datos' : 'Storage'}
                </div>
              )}
            </div>

            <div className={`rounded-[2rem] border-2 p-5 shadow-lg ${isSupabaseConfigured ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className="flex items-start gap-3">
                <Cloud className={isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'} size={28} />
                <div>
                  <h3 className="text-xl font-black text-[#071D4A]">Conexión de publicación</h3>
                  <p className="mt-2 text-sm font-bold leading-relaxed text-slate-700">Estado: <strong>{isSupabaseConfigured ? 'Supabase conectado' : 'sin variables de Supabase'}</strong>.</p>
                  <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">Si la tabla o el bucket no están disponibles, la página guarda el mapa en este navegador para que puedas continuar probando.</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <article className="rounded-[2.2rem] border-4 border-white bg-white p-5 shadow-[0_22px_65px_rgba(0,0,0,.2)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-rose-100 p-3 text-rose-600"><CheckCircle2 size={28} /></div>
                <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-rose-500">Vista provincial</p><h2 className="text-3xl font-black text-[#071D4A]">Cantones de Tungurahua</h2></div>
              </div>
              <TerritorialMapView collection={cantones} mode="cantones" />
            </article>

            <article className="rounded-[2.2rem] border-4 border-white bg-white p-5 shadow-[0_22px_65px_rgba(0,0,0,.2)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600"><CheckCircle2 size={28} /></div>
                <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-600">Vista cantonal</p><h2 className="text-3xl font-black text-[#071D4A]">Parroquias de Baños</h2></div>
              </div>
              <TerritorialMapView collection={parroquias} mode="parroquias" />
            </article>

            <div className="flex items-start gap-3 rounded-[1.6rem] border-2 border-sky-200 bg-sky-50 p-4 text-sky-900">
              <Info className="shrink-0 text-sky-600" size={22} />
              <p className="text-sm font-bold leading-relaxed">La vista previa está simplificada para que el navegador no se congele, pero conserva los límites y nombres necesarios para la experiencia educativa.</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
};

export default TerritorialAdminPage;
