import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ShieldCheck, MapPin, User, ChevronRight, Activity, X, Search, Database, Users, HelpCircle } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  // NUEVO: Estado para el personaje (chico o chica)
  const [personaje, setPersonaje] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const escuelasDisponibles = [
    "Escuela Río Blanco", "Escuela Río Verde", "U.E. Baños", 
    "Unidad Educativa 04", "Unidad Educativa 05", "Unidad Educativa 06", 
    "Unidad Educativa 07", "Unidad Educativa 08", "Unidad Educativa 09", 
    "Unidad Educativa 10", "Unidad Educativa 11", "Unidad Educativa 12"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Requerimos que también elija un personaje
    if (!nombre || !escuela || !personaje) return;
    setLoading(true);
    
    // Guardar nombre y personaje localmente
    localStorage.setItem('agenteNombre', nombre);
    localStorage.setItem('agenteAvatar', personaje);

    // Guardar en Supabase (solo enviamos nombre e institucion como lo tenías, para no dar error)
    const { error } = await supabase.from('agentes').insert([{ nombre, institucion: escuela }]);
    if (error) {
      alert('Error de sincronización satelital.');
      setLoading(false);
    } else {
      navigate('/hub');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-10 relative overflow-hidden bg-[#020617] cursor-none">
      
      {/* Cursor Táctico (Z-index superior) */}
      <div
        className="custom-cursor fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px`, transform: 'translate(-50%, -50%)' }}
      >
        <motion.div 
          animate={{ scale: isHovering ? 1.25 : 1, borderColor: isHovering ? '#10b981' : '#22d3ee' }}
          className="w-7 h-7 border-2 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]"
        >
          <div className="w-1 h-1 bg-white rounded-full" />
        </motion.div>
      </div>

      {/* Bokeh de fondo */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div animate={{ x: [0, 100, -100, 0], y: [0, -80, 80, 0], scale: [1, 1.3, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[110px]" />
        <motion.div animate={{ x: [0, -120, 120, 0], y: [0, 60, -60, 0], scale: [1, 1.2, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[140px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-6xl bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col lg:flex-row overflow-hidden z-10">
        
        {/* COLUMNA IZQUIERDA (Adaptada al borrador) */}
        <div className="w-full lg:w-1/2 p-10 md:p-16 border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-950/20 flex flex-col">
          <div className="flex items-center space-x-3 text-cyan-400 mb-10">
            <Activity size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Distrito 18D03</span>
          </div>

          <h1 className="text-[clamp(2.5rem,5.5vw,4rem)] font-black leading-[0.95] tracking-tighter mb-6 select-none text-white">
            MISIÓN <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">PREVENCIÓN</span>
          </h1>
          
          {/* Texto exacto de Jahir */}
          <p className="text-slate-300 text-lg leading-relaxed max-w-md mb-10">
            Plataforma de educación en Gestión de Riesgos de Desastres para el distrito 18D03.
          </p>

          {/* Logo de Protección Civil (Círculo rojo con triángulo blanco) */}
          <div className="flex items-center mb-auto">
            <div className="w-24 h-24 bg-[#8b0000] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(139,0,0,0.5)] border-2 border-red-900/50">
              <div className="w-0 h-0 border-l-[25px] border-r-[25px] border-b-[43.3px] border-l-transparent border-r-transparent border-b-white mt-[-5px]"></div>
            </div>
          </div>

          {/* Frase del borrador en la parte inferior */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-slate-400 italic text-sm border-l-2 border-cyan-500 pl-4">
              "Un buen conocimiento del riesgo ayuda a mejorar la resiliencia comunitaria"
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA (Formulario interactivo) */}
        <div className="w-full lg:w-1/2 p-10 md:p-16 bg-black/10 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><User size={14} className="mr-2 text-cyan-400" /> Regístrese: Introduzca su nombre</label>
              <input type="text" placeholder="Tu nombre..." required onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500/50 transition-all text-xl font-bold placeholder:text-slate-800 text-white" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><School size={14} className="mr-2 text-emerald-400" /> Unidad Educativa Local</label>
              <button type="button" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setIsModalOpen(true)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${escuela ? 'border-emerald-500/50 bg-emerald-500/10 text-white' : 'border-white/5 bg-slate-950/60 text-slate-600'}`}><div className="flex items-center truncate mr-2"><MapPin className="mr-3 text-emerald-500 shrink-0" size={18} /><span className="font-bold uppercase text-sm truncate">{escuela || 'Seleccionar Escuela...'}</span></div><ChevronRight size={18} /></button>
            </div>

            {/* NUEVO: Selección de Personaje */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><Users size={14} className="mr-2 text-purple-400" /> Seleccione su personaje</label>
              <div className="flex gap-4">
                <button type="button" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setPersonaje('chica')} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${personaje === 'chica' ? 'border-purple-500 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-white/5 bg-slate-950/60 opacity-60 hover:opacity-100 hover:bg-white/5'}`}>
                  <span className="text-4xl mb-2">👧🏽</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Niña</span>
                </button>
                <button type="button" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setPersonaje('chico')} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${personaje === 'chico' ? 'border-orange-500 bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-white/5 bg-slate-950/60 opacity-60 hover:opacity-100 hover:bg-white/5'}`}>
                  <span className="text-4xl mb-2">👦🏽</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Niño</span>
                </button>
              </div>
            </div>

            <button type="submit" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} disabled={loading || !nombre || !escuela || !personaje} className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 p-5 font-black uppercase tracking-[0.3em] text-black shadow-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-20 mt-4"><div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[scan_4s_infinite_linear]" /><span className="relative z-10">{loading ? 'PROCESANDO...' : 'COMENZAR AVENTURA'}</span></button>
          </form>

          {/* NUEVO: Dato Curioso (¿Sabías que?) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 bg-[#2a0808]/80 border border-red-500/30 p-5 rounded-[2rem] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-start space-x-4 relative z-10">
              <HelpCircle className="text-red-400 shrink-0 mt-1" size={24} />
              <div>
                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">¿Sabías que?</h4>
                <p className="text-red-200/80 text-xs leading-relaxed font-medium">El riesgo es una construcción social, es decir, no hay riesgo si no existen personas.</p>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Modal de Escuelas (Intacto) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden z-[60]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/50"><div className="flex items-center space-x-3"><Search className="text-cyan-400" size={18} /><h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Censo del Distrito</h2></div><button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20} className="text-white"/></button></div>
              <div className="p-8 max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 custom-scrollbar">
                {escuelasDisponibles.map((item) => (
                  <button key={item} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => { setEscuela(item); setIsModalOpen(false); }} className={`flex items-center p-4 rounded-xl border transition-all text-left ${escuela === item ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}><ShieldCheck size={14} className={`mr-3 ${escuela === item ? 'text-cyan-400' : 'text-slate-700'}`} /><span className="text-[10px] font-black uppercase tracking-tight">{item}</span></button>
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
