import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldAlert, ShieldCheck, EyeOff, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MisionVolcan = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <button onClick={() => navigate('/hub')} className="flex items-center text-cyan-400 mb-8 hover:underline">
        <ChevronLeft size={20} /> <span className="text-xs font-black uppercase tracking-widest">Volver al Hub</span>
      </button>

      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h2 className="text-orange-500 font-black text-xs uppercase tracking-[0.4em] mb-2">Protocolo de Ceniza</h2>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">ALERTA VOLCÁNICA</h1>
        </header>

        <div className="aspect-video w-full rounded-[2rem] overflow-hidden border border-white/5 mb-12 shadow-2xl">
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/S2Y2P3w8Hps" 
            title="Prevención Volcán"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
            <ShieldCheck className="text-orange-500 mb-4" />
            <h3 className="font-bold mb-2">Usa Mascarilla</h3>
            <p className="text-sm text-slate-400">Protege tus vías respiratorias de la ceniza fina.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
            <EyeOff className="text-orange-500 mb-4" />
            <h3 className="font-bold mb-2">Protege tus Ojos</h3>
            <p className="text-sm text-slate-400">Evita usar lentes de contacto; prefiere gafas protectoras.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
            <Droplets className="text-orange-500 mb-4" />
            <h3 className="font-bold mb-2">Agua Segura</h3>
            <p className="text-sm text-slate-400">Cubre los depósitos de agua para evitar contaminación.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisionVolcan;
