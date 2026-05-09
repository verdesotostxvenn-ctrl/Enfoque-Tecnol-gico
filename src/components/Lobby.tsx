import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { School, ShieldCheck, MapPin, User, ChevronRight, Activity, X, Search, Database, Users, HelpCircle, BrainCircuit } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // 🚀 EL SECRETO DE LOS 60 FPS: Usamos MotionValues para mover el cursor sin re-renders
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  // Configuramos un suavizado (spring) para que se sienta más orgánico
  const springConfig = { damping: 25, stiffness: 300 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!cursorVisible) setCursorVisible(true);
    };

    const handleMouseLeave = () => setCursorVisible(false);
    const handleMouseEnter = () => setCursorVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorVisible, mouseX, mouseY]);

  const escuelasDisponibles = [
    "Escuela Río Blanco", "Escuela Río Verde", "U.E. Baños", 
    "Unidad Educativa 04", "Unidad Educativa 05", "Unidad Educativa 06", 
    "Unidad Educativa 07", "Unidad Educativa 08", "Unidad Educativa 09", 
    "Unidad Educativa 10", "Unidad Educativa 11", "Unidad Educativa 12"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !escuela || !avatar) return;
    setLoading(true);

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
    // 'h-screen overflow-hidden' asegura que no haya scroll en PC
    <div className="h-screen w-full flex items-center justify-center p-4 md:p-6 relative overflow-hidden bg-[#020617] cursor-none">
      
      {/* 🖱️ CURSOR DE ALTO RENDIMIENTO (Fuera del flujo de React) */}
      <motion.div
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
      >
        <motion.div 
          animate={{ scale: isHovering ? 1.25 : 1, borderColor: isHovering ? '#f97316' : '#22d3ee' }}
          className="w-7 h-7 border-2 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]"
        >
          <div className="w-1 h-1 bg-white rounded-full" />
        </motion.div>
      </motion.div>

      {/* Bokeh de fondo con movimiento fluido */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[110px] opacity-20"
            animate={{
              x: [0, i%2? 400 : -400, 0],
              y: [0, i%2? -300 : 300, 0],
            }}
            transition={{ duration: 25 + i * 5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: '650px', height: '650px',
              left: `${i * 20}%`, top: `${i * 15}%`,
              background: i % 2 === 0 ? '#f97316' : '#2563eb'
            }}
          />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900/30 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden z-10">
        
        {/* IZQUIERDA: Info y Logo */}
        <div className="w-full lg:w-1/2 p-10 md:p-14 border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-950/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 text-orange-500 mb-8">
              <Activity size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Distrito 18D03</span>
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,4.2rem)] font-black leading-[0.9] tracking-tighter mb-6 text-white uppercase">
              MISIÓN <br /><span className="text-orange-500">PREVENCIÓN</span>
            </h1>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-sm mb-10">
              Plataforma de educación en Gestión de Riesgos de Desastres para el distrito 18D03.
            </p>

            {/* 🖼️ LOGO CON GLOW */}
            <div className="relative w-36 md:w-44 mb-4">
              <div className="absolute inset-0 bg-orange-600/30 blur-3xl rounded-full animate-pulse"></div>
              <img 
                src="https://blogger.googleusercontent.com/img/a/AVvXsEhwwQia3e2LdO2aVrT1GFE6Cojzx6-lve9qceOZH3IiwXtV3wYKFiTioE7lSASVOnjdUexdIJwv9PUVScy_iupzCzzbbGUp7S1ByxBcJWK8fsZVexSyKj2oh7VgnJZ7iC4bkUjuko0R7SH-Lzgii-JsZmRgbdNWqQlwFlQ194py9fA-fCIIhM1HrHesW3pv" 
                alt="Logo" className="relative z-10 w-full h-auto drop-shadow-2xl" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 opacity-60">
            <p className="text-slate-400 italic text-[11px] border-l-2 border-orange-500 pl-4 uppercase tracking-tighter">
              "Un buen conocimiento del riesgo ayuda a mejorar la resiliencia comunitaria"
            </p>
          </div>
        </div>

        {/* DERECHA: Formulario y Nube interactiva */}
        <div className="w-full lg:w-1/2 p-10 md:p-14 bg-black/20 flex flex-col justify-between overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><User size={12} className="mr-2 text-orange-500" /> Registro del Agente</label>
              <input type="text" placeholder="Escribe tu nombre..." required onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-orange-500/50 transition-all text-lg font-bold text-white placeholder:text-slate-800" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><School size={12} className="mr-2 text-blue-500" /> Unidad Educativa Local</label>
              <button type="button" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setIsModalOpen(true)} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${escuela ? 'border-blue-500/50 bg-blue-500/10 text-white' : 'border-white/10 bg-black/40 text-slate-600'}`}><div className="flex items-center truncate mr-2"><MapPin className="mr-3 text-blue-500 shrink-0" size={16} /><span className="font-bold uppercase text-xs truncate">{escuela || 'Seleccionar Escuela...'}</span></div><ChevronRight size={16} /></button>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><Users size={12} className="mr-2 text-white" /> Selección de Agente (Nivel 1)</label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setAvatar('chica')} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className={`flex items-center justify-center space-x-2 p-4 rounded-xl border transition-all ${avatar === 'chica' ? 'bg-orange-500/10 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'bg-black/40 border-white/5 text-slate-700'}`}>
                  <span className="text-2xl">👧🏽</span> <span className="font-black text-[9px] uppercase tracking-widest">Niña</span>
                </button>
                <button type="button" onClick={() => setAvatar('chico')} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className={`flex items-center justify-center space-x-2 p-4 rounded-xl border transition-all ${avatar === 'chico' ? 'bg-blue-500/10 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.1)]' : 'bg-black/40 border-white/5 text-slate-700'}`}>
                  <span className="text-2xl">👦🏽</span> <span className="font-black text-[9px] uppercase tracking-widest">Niño</span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !nombre || !escuela || !avatar} className="w-full rounded-xl bg-orange-600 p-5 font-black uppercase tracking-[0.3em] text-white shadow-2xl hover:bg-orange-500 active:scale-[0.98] transition-all disabled:opacity-10">
              {loading ? 'SINCRONIZANDO...' : 'COMENZAR AVENTURA'}
            </button>
          </form>

          {/* ☁️ NUBE DE PENSAMIENTO "SABÍAS QUE" */}
          <div className="mt-8 relative bg-red-950/40 border border-red-500/40 p-7 rounded-[2.8rem] backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.05)]">
            {/* Puntero de la nube */}
            <div className="absolute top-[-10px] left-12 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-red-500/40"></div>
            
            {/* Emojis animados adentro */}
            <div className="absolute top-5 right-8 flex space-x-3">
              <motion.span animate={{ y: [0, -6, 0], rotate: [0, 15, 0] }} transition={{ duration: 2.2, repeat: Infinity }} className="text-2xl drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]">💡</motion.span>
              <motion.span animate={{ y: [0, -5, 0], scale: [1, 1.15, 1] }} transition={{ duration: 2.8, repeat: Infinity, delay: 0.6 }} className="text-2xl drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]">🧠</motion.span>
            </div>

            <div className="flex items-start pr-14">
              <HelpCircle className="text-red-400 shrink-0 mt-1 mr-4" size={22} />
              <div>
                <h4 className="text-red-300 font-black text-[11px] uppercase tracking-[0.2em] mb-2">¿Sabías que?</h4>
                <p className="text-white text-[12px] leading-relaxed font-semibold opacity-95">
                  El riesgo es una construcción social, es decir, no hay riesgo si no existen personas expuestas y vulnerables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de Escuelas */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/40 text-white font-black uppercase text-[10px] tracking-widest">
                <span>Censo Escolar 18D03</span>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 max-h-[40vh] overflow-y-auto grid grid-cols-1 gap-2 custom-scrollbar">
                {escuelasDisponibles.map((item) => (
                  <button key={item} onClick={() => { setEscuela(item); setIsModalOpen(false); }} className={`p-4 rounded-xl border transition-all text-left text-[11px] font-bold uppercase ${escuela === item ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}>
                    {item}
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
