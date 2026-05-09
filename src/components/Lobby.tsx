import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ShieldCheck, MapPin, User, ChevronRight, Activity, X, Search, Database, Users, HelpCircle } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true); // 🖱️ Control de visibilidad
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!cursorVisible) setCursorVisible(true);
    };

    // 🖱️ Desaparecer cursor fuera de la página
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
  }, [cursorVisible]);

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
    // 🛠️ 'h-screen overflow-hidden' elimina el scroll lateral derecho
    <div className="h-screen w-full flex items-center justify-center p-4 md:p-6 relative overflow-hidden bg-[#020617] cursor-none">
      
      {/* Cursor Táctico */}
      <motion.div
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px`, transform: 'translate(-50%, -50%)' }}
      >
        <motion.div 
          animate={{ scale: isHovering ? 1.25 : 1, borderColor: isHovering ? '#f97316' : '#22d3ee' }}
          className="w-7 h-7 border-2 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]"
        >
          <div className="w-1 h-1 bg-white rounded-full" />
        </motion.div>
      </motion.div>

      {/* Bokeh de fondo dinámico */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[120px] opacity-20"
            animate={{
              x: [0, i%2? 300 : -300, i%2? -200 : 200, 0],
              y: [0, i%2? -200 : 250, i%2? 250 : -200, 0],
            }}
            transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: '600px', height: '600px',
              left: `${i * 20}%`, top: `${i * 15}%`,
              background: i % 2 === 0 ? '#f97316' : '#2563eb'
            }}
          />
        ))}
      </div>

      {/* CAJA CENTRAL (Ajustada para que no exceda el alto de pantalla) */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-6xl max-h-[95vh] bg-slate-900/30 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden z-10">
        
        {/* IZQUIERDA: Branding */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-950/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 text-orange-500 mb-6">
              <Activity size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Distrito 18D03</span>
            </div>
            <h1 className="text-[clamp(2rem,6vw,3.8rem)] font-black leading-[0.9] tracking-tighter mb-6 text-white uppercase">
              MISIÓN <br /><span className="text-orange-500">PREVENCIÓN</span>
            </h1>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-sm mb-8">
              Plataforma de educación en Gestión de Riesgos de Desastres para el distrito 18D03.
            </p>

            {/* 🖼️ LOGO RECUPERADO */}
            <div className="relative w-32 md:w-40 mb-4">
              <div className="absolute inset-0 bg-orange-600/20 blur-2xl rounded-full animate-pulse"></div>
              <img 
                src="https://blogger.googleusercontent.com/img/a/AVvXsEhwwQia3e2LdO2aVrT1GFE6Cojzx6-lve9qceOZH3IiwXtV3wYKFiTioE7lSASVOnjdUexdIJwv9PUVScy_iupzCzzbbGUp7S1ByxBcJWK8fsZVexSyKj2oh7VgnJZ7iC4bkUjuko0R7SH-Lzgii-JsZmRgbdNWqQlwFlQ194py9fA-fCIIhM1HrHesW3pv" 
                alt="Logo" className="relative z-10 w-full h-auto drop-shadow-2xl" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 opacity-50">
            <p className="text-slate-400 italic text-xs border-l-2 border-orange-500 pl-4 uppercase tracking-tighter">
              "Un buen conocimiento del riesgo ayuda a mejorar la resiliencia comunitaria"
            </p>
          </div>
        </div>

        {/* DERECHA: Formulario + Nube */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 bg-black/20 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><User size={12} className="mr-2 text-orange-500" /> Registro de Identidad</label>
              <input type="text" placeholder="Escribe tu nombre..." required onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-orange-500/50 transition-all text-lg font-bold text-white placeholder:text-slate-800" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><School size={12} className="mr-2 text-blue-500" /> Unidad Educativa Local</label>
              <button type="button" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setIsModalOpen(true)} className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${escuela ? 'border-blue-500/50 bg-blue-500/10 text-white' : 'border-white/10 bg-black/40 text-slate-600'}`}><div className="flex items-center truncate mr-2"><MapPin className="mr-3 text-blue-500 shrink-0" size={16} /><span className="font-bold uppercase text-xs truncate">{escuela || 'Seleccionar Escuela...'}</span></div><ChevronRight size={16} /></button>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><Users size={12} className="mr-2 text-white" /> Selecciona tu Agente (Nivel 1)</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setAvatar('chica')} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className={`flex items-center justify-center space-x-2 p-3.5 rounded-xl border transition-all ${avatar === 'chica' ? 'bg-orange-500/10 border-orange-500 text-white' : 'bg-black/40 border-white/5 text-slate-700'}`}>
                  <span className="text-2xl">👧🏽</span> <span className="font-black text-[9px] uppercase tracking-widest">Niña</span>
                </button>
                <button type="button" onClick={() => setAvatar('chico')} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className={`flex items-center justify-center space-x-2 p-3.5 rounded-xl border transition-all ${avatar === 'chico' ? 'bg-blue-500/10 border-blue-500 text-white' : 'bg-black/40 border-white/5 text-slate-700'}`}>
                  <span className="text-2xl">👦🏽</span> <span className="font-black text-[9px] uppercase tracking-widest">Niño</span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !nombre || !escuela || !avatar} className="w-full rounded-xl bg-orange-600 p-4 font-black uppercase tracking-[0.3em] text-white shadow-xl hover:bg-orange-500 active:scale-[0.98] transition-all disabled:opacity-10">
              {loading ? 'SINCRONIZANDO...' : 'COMENZAR AVENTURA'}
            </button>
          </form>

          {/* ☁️ NUBE "SABÍAS QUE" CON EMOJIS ADENTRO */}
          <div className="mt-6 relative bg-[#400000]/80 border border-red-500/30 p-6 rounded-[2.5rem] backdrop-blur-md">
            {/* Puntero de la nube */}
            <div className="absolute top-[-8px] left-10 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-red-500/30"></div>
            
            {/* 💡🧠 EMOJIS DENTRO DE LA NUBE */}
            <div className="absolute top-4 right-6 flex space-x-2">
              <motion.span animate={{ y: [0, -5, 0], rotate: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-xl">💡</motion.span>
              <motion.span animate={{ y: [0, -4, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} className="text-xl">🧠</motion.span>
            </div>

            <div className="flex items-start pr-12">
              <HelpCircle className="text-red-400 shrink-0 mt-1 mr-3" size={20} />
              <div>
                <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-1">Sabías que...</h4>
                <p className="text-red-100/80 text-[11px] leading-relaxed font-medium pr-2">
                  El riesgo es una construcción social, es decir, no hay riesgo si no existen personas expuestas y vulnerables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de Escuelas (Intacto) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/40 text-white font-black uppercase text-[10px] tracking-widest">
                <span>Censo Escolar 18D03</span>
                <button onClick={() => setIsModalOpen(false)}><X size={18} /></button>
              </div>
              <div className="p-6 max-h-[45vh] overflow-y-auto grid grid-cols-1 gap-2 custom-scrollbar">
                {escuelasDisponibles.map((item) => (
                  <button key={item} onClick={() => { setEscuela(item); setIsModalOpen(false); }} className={`p-3.5 rounded-xl border transition-all text-left text-[10px] font-bold uppercase ${escuela === item ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}>
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
