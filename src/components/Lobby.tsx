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
  ChevronLeft,
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
  'Unidad Arena Breakout'
];

const edadesDisponibles = [6, 7, 8, 9, 10, 11];

const sabiasQueFrases = [
  '¡Los desastres NO son naturales! Lo natural es que llueva o tiemble; el desastre ocurre únicamente cuando no estamos preparados para ello.',
  'La "vulnerabilidad" es como salir a la lluvia sin paraguas. Mientras más conozcamos los peligros de nuestro entorno, menos vulnerables seremos.',
  '¡Tu Mochila de Emergencia es tu escudo protector! Debe contener todo lo necesario para cuidarte durante 3 días o 72 horas.',
  'Una urgencia la puede solventar la comunidad o la escuela, pero una emergencia real ¡Necesita que llamemos a los verdaderos héroes del ECU 911!',
  'Hacer llamadas de broma al 9-1-1 es muy peligroso. Podrías hacer que una ambulancia pierda tiempo y no llegue a salvar una vida real.',
  '¡Tu familia es tu mejor equipo de rescate! Tener un Plan Familiar de Emergencias les ayuda a saber exactamente qué hacer y dónde encontrarse si algo pasa.',
  'Nuestro hermoso cantón convive con ríos, montañas y el gran volcán Tungurahua. ¡Conocer las Zonas Seguras y rutas de evacuación es nuestro súper poder!',
  'Si la tierra empieza a temblar, debes actuar como un ninja. Solo recuerda los tres pasos vitales: ¡Agáchate, cúbrete debajo de una mesa y agárrate fuerte!',
  'Al escuchar la alarma de evacuación, somos como tortugas sabias y no como liebres asustadas. Caminar rápido pero sin correr evita que nos lastimemos.'
];

