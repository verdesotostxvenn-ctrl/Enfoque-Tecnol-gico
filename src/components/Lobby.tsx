import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { School, ShieldCheck, TowerControl as Control, MapPin, User } from 'lucide-react';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [loading, setLoading] = useState(false);

  const escuelas = [
    { id: 'rio-blanco', nombre: 'Escuela Río Blanco', icono: <MapPin className="w-6 h-6" /> },
    { id: 'rio-verde', nombre: 'Escuela Río Verde', icono: <ShieldCheck className="w-6 h-6" /> },
    { id: 'banos', nombre: 'U.E. Baños', icono: <School className="w-6 h-6" /> }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !escuela) return alert('Por favor, completa tus datos de Agente');
    
    setLoading(true);
    const { error } = await supabase
      .from('agentes')
      .insert([{ nombre, institucion: escuela }]);

    if (error) {
      console.error(error);
      alert('Error de conexión con la base');
    } else {
      alert('¡Datos guardados! Bienvenido a la misión.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 md:p-8 bg-[#0a0f1e] text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-[#161d31] rounded-[2rem] border border-cyan-500/20 shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Lado Izquierdo: Branding y Título */}
        <div className="w-full md:w-2/5 p-8 md:p-12 bg-gradient-to-br from-cyan-900/20 to-transparent border-b md:border-b-0 md:border-r border-cyan-500/10 flex flex-col justify-center items-center text-center">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="p-5 mb-6 rounded-3xl bg-cyan-500/10 text-cyan-400 shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]"
          >
            <Control size={60} strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 leading-none">
            MISIÓN <span className="text-cyan-400 text-shadow-glow">PREVENCIÓN</span>
          </h1>
          <div className="h-1 w-20 bg-cyan-500 rounded-full mb-4"></div>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-[0.3em]">Distrito 18D03</p>
          <p className="hidden md:block mt-6 text-sm text-gray-500 leading-relaxed max-w-[200px]">
            Software educativo para la gestión y prevención de riesgos naturales.
          </p>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="w-full md:w-3/5 p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="flex items-center text-xs font-bold uppercase tracking-widest text-cyan-500/80">
                <User size={14} className="mr-2" /> Identificación del Estudiante
              </label>
              <input
                type="text"
                placeholder="Escribe tu nombre completo..."
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all text-lg placeholder:text-gray-700"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center text-xs font-bold uppercase tracking-widest text-cyan-500/80">
                <School size={14} className="mr-2" /> Selecciona tu Escuela
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {escuelas.map((item) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEscuela(item.nombre)}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all text-center ${
                      escuela === item.nombre 
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-[0_10px_20px_-10px_rgba(6,182,212,0.4)]' 
                      : 'bg-[#0a0f1e] border-gray-800 text-gray-500 hover:border-gray-700'
                    }`}
                  >
                    <div className={`mb-3 p-3 rounded-xl ${escuela === item.nombre ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-600'}`}>
                      {item.icono}
                    </div>
                    <span className="text-sm font-bold leading-tight">{item.nombre}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-emerald-500 p-5 font-black uppercase tracking-widest text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 active:scale-95 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? 'Sincronizando Base...' : '¡Comenzar Misión!'}
              </span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;
