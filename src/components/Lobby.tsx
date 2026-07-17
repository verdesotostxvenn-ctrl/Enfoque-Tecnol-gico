import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ChevronRight,
  MapPin,
  School,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const avatarImages = {
  chica:
    'https://blogger.googleusercontent.com/img/a/AVvXsEh_PnIcFYcgmsvgfKqk4Mr0s40x0a5f1_pIFmBRlR0oVInL1-uaLQIez5BrYNp-ua4-mBmHqb2A8Ox4tElSIJx3LtHnBaO-cGTxzHomjYO1f2X6KQzCYn8I0LmpqNe6o1UiXhc814JjCv0hWJ3kME5gcDJ1czrxl7xYge9BE214gnYyrIHHqxwuTMyoxPjd',
  chico:
    'https://blogger.googleusercontent.com/img/a/AVvXsEhGuah8gRxjKHRH2XeN_K7ew3dlo-4QNWudy46AsoT91CiPXkrU9JDEA1wQ1iyIcYj23qQGhITb2EJpIMP1bww_g24vx1-yYp6dYz1agR_nWX6pazjghCNOXXKGvdI0nzDG173acHzltH-fCPlxYYkVQhA47V7aFNiZmVH4HAZf8OTIqtiu0DiI7SIOd5Qe'
};

