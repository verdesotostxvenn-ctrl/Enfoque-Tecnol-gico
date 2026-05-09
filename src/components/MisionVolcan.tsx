import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldAlert, ShieldCheck, EyeOff, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MisionVolcan = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
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
  }, [cursorVisible]);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden cursor-none">
      
      {/* 🟢 CURSOR TÁCTICO */}
      <motion.div
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px`, transform: 'translate(-50%, -50%)' }}
      >
        <div className="w-7 h-7 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>
      </motion.div>

      <button onClick={() => navigate('/hub')} className="relative z-10 flex items-center text-cyan-400 mb-8 hover:text-cyan-300">
        <ChevronLeft size={20} /> <span className="text-xs font-black uppercase tracking-widest">Volver al Hub</span>
      </button>

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-12">
          <h2 className="text-orange-500 font-black text-xs uppercase tracking-[0.4em] mb-2 text-white">Protocolo de Ceniza</h2>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">ALERTA VOLCÁNICA</h1>
        </header>

        <div 
          onMouseEnter={() => setCursorVisible(false)}
          onMouseLeave={() => setCursorVisible(true)}
          className="aspect-video w-full rounded-[2rem] overflow-hidden border border-white/5 mb-12 shadow-2xl bg-black"
        >
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/S2Y2P3w8Hps" 
            title="Prevención Volcán"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
            <ShieldCheck className="text-orange-500 mb-4" />
            <h3 className="font-bold mb-2 text-white">Usa Mascarilla</h3>
            <p className="text-sm text-slate-400">Protege tus vías respiratorias de la ceniza fina.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
            <EyeOff className="text-orange-500 mb-4" />
            <h3 className="font-bold mb-2 text-white">Protege tus Ojos</h3>
            <p className="text-sm text-slate-400">Evita usar lentes de contacto; prefiere gafas.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
            <Droplets className="text-orange-500 mb-4" />
            <h3 className="font-bold mb-2 text-white">Agua Segura</h3>
            <p className="text-sm text-slate-400">Cubre los depósitos de agua para evitar contaminación.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisionVolcan;
