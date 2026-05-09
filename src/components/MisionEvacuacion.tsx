import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Navigation, Briefcase, Users, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MisionEvacuacion = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <button onClick={() => navigate('/hub')} className="flex items-center text-cyan-400 mb-8 hover:underline">
        <ChevronLeft size={20} /> <span className="text-xs font-black uppercase tracking-widest">Volver al Hub</span>
      </button>

      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h2 className="text-emerald-500 font-black text-xs uppercase tracking-[0.4em] mb-2">Rutas Seguras</h2>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">EVACUACIÓN</h1>
        </header>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem] mb-12 flex flex-col items-center">
          <Bell size={48} className="text-emerald-500 mb-6" />
          <p className="text-center text-xl font-medium max-w-2xl">
            Identifica las señales verdes en tu Unidad Educativa. Sigue las flechas y mantén la calma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex space-x-6 items-start">
            <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-500 shrink-0"><Briefcase /></div>
            <div>
              <h3 className="font-black text-lg mb-1">Mochila de Emergencia</h3>
              <p className="text-slate-500 text-sm">Botiquín, linterna, radio y copias de documentos.</p>
            </div>
          </div>
          <div className="flex space-x-6 items-start">
            <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-500 shrink-0"><Users /></div>
            <div>
              <h3 className="font-black text-lg mb-1">Punto de Encuentro</h3>
              <p className="text-slate-500 text-sm">El lugar acordado donde la familia se reunirá.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisionEvacuacion;
