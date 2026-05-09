import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ShieldCheck, MapPin, User, ChevronRight, Info, Database } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [loading, setLoading] = useState(false);

  const escuelas = [
    { id: 'rio-blanco', nombre: 'Escuela Río Blanco', icono: <MapPin className="w-5 h-5" /> },
    { id: 'rio-verde', nombre: 'Escuela Río Verde', icono: <ShieldCheck className="w-5 h-5" /> },
    { id: 'banos', nombre: 'U.E. Baños', icono: <School className="w-5 h-5" /> }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !escuela) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('agentes')
      .insert([{ nombre, institucion: escuela }]);

    if (error) {
      alert('Error de enlace con el servidor central.');
    } else {
      alert('Registro completado. Iniciando sistema educativo.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-institutional min-h-screen w-full flex items-center justify-center p-4 sm:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col lg:flex-row"
      >
        {/* PANEL INFORMATIVO (ESTILO DASHBOARD) */}
        <div className="w-full lg:w-5/12 p-8 lg:p-14 border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-950/30">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 text-emerald-400 mb-10"
          >
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Database size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Servidor Central Activo</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] mb-6">
            MISIÓN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              PREVENCIÓN
            </span>
          </h1>

          <p className="text-slate-400 text-sm lg:text-base leading-relaxed mb-10 max-w-sm">
            Plataforma de gestión de riesgos diseñada para la seguridad del <span className="text-white font-semibold">Distrito 18D03</span>.
          </p>

          <div className="hidden lg:block space-y-4">
            <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium">
              <div className="w-8 h-[1px] bg-white/10" />
              <span>ESTÁNDARES GUBERNAMENTALES</span>
            </div>
          </div>
        </div>

        {/* PANEL DE ACCIÓN (REGISTRO) */}
        <div className="w-full lg:w-7/12 p-8 lg:p-14">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center">
                <User size={14} className="mr-2" /> Identificación Obligatoria
              </label>
              <input
                type="text"
                placeholder="Nombre del Estudiante..."
                required
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-lg placeholder:text-slate-700"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center">
                <School size={14} className="mr-2" /> Unidad Educativa Local
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {escuelas.map((item) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.02)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEscuela(item.nombre)}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all ${
                      escuela === item.nombre 
                      ? 'border-emerald-500 bg-emerald-500/5 text-white shadow-lg shadow-emerald-500/10' 
                      : 'border-white/5 text-slate-500 hover:border-white/10'
                    }`}
                  >
                    <div className={`mb-3 p-2 rounded-lg ${escuela === item.nombre ? 'bg-emerald-500 text-black' : 'bg-white/5'}`}>
                      {item.icono}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tight">{item.nombre}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !nombre || !escuela}
              className="group w-full bg-gradient-to-r from-emerald-500 to-cyan-500 p-5 rounded-2xl text-black font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all disabled:opacity-20 active:scale-[0.99]"
            >
              <span className="flex items-center justify-center">
                {loading ? 'SINCRONIZANDO...' : 'INICIAR PROTOCOLO'}
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </span>
            </button>
          </form>

          <div className="mt-12 flex items-center justify-between text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">
            <div className="flex items-center">
              <Info size={12} className="mr-2" /> Privacidad Protegida
            </div>
            <span>V 1.0.2</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;
