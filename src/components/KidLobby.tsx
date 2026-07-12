import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, MapPin, School, ShieldCheck, Sparkles, UserRound, UsersRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const LOGO_URL = 'https://blogger.googleusercontent.com/img/a/AVvXsEhy3dwaYQj6R2ws_jFzJAR7c3yKKTE6lbdml-nVgm4NwaM-W-5MXjgblPUVcqzs1KnN806FhXVXwvPsl9lJyYyGnbNbuSXyvXJCZvtlYw752K1uI63zBuNOHArFLhALPQPGLWy7TsYgi0UwtCxN_PFsTchZlW6fAPQ9sbzPwjfdBWoiwfiN2lywSte4Plw';

const AVATARS = {
  chica: 'https://blogger.googleusercontent.com/img/a/AVvXsEh_PnIcFYcgmsvgfKqk4Mr0s40x0a5f1_pIFmBRlR0oVInL1-uaLQIez5BrYNp-ua4-mBmHqb2A8Ox4tElSIJx3LtHnBaO-cGTxzHomjYO1f2X6KQzCYn8I0LmpqNe6o1UiXhc814JjCv0hWJ3kME5gcDJ1czrxl7xYge9BE214gnYyrIHHqxwuTMyoxPjd',
  chico: 'https://blogger.googleusercontent.com/img/a/AVvXsEhGuah8gRxjKHRH2XeN_K7ew3dlo-4QNWudy46AsoT91CiPXkrU9JDEA1wQ1iyIcYj23qQGhITb2EJpIMP1bww_g24vx1-yYp6dYz1agR_nWX6pazjghCNOXXKGvdI0nzDG173acHzltH-fCPlxYYkVQhA47V7aFNiZmVH4HAZf8OTIqtiu0DiI7SIOd5Qe'
};

const ESCUELAS = [
  'Colegio De Bachillerato Pcei Agoyán',
  'Escuela Augusto N Martinez',
  'Escuela Gonzalo Pizarro',
  'Escuela Gran Ducado De Luxemburgo',
  'Escuela Jose Ignacio Vela',
  'Escuela Leonidas Garcia',
  'Escuela Manuel Andrade',
  'Escuela Nicolas Vasconez',
  'Escuela Pablo Arturo Suarez',
  'Escuela Pedro Vicente Maldonado',
  'Extensión Unidad Educativa San Pio X',
  'Gonzalo Abad Grijalva',
  'Unidad Educativa Baños',
  'Unidad Educativa Doctor Misael Acosta Solis',
  'Unidad Educativa Fray Sebastian Acosta',
  'Unidad Educativa Oscar Efren Reyes',
  'Unidad Educativa Palomino Flores',
  'Unidad Educativa Puerta Del Dorado',
  'Unidad Educativa Rio Negro'
];

