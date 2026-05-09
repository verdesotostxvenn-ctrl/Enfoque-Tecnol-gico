import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ShieldCheck, MapPin, User, ChevronRight, Activity, X, Search, Database, Target } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // 🖱️ Lógica de Cursor Ultra-Fluido (Smooth Follow)
  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animateCursor = () => {
      // Técnica LERP para suavidad sin delay apreciable
      const easing = 0.15; 
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * easing;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * easing;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(animateCursor);
    };

    window.addEventListener('mousemove', handleMouseMove);
    const animationFrame = requestAnimationFrame(animateCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const escuelasDisponibles = [
    "Escuela Río Blanco", "Escuela Río Verde", "U.E. Baños", 
    "U.E. Misael Acosta Solís", "Escuela Juan Montalvo", "U.E. 16 de Diciembre"
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
      
      {/* 🟢 CURSOR TÁCTICO PERSONALIZADO */}
      <div
        ref={cursorRef}
        className="custom-cursor fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
      >
        <motion.div 
          animate={{ 
            scale: isHovering ? 1.4 : 1,
            backgroundColor: isHovering ? "rgba(16, 185, 129, 0.1)" : "transparent",
            borderColor: isHovering ? "#10b981" : "#06b6d4"
          }}
          className="w-10 h-10 border-2 rounded-full flex items-center justify-center transition-colors duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          {isHovering ? (
            <Target size={14} className="text-emerald-400" />
          ) : (
            <div className="w-1 h-1 bg-cyan-400 rounded-full" />
          )}
        </motion.div>
      </div>

      {/* 🔵 EFECTO BOKEH INTENSIFICADO */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ 
            x: [0, 120, -120, 0], 
            y: [0, -80, 80, 0],
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-[550px] h-[550px] bg-cyan-600/20 rounded-full blur-[110px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 100, 0], 
            y: [0, 100, -100, 0],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-10 w-[650px] h-[650px] bg-emerald-600/15 rounded-full blur-[140px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl bg-slate-900/30 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row overflow-hidden z-10"
      >
        {/* PANEL IZQUIERDO */}
        <div className="w-full lg:w-1/2 p-10 md:p-16 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 text-cyan-400 mb-12">
              <Activity size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Protocolo Distrital 18D03</span>
            </div>

            <h1 className="text-[clamp(2.5rem,7.5vw,4.5rem)] font-black leading-[0.85] tracking-tighter mb-8 select-none">
              MISIÓN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                PREVENCIÓN
              </span>
            </h1>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md">
              Software estratégico de gestión de riesgos para la protección estudiantil en el <span className="text-white font-bold underline decoration-cyan-500/50 underline-offset-4">Cantón Baños</span>.
            </p>
          </div>

          <div className="mt-12 flex items-center space-x-4 opacity-40">
            <Database size={20} className="text-slate-500" />
            <div className="h-[1px] w-12 bg-white/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Sincronización v1.2.8</span>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="w-full lg:w-1/2 p-10 md:p-16 bg-black/20">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center">
                <User size={14} className="mr-2 text-cyan-400" /> Identificación del Estudiante
              </label>
              <input
                type="text"
                placeholder="Ingresa tu nombre completo..."
                required
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-cyan-500/50 transition-all text-xl font-bold placeholder:text-slate-800"
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
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => setIsModalOpen(true)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                  escuela 
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-white' 
                  : 'border-white/5 bg-slate-950/50 text-slate-600'
                }`}
              >
                <div className="flex items-center truncate mr-2">
                  <MapPin className="mr-3 text-emerald-500 shrink-0" size={18} />
                  <span className="font-bold uppercase text-sm truncate">
                    {escuela || 'Seleccionar Unidad Educativa...'}
                  </span>
                </div>
                <ChevronRight size={18} />
              </button>
            </div>

            <button
              type="submit"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              disabled={loading || !nombre || !escuela}
              className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 p-6 font-black uppercase tracking-[0.4em] text-black shadow-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-20"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[scan_4s_infinite_linear]" />
              <span className="relative z-10">{loading ? 'CONECTANDO...' : 'INICIAR PROTOCOLO'}</span>
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
                <div className="flex items-center space-x-3 text-cyan-400">
                  <Search size={18} />
                  <h2 className="text-xs font-black uppercase tracking-[0.3em]">Censo de Unidades</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 custom-scrollbar">
                {escuelasDisponibles.map((item) => (
                  <button
                    key={item}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onClick={() => { setEscuela(item); setIsModalOpen(false); }}
                    className={`flex items-center p-4 rounded-xl border transition-all text-left ${
                      escuela === item 
                      ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
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
