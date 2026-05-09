import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ShieldCheck, MapPin, User, ChevronRight, Activity, Zap, Lock } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [loading, setLoading] = useState(false);

  const escuelas = [
    { id: 'rio-blanco', nombre: 'Escuela Río Blanco', icono: <MapPin className="w-5 h-5" /> },
    { id: 'rio-verde', nombre: 'Escuela Río Verde', icono: <ShieldCheck className="w-5 h-5" /> },
    { id: 'banos', nombre: 'U.E. Baños', icono: <School className="w-5 h-5" /> }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !escuela) return;
    setLoading(true);
    const { error } = await supabase.from('agentes').insert([{ nombre, institucion: escuela }]);
    if (error) alert('Enlace fallido con el centro de datos.');
    else alert('Acceso Concedido. Iniciando Misión.');
    setLoading(false);
  };

  return (
    <div className="bg-command-center min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      
      {/* Elementos de fondo decorativos móviles */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]"
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-6xl bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_35px_100px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col lg:flex-row"
      >
        {/* PANEL IZQUIERDO: BRANDING INSTITUCIONAL */}
        <div className="w-full lg:w-5/12 p-10 lg:p-16 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between">
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="flex items-center space-x-3 text-cyan-400">
              <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 animate-pulse">
                <Activity size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Sistema de Respuesta Activo</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.85] tracking-tighter">
                MISIÓN <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                  PREVENCIÓN
                </span>
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-4"></div>
            </div>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xs font-medium">
              Protocolo educativo de gestión de riesgos territoriales para el <span className="text-white font-bold underline decoration-cyan-500/50">Distrito 18D03</span>.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-12 lg:mt-0 flex items-center space-x-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                  <Zap size={12} className="text-cyan-400" />
                </div>
              ))}
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nodos Conectados</span>
          </motion.div>
        </div>

        {/* PANEL DERECHO: INTERFAZ DE REGISTRO */}
        <div className="w-full lg:w-7/12 p-10 lg:p-16 flex flex-col justify-center relative bg-slate-950/20">
          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            
            <motion.div variants={itemVariants} className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center">
                <User size={14} className="mr-2 text-cyan-500" /> Verificación de Identidad
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Ingresa tu nombre completo..."
                  required
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all text-xl font-bold placeholder:text-slate-800"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-5">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center">
                <School size={14} className="mr-2 text-emerald-500" /> Despliegue de Unidad Educativa
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {escuelas.map((item) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setEscuela(item.nombre)}
                    className={`group flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all ${
                      escuela === item.nombre 
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)]' 
                      : 'border-white/5 bg-slate-900/40 text-slate-500 hover:border-white/10 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`mb-3 p-3 rounded-xl transition-colors ${escuela === item.nombre ? 'bg-emerald-500 text-black' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                      {item.icono}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-tight">
                      {item.nombre}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading || !nombre || !escuela}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 p-6 font-black uppercase tracking-[0.3em] text-black shadow-2xl shadow-cyan-500/20 disabled:opacity-30 transition-all"
            >
              <div className="scan-line opacity-20" />
              <span className="relative z-10 flex items-center justify-center text-sm">
                {loading ? 'AUTENTICANDO...' : 'INICIAR PROTOCOLO'}
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </span>
            </motion.button>
          </form>

          <motion.div 
            variants={itemVariants}
            className="mt-12 flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]"
          >
            <div className="flex items-center">
              <Lock size={12} className="mr-2 text-emerald-500/50" /> Protocolo de Datos Seguro
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>V 1.1.0</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;
