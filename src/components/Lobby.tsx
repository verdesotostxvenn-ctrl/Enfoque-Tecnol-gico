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
  User,
  Users,
  X,
  Minus,
  Plus
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
  'Unidad Educativa'
];

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
  const mouseX = useSpring(rawMouseX, { stiffness: 1300, damping: 65 });
  const mouseY = useSpring(rawMouseY, { stiffness: 1300, damping: 65 });
  
  const bokehX = useTransform(rawMouseX, [0, 1400], [-45, 45]);
  const bokehY = useTransform(rawMouseY, [0, 900], [-32, 32]);

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
    <main className="h-screen max-h-screen w-full bg-[#010413] text-white relative overflow-hidden flex items-center justify-center p-2 md:p-4 cursor-none">
      
      {/* Fondo Bokeh */}
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:30px_30px] opacity-45" />
      </motion.div>

      <motion.section
        initial={{ opacity: 0, scale: 0.965, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-6xl h-[94vh] bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
      >
        <aside className="relative overflow-hidden bg-slate-950/55 border-b lg:border-b-0 lg:border-r border-white/10 p-4 md:p-6 flex flex-col justify-between">
          <div className="relative z-10">
            <h1 className="text-[2.35rem] md:text-[3.85rem] font-black leading-[0.86] tracking-tighter uppercase">
              Misión <br />
              <span className="text-orange-500">Prevención</span>
            </h1>
          </div>
        </aside>

        <section className="bg-black/30 p-4 md:p-6 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Escribe tu nombre..."
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-orange-500 transition-all text-sm"
            />

            <div>
              <label className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 mb-1.5 block">
                Tu Edad ({edad} años)
              </label>
              <div className="flex items-center gap-3 w-full">
                <button type="button" onClick={() => setEdad(Math.max(6, edad - 1))} className="bg-black/50 border border-white/10 p-3 rounded-2xl text-white hover:border-purple-400"><Minus size={16} /></button>
                <div className="flex-1 bg-black/50 border border-white/10 rounded-2xl p-3 text-center font-black text-lg text-purple-400">{edad}</div>
                <button type="button" onClick={() => setEdad(Math.min(14, edad + 1))} className="bg-black/50 border border-white/10 p-3 rounded-2xl text-white hover:border-purple-400"><Plus size={16} /></button>
              </div>
            </div>

            <button type="button" onClick={() => setShowEscuelas(true)} className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold outline-none flex items-center justify-between text-sm">
              {escuela || 'Seleccionar escuela...'} <MapPin size={17} />
            </button>

            <button type="submit" className="w-full bg-orange-600 rounded-2xl p-3.5 text-white font-black uppercase tracking-[0.2em] shadow-[0_15px_35px_rgba(249,115,22,0.28)]">
              Comenzar
            </button>
          </form>
        </section>
      </motion.section>

      <AnimatePresence>
        {showEscuelas && (
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-6 rounded-3xl border border-white/10 max-h-[80vh] overflow-y-auto">
              {escuelasDisponibles.map((item) => (
                <button key={item} onClick={() => { setEscuela(item); setShowEscuelas(false); }} className="p-3 bg-white/5 rounded-xl border border-white/10 text-[10px] uppercase font-bold text-left hover:border-cyan-400">
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
        className="fixed top-0 left-0 pointer-events-none z-[999999] hidden md:block"
      >
        <div className="w-4 h-4 rounded-full border-2 border-cyan-400 bg-cyan-400/20" />
      </motion.div>
    </main>
  );
};

export default LobbyUltra;
