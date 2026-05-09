import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform
} from 'framer-motion';
import {
  Activity,
  ChevronRight,
  HelpCircle,
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
  chica: 'https://blogger.googleusercontent.com/img/a/AVvXsEh_PnIcFYcgmsvgfKqk4Mr0s40x0a5f1_pIFmBRlR0oVInL1-uaLQIez5BrYNp-ua4-mBmHqb2A8Ox4tElSIJx3LtHnBaO-cGTxzHomjYO1f2X6KQzCYn8I0LmpqNe6o1UiXhc814JjCv0hWJ3kME5gcDJ1czrxl7xYge9BE214gnYyrIHHqxwuTMyoxPjd',
  chico: 'https://blogger.googleusercontent.com/img/a/AVvXsEhGuah8gRxjKHRH2XeN_K7ew3dlo-4QNWudy46AsoT91CiPXkrU9JDEA1wQ1iyIcYj23qQGhITb2EJpIMP1bww_g24vx1-yYp6dYz1agR_nWX6pazjghCNOXXKGvdI0nzDG173acHzltH-fCPlxYYkVQhA47V7aFNiZmVH4HAZf8OTIqtiu0DiI7SIOd5Qe'
};

const escuelasDisponibles = [
  'Escuela Río Blanco',
  'Escuela Río Verde',
  'U.E. Baños',
  'Unidad Educativa 04',
  'Unidad Educativa 05',
  'Unidad Educativa 06',
  'Unidad Educativa 07',
  'Unidad Educativa 08',
  'Unidad Educativa 09',
  'Unidad Educativa 10',
  'Unidad Educativa 11',
  'Unidad Educativa 12'
];