const LobbyUltra = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [edad, setEdad] = useState(9); // Nuevo estado
  const [avatar, setAvatar] = useState<'chica' | 'chico' | ''>('');
  const [hoverAvatar, setHoverAvatar] = useState<'chica' | 'chico' | ''>('');
  const [loading, setLoading] = useState(false);
  const [showEscuelas, setShowEscuelas] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const [frases, setFrases] = useState<string[]>([]);
  const [fraseIndex, setFraseIndex] = useState(0);

  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseX = useSpring(rawMouseX, { stiffness: 2200, damping: 48, mass: 0.18 });
  const mouseY = useSpring(rawMouseY, { stiffness: 2200, damping: 48, mass: 0.18 });
  
  const bokehX = useTransform(rawMouseX, [0, 1400], [-18, 18]);
  const bokehY = useTransform(rawMouseY, [0, 900], [-12, 12]);

  useEffect(() => {
    const mezcladas = [...sabiasQueFrases].sort(() => Math.random() - 0.5);
    setFrases(mezcladas);
  }, []);

  useEffect(() => {
    if (frases.length === 0) return;
    const intervalId = window.setInterval(() => {
      setFraseIndex((prev) => (prev + 1) % frases.length);
    }, 10000);
    return () => window.clearInterval(intervalId);
  }, [frases, fraseIndex]);

  const nextFrase = () => setFraseIndex((prev) => (prev + 1) % frases.length);
  const prevFrase = () => setFraseIndex((prev) => (prev - 1 + frases.length) % frases.length);

  useEffect(() => {
    const moveCursor = (event: MouseEvent) => {
      rawMouseX.set(event.clientX);
      rawMouseY.set(event.clientY);
    };

    window.addEventListener('mousemove', moveCursor, { passive: true });
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
    localStorage.setItem('agenteEdad', edad.toString()); // Guardado
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
          edad: edad, // Inserción
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
    <main
      className="h-screen max-h-screen w-full bg-[#010413] text-white relative overflow-hidden flex items-center justify-center p-2 md:p-4 cursor-none"
    >
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%'
        }}
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block transform-gpu will-change-transform"
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
        className="absolute inset-0 pointer-events-none overflow-hidden transform-gpu will-change-transform"
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
            </motion.div>

            <p className="text-slate-300 text-[11px] md:text-sm leading-relaxed max-w-md mb-2">
              Plataforma de educación en Gestión de Riesgos de Desastres para el distrito 18D03
            </p>

            <div className="w-full flex justify-center py-6">
              <div className="relative w-40 md:w-48 mx-auto flex justify-center">
                <div className="absolute inset-0 bg-red-600/30 blur-3xl rounded-full" />
                <img
                  src="https://blogger.googleusercontent.com/img/a/AVvXsEhwwQia3e2LdO2aVrT1GFE6Cojzx6-lve9qceOZH3IiwXtV3wYKFiTioE7lSASVOnjdUexdIJwv9PUVScy_iupzCzzbbGUp7S1ByxBcJWK8fsZVexSyKj2oh7VgnJZ7iC4bkUjuko0R7SH-Lzgii-JsZmRgbdNWqQlwFlQ194py9fA-fCIIhM1HrHesW3pv"
                  alt="Logo"
                  className="relative z-10 w-full h-auto drop-shadow-2xl"
                />
              </div>
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

            {/* Selector de Edad */}
            <div>
              <label className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 flex items-center mb-1.5">
                <Users size={12} className="mr-2 text-purple-400" />
                Tu Edad ({edad} años)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 w-full">
                {edadesDisponibles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setEdad(item)}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    aria-pressed={edad === item}
                    className={`rounded-2xl border p-3 text-center font-black text-sm transition-all ${
                      edad === item
                        ? 'bg-purple-500/25 border-purple-400 text-white shadow-[0_0_22px_rgba(192,132,252,0.35)] scale-[1.02]'
                        : 'bg-black/50 border-white/10 text-slate-300 hover:border-purple-400/60 hover:bg-white/10'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
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
            <div className="relative w-full max-w-[460px] pb-6">
              <motion.div
                animate={{
                  y: [0, -4, 0],
                  rotate: [-0.35, 0.35, -0.35]
                }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative bg-slate-950/60 border border-cyan-300/20 rounded-[2.8rem] rounded-tr-[3.8rem] rounded-bl-[3.4rem] p-4 md:p-5 backdrop-blur-xl shadow-[0_0_32px_rgba(34,211,238,0.14)] overflow-hidden"
              >
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-cyan-400/12 rounded-full blur-2xl" />
                <div className="absolute -left-10 -bottom-10 w-28 h-28 bg-orange-400/10 rounded-full blur-2xl" />

                <div className="relative z-10 grid grid-cols-[auto_1fr] items-start gap-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.08, 1],
                      rotate: [-4, 5, -4]
                    }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative bg-orange-400/15 border border-orange-300/25 p-3 rounded-full text-orange-200 shadow-[0_0_22px_rgba(251,146,60,0.16)]"
                  >
                    <HelpCircle size={18} />
                    <span className="absolute -right-1 -top-2 text-lg">💡</span>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <p className="text-cyan-200/70 text-[8px] font-black uppercase tracking-[0.28em]">
                          Pista de prevención
                        </p>
                        <h4 className="text-orange-300 font-black text-[10px] md:text-xs uppercase tracking-[0.24em]">
                          ¿Sabías que...?
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-white/55">
                        <button
                          type="button"
                          onClick={prevFrase}
                          onMouseEnter={() => setIsHovering(true)}
                          onMouseLeave={() => setIsHovering(false)}
                          className="bg-white/5 hover:bg-cyan-400/15 hover:text-cyan-300 border border-white/10 hover:border-cyan-300/35 p-2 rounded-full transition-all"
                          aria-label="Ver dato anterior"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={nextFrase}
                          onMouseEnter={() => setIsHovering(true)}
                          onMouseLeave={() => setIsHovering(false)}
                          className="bg-white/5 hover:bg-cyan-400/15 hover:text-cyan-300 border border-white/10 hover:border-cyan-300/35 p-2 rounded-full transition-all"
                          aria-label="Ver siguiente dato"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="min-h-[4.8rem] pr-2">
                      <AnimatePresence mode="wait">
                        {frases.length > 0 && (
                          <motion.p
                            key={fraseIndex}
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.28 }}
                            className="text-white/88 text-[11px] md:text-xs leading-relaxed font-semibold"
                          >
                            {frases[fraseIndex]}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.22em] text-emerald-200/70">
                      <ShieldCheck size={12} />
                      Agente preparado
                    </div>
                  </div>
                </div>

                <motion.span
                  animate={{ y: [0, -7, 0], rotate: [-8, 8, -8] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  className="absolute right-5 bottom-4 text-xl"
                >
                  🧠
                </motion.span>
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-20 bottom-2 w-6 h-6 bg-slate-950/70 border border-cyan-300/20 rounded-full shadow-[0_0_18px_rgba(34,211,238,0.12)]"
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.55, 0.9, 0.55] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-12 -bottom-1 w-4 h-4 bg-slate-950/65 border border-cyan-300/20 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.45, 0.8, 0.45] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-3 -bottom-3 w-2.5 h-2.5 bg-slate-950/60 border border-cyan-300/20 rounded-full"
              />
            </div>
          </div>

        </section>
      </motion.section>

      <AnimatePresence>
        {showEscuelas && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-none"
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
