import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Wind, Mountain, Navigation, Activity, Database, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hub = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false); // Para el efecto del cursor

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 1. Añadimos el "path" que configuramos en App.tsx
  const misiones = [
    { 
      id: 1, 
      titulo: 'Alerta Volcánica', 
      path: '/volcan', 
      desc: 'Protocolos ante caída de ceniza y lahares.', 
      icono: <Mountain className="w-8 h-8 text-orange-500" /> 
    },
    { 
      id: 2, 
      titulo: 'Inundaciones', 
      path: '/inundacion', 
      desc: 'Gestión de riesgos en zonas de ríos y lluvias.', 
      icono: <Wind className="w-8 h-8 text-blue-500" /> 
    },
    { 
      id: 3, 
      titulo: 'Evacuación', 
      path: '/evacuacion', 
      desc: 'Rutas seguras y puntos de encuentro del distrito.', 
      icono: <Navigation className="w-8 h-8 text-emerald-500" /> 
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white p-8 md:p-16 relative overflow-hidden">
      
      {/* Cursor Táctico */}
      <div
        className="custom-cursor fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px`, transform: 'translate(-50%, -50%)' }}
      >
        <motion.div 
          animate={{ scale: isHovering ? 1.25 : 1, borderColor: isHovering ? '#10b981' : '#22d3ee' }}
          className="w-7 h-7 border-2 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]"
        >
          <div className="w-1 h-1 bg-white rounded-full" />
        </motion.div>
      </div>

      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center space-x-3 text-cyan-400 mb-2">
            <Activity size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Terminal de Agente Activa</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">CENTRO DE <span className="text-cyan-400">OPERACIONES</span></h1>
        </motion.div>

        <motion.button 
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </motion.button>
      </header>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {misiones.map((mision, index) => (
          <motion.div
            key={mision.id}
            // 2. Aquí activamos la navegación al dar clic
            onClick={() => navigate(mision.path)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10, borderColor: 'rgba(34, 211, 238, 0.4)' }}
            className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="mb-8 p-6 bg-white/5 rounded-[2rem] group-hover:bg-white/10 transition-colors">
              {mision.icono}
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter text-white">{mision.titulo}</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{mision.desc}</p>
          </motion.div>
        ))}
      </div>

      <footer className="absolute bottom-8 left-8 right-8 flex justify-between items-center opacity-30">
        <div className="flex items-center space-x-4">
          <Database size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">Base de Datos: Sincronizada</span>
        </div>
        <span className="text-[10px] font-bold text-white uppercase tracking-widest">DISTRITO 18D03 - 2026</span>
      </footer>
    </div>
  );
};

export default Hub;
