import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ShieldCheck, MapPin, User, ChevronRight, Activity, X, Search, Database, Users, HelpCircle, Trophy } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
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
    if (!nombre || !escuela || !personaje) return;
    setLoading(true);
    
    // Guardamos nombre, personaje y el nivel inicial (Nivel 1)
    localStorage.setItem('agenteNombre', nombre);
    localStorage.setItem('agenteAvatar', personaje);
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-10 relative overflow-hidden bg-[#0a0a0a] cursor-none">
      
      {/* Cursor Táctico (Colores del Logo: Naranja/Azul) */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px`, transform: 'translate(-50%, -50%)' }}
      >
        <motion.div 
          animate={{ scale: isHovering ? 1.2 : 1, borderColor: isHovering ? '#f97316' : '#2563eb' }}
          className="w-8 h-8 border-2 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>
      </div>

      {/* Bokeh de fondo temático */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px]" />
        <motion.div animate={{ x: [0, -50, 50, 0], y: [0, 50, -50, 0] }} transition={{ duration: 18, repeat: Infinity }} className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-6xl bg-slate-900/20 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden z-10">
        
        {/* LADO IZQUIERDO: Branding Oficial */}
        <div className="w-full lg:w-1/2 p-10 md:p-16 bg-gradient-to-br from-blue-950/40 to-black/40 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 text-orange-500 mb-8">
              <Activity size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Gestión de Riesgos Ecuador</span>
            </div>

            <h1 className="text-[clamp(2.5rem,5.5vw,4rem)] font-black leading-[0.9] tracking-tighter mb-6 text-white uppercase">
              MISIÓN <br /><span className="text-orange-500">PREVENCIÓN</span>
            </h1>
            
            <p className="text-slate-300 text-lg leading-relaxed max-w-sm mb-10">
              Plataforma de educación en Gestión de Riesgos de Desastres para el distrito 18D03.
            </p>

            {/* LOGO OFICIAL DESDE EL LINK */}
            <div className="flex items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full group-hover:bg-orange-500/40 transition-all"></div>
                <img 
                  src="https://blogger.googleusercontent.com/img/a/AVvXsEhwwQia3e2LdO2aVrT1GFE6Cojzx6-lve9qceOZH3IiwXtV3wYKFiTioE7lSASVOnjdUexdIJwv9PUVScy_iupzCzzbbGUp7S1ByxBcJWK8fsZVexSyKj2oh7VgnJZ7iC4bkUjuko0R7SH-Lzgii-JsZmRgbdNWqQlwFlQ194py9fA-fCIIhM1HrHesW3pv" 
                  alt="Logo Misión Prevención"
                  className="relative w-32 md:w-40 h-auto drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-slate-400 italic text-sm border-l-2 border-orange-500 pl-4">
              "Un buen conocimiento del riesgo ayuda a mejorar la resiliencia comunitaria"
            </p>
          </div>
        </div>

        {/* LADO DERECHO: Selección de Agente */}
        <div className="w-full lg:w-1/2 p-10 md:p-16 bg-slate-950/30">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><User size={14} className="mr-2 text-orange-500" /> Registro de Identidad</label>
              <input type="text" placeholder="Escribe tu nombre..." required onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-orange-500/50 transition-all text-xl font-bold placeholder:text-slate-800 text-white" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><School size={14} className="mr-2 text-blue-500" /> Institución Educativa</label>
              <button type="button" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setIsModalOpen(true)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${escuela ? 'border-blue-500/50 bg-blue-500/10 text-white' : 'border-white/10 bg-black/40 text-slate-600'}`}><div className="flex items-center truncate mr-2"><MapPin className="mr-3 text-blue-500 shrink-0" size={18} /><span className="font-bold uppercase text-sm truncate">{escuela || 'Seleccionar...'}</span></div><ChevronRight size={18} /></button>
            </div>

            {/* SELECCIÓN DE AVATAR (Nivel 1) */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><Users size={14} className="mr-2 text-white" /> Selección de Agente (Nivel 1)</label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setPersonaje('chica')} className={`group relative p-6 rounded-[2rem] border transition-all overflow-hidden ${personaje === 'chica' ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 bg-black/40 opacity-40 hover:opacity-100'}`}>
                  <div className="text-5xl mb-3">👧🏽</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Agente Femenina</span>
                  {personaje === 'chica' && <motion.div layoutId="active" className="absolute top-3 right-3"><ShieldCheck size={16} className="text-orange-500" /></motion.div>}
                </button>
                <button type="button" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setPersonaje('chico')} className={`group relative p-6 rounded-[2rem] border transition-all overflow-hidden ${personaje === 'chico' ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-black/40 opacity-40 hover:opacity-100'}`}>
                  <div className="text-5xl mb-3">👦🏽</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Agente Masculino</span>
                  {personaje === 'chico' && <motion.div layoutId="active" className="absolute top-3 right-3"><ShieldCheck size={16} className="text-blue-500" /></motion.div>}
                </button>
              </div>
            </div>

            <button type="submit" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} disabled={loading || !nombre || !escuela || !personaje} className="w-full rounded-2xl bg-orange-600 p-5 font-black uppercase tracking-[0.3em] text-white shadow-[0_0_30px_rgba(234,88,12,0.3)] transition-all hover:bg-orange-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20">
              {loading ? 'SINCRONIZANDO...' : 'COMENZAR AVENTURA'}
            </button>
          </form>

          {/* DATO CURIOSO */}
          <div className="mt-8 bg-blue-900/10 border border-blue-500/20 p-5 rounded-3xl backdrop-blur-md">
            <div className="flex space-x-4">
              <div className="bg-blue-500/20 p-2 rounded-xl h-fit"><HelpCircle className="text-blue-400" size={20} /></div>
              <div>
                <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-1">Sabías que...</h4>
                <p className="text-blue-200/60 text-xs leading-relaxed font-medium">El riesgo es una construcción social; solo existe si hay personas expuestas.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de Escuelas (Se mantiene igual pero con colores de acento azul) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden z-[110]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center space-x-3 text-blue-500"><Search size={18} /><h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Censo Escolar</h2></div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} className="text-white"/></button>
              </div>
              <div className="p-8 max-h-[50vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 custom-scrollbar">
                {escuelasDisponibles.map((item) => (
                  <button key={item} onClick={() => { setEscuela(item); setIsModalOpen(false); }} className={`flex items-center p-4 rounded-2xl border transition-all text-left ${escuela === item ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/5'}`}>
                    <ShieldCheck size={14} className={`mr-3 ${escuela === item ? 'text-blue-500' : 'text-slate-800'}`} /><span className="text-[10px] font-bold uppercase tracking-tight">{item}</span>
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
