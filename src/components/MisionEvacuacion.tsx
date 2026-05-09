import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Navigation, Briefcase, Users, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MisionEvacuacion = () => {
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
        <header className="mb-12 text-center">
          <h2 className="text-emerald-500 font-black text-xs uppercase tracking-[0.4em] mb-2">Rutas Seguras</h2>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">EVACUACIÓN</h1>
        </header>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem] mb-12 flex flex-col items-center backdrop-blur-sm">
          <Bell size={48} className="text-emerald-500 mb-6" />
          <p className="text-center text-xl font-medium max-w-2xl">
            Identifica las señales verdes en tu Unidad Educativa. Sigue las flechas y mantén la calma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex space-x-6 items-start bg-slate-900/30 p-6 rounded-3xl border border-white/5">
            <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-500 shrink-0"><Briefcase /></div>
            <div>
              <h3 className="font-black text-lg mb-1">Mochila de Emergencia</h3>
              <p className="text-slate-500 text-sm">Botiquín, linterna, radio y documentos.</p>
            </div>
          </div>
          <div className="flex space-x-6 items-start bg-slate-900/30 p-6 rounded-3xl border border-white/5">
            <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-500 shrink-0"><Users /></div>
            <div>
              <h3 className="font-black text-lg mb-1">Punto de Encuentro</h3>
              <p className="text-slate-500 text-sm">El lugar acordado para reunirse con la familia.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisionEvacuacion;