const escuelasDisponibles = [
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

const edadesDisponibles = [6, 7, 8, 9, 10, 11];

const frasesPrevencion = [
  'Conoce el riesgo, actúa con seguridad y protege tu comunidad.',
  'Aprender hoy nos ayuda a responder mejor mañana.',
  'La preparación convierte a cada estudiante en un agente de prevención.'
];

const LobbyUltra = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [edad, setEdad] = useState(9);
  const [avatar, setAvatar] = useState<'chica' | 'chico' | ''>('');
  const [loading, setLoading] = useState(false);
  const [showEscuelas, setShowEscuelas] = useState(false);
  const [fraseIndex, setFraseIndex] = useState(0);

  const fraseActual = frasesPrevencion[fraseIndex];

  const formularioListo = useMemo(() => {
    return Boolean(nombre.trim() && escuela && avatar);
  }, [nombre, escuela, avatar]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFraseIndex((prev) => (prev + 1) % frasesPrevencion.length);
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    Object.values(avatarImages).forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formularioListo) return;

    setLoading(true);

    const nombreLimpio = nombre.trim();

    localStorage.setItem('agenteNombre', nombreLimpio);
    localStorage.setItem('agenteEscuela', escuela);
    localStorage.setItem('agenteEdad', edad.toString());
    localStorage.setItem('agenteAvatar', avatar);
    localStorage.setItem('agenteNivel', '1');
    localStorage.setItem('misionVolcanCompletada', 'false');
    localStorage.setItem('misionInundacionCompletada', 'false');
    localStorage.setItem('misionEvacuacionCompletada', 'false');

    try {
      const { error } = await supabase.from('agentes').insert([
        {
          nombre: nombreLimpio,
          institucion: escuela,
          edad,
          avatar,
          nivel: 1,
          mision_volcan: false,
          mision_inundacion: false,
          mision_evacuacion: false,
          ultima_conexion: new Date().toISOString()
        }
      ]);

      if (error) {
        console.warn('Supabase no sincronizó, pero el agente fue guardado localmente:', error.message);
      }
    } catch (error) {
      console.warn('Fallo de conexión con Supabase. Registro local guardado:', error);
    }

    window.dispatchEvent(new Event('agenteNivelActualizado'));

    window.setTimeout(() => {
      setLoading(false);
      navigate('/hub');
    }, 500);
  };

  return (
    <main className="lobby-safe min-h-screen w-full bg-[#010413] text-white relative overflow-hidden flex items-center justify-center p-3 md:p-5">

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[34rem] h-[34rem] bg-orange-500/25 rounded-full blur-[120px]" />
        <div className="absolute -bottom-44 -right-36 w-[38rem] h-[38rem] bg-cyan-400/25 rounded-full blur-[125px]" />
        <div className="absolute left-1/2 top-1/2 w-[34rem] h-[34rem] -translate-x-1/2 -translate-y-1/2 bg-fuchsia-500/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:32px_32px] opacity-35" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42 }}
        className="relative z-10 w-full max-w-6xl min-h-[92vh] bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden grid grid-cols-1 lg:grid-cols-[0.86fr_1.14fr] backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
      >
        <aside className="relative bg-slate-950/60 border-b lg:border-b-0 lg:border-r border-white/10 p-5 md:p-7 flex flex-col justify-between gap-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 text-orange-500 mb-4">
              <Activity size={15} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.35em]">Distrito 18D03</span>
            </div>

            <div className="relative mb-5">
              <Sparkles className="absolute -right-1 -top-3 text-cyan-300/90" size={25} />
              <h1 className="text-[2.7rem] sm:text-[3.5rem] md:text-[4.35rem] font-black leading-[0.86] tracking-tighter uppercase">
                Misión <br />
                <span className="bg-gradient-to-r from-yellow-200 via-orange-400 to-red-500 bg-clip-text text-transparent">
                  Prevención
                </span>
              </h1>
            </div>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-md">
              Plataforma de educación en Gestión de Riesgos de Desastres para el distrito 18D03.
            </p>

            <div className="flex justify-center py-6 md:py-7">
              <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full bg-red-700 shadow-[0_0_80px_rgba(220,38,38,0.35)] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 via-red-700 to-red-950" />
                <div className="relative z-10 w-0 h-0 border-l-[68px] border-l-transparent border-r-[68px] border-r-transparent border-b-[118px] border-b-white translate-y-[-8px] md:border-l-[78px] md:border-r-[78px] md:border-b-[136px]" />
              </div>
            </div>

            <motion.div
              key={fraseActual}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-[1.6rem] border border-orange-300/20 bg-black/25 p-4 shadow-[0_0_40px_rgba(251,146,60,0.1)]"
            >
              <p className="text-orange-200 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                Eslogan de misión
              </p>
              <p className="text-white text-lg md:text-xl font-black leading-tight">
                {fraseActual}
              </p>
              <p className="text-white/55 text-xs md:text-sm mt-3 leading-relaxed font-semibold">
                Explora misiones, aprende protocolos y conviértete en un agente de prevención.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 pt-3 border-t border-white/10">
            <p className="text-[10px] md:text-xs text-white/85 font-bold italic border-l-2 border-orange-500 pl-3 uppercase leading-relaxed">
              “Un buen conocimiento del riesgo ayuda a mejorar la resiliencia comunitaria”
            </p>
          </div>
        </aside>

        <section className="bg-black/25 p-5 md:p-7 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 flex items-center mb-2">
                <User size={13} className="mr-2 text-orange-500" />
                Registro de identidad
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Escribe tu nombre..."
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3.5 text-white font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 flex items-center mb-2">
                <Users size={13} className="mr-2 text-purple-400" />
                Tu edad ({edad} años)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {edadesDisponibles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setEdad(item)}
                    aria-pressed={edad === item}
                    className={`rounded-2xl border p-3 text-center font-black text-sm transition-all ${
                      edad === item
                        ? 'bg-purple-500/25 border-purple-400 text-white shadow-[0_0_22px_rgba(192,132,252,0.28)]'
                        : 'bg-black/50 border-white/10 text-slate-300 hover:border-purple-400/60 hover:bg-white/10'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 flex items-center mb-2">
                <School size={13} className="mr-2 text-cyan-400" />
                Unidad educativa local
              </label>
              <button
                type="button"
                onClick={() => setShowEscuelas(true)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3.5 text-white font-bold outline-none hover:border-cyan-400 transition-all flex items-center justify-between text-left text-sm"
              >
                <span className={escuela ? 'text-white' : 'text-slate-500'}>
                  {escuela || 'Seleccionar escuela...'}
                </span>
                <MapPin className="text-cyan-400 shrink-0 ml-3" size={18} />
              </button>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 flex items-center mb-2">
                <Users size={13} className="mr-2 text-white" />
                Selecciona tu agente
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['chica', 'chico'] as const).map((tipo) => {
                  const selected = avatar === tipo;
                  const isChica = tipo === 'chica';

                  return (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setAvatar(tipo)}
                      className={`p-4 rounded-[1.5rem] border transition-all ${
                        selected
                          ? isChica
                            ? 'bg-orange-500/20 border-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.28)]'
                            : 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.28)]'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <img
                        src={avatarImages[tipo]}
                        alt={isChica ? 'Avatar niña' : 'Avatar niño'}
                        className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-2 rounded-full bg-white/10 p-1.5 object-cover"
                      />
                      <div className="text-[10px] font-black uppercase tracking-widest">
                        {isChica ? 'Niña' : 'Niño'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formularioListo}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-35 rounded-2xl p-4 text-white font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-[0_15px_35px_rgba(249,115,22,0.28)] text-xs md:text-sm"
            >
              {loading ? 'Preparando misión...' : 'Comenzar aventura'}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>

          <div className="mt-5 rounded-[1.6rem] bg-slate-950/55 border border-cyan-300/20 p-4 flex items-start gap-3">
            <div className="bg-cyan-400/10 p-3 rounded-2xl text-cyan-300">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-cyan-200/70 text-[9px] font-black uppercase tracking-[0.28em] mb-1">
                Pista de prevención
              </p>
              <p className="text-white/80 text-sm leading-relaxed font-semibold">
                Lee cada misión con atención. Tus respuestas desbloquean nuevos niveles y tu credencial final.
              </p>
            </div>
          </div>
        </section>
      </motion.section>

      <AnimatePresence>
        {showEscuelas && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={() => setShowEscuelas(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              aria-label="Cerrar selector de escuelas"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-5xl max-h-[86vh] overflow-y-auto bg-slate-950 border border-cyan-400/20 rounded-[2rem] p-5 shadow-[0_0_80px_rgba(34,211,238,0.22)]"
            >
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-cyan-400 text-[9px] font-black uppercase tracking-[0.32em]">
                    Censo Escolar 18D03
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-1">
                    Elige tu base de entrenamiento
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEscuelas(false)}
                  className="bg-white/10 hover:bg-red-500/20 border border-white/10 p-3 rounded-2xl transition-all"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {escuelasDisponibles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setEscuela(item);
                      setShowEscuelas(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all min-h-[76px] ${
                      escuela === item
                        ? 'bg-cyan-500/20 border-cyan-400 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-cyan-400/50'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="bg-cyan-400/10 p-2 rounded-xl text-cyan-300 w-fit">
                        <School size={16} />
                      </div>
                      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider leading-tight">
                        {item}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default LobbyUltra;
