import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { School, ShieldCheck, MapPin, User, ChevronRight, Activity, X, Search, Database } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lógica del Cursor Personalizado
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
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

  const escuelasDisponibles = [
    "Escuela Río Blanco", "Escuela Río Verde", "U.E. Baños", 
    "Escuela 04", "Escuela 05", "Escuela 06", "Escuela 07",
    "Escuela 08", "Escuela 09", "Escuela 10", "Escuela 11",
    "Escuela 12", "Escuela 13", "Escuela 14", "Escuela 15",
    "Escuela 16", "Escuela 17", "Escuela 18", "Escuela 19"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !escuela) return;
    setLoading(true);
    const { error } = await supabase.from('agentes').insert([{ nombre, institucion: escuela }]);
    if (error) alert('Error de sincronización.');
    else alert('Acceso Concedido.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-10 relative overflow-hidden bg-[#020617]">
      
      {/* Cursor Personalizado (Solo visible en PC) */}
      <motion.div
        className="custom-cursor fixed top-0 left-0 w-8 h-8 border-2 border-cyan-500 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{ x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%' }}
      />

      {/* Micromovimientos de fondo mejorados */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-6xl bg-slate-900/30 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col lg:flex-row overflow-hidden z-10"
      >
        {/* PANEL IZQUIERDO */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="flex items-center space-x-3 text-cyan-400 mb-8">
            <Activity size={18} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Enlace Satelital Activo</span>
          </div>

          <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[0.9] tracking-tighter mb-8 select-none">
            MISIÓN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              PREVENCIÓN
            </span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mb-12">
            Protocolo de gestión de riesgos diseñado para el <span className="text-white font-bold decoration-cyan-500/50 underline-offset-4 underline">Distrito 18D03</span>.
          </p>

          <div className="flex items-center space-x-4 opacity-30">
            <Database size={20} />
            <div className="h-[1px] w-12 bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Protocolo v1.2.5</span>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 bg-black/10">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center">
                <User size={14} className="mr-2 text-cyan-400" /> Identidad del Estudiante
              </label>
              <input
                type="text"
                placeholder="Escribe tu nombre..."
                required
                className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500/50 transition-all text-lg font-bold placeholder:text-slate-800"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center">
                <School size={14} className="mr-2 text-emerald-400" /> Unidad Educativa
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
                <ChevronRight size={18} className="shrink-0" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !nombre || !escuela}
              className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 p-5 font-black uppercase tracking-[0.3em] text-black shadow-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-20"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[scan_3s_infinite_ease-in-out]" />
              <span className="relative z-10">{loading ? 'CONECTANDO...' : 'INICIAR PROTOCOLO'}</span>
            </button>
          </form>
        </div>
      </motion.div>

      {/* MODAL DE ESCUELAS MEJORADO */}
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
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                <div className="flex items-center space-x-3">
                  <Search className="text-cyan-400" size={18} />
                  <h2 className="text-sm md:text-lg font-black uppercase tracking-widest">Despliegue de Unidades</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                {escuelasDisponibles.map((item) => (
                  <button
                    key={item}
                    onClick={() => { setEscuela(item); setIsModalOpen(false); }}
                    className={`flex items-center p-4 rounded-xl border transition-all text-left ${
                      escuela === item 
                      ? 'bg-cyan-500/10 border-cyan-500 text-white' 
                      : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <ShieldCheck size={14} className={`mr-3 ${escuela === item ? 'text-cyan-400' : 'text-slate-600'}`} />
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
