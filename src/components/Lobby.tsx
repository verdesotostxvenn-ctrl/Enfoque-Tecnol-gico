import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { School, ShieldCheck, MapPin, User, ChevronRight, Activity, X, Search, Database, Users, HelpCircle, BrainCircuit } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // 🚀 OPTIMIZACIÓN: Valores directos para 0% de delay (movimiento 1:1 instantáneo)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
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
  }, [mouseX, mouseY]);

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
    <div className="h-screen w-full flex items-center justify-center p-4 md:p-6 relative overflow-hidden bg-[#010413] cursor-none">
      
      {/* 🖱️ CURSOR TÁCTICO REDUCIDO (Instantáneo) */}
      <motion.div
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%', willChange: 'transform' }}
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
      >
        <motion.div 
          animate={{ 
            scale: isHovering ? 1.4 : 1, 
            borderColor: isHovering ? '#f97316' : '#22d3ee',
            borderWidth: isHovering ? '1px' : '2px'
          }}
          transition={{ duration: 0.15 }}
          className="w-6 h-6 border-2 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.2)] bg-white/5 backdrop-blur-[2px]"
        >
          <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_5px_#fff]" />
        </motion.div>
      </motion.div>

      {/* 🟢 BOKEH DINÁMICO */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[120px] opacity-[0.15]"
            animate={{
              x: [0, i%2? 200 : -200, 0],
              y: [0, i%2? -150 : 150, 0],
            }}
            transition={{ duration: 25 + i * 5, repeat: Infinity, ease: "linear" }}
            style={{
              width: '600px', height: '600px',
              left: `${20 + i * 25}%`, top: `${15 + i * 20}%`,
              background: i % 2 === 0 ? '#f97316' : '#2563eb'
            }}
          />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-6xl h-full max-h-[92vh] bg-slate-900/20 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden z-10">
        
        {/* IZQUIERDA: Branding y Logo */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-950/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 text-orange-500 mb-6">
              <Activity size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Distrito 18D03</span>
            </div>
            <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] font-black leading-[0.9] tracking-tighter mb-6 text-white uppercase">
              MISIÓN <br /><span className="text-orange-500">PREVENCIÓN</span>
            </h1>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-sm mb-10">
              Plataforma de educación en Gestión de Riesgos de Desastres para el distrito 18D03.
            </p>

            {/* 🖼️ LOGO OFICIAL */}
            <div className="relative w-36 md:w-44">
              <div className="absolute inset-0 bg-orange-600/30 blur-3xl rounded-full animate-pulse"></div>
              <img 
                src="https://blogger.googleusercontent.com/img/a/AVvXsEhwwQia3e2LdO2aVrT1GFE6Cojzx6-lve9qceOZH3IiwXtV3wYKFiTioE7lSASVOnjdUexdIJwv9PUVScy_iupzCzzbbGUp7S1ByxBcJWK8fsZVexSyKj2oh7VgnJZ7iC4bkUjuko0R7SH-Lzgii-JsZmRgbdNWqQlwFlQ194py9fA-fCIIhM1HrHesW3pv" 
                alt="Logo" className="relative z-10 w-full h-auto drop-shadow-2xl" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/20">
            <p className="text-slate-100 font-bold italic text-[11px] md:text-xs border-l-2 border-orange-500 pl-4 uppercase tracking-tighter shadow-orange-900/20">
              "Un buen conocimiento del riesgo ayuda a mejorar la resiliencia comunitaria"
            </p>
          </div>
        </div>

        {/* DERECHA: Formulario */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 bg-black/30 flex flex-col justify-between overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center"><User size={12} className="mr-2 text-orange-500" /> Registro de Identidad</label>
              <input type="text" placeholder="Escribe tu nombre..." required onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-orange-500/50 transition-all text-lg font-bold text-white placeholder:text-slate-800" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center"><School size={12} className="mr-2 text-blue-500" /> Unidad Educativa Local</label>
              <button type="button" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setIsModalOpen(true)} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${escuela ? 'border-blue-500/50 bg-blue-500/10 text-white' : 'border-white/10 bg-black/40 text-slate-600 hover:bg-white/5 hover:border-white/30'}`}><div className="flex items-center truncate mr-2"><MapPin className="mr-3 text-blue-500 shrink-0" size={16} /><span className="font-bold uppercase text-xs truncate">{escuela || 'Seleccionar Escuela...'}</span></div><ChevronRight size={16} /></button>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center"><Users size={12} className="mr-2 text-white" /> Selecciona tu Agente (Nivel 1)</label>
              <div className="grid grid-cols-2 gap-4">
                
                <button 
                  type="button" 
                  onClick={() => setAvatar('chica')} 
                  onMouseEnter={() => setIsHovering(true)} 
                  onMouseLeave={() => setIsHovering(false)} 
                  className={`group flex items-center justify-center space-x-2 p-4 rounded-xl border transition-all duration-300 ${
                    avatar === 'chica' 
                      ? 'bg-orange-500/20 border-orange-500 text-white scale-[1.03] shadow-[0_0_20px_rgba(249,115,22,0.3)] ring-1 ring-orange-500' 
                      : 'bg-black/40 border-white/10 text-slate-500 hover:bg-white/10 hover:border-white/40 hover:text-white hover:scale-[1.01]'
                  }`}
                >
                  <span className={`text-2xl transition-transform duration-300 ${avatar === 'chica' ? 'scale-110' : 'group-hover:scale-110'}`}>👧🏽</span> 
                  <span className="font-black text-[9px] uppercase tracking-widest">Niña</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => setAvatar('chico')} 
                  onMouseEnter={() => setIsHovering(true)} 
                  onMouseLeave={() => setIsHovering(false)} 
                  className={`group flex items-center justify-center space-x-2 p-4 rounded-xl border transition-all duration-300 ${
                    avatar === 'chico' 
                      ? 'bg-blue-500/20 border-blue-500 text-white scale-[1.03] shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-1 ring-blue-500' 
                      : 'bg-black/40 border-white/10 text-slate-500 hover:bg-white/10 hover:border-white/40 hover:text-white hover:scale-[1.01]'
                  }`}
                >
                  <span className={`text-2xl transition-transform duration-300 ${avatar === 'chico' ? 'scale-110' : 'group-hover:scale-110'}`}>👦🏽</span> 
                  <span className="font-black text-[9px] uppercase tracking-widest">Niño</span>
                </button>

              </div>
            </div>

            <button type="submit" disabled={loading || !nombre || !escuela || !avatar} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="w-full rounded-xl bg-orange-600 p-5 font-black uppercase tracking-[0.3em] text-white shadow-2xl hover:bg-orange-500 active:scale-[0.98] transition-all disabled:opacity-10">
              {loading ? 'SINCRONIZANDO...' : 'COMENZAR AVENTURA'}
            </button>
          </form>

          {/* ☁️ NUBE "SABÍAS QUE" */}
          <div className="mt-8 relative bg-red-600/10 border border-red-500/30 p-6 rounded-[2.8rem] backdrop-blur-xl">
            <div className="absolute top-[-10px] left-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-red-500/30"></div>
            <div className="absolute top-4 right-8 flex space-x-3">
              <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-2xl">💡</motion.span>
              <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} className="text-2xl">🧠</motion.span>
            </div>
            <div className="flex items-start pr-14">
              <HelpCircle className="text-red-400 shrink-0 mt-1 mr-3" size={20} />
              <div>
                <h4 className="text-red-300 font-black text-[10px] uppercase tracking-widest mb-1">¿Sabías que?</h4>
                <p className="text-white text-[11px] leading-relaxed font-semibold">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-pointer" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/40 text-white font-black uppercase text-[10px] tracking-widest">
                <span>Censo Escolar 18D03</span>
                <button onClick={() => setIsModalOpen(false)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="hover:text-red-500 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 max-h-[40vh] overflow-y-auto grid grid-cols-1 gap-2 custom-scrollbar">
                {escuelasDisponibles.map((item) => (
                  <button key={item} onClick={() => { setEscuela(item); setIsModalOpen(false); }} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className={`p-4 rounded-xl border transition-all text-left text-[11px] font-bold uppercase ${escuela === item ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'}`}>
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
