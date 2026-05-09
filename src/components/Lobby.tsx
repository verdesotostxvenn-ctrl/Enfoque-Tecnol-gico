import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ShieldCheck, MapPin, User, ChevronRight, Activity, X, Search, Database } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lista extendida de escuelas (puedes agregar las 19 aquí)
  const escuelasDisponibles = [
    "Escuela Río Blanco", "Escuela Río Verde", "U.E. Baños", 
    "Escuela 04", "Escuela 05", "Escuela 06", "Escuela 07",
    "Escuela 08", "Escuela 09", "Escuela 10", "Escuela 11",
    "Escuela 12", "Escuela 13", "Escuela 14", "Escuela 15",
    "Escuela 16", "Escuela 17", "Escuela 18", "Escuela 19"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !escuela) return;
    setLoading(true);
    const { error } = await supabase.from('agentes').insert([{ nombre, institucion: escuela }]);
    if (error) alert('Error de enlace con el servidor.');
    else alert('Acceso Concedido. Iniciando Misión.');
    setLoading(false);
  };

  return (
    <div className="bg-command-center min-h-screen w-full flex items-center justify-center p-4 sm:p-10 relative overflow-hidden">
      
      {/* Nebulosa de fondo animada */}
      <motion.div 
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1)_0%,transparent_70%)]"
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden"
      >
        {/* PANEL IZQUIERDO */}
        <div className="w-full lg:w-5/12 p-10 lg:p-16 border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="flex items-center space-x-3 text-cyan-400 mb-10">
            <Activity size={20} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Enlace Satelital Activo</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black leading-none mb-8 tracking-tighter">
            MISIÓN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 glow-text">
              PREVENCIÓN
            </span>
          </h1>

          <p className="text-slate-400 text-sm lg:text-base leading-relaxed max-w-xs mb-12">
            Sistema estratégico de gestión de riesgos territoriales. <br />
            <span className="text-white font-bold underline decoration-cyan-500">Distrito 18D03</span>.
          </p>

          <div className="flex items-center space-x-4 opacity-50">
            <Database size={24} className="text-slate-600" />
            <div className="h-[1px] w-12 bg-white/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Protocolo v1.2</span>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="w-full lg:w-7/12 p-10 lg:p-16 bg-black/10">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center">
                <User size={14} className="mr-2 text-cyan-400" /> Identidad del Estudiante
              </label>
              <input
                type="text"
                placeholder="Escribe tu nombre..."
                required
                className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-cyan-500/50 transition-all text-xl font-bold placeholder:text-slate-800"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center">
                <School size={14} className="mr-2 text-emerald-400" /> Unidad Educativa
              </label>
              
              {/* Botón que despliega la ventana de escuelas */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                  escuela 
                  ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                  : 'border-white/10 bg-slate-950/40 text-slate-600'
                }`}
              >
                <div className="flex items-center">
                  <MapPin className="mr-3 text-emerald-500" size={20} />
                  <span className="font-bold uppercase tracking-tight">
                    {escuela || 'Seleccionar Escuela...'}
                  </span>
                </div>
                <ChevronRight size={20} />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !nombre || !escuela}
              className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 p-6 font-black uppercase tracking-[0.3em] text-black shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-20"
            >
              <div className="scan-effect opacity-30" />
              <span className="relative z-10">{loading ? 'CONECTANDO...' : 'INICIAR PROTOCOLO'}</span>
            </button>
          </form>
        </div>
      </motion.div>

      {/* VENTANA EMERGENTE (MODAL) DE ESCUELAS */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                <div className="flex items-center space-x-3">
                  <Search className="text-cyan-400" size={20} />
                  <h2 className="text-lg font-black uppercase tracking-widest">Despliegue de Unidades</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-3">
                {escuelasDisponibles.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setEscuela(item);
                      setIsModalOpen(false);
                    }}
                    className={`flex items-center p-4 rounded-xl border transition-all text-left ${
                      escuela === item 
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg' 
                      : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <ShieldCheck size={16} className={`mr-3 ${escuela === item ? 'text-cyan-400' : 'text-slate-600'}`} />
                    <span className="text-xs font-bold uppercase tracking-tight">{item}</span>
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
