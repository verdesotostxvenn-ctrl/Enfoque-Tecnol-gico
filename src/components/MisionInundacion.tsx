import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, CloudRain, ZapOff, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MisionInundacion = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden">
      
      <div
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px`, transform: 'translate(-50%, -50%)' }}
      >
        <div className="w-7 h-7 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>
      </div>

      <button onClick={() => navigate('/hub')} className="relative z-10 flex items-center text-cyan-400 mb-8 hover:underline">
        <ChevronLeft size={20} /> <span className="text-xs font-black uppercase tracking-widest">Volver al Hub</span>
      </button>

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-12">
          <h2 className="text-blue-500 font-black text-xs uppercase tracking-[0.4em] mb-2">Protocolo Hídrico</h2>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">INUNDACIONES</h1>
        </header>

        <div className="aspect-video w-full rounded-[2rem] overflow-hidden border border-white/5 mb-12 shadow-2xl bg-black">
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/YpS8Vf9fRpk" 
            title="Prevención Inundaciones"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-blue-500/20 backdrop-blur-md">
            <ZapOff className="text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Desconecta la Energía</h3>
            <p className="text-slate-400 text-sm">Si el agua entra en casa, corta la luz de inmediato.</p>
          </div>
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-blue-500/20 backdrop-blur-md">
            <MapPin className="text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Zonas Altas</h3>
            <p className="text-slate-400 text-sm">Ubica el punto más alto de tu escuela o comunidad.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisionInundacion;
