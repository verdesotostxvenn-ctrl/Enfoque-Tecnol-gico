import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
  Activity,
  Brain,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  MapPin,
  School,
  User,
  Users,
  X
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const avatarImages = {
  chica: 'https://api.dicebear.com/8.x/adventurer/svg?seed=agente-nina-prevencion',
  chico: 'https://api.dicebear.com/8.x/adventurer/svg?seed=agente-nino-prevencion'
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

const Lobby = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [avatar, setAvatar] = useState<'chica' | 'chico' | ''>('');
  const [hoverAvatar, setHoverAvatar] = useState<'chica' | 'chico' | ''>('');
  const [loading, setLoading] = useState(false);
  const [showEscuelas, setShowEscuelas] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const rawMouseX = useMotionValue(-100);
  const rawMouseY = useMotionValue(-100);
  const mouseX = useSpring(rawMouseX, { stiffness: 900, damping: 45 });
  const mouseY = useSpring(rawMouseY, { stiffness: 900, damping: 45 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      rawMouseX.set(e.clientX);
      rawMouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [rawMouseX, rawMouseY]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
          institucion: escuela
        }
      ]);

      if (error) {
        console.warn('Supabase no sincronizó, pero el agente fue guardado localmente:', error.message);
      }
    } catch (error) {
      console.warn('Fallo de red con Supabase. Registro local guardado:', error);
    }

    window.dispatchEvent(new Event('agenteNivelActualizado'));

    setTimeout(() => {
      setLoading(false);
      navigate('/hub');
    }, 850);
  };

  return (
    <div className="min-h-screen w-full bg-[#010413] text-white relative overflow-hidden flex items-center justify-center p-5 cursor-none">
      {/* Cursor táctico */}
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
            scale: isHovering ? 1.75 : 1,
            borderColor: isHovering ? '#f97316' : '#22d3ee',
            backgroundColor: isHovering ? 'rgba(249,115,22,0.16)' : 'rgba(34,211,238,0.12)'
          }}
          className="w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-[0_0_26px_rgba(34,211,238,0.65)] backdrop-blur-sm"
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff]" />
        </motion.div>
      </motion.div>

      {/* Fondo bokeh orbital */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="absolute top-0 left-1/2 w-72 h-72 bg-orange-500/25 rounded-full blur-[110px]" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/20 rounded-full blur-[120px]" />
          <div className="absolute left-0 top-1/2 w-64 h-64 bg-emerald-500/15 rounded-full blur-[120px]" />
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.16, 0.3, 0.16] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute -top-36 -left-36 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[140px]"
        />

        <motion.div
          animate={{ scale: [1.15, 1, 1.15], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: 6.5, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-[520px] h-[520px] bg-cyan-500/20 rounded-full blur-[140px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 w-full max-w-6xl bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.5)]"
      >
        {/* Izquierda */}
        <div className="p-8 md:p-14 bg-slate-950/50 border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 text-orange-500 mb-6">
              <Activity size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Distrito 18D03
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tighter uppercase mb-6">
              Misión <br />
              <span className="text-orange-500">Prevención</span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-md mb-10">
              Plataforma educativa de gestión de riesgos para entrenar agentes infantiles en prevención, emergencia y evacuación.
            </p>

            <div className="relative w-40">
              <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full" />
              <img
                src="https://blogger.googleusercontent.com/img/a/AVvXsEhwwQia3e2LdO2aVrT1GFE6Cojzx6-lve9qceOZH3IiwXtV3wYKFiTioE7lSASVOnjdUexdIJwv9PUVScy_iupzCzzbbGUp7S1ByxBcJWK8fsZVexSyKj2oh7VgnJZ7iC4bkUjuko0R7SH-Lzgii-JsZmRgbdNWqQlwFlQ194py9fA-fCIIhM1HrHesW3pv"
                alt="Logo"
                className="relative z-10 w-full h-auto drop-shadow-2xl"
              />
            </div>

            <div className="mt-10 pt-6 border-t border-white/10">
              <p className="text-xs text-white/85 font-bold italic border-l-2 border-orange-500 pl-4 uppercase leading-relaxed">
                “Un buen conocimiento del riesgo ayuda a mejorar la resiliencia comunitaria”
              </p>
            </div>

            {/* Nube de idea */}
            <div className="mt-10 relative">
              <motion.div
                animate={{ rotate: [-1.5, 1.5, -1.5], y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative bg-white/10 border border-white/10 p-7 rounded-[3.2rem] rounded-bl-xl backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.07)]"
              >
                <div className="absolute -top-8 right-12 flex gap-3">
                  <motion.div
                    animate={{ y: [0, -9, 0], rotate: [-8, 8, -8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-yellow-300 text-black p-3 rounded-full shadow-[0_0_22px_rgba(250,204,21,0.7)]"
                  >
                    <Lightbulb size={22} />
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -7, 0], scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                    className="bg-pink-400 text-black p-3 rounded-full shadow-[0_0_22px_rgba(244,114,182,0.55)]"
                  >
                    <Brain size={22} />
                  </motion.div>
                </div>

                <div className="flex gap-3 pt-3">
                  <HelpCircle className="text-orange-400 shrink-0 mt-1" size={22} />
                  <div>
                    <h4 className="text-orange-300 font-black text-[10px] uppercase tracking-[0.25em] mb-1">
                      ¿Sabías que?
                    </h4>
                    <p className="text-white text-xs leading-relaxed font-semibold">
                      El riesgo es una construcción social: no hay riesgo si no existen personas expuestas y vulnerables.
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-3 left-10 w-8 h-8 bg-white/10 border-l border-b border-white/10 rotate-45" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Derecha */}
        <div className="p-8 md:p-14 bg-black/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center mb-2">
                <User size={14} className="mr-2 text-orange-500" />
                Registro de identidad
              </label>

              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                placeholder="Escribe tu nombre..."
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center mb-2">
                <School size={14} className="mr-2 text-cyan-400" />
                Unidad educativa local
              </label>

              <button
                type="button"
                onClick={() => setShowEscuelas(true)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none hover:border-cyan-400 transition-all flex items-center justify-between text-left"
              >
                <span className={escuela ? 'text-white' : 'text-slate-500'}>
                  {escuela || 'Seleccionar escuela...'}
                </span>
                <MapPin className="text-cyan-400" size={18} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center mb-3">
                <Users size={14} className="mr-2 text-white" />
                Selecciona tu agente
              </label>

              <div className="grid grid-cols-2 gap-4">
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
                  whileHover={{ y: -8, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`p-5 rounded-3xl border transition-all ${
                    avatar === 'chica' || hoverAvatar === 'chica'
                      ? 'bg-orange-500/20 border-orange-500 shadow-[0_0_28px_rgba(249,115,22,0.35)]'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <img
                    src={avatarImages.chica}
                    alt="Avatar niña"
                    className="w-24 h-24 mx-auto mb-3 rounded-3xl bg-white/10 p-2"
                  />
                  <div className="text-[10px] font-black uppercase tracking-widest">
                    Niña
                  </div>
                  <div className="text-[8px] mt-1 text-orange-200/70 uppercase font-black tracking-widest">
                    Agente alerta
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
                  whileHover={{ y: -8, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`p-5 rounded-3xl border transition-all ${
                    avatar === 'chico' || hoverAvatar === 'chico'
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_28px_rgba(34,211,238,0.35)]'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <img
                    src={avatarImages.chico}
                    alt="Avatar niño"
                    className="w-24 h-24 mx-auto mb-3 rounded-3xl bg-white/10 p-2"
                  />
                  <div className="text-[10px] font-black uppercase tracking-widest">
                    Niño
                  </div>
                  <div className="text-[8px] mt-1 text-cyan-200/70 uppercase font-black tracking-widest">
                    Agente táctico
                  </div>
                </motion.button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !nombre.trim() || !escuela || !avatar}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              whileHover={!loading ? { scale: 1.025, y: -3 } : {}}
              whileTap={!loading ? { scale: 0.96 } : {}}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-30 rounded-2xl p-5 text-white font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-[0_15px_35px_rgba(249,115,22,0.25)]"
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
                  <ChevronRight size={18} />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Modal escuelas */}
      <AnimatePresence>
        {showEscuelas && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEscuelas(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity:
