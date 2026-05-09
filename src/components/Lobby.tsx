import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { School, ShieldCheck, TowerControl as Control, MapPin } from 'lucide-react';

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
      // Aquí podrías usar un router para ir al HUB
      alert('¡Datos guardados! Bienvenido a la misión.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#0a0f1e] text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-[#161d31] border border-cyan-500/30 shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)]"
      >
        <div className="text-center mb-8">
          <div className="inline-block p-3 mb-4 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Control size={40} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">MISIÓN PREVENCIÓN</h1>
          <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest">Base de Operaciones - Distrito 18D03</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 ml-1">Identificación del Agente</label>
            <input
              type="text"
              placeholder="Escribe tu nombre..."
              className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all text-white placeholder:text-gray-600"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 ml-1">Selecciona tu Unidad Educativa</label>
            <div className="grid grid-cols-1 gap-3">
              {escuelas.map((item) => (
                <motion.button
                  key={item.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEscuela(item.nombre)}
                  className={`flex items-center p-4 rounded-xl border transition-all ${
                    escuela === item.nombre 
                    ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                    : 'bg-[#0a0f1e] border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className={`mr-4 p-2 rounded-lg ${escuela === item.nombre ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                    {item.icono}
                  </div>
                  <span className="font-medium">{item.nombre}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'CONECTANDO...' : '¡COMENZAR ENTRENAMIENTO!'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Lobby;