const KidLobby = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [edad, setEdad] = useState(9);
  const [avatar, setAvatar] = useState<'chica' | 'chico' | ''>('');
  const [showSchools, setShowSchools] = useState(false);
  const [loading, setLoading] = useState(false);

  const listo = useMemo(() => Boolean(nombre.trim() && escuela && avatar), [nombre, escuela, avatar]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!listo || loading) return;

    setLoading(true);
    const cleanName = nombre.trim();

    localStorage.setItem('agenteNombre', cleanName);
    localStorage.setItem('agenteEscuela', escuela);
    localStorage.setItem('agenteEdad', String(edad));
    localStorage.setItem('agenteAvatar', avatar);
    localStorage.setItem('agenteNivel', '1');
    localStorage.setItem('misionVolcanCompletada', 'false');
    localStorage.setItem('misionInundacionCompletada', 'false');
    localStorage.setItem('misionEvacuacionCompletada', 'false');
    localStorage.removeItem('introTerritorialVista');

    try {
      const { error } = await supabase.from('agentes').insert([{ nombre: cleanName, institucion: escuela, edad, avatar, nivel: 1, mision_volcan: false, mision_inundacion: false, mision_evacuacion: false, ultima_conexion: new Date().toISOString() }]);
      if (error) console.warn('Registro guardado localmente; Supabase no respondió:', error.message);
    } catch (error) {
      console.warn('Registro guardado localmente:', error);
    }

    window.dispatchEvent(new Event('agenteNivelActualizado'));
    window.setTimeout(() => navigate('/hub'), 350);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-300 via-violet-300 to-amber-200 p-3 text-slate-900 md:p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-pink-400/45 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-cyan-300/55 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-300/45 blur-3xl" />
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle,white_2px,transparent_2px)] [background-size:28px_28px]" />
      </div>

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mx-auto grid min-h-[92vh] max-w-7xl overflow-hidden rounded-[2.5rem] border-4 border-white/70 bg-white/80 shadow-[0_35px_100px_rgba(70,43,120,.28)] backdrop-blur-xl lg:grid-cols-[.9fr_1.1fr]">
        <aside className="relative overflow-hidden bg-gradient-to-br from-yellow-200 via-orange-200 to-pink-200 p-6 md:p-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[28px] border-cyan-300/50" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full border-[32px] border-violet-300/45" />

          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-orange-600 shadow-md">
                <Sparkles size={16} /> Distrito 18D03
              </div>

              <h1 className="mt-5 text-5xl font-black leading-[.88] tracking-tight text-slate-900 md:text-7xl">
                MISIÓN
                <span className="block bg-gradient-to-r from-fuchsia-600 via-orange-500 to-red-500 bg-clip-text text-transparent">PREVENCIÓN</span>
              </h1>

              <p className="mt-5 max-w-lg text-base font-bold leading-relaxed text-slate-700 md:text-lg">
                Aprende jugando, completa retos y conviértete en un héroe de la seguridad para tu escuela y tu comunidad.
              </p>
            </div>

            <div className="mx-auto w-full max-w-[420px] rounded-[2.5rem] border-4 border-white bg-white/90 p-5 shadow-[0_20px_55px_rgba(90,66,160,.24)]">
              <img src={LOGO_URL} alt="Logo Misión Prevención 18D03" className="mx-auto h-72 w-72 object-contain md:h-80 md:w-80" />
            </div>

            <div className="rounded-[2rem] border-4 border-white/80 bg-gradient-to-r from-cyan-500 to-blue-500 p-5 text-white shadow-xl">
              <p className="text-xs font-black uppercase tracking-[.22em] text-yellow-200">Tu súper poder</p>
              <p className="mt-2 text-2xl font-black leading-tight">Conocer el riesgo y saber qué hacer.</p>
            </div>
          </div>
        </aside>

        <section className="bg-white/75 p-5 md:p-9">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 rounded-[2rem] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-5 text-white shadow-xl">
              <p className="text-xs font-black uppercase tracking-[.2em] text-yellow-200">Crea tu agente</p>
              <h2 className="mt-1 text-3xl font-black md:text-4xl">¡Prepárate para la aventura!</h2>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <label className="block rounded-[1.7rem] border-4 border-sky-200 bg-sky-50 p-4 shadow-sm">
                <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-sky-700"><UserRound size={18} /> Tu nombre</span>
                <input value={nombre} onChange={(event) => setNombre(event.target.value)} required placeholder="Escribe tu nombre..." className="w-full rounded-2xl border-2 border-sky-200 bg-white px-4 py-4 text-base font-black text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-200" />
              </label>

              <div className="rounded-[1.7rem] border-4 border-violet-200 bg-violet-50 p-4 shadow-sm">
                <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-violet-700"><UsersRound size={18} /> Tu edad: {edad} años</p>
                <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                  {[6,7,8,9,10,11].map((value) => <button key={value} type="button" onClick={() => setEdad(value)} className={`rounded-2xl border-2 px-3 py-3 text-lg font-black transition ${edad === value ? 'border-violet-600 bg-violet-600 text-white shadow-lg' : 'border-violet-200 bg-white text-violet-700 hover:-translate-y-1 hover:bg-violet-100'}`}>{value}</button>)}
                </div>
              </div>

              <button type="button" onClick={() => setShowSchools(true)} className="flex w-full items-center justify-between rounded-[1.7rem] border-4 border-cyan-200 bg-cyan-50 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:bg-cyan-100">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.16em] text-cyan-700">Tu escuela</p>
                  <p className={`mt-1 font-black ${escuela ? 'text-slate-900' : 'text-slate-400'}`}>{escuela || 'Toca aquí para seleccionar'}</p>
                </div>
                <MapPin className="text-cyan-600" />
              </button>

              <div className="rounded-[1.7rem] border-4 border-amber-200 bg-amber-50 p-4 shadow-sm">
                <p className="mb-3 text-xs font-black uppercase tracking-[.16em] text-amber-700">Elige tu personaje</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['chica','chico'] as const).map((kind) => <button key={kind} type="button" onClick={() => setAvatar(kind)} className={`rounded-[1.8rem] border-4 p-4 transition hover:-translate-y-1 ${avatar === kind ? (kind === 'chica' ? 'border-pink-500 bg-pink-100 shadow-xl' : 'border-blue-500 bg-blue-100 shadow-xl') : 'border-white bg-white shadow-md'}`}>
                    <img src={AVATARS[kind]} alt={kind === 'chica' ? 'Avatar niña' : 'Avatar niño'} className="mx-auto h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-lg" />
                    <p className="mt-3 text-sm font-black uppercase text-slate-800">{kind === 'chica' ? 'Niña' : 'Niño'}</p>
                  </button>)}
                </div>
              </div>

              <button type="submit" disabled={!listo || loading} className="flex w-full items-center justify-center gap-3 rounded-[1.8rem] bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-5 py-5 text-sm font-black uppercase tracking-[.16em] text-white shadow-[0_16px_35px_rgba(236,72,153,.3)] transition hover:-translate-y-1 disabled:translate-y-0 disabled:opacity-40">
                {loading ? 'Preparando tu misión...' : 'Comenzar aventura'} <ChevronRight size={21} />
              </button>
            </form>

            <div className="mt-5 flex items-start gap-3 rounded-[1.6rem] border-4 border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <ShieldCheck className="shrink-0 text-emerald-600" />
              <p className="text-sm font-bold leading-relaxed">Cada reto te enseñará a mantener la calma, ayudar a otros y actuar de forma segura.</p>
            </div>
          </div>
        </section>
      </motion.section>

      <AnimatePresence>
        {showSchools && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-violet-950/60 p-4 backdrop-blur-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section initial={{ y: 30, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .96 }} className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-[2.5rem] border-4 border-white bg-gradient-to-br from-sky-100 via-white to-amber-100 p-5 shadow-2xl md:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-700">Escuelas 18D03</p><h3 className="text-3xl font-black text-slate-900">Elige tu base de entrenamiento</h3></div>
                <button onClick={() => setShowSchools(false)} className="rounded-full bg-red-500 p-3 text-white shadow-lg hover:bg-red-400" aria-label="Cerrar"><X /></button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ESCUELAS.map((item) => <button key={item} onClick={() => { setEscuela(item); setShowSchools(false); }} className={`rounded-2xl border-4 p-4 text-left font-black transition hover:-translate-y-1 ${escuela === item ? 'border-cyan-500 bg-cyan-100 text-cyan-900' : 'border-white bg-white text-slate-700 shadow-md hover:border-amber-300'}`}><School className="mb-2 text-orange-500" size={22} />{item}</button>)}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default KidLobby;
