import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Lobby = () => {
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('Escuela Río Blanco');

  const iniciarMision = async () => {
    if (!nombre) return alert("Agente, ingresa tu nombre");
    
    const { data, error } = await supabase
      .from('agentes')
      .insert([{ nombre, institucion: escuela }]);

    if (error) console.error("Error al registrar:", error);
    else alert("¡Misión Iniciada, Agente " + nombre + "!");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Efecto de Radar de Fondo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter">PROYECTO FUSILERO</h1>
        <p className="text-emerald-400 text-xs mb-8 uppercase tracking-widest">Base de Operaciones - Distrito 18D03</p>

        <div className="space-y-6">
          <input 
            type="text" 
            placeholder="Nombre de Agente" 
            className="w-full bg-slate-900/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-emerald-500 transition-all"
            onChange={(e) => setNombre(e.target.value)}
          />

          <select 
            className="w-full bg-slate-900/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-emerald-500"
            onChange={(e) => setEscuela(e.target.value)}
          >
            <option>Escuela Río Blanco</option>
            <option>Escuela Río Verde</option>
            <option>Unidad Educativa Baños</option>
          </select>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={iniciarMision}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20"
          >
            ¡COMENZAR ENTRENAMIENTO!
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;
