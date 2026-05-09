import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, CloudRain, ZapOff, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MisionInundacion = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <button onClick={() => navigate('/hub')} className="flex items-center text-cyan-400 mb-8 hover:underline">
        <ChevronLeft size={20} /> <span className="text-xs font-black uppercase tracking-widest">Volver al Hub</span>
      </button>

      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h2 className="text-blue-500 font-black text-xs uppercase tracking-[0.4em] mb-2">Protocolo Hídrico</h2>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">INUNDACIONES</h1>
        </header>

        <div className="aspect-video w-full rounded-[2rem] overflow-hidden border border-white/5 mb-12 shadow-2xl">
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/YpS8Vf9fRpk" 
            title="Prevención Inundaciones"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-blue-500/20">
            <ZapOff className="text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Desconecta la Energía</h3>
            <p className="text-slate-400">Si el agua entra en casa, corta la luz para evitar cortocircuitos.</p>
          </div>
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-blue-500/20">
            <MapPin className="text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Zonas Altas</h3>
            <p className="text-slate-400">Ubica el punto más alto de tu escuela o comunidad.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisionInundacion;
