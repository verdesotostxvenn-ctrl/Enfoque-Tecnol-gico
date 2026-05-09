import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ShieldCheck, Terminal, MapPin, User, ChevronRight, Activity } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [loading, setLoading] = useState(false);

  const escuelas = [
    { id: 'rio-blanco', nombre: 'Escuela Río Blanco', icono: <MapPin className="w-5 h-5" />, color: 'cyan' },
    { id: 'rio-verde', nombre: 'Escuela Río Verde', icono: <ShieldCheck className="w-5 h-5" />, color: 'emerald' },
    { id: 'banos', nombre: 'U.E. Baños', icono: <School className="w-5 h-5" />, color: 'blue' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !escuela) return alert('Sistemas incompletos: Identifica al agente y la unidad.');
    
    setLoading(true);
    const { error } = await supabase
      .from('agentes')
      .insert([{ nombre, institucion: escuela }]);

    if (error) {
      console.error(error);
      alert('Fallo en el enlace con la base de datos.');
    } else {
      alert('¡Protocolo activado! Bienvenido a la Misión Prevención.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-mesh min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-12 selection:bg-cyan-500/30">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl flex flex-col lg:flex-row bg-[#0f172a]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden"
      >
        {/* PANEL IZQUIERDO: ESTÉTICA "FUSILERO" (TÉCNICO-PROFESIONAL) */}
        <div className="w-full lg:w-5/12 p-10 lg:p-16 relative overflow-hidden flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="relative z-10">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center space-x-2 text-cyan-400 mb-8"
            >
              <Activity size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Enlace Satelital Activo</span>
            </motion.div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-none mb-6">
              MISIÓN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 text-shadow-glow">
                PREVENCIÓN
              </span>
            </h1>
            <p className="text-gray-400 text-sm lg:text-base max-w-xs font-medium leading-relaxed">
              Gestión estratégica de riesgos naturales para el <span className="text-white">Distrito 18D03</span>.
            </p>
          </div>

          <div className="mt-12 relative z-10 flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <Terminal className="text-cyan-400" size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Desarrollado para</p>
              <p className="text-sm font-bold text-white/80 tracking-tight text-emerald-400">Jahir "Fusilero"</p>
            </div>
          </div>

          {/* Elementos decorativos de fondo */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
        </div>

        {/* PANEL DERECHO: FORMULARIO INTERACTIVO */}
        <div className="w-full lg:w-7/12 p-10 lg:p-16 flex flex-col justify-center bg-black/20">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Input Nombre */}
            <div className="group space-y-4">
              <label className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                <User size={14} className="mr-2" /> Registro de Identidad
              </label>
              <input
                type="text"
                placeholder="Ingresa tu nombre completo..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all text-xl font-medium placeholder:text-gray-700"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            {/* Selector de Escuelas (Cards Pro) */}
            <div className="space-y-4">
              <label className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <School size={14} className="mr-2" /> Localización de Unidad
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {escuelas.map((item) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setEscuela(item.nombre)}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all ${
                      escuela === item.nombre 
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_25px_-5px_rgba(6,182,212,0.4)]' 
                      : 'border-white/5 bg-transparent text-gray-500 hover:border-white/20'
                    }`}
                  >
                    <div className={`mb-4 p-3 rounded-2xl ${escuela === item.nombre ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-500'}`}>
                      {item.icono}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-tighter leading-tight ${escuela === item.nombre ? 'text-white' : ''}`}>
                      {item.nombre}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Botón Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 p-5 font-black uppercase tracking-[0.2em] text-black shadow-xl shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? 'Sincronizando...' : 'Iniciar Protocolo'}
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </span>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;
