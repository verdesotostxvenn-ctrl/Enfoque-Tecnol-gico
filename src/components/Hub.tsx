import React, { useState, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { ShieldAlert, Wind, Mountain, Navigation, Activity, Database, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hub = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [nombreAgente, setNombreAgente] = useState('AGENTE');
  const [cursorVisible, setCursorVisible] = useState(true);

  // 🚀 CURSOR DE ALTO RENDIMIENTO (0 DELAY)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  useEffect(() => {
    const guardado = localStorage.getItem('agenteNombre');
    if (guardado) setNombreAgente(guardado.toUpperCase());

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseLeave = () => setCursorVisible(false);
    const handleMouseEnter = () => setCursorVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const misiones = [
    { 
      id: 1, 
      titulo: 'Alerta Volcánica', 
      path: '/volcan', 
      desc: 'Protocolos ante caída de ceniza y lahares.', 
      color: 'orange',
      icono: <Mountain className="w-8 h-8 text-orange-500" /> 
    },
    { 
      id: 2, 
      titulo: 'Inundaciones', 
      path: '/inundacion', 
      desc: 'Gestión de riesgos en zonas de ríos y lluvias.', 
      color: 'blue',
      icono: <Wind className="w-8 h-8 text-blue-500" /> 
    },
    { 
      id: 3, 
      titulo: 'Evacuación', 
      path: '/evacuacion', 
      desc: 'Rutas seguras y puntos de encuentro del distrito.', 
      color: 'emerald',
      icono: <Navigation className="w-8 h-8 text-emerald-500" /> 
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#010413] text-white p-6 md:p-16 relative overflow-hidden cursor-none">
      
      {/* 🖱️ CURSOR TÁCTICO REDUCIDO */}
      <motion.div
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%', willChange: 'transform' }}
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
      >
        <motion.div 
          animate={{ scale: isHovering ? 1.4 : 1, borderColor: isHovering ? '#f97316' : '#22d3ee' }}
          className="w-6 h-6 border-2 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)] bg-white/5 backdrop-blur-[2px]"
        >
          <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_5px_#fff]" />
        </motion.div>
      </motion.div>

      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center space-x-3 text-cyan-400 mb-2">
            <Activity size={16} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Terminal Agente Distrito 18D03</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">BIENVENIDO, <span className="text-orange-500">{nombreAgente}</span></h1>
        </motion.div>

        <button 
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleLogout}
          className="group flex items-center space-x-3 bg-red-500/5 border border-red-500/20 px-6 py-3 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
        >
          <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
          <span>Finalizar Turno</span>
        </button>
      </header>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {misiones.map((mision, index) => (
          <motion.div
            key={mision.id}
            onClick={() => navigate(mision.path)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[2.8rem] border border-white/5 flex flex-col items-center text-center cursor-pointer overflow-hidden"
          >
            {/* Efecto de escaneo en hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            
            <div className="mb-8 p-6 bg-white/5 rounded-[2rem] group-hover:bg-white/10 transition-all duration-500 ring-1 ring-white/10 group-hover:ring-cyan-500/30">
              {mision.icono}
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter text-white group-hover:text-cyan-400 transition-colors">{mision.titulo}</h2>
            <p className="text-slate-400 text-xs leading-relaxed font-medium mb-6 uppercase tracking-wide">{mision.desc}</p>
            
            <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
              Iniciar Protocolo <ChevronRight size={14} className="ml-1" />
            </div>
          </motion.div>
        ))}
      </div>

      <footer className="absolute bottom-8 left-8 right-8 flex justify-between items-center opacity-40">
        <div className="flex items-center space-x-4">
          <Database size={14} className="text-cyan-500" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-white">Sincronización Satelital: OK</span>
        </div>
        <span className="text-[9px] font-bold text-white uppercase tracking-widest">ESPOCH - INVESTIGACIÓN RESILIENCIA 2026</span>
      </footer>
    </div>
  );
};

export default Hub;