const LobbyUltra = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [avatar, setAvatar] = useState<'chica' | 'chico' | ''>('');
  const [hoverAvatar, setHoverAvatar] = useState<'chica' | 'chico' | ''>('');
  const [loading, setLoading] = useState(false);
  const [showEscuelas, setShowEscuelas] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseX = useSpring(rawMouseX, { stiffness: 1300, damping: 65 });
  const mouseY = useSpring(rawMouseY, { stiffness: 1300, damping: 65 });

  const bokehX = useTransform(rawMouseX, [0, 1400], [-45, 45]);
  const bokehY = useTransform(rawMouseY, [0, 900], [-32, 32]);

  useEffect(() => {
    const moveCursor = (event: MouseEvent) => {
      rawMouseX.set(event.clientX);
      rawMouseY.set(event.clientY);
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [rawMouseX, rawMouseY]);

  useEffect(() => {
    Object.values(avatarImages).forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!nombre.trim() || !escuela || !avatar) return;

    setLoading(true);

    const nombreLimpio = nombre.trim();

    localStorage.setItem('agenteNombre', nombreLimpio);
    localStorage.setItem('agenteEscuela', escuela);
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
          avatar,
          nivel: 1,
          mision_volcan: false,
          mision_inundacion: false,
          mision_evacuacion: false,
          ultima_conexion: new Date().toISOString()
        }
      ]);

      if (error) {
        console.warn(
          'Supabase no sincronizó, pero el agente fue guardado localmente:',
          error.message
        );
      }
    } catch (error) {
      console.warn('Fallo de red con Supabase. Registro local guardado:', error);
    }

    window.dispatchEvent(new Event('agenteNivelActualizado'));

    setTimeout(() => {
      setLoading(false);
      navigate('/hub');
    }, 650);
  };

  return (
    <main className="h-screen max-h-screen w-full bg-[#010413] text-white relative overflow-hidden flex items-center justify-center p-2 md:p-4 cursor-none">
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%'
        }}
        className="fixed top-0 left-0 pointer-events-none z-[999999] hidden md:block"
      >
        <motion.div
          animate={{
            scale: isHovering ? 1.05 : 1,
            borderColor: isHovering ? '#fb923c' : '#22d3ee',
            backgroundColor: isHovering
              ? 'rgba(251,146,60,0.08)'
              : 'rgba(34,211,238,0.08)'
          }}
          transition={{ duration: 0.1 }}
          className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shadow-[0_0_14px_rgba(34,211,238,0.8)] backdrop-blur-sm"
        >
          <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#fff]" />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ x: bokehX, y: bokehY }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 13, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 w-[1250px] h-[1250px] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="absolute top-0 left-1/2 w-[410px] h-[410px] bg-orange-500/50 rounded-full blur-[115px]" />
          <div className="absolute bottom-10 right-0 w-[460px] h-[460px] bg-cyan-400/42 rounded-full blur-[125px]" />
          <div className="absolute left-0 top-1/2 w-[360px] h-[360px] bg-emerald-400/35 rounded-full blur-[120px]" />
          <div className="absolute right-1/3 top-1/4 w-80 h-80 bg-pink-500/32 rounded-full blur-[115px]" />
          <div className="absolute left-1/4 bottom-1/4 w-72 h-72 bg-yellow-400/28 rounded-full blur-[110px]" />
        </motion.div>

        <motion.div
          animate={{
            x: [-100, 125, -100],
            y: [45, -85, 45],
            scale: [1, 1.18, 1],
            opacity: [0.35, 0.68, 0.35]
          }}
          transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-[560px] h-[560px] bg-orange-500/38 rounded-full blur-[130px]"
        />

        <motion.div
          animate={{
            x: [100, -120, 100],
            y: [-45, 80, -45],
            scale: [1.12, 1, 1.12],
            opacity: [0.3, 0.62, 0.3]
          }}
          transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-36 -right-32 w-[610px] h-[610px] bg-cyan-400/38 rounded-full blur-[135px]"
        />

        <motion.div
          animate={{
            x: [-55, 70, -55],
            y: [-25, 35, -25],
            opacity: [0.2, 0.46, 0.2]
          }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/4 w-[380px] h-[380px] bg-fuchsia-500/25 rounded-full blur-[125px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:30px_30px] opacity-45" />
      </motion.div>

      <motion.section
        initial={{ opacity: 0, scale: 0.965, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-6xl h-[94vh] bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
      >
        <aside className="relative overflow-hidden bg-slate-950/55 border-b lg:border-b-0 lg:border-r border-white/10 p-4 md:p-6 flex flex-col justify-between">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 text-orange-500 mb-3">
              <Activity size={14} className="animate-pulse" />
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.35em]">
                Distrito 18D03
              </span>
            </div>

            <motion.div
              animate={{
                textShadow: [
                  '0 0 14px rgba(249,115,22,0.4)',
                  '0 0 30px rgba(34,211,238,0.4)',
                  '0 0 14px rgba(249,115,22,0.4)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative mb-4"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.12, 1]
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -right-1 -top-4 text-cyan-300/90"
              >
                <Sparkles size={24} />
              </motion.div>

              <h1 className="text-[2.35rem] md:text-[3.85rem] font-black leading-[0.86] tracking-tighter uppercase">
                Misión <br />
                <span className="relative bg-gradient-to-r from-yellow-200 via-orange-400 to-red-500 bg-clip-text text-transparent">
                  Prevención
                </span>
              </h1>

              <div className="mt-3 flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-[0.24em] text-cyan-200/80">
                <ShieldCheck size={14} />
                Academia infantil de gestión de riesgos
              </div>
            </motion.div>

            <p className="text-slate-300 text-[11px] md:text-sm leading-relaxed max-w-md mb-4">
              Plataforma educativa de gestión de riesgos para entrenar agentes infantiles en prevención, emergencia y evacuación.
            </p>

            <div className="relative w-32 md:w-44">
              <div className="absolute inset-0 bg-orange-500/45 blur-3xl rounded-full" />
              <img
                src="https://blogger.googleusercontent.com/img/a/AVvXsEhwwQia3e2LdO2aVrT1GFE6Cojzx6-lve9qceOZH3IiwXtV3wYKFiTioE7lSASVOnjdUexdIJwv9PUVScy_iupzCzzbbGUp7S1ByxBcJWK8fsZVexSyKj2oh7VgnJZ7iC4bkUjuko0R7SH-Lzgii-JsZmRgbdNWqQlwFlQ194py9fA-fCIIhM1HrHesW3pv"
                alt="Logo"
                className="relative z-10 w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="relative z-10 pt-3 border-t border-white/10">
            <p className="text-[9px] md:text-[11px] text-white/85 font-bold italic border-l-2 border-orange-500 pl-3 uppercase leading-relaxed">
              “Un buen conocimiento del riesgo ayuda a mejorar la resiliencia comunitaria”
            </p>
          </div>
        </aside>

        <section className="bg-black/30 p-4 md:p-6 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 flex items-center mb-1.5">
                <User size={12} className="mr-2 text-orange-500" />
                Registro de identidad
              </label>

              <input
                type="text"
                required
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                placeholder="Escribe tu nombre..."
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-orange-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 flex items-center mb-1.5">
                <School size={12} className="mr-2 text-cyan-400" />
                Unidad educativa local
              </label>

              <button
                type="button"
                onClick={() => setShowEscuelas(true)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold outline-none hover:border-cyan-400 transition-all flex items-center justify-between text-left text-sm"
              >
                <span className={escuela ? 'text-white' : 'text-slate-500'}>
                  {escuela || 'Seleccionar escuela...'}
                </span>
                <MapPin className="text-cyan-400" size={17} />
              </button>
            </div>

            <div>
              <label className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 flex items-center mb-1.5">
                <Users size={12} className="mr-2 text-white" />
                Selecciona tu agente
              </label>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  onClick={() => setAvatar('chica')}
                  onMouseEnter={() => {
                    setHoverAvatar('chica');
                    setIsHovering(true);
                  }}
                  onMouseLeave={() => {
                    setHoverAvatar('');
                    setIsHovering(false);
                  }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className={`p-3 rounded-[1.5rem] border transition-all ${
                    avatar === 'chica' || hoverAvatar === 'chica'
                      ? 'bg-orange-500/20 border-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.35)]'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <img
                    src={avatarImages.chica}
                    alt="Avatar niña"
                    className="w-[4.5rem] h-[4.5rem] md:w-[5rem] md:h-[5rem] mx-auto mb-1.5 rounded-full bg-white/10 p-1.5 object-cover"
                  />
                  <div className="text-[9px] font-black uppercase tracking-widest">
                    Niña
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setAvatar('chico')}
                  onMouseEnter={() => {
                    setHoverAvatar('chico');
                    setIsHovering(true);
                  }}
                  onMouseLeave={() => {
                    setHoverAvatar('');
                    setIsHovering(false);
                  }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className={`p-3 rounded-[1.5rem] border transition-all ${
                    avatar === 'chico' || hoverAvatar === 'chico'
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.35)]'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <img
                    src={avatarImages.chico}
                    alt="Avatar niño"
                    className="w-[4.5rem] h-[4.5rem] md:w-[5rem] md:h-[5rem] mx-auto mb-1.5 rounded-full bg-white/10 p-1.5 object-cover"
                  />
                  <div className="text-[9px] font-black uppercase tracking-widest">
                    Niño
                  </div>
                </motion.button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !nombre.trim() || !escuela || !avatar}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              whileHover={!loading ? { scale: 1.012, y: -2 } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-30 rounded-2xl p-3.5 text-white font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-[0_15px_35px_rgba(249,115,22,0.28)] text-xs md:text-sm"
            >
              {loading ? (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  Preparando misión...
                </motion.span>
              ) : (
                <>
                  Comenzar aventura
                  <ChevronRight size={17} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-3 flex justify-end">
            <motion.div
              animate={{
                y: [0, -3, 0],
                rotate: [-0.4, 0.4, -0.4]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full max-w-[430px] bg-slate-950/55 border border-white/10 rounded-[2.2rem] rounded-tr-[3rem] rounded-bl-[1.2rem] p-4 backdrop-blur-xl shadow-[0_0_24px_rgba(34,211,238,0.10)] overflow-hidden"
            >
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
              <div className="absolute -right-3 -top-3 w-12 h-12 bg-cyan-400/10 rounded-full blur-lg" />
              <div className="absolute right-7 -bottom-2 w-6 h-6 bg-slate-950/55 border-r border-b border-white/10 rotate-45" />

              <div className="relative z-10 grid grid-cols-[auto_1fr_auto] items-start gap-3">
                <div className="bg-white/5 border border-white/10 p-2 rounded-2xl text-orange-300">
                  <HelpCircle size={18} />
                </div>

                <div>
                  <h4 className="text-orange-300 font-black text-[9px] uppercase tracking-[0.25em] mb-1">
                    ¿Sabías que?
                  </h4>

                  <p className="text-white/85 text-[11px] md:text-xs leading-relaxed font-semibold max-w-[270px]">
                    El riesgo es una construcción social: no hay riesgo si no existen personas expuestas y vulnerables.
                  </p>
                </div>

                <div className="flex flex-col gap-1 text-xl">
                  <motion.span
                    animate={{ y: [0, -6, 0], rotate: [-8, 8, -8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    💡
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                  >
                    🧠
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </motion.section>

      <AnimatePresence>
        {showEscuelas && (
          <motion.div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
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
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-5xl bg-slate-950 border border-cyan-400/20 rounded-[2.4rem] p-5 shadow-[0_0_80px_rgba(34,211,238,0.25)]"
            >
              <div className="flex items-center justify-between mb-5">
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
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="bg-white/10 hover:bg-red-500/20 border border-white/10 p-3 rounded-2xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {escuelasDisponibles.map((item) => (
                  <motion.button
                    key={item}
                    type="button"
                    onClick={() => {
                      setEscuela(item);
                      setShowEscuelas(false);
                    }}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    whileHover={{ y: -4, scale: 1.025 }}
                    whileTap={{ scale: 0.96 }}
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
                      <span className="text-[9px] md:text-[11px] font-black uppercase tracking-wider leading-tight">
                        {item}
                      </span>
                    </div>
                  </motion.button>
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
