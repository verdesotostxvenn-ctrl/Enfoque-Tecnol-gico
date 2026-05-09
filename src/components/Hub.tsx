import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { Wind, Mountain, Navigation, Activity, Database, LogOut, ChevronRight, Trophy, QrCode, ShieldCheck, Award, XSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hub = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [nombreAgente, setNombreAgente] = useState('AGENTE');
  const [cursorVisible, setCursorVisible] = useState(true);
  
  // 👈 NUEVOS ESTADOS PARA EL RANGO Y LA CREDENCIAL
  const [nivelAgente, setNivelAgente] = useState('1'); 
  const [avatarAgente, setAvatarAgente] = useState('chico'); 
  const [showCredencial, setShowCredencial] = useState(false);

  // 🚀 CURSOR DE ALTO RENDIMIENTO (0 DELAY)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  useEffect(() => {
    // 👈 RECUPERAMOS DATOS DE LOCALSTORAGE
    const guardadoNombre = localStorage.getItem('agenteNombre');
    const guardadoNivel = localStorage.getItem('agenteNivel');
    const guardadoAvatar = localStorage.getItem('agenteAvatar');
    
    if (guardadoNombre) setNombreAgente(guardadoNombre.toUpperCase());
    if (guardadoNivel) setNivelAgente(guardadoNivel);
    if (guardadoAvatar) setAvatarAgente(guardadoAvatar);

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
    // 👈 BORRAMOS SOLO LO NUESTRO, NO TODA LA SESIÓN
    localStorage.removeItem('agenteNombre');
    localStorage.removeItem('agenteAvatar');
    localStorage.removeItem('agenteNivel');
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
          
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white">BIENVENIDO, <span className="text-orange-500">{nombreAgente}</span></h1>
            
            <div className="flex space-x-3">
              {/* 👈 INDICADOR DE RANGO */}
              <div className="flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl text-orange-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <Trophy size={14} />
                <span>Rango: {nivelAgente === '4' ? 'COMANDANTE' : `Nivel ${nivelAgente}`}</span>
              </div>

              {/* 👈 BOTÓN DE CREDENCIAL (SOLO SI ES NIVEL 4) */}
              {nivelAgente === '4' && (
                <motion.button 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowCredencial(true)}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-amber-600 px-4 py-2 rounded-xl text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                >
                  <Award size={14} />
                  <span>Ver Credencial</span>
                </motion.button>
              )}
            </div>
          </div>
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

      {/* 👈 MODAL DE LA CREDENCIAL DE AGENTE */}
      <AnimatePresence>
        {showCredencial && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotateY: 90 }} 
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-slate-800 to-[#020617] p-1 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.2)]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] rounded-3xl pointer-events-none" />
              
              <div className="relative bg-slate-900/90 border border-white/10 h-full rounded-[1.4rem] p-6 flex flex-col items-center overflow-hidden">
                {/* Header Credencial */}
                <div className="w-full flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-[8px] text-cyan-500 font-black tracking-[0.3em] uppercase">República del Ecuador</h3>
                    <h2 className="text-[10px] text-white font-black tracking-widest uppercase">Distrito 18D03</h2>
                  </div>
                  <ShieldCheck className="text-yellow-500" size={24} />
                </div>

                {/* Foto / Avatar */}
                <div className="relative w-32 h-32 bg-gradient-to-tr from-cyan-900 to-blue-900 rounded-2xl border-2 border-cyan-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none rounded-2xl" />
                  <span className="text-7xl drop-shadow-2xl">{avatarAgente === 'chica' ? '👧🏽' : '👦🏽'}</span>
                  <div className="absolute -bottom-3 bg-yellow-500 text-black text-[9px] font-black tracking-[0.2em] px-3 py-1 rounded-full uppercase border-2 border-slate-900">
                    Comandante
                  </div>
                </div>

                {/* Datos del Agente */}
                <div className="w-full space-y-4 mb-8">
                  <div className="border-b border-white/10 pb-2">
                    <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase mb-1">Identidad</p>
                    <p className="text-lg text-white font-black uppercase tracking-wider truncate">{nombreAgente}</p>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <div>
                      <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase mb-1">Estatus</p>
                      <p className="text-xs text-emerald-400 font-black uppercase tracking-widest">ACTIVO / APROBADO</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase mb-1">Nivel</p>
                      <p className="text-xs text-yellow-500 font-black uppercase tracking-widest">MAX [4]</p>
                    </div>
                  </div>
                </div>

                {/* Footer Código QR */}
                <div className="w-full flex items-center justify-between bg-black/50 p-3 rounded-xl border border-white/5">
                  <QrCode size={40} className="text-white/80" />
                  <div className="text-right">
                    <p className="text-[7px] text-slate-400 font-mono tracking-widest">AUTH_CODE: {Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                    <p className="text-[7px] text-slate-500 font-mono tracking-widest mt-1">EMISIÓN: 2026-ESPOCH</p>
                  </div>
                </div>

                {/* Botón Cerrar */}
                <button 
                  onClick={() => setShowCredencial(false)}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors z-50"
                >
                  <XSquare size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Hub;
