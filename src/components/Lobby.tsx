import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { School, ShieldCheck, MapPin, User, ChevronRight, Activity, X, Search, Database } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lógica del Cursor Táctico (Mouse Follower)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 30, stiffness: 500 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  // Lista de ejemplo para el Distrito 18D03
  const escuelasDisponibles = [
    "Escuela Río Blanco", "Escuela Río Verde", "U.E. Baños", 
    "Unidad Educativa 04", "Unidad Educativa 05", "Unidad Educativa 06", 
    "Unidad Educativa 07", "Unidad Educativa 08", "Unidad Educativa 09", 
    "Unidad Educativa 10", "Unidad Educativa 11", "Unidad Educativa 12"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !escuela) return;
    setLoading(true);
    const { error } = await supabase.from('agentes').insert([{ nombre, institucion: escuela }]);
    if (error) alert('Error de conexión satelital.');
    else alert('Acceso Concedido. Sistema de Prevención iniciado.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-10 relative overflow-hidden bg-[#020617]">
      
      {/* Cursor Táctico Personalizado (Solo en PC) */}
      <motion.div
        className="custom-cursor fixed top-0 left-0 w-6 h-6 border-2 border-cyan-400 rounded-full pointer-events-none z-[9999] mix-blend-screen hidden md:block shadow-[0_0_15px_rgba(34,211,238,0.5)]"
        style={{ x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-400 rounded-full" />
      </motion.div>

      {/* Micromovimientos de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 20, 0], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.2)_0%,transparent_50%)]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-6xl bg-slate-900/20 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col lg:flex-row overflow-hidden z-10"
      >
        {/* PANEL IZQUIERDO */}
        <div className="w-full lg:w-1/2 p-10 md:p-16 border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="flex items-center space-x-3 text-cyan-400 mb-10">
            <Activity size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Enlace Seguro Activo</span>
          </div>

          <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-black leading-[0.85] tracking-tighter mb-8">
            MISIÓN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              PREVENCIÓN
            </span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mb-12">
            Protocolo estratégico para la gestión de riesgos naturales del <span className="text-white font-bold underline decoration-cyan-500/30">Distrito 18D03</span>.
          </p>

          <div className="flex items-center space-x-4 opacity-30">
            <Database size={20} />
            <div className="h-[1px] w-12 bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Protocolo v1.2.5</span>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="w-full lg:w-1/2 p-10 md:p-16 bg-black/5">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center">
                <User size={14} className="mr-2 text-cyan-400" /> Identidad del Estudiante
              </label>
              <input
                type="text"
                placeholder="Nombre completo..."
                required
                className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-cyan-500/50 transition-all text-xl font-bold placeholder:text-slate-800"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center">
                <School size={14} className="mr-2 text-emerald-400" /> Unidad Educativa Local
              </label>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                  escuela 
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-white' 
                  : 'border-white/5 bg-slate-950/40 text-slate-600'
                }`}
              >
                <div className="flex items-center truncate mr-2">
                  <MapPin className="mr-3 text-emerald-500 shrink-0" size={18} />
                  <span className="font-bold uppercase text-sm truncate">
                    {escuela || 'Seleccionar Escuela...'}
                  </span>
                </div>
                <ChevronRight size={18} />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !nombre || !escuela}
              className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 p-6 font-black uppercase tracking-[0.3em] text-black shadow-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-20"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[scan_4s_infinite_linear]" />
              <span className="relative z-10 font-black">{loading ? 'CONECTANDO...' : 'INICIAR PROTOCOLO'}</span>
            </button>
          </form>
        </div>
      </motion.div>

      {/* MODAL DE UNIDADES */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                <div className="flex items-center space-x-3">
                  <Search className="text-cyan-400" size={18} />
                  <h2 className="text-sm font-black uppercase tracking-[0.3em]">Unidades del Distrito</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 custom-scrollbar">
                {escuelasDisponibles.map((item) => (
                  <button
                    key={item}
                    onClick={() => { setEscuela(item); setIsModalOpen(false); }}
                    className={`flex items-center p-4 rounded-xl border transition-all text-left ${
                      escuela === item 
                      ? 'bg-cyan-500/10 border-cyan-500 text-white' 
                      : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'
                    }`}
                  >
                    <ShieldCheck size={14} className={`mr-3 ${escuela === item ? 'text-cyan-400' : 'text-slate-700'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{item}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lobby;
