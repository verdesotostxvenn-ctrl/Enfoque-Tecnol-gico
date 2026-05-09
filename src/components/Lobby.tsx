import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ShieldCheck, MapPin, User, ChevronRight, Activity, X, Search, Database, Users, HelpCircle, BrainCircuit } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  // 💾 ESTADO PARA AVATAR (Chico/Chica)
  const [avatar, setAvatar] = useState('');
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
    if (!nombre || !escuela || !avatar) return; // Requiere también avatar
    setLoading(true);

    // 💾 Guardamos nombre, avatar y Nivel inicial en memoria local
    localStorage.setItem('agenteNombre', nombre);
    localStorage.setItem('agenteAvatar', avatar);
    localStorage.setItem('agenteNivel', '1');

    const { error } = await supabase.from('agentes').insert([{ nombre, institucion: escuela }]);
    if (error) {
      alert('Error de sincronización satelital.');
      setLoading(false);
    } else {
      navigate('/hub');
    }
  };

  return (
    // 🛠️ 'min-h-screen' y flex aseguran que todo quepa sin scrolling
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-10 relative overflow-hidden bg-[#020617] cursor-none">
      
      {/* Cursor Táctico (Z-index superior) */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px`, transform: 'translate(-50%, -50%)' }}
      >
        <motion.div 
          animate={{ scale: isHovering ? 1.25 : 1, borderColor: isHovering ? '#10b981' : '#22d3ee' }}
          className="w-7 h-7 border-2 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]"
        >
          <div className="w-1 h-1 bg-white rounded-full" />
        </motion.div>
      </div>

      {/* 🟢 BOKEH CON MOVIMIENTO COMPLEJO (Alrededor de la caja) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full blur-[140px] opacity-15`}
            animate={{
              // Trayectorias wandering que cubren toda la pantalla y el marco
              x: [0, i%2? 200 : -200, i%2? -100 : 150, 0],
              y: [0, i%2? -100 : 150, i%2? 200 : -100, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 20 + i * 5, // Duraciones y delays variados
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2
            }}
            style={{
              width: `${500 + i * 50}px`,
              height: `${500 + i * 50}px`,
              // Posicionamiento inicial estratégico alrededor de la caja
              top: i === 0 ? '-10%' : i === 2 ? '-5%' : 'unset',
              bottom: i === 1 ? '-10%' : i === 3 ? '-5%' : 'unset',
              left: i === 0 ? '-5%' : i === 1 ? ' unset' : '-10%',
              right: i === 2 ? '-5%' : i === 3 ? ' unset' : '-10%',
              background: i % 2 === 0 ? '#06b6d4' : '#10b981', // Alternar Cyan/Emerald
            }}
          />
        ))}
      </div>

      {/* 🛠️ CAJA CENTRAL CON ALTURA FLEXIBLE Y AJUSTE 'justify-between' */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-6xl h-[calc(100vh-2rem)] min-h-[750px] bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col lg:flex-row overflow-hidden z-10">
        
        {/* COLUMNA IZQUIERDA (Info y Quote - 'justify-between' empuja el quote al final) */}
        <div className="w-full lg:w-1/2 p-10 md:p-16 border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 text-cyan-400 mb-10">
              <Activity size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Misión Prevención Distrito 18D03</span>
            </div>
            <h1 className="text-[clamp(2.5rem,7.5vw,4.5rem)] font-black leading-[0.85] tracking-tighter mb-8 select-none text-whiteuppercase">
              Misión <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Prevención</span>
            </h1>
            {/* 🛠️ MAYOR LUMINOSIDAD EN DESCRIPCIÓN */}
            <p className="text-slate-200 text-base leading-relaxed max-w-sm mb-12">
              Protocolo estratégico para la gestión de riesgos naturales.
            </p>
          </div>

          {/* FRASE AL FINAL DENTRO DE LA CAJA (Garantizado sin scrolling) */}
          <div className="pt-8 border-t border-white/10 opacity-60">
            <p className="text-slate-400 italic text-sm border-l-2 border-cyan-500 pl-4">
              "Un buen conocimiento del riesgo ayuda a mejorar la resiliencia comunitaria"
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA (Formulario y Dato Curioso - 'justify-between') */}
        <div className="w-full lg:w-1/2 p-10 md:p-16 bg-black/10 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><User size={14} className="mr-2 text-cyan-400" /> Identidad del Agente</label>
              {/* 🛠️ SUBIENDO BRILLO EN INPUT Y PLACEHOLDER */}
              <input type="text" placeholder="Nombre completo..." required onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-cyan-500/50 transition-all text-xl font-bold placeholder:text-slate-700 text-white" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><School size={14} className="mr-2 text-emerald-400" /> Unidad Educativa Local</label>
              <button type="button" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setIsModalOpen(true)} className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${escuela ? 'border-emerald-500/50 bg-emerald-500/10 text-white' : 'border-white/5 bg-slate-950/60 text-slate-600'}`}><div className="flex items-center truncate mr-2"><MapPin className="mr-3 text-emerald-500 shrink-0" size={18} /><span className="font-bold uppercase text-sm truncate">{escuela || 'Seleccionar Escuela...'}</span></div><ChevronRight size={18} /></button>
            </div>

            {/* 💾 NUEVA SECCIÓN: Selección de Agente (Nivel 1) */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><Users size={14} className="mr-2 text-white" /> Selección de Agente (Nivel 1)</label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setAvatar('chica')} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className={`flex items-center space-x-3 p-5 rounded-2xl border transition-all ${avatar === 'chica' ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-950/60 border-white/5 text-slate-500 hover:bg-white/5'}`}>
                  <ShieldCheck size={18} className={`${avatar === 'chica' ? 'text-cyan-400' : 'text-slate-700'}`}/> <span className="font-black text-[10px] uppercase tracking-widest">👧🏽 Chica</span>
                </button>
                <button type="button" onClick={() => setAvatar('chico')} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className={`flex items-center space-x-3 p-5 rounded-2xl border transition-all ${avatar === 'chico' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-950/60 border-white/5 text-slate-500 hover:bg-white/5'}`}>
                  <ShieldCheck size={18} className={`${avatar === 'chico' ? 'text-emerald-400' : 'text-slate-700'}`}/> <span className="font-black text-[10px] uppercase tracking-widest">👦🏽 Chico</span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !nombre || !escuela || !avatar} className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 p-6 font-black uppercase tracking-[0.3em] text-black shadow-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-20"><div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[scan_4s_infinite_linear]" /><span className="relative z-10">{loading ? 'PROCESANDO...' : 'INICIAR PROTOCOLO'}</span></button>
          </form>

          {/* 🟢 NUEVO DATO CURIOSO COMO BURBUJA DE PENSAMIENTO (Thought Cloud) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="relative bg-[#330000]/80 border border-red-500/30 p-8 rounded-[2.5rem] mt-10 backdrop-blur-md">
            {/* Puntero de la burbuja */}
            <div className="absolute bottom-[-10px] left-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-red-500/30"></div>
            {/* Círculos flotantes de pensamiento */}
            <motion.div animate={{ y: [0, -15, 0], x: [0, 5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-12 left-10 text-3xl">💡</motion.div>
            <motion.div animate={{ y: [0, -10, 0], x: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.2 }} className="absolute -top-8 left-20 text-2xl">🧠</motion.div>
            
            <div className="flex items-start space-x-5">
              <BrainCircuit className="text-red-400 shrink-0 mt-1" size={24} />
              <div>
                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1.5">Sabías que...</h4>
                {/* 🛠️ MAYOR LUMINOSIDAD EN EL DATO CURIOSO */}
                <p className="text-red-200/90 text-xs leading-relaxed font-medium">El riesgo es una construcción social, es decir, no hay riesgo si no existen personas expuestas y vulnerables.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal de Escuelas (Intacto) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden z-[110]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/50"><div className="flex items-center space-x-3"><Search className="text-cyan-400" size={18} /><h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Censo del Distrito</h2></div><button onClick={() => setIsModalOpen(false)}><X size={20} className="text-white"/></button></div>
              <div className="p-8 max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 custom-scrollbar">
                {escuelasDisponibles.map((item) => (
                  <button key={item} onClick={() => { setEscuela(item); setIsModalOpen(false); }} className={`flex items-center p-4 rounded-xl border transition-all text-left ${escuela === item ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}>
                    <ShieldCheck size={14} className={`mr-3 ${escuela === item ? 'text-cyan-400' : 'text-slate-700'}`} /><span className="text-[10px] font-black uppercase tracking-tight">{item}</span>
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
