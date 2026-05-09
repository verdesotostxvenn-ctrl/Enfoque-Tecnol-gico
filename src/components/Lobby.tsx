import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import {
  Activity,
  ChevronRight,
  HelpCircle,
  MapPin,
  School,
  User,
  Users,
  X
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const Lobby = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEscuelas, setShowEscuelas] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

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

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [mouseX, mouseY]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nombre.trim() || !escuela || !avatar) return;

    setLoading(true);

    const nombreLimpio = nombre.trim();

    // Guardado local SIEMPRE
    localStorage.setItem('agenteNombre', nombreLimpio);
    localStorage.setItem('agenteEscuela', escuela);
    localStorage.setItem('agenteAvatar', avatar);
    localStorage.setItem('agenteNivel', '1');
    localStorage.setItem('misionVolcanCompletada', 'false');
    localStorage.setItem('misionInundacionCompletada', 'false');
    localStorage.setItem('misionEvacuacionCompletada', 'false');

    // Sync con Supabase sin bloquear
    try {
      const { error } = await supabase.from('agentes').insert([
        {
          nombre: nombreLimpio,
          institucion: escuela,
          avatar,
          nivel: 1
        }
      ]);

      if (error) {
        console.warn('Supabase no sincronizó:', error.message);
      }
    } catch (err) {
      console.warn('Fallo de red con Supabase:', err);
    }

    window.dispatchEvent(new Event('agenteNivelActualizado'));

    setTimeout(() => {
      setLoading(false);
      navigate('/hub');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#010413] text-white relative overflow-hidden flex items-center justify-center p-5">

      {/* CURSOR */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999999]"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%'
        }}
      >
        <div className="w-6 h-6 rounded-full border-2 border-orange-400 bg-white/5 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      </motion.div>

      {/* FONDO */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-6xl bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 backdrop-blur-2xl"
      >

        {/* LADO IZQUIERDO */}
        <div className="p-8 md:p-14 bg-slate-950/50 border-r border-white/10">

          <div className="flex items-center gap-3 text-orange-500 mb-6">
            <Activity size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Distrito 18D03
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-none mb-6 uppercase">
            Misión <br />
            <span className="text-orange-500">Prevención</span>
          </h1>

          <p className="text-slate-300 mb-8">
            Plataforma educativa de gestión de riesgos para agentes infantiles.
          </p>

          <img
            src="https://blogger.googleusercontent.com/img/a/AVvXsEhwwQia3e2LdO2aVrT1GFE6Cojzx6-lve9qceOZH3IiwXtV3wYKFiTioE7lSASVOnjdUexdIJwv9PUVScy_iupzCzzbbGUp7S1ByxBcJWK8fsZVexSyKj2oh7VgnJZ7iC4bkUjuko0R7SH-Lzgii-JsZmRgbdNWqQlwFlQ194py9fA-fCIIhM1HrHesW3pv"
            alt="Logo"
            className="w-40"
          />

          {/* SABÍAS QUE */}
          <div className="mt-10 bg-white/5 border border-white/10 p-6 rounded-[2rem] relative">
            <div className="flex gap-3">
              <HelpCircle className="text-orange-400" />
              <div>
                <h4 className="font-black text-orange-400 text-xs mb-1">
                  ¿SABÍAS QUE?
                </h4>

                <div className="flex gap-2 mb-2">
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    💡
                  </motion.span>

                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.4 }}
                  >
                    🧠
                  </motion.span>
                </div>

                <p className="text-xs text-white">
                  El riesgo existe cuando hay personas expuestas y vulnerables.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DERECHO */}
        <div className="p-8 md:p-14 bg-black/30">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* NOMBRE */}
            <div>
              <label className="text-[10px] uppercase flex items-center mb-2">
                <User size={14} className="mr-2 text-orange-500" />
                Nombre
              </label>

              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Escribe tu nombre..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4"
              />
            </div>

            {/* ESCUELA */}
            <div>
              <label className="text-[10px] uppercase flex items-center mb-2">
                <School size={14} className="mr-2 text-cyan-400" />
                Escuela
              </label>

              <button
                type="button"
                onClick={() => setShowEscuelas(true)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-left flex justify-between"
              >
                <span>
                  {escuela || 'Seleccionar escuela...'}
                </span>

                <MapPin className="text-cyan-400" />
              </button>
            </div>

            {/* AVATARES */}
            <div>
              <label className="text-[10px] uppercase flex items-center mb-3">
                <Users size={14} className="mr-2" />
                Selecciona tu agente
              </label>

              <div className="grid grid-cols-2 gap-4">

                <button
                  type="button"
                  onClick={() => setAvatar('chica')}
                  className={`p-4 rounded-3xl border ${
                    avatar === 'chica'
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-white/10'
                  }`}
                >
                  <img
                    src="https://api.dicebear.com/8.x/adventurer/svg?seed=girl"
                    alt="Niña"
                    className="w-20 h-20 mx-auto mb-2"
                  />
                  <p className="text-xs font-black">NIÑA</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAvatar('chico')}
                  className={`p-4 rounded-3xl border ${
                    avatar === 'chico'
                      ? 'border-cyan-400 bg-cyan-400/20'
                      : 'border-white/10'
                  }`}
                >
                  <img
                    src="https://api.dicebear.com/8.x/adventurer/svg?seed=boy"
                    alt="Niño"
                    className="w-20 h-20 mx-auto mb-2"
                  />
                  <p className="text-xs font-black">NIÑO</p>
                </button>

              </div>
            </div>

            {/* BOTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 rounded-2xl p-5 font-black uppercase flex items-center justify-center gap-2"
            >
              {loading ? 'Preparando misión...' : 'Comenzar aventura'}
              {!loading && <ChevronRight size={18} />}
            </button>

          </form>
        </div>
      </motion.div>

      {/* MODAL ESCUELAS */}
      <AnimatePresence>
        {showEscuelas && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/70 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-lg max-h-[70vh] overflow-auto border border-white/10">

              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black">Selecciona tu escuela</h3>

                <button onClick={() => setShowEscuelas(false)}>
                  <X />
                </button>
              </div>

              <div className="space-y-2">
                {escuelasDisponibles.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setEscuela(item);
                      setShowEscuelas(false);
                    }}
                    className="w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-cyan-500/20"
                  >
                    {item}
                  </button>
                ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Lobby;
