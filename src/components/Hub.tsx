import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  Wind, 
  Mountain, 
  Navigation, 
  Activity, 
  Database, 
  LogOut, 
  ChevronRight, 
  Trophy, 
  QrCode, 
  ShieldCheck, 
  Award, 
  XSquare,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hub = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [nombreAgente, setNombreAgente] = useState('AGENTE');
  const [cursorVisible, setCursorVisible] = useState(true);
  
  // ESTADOS DE PROGRESO (Sincronizados con el centro de mando)
  const [nivelAgente, setNivelAgente] = useState(1); 
  const [avatarAgente, setAvatarAgente] = useState('chico'); 
  const [showCredencial, setShowCredencial] = useState(false);

  // CURSOR TÁCTICO DE 60 FPS
  const rawMouseX = useMotionValue(-100);
  const rawMouseY = useMotionValue(-100);
  
  // Suavizado para que el cursor se sienta profesional (Spring physics)
  const mouseX = useSpring(rawMouseX, { stiffness: 1000, damping: 50 });
  const mouseY = useSpring(rawMouseY, { stiffness: 1000, damping: 50 });

  useEffect(() => {
    // SENSOR DE DATOS: Solo corre al montar el componente
    const sincronizarDatos = () => {
      const guardadoNombre = localStorage.getItem('agenteNombre');
      const guardadoNivel = localStorage.getItem('agenteNivel');
      const guardadoAvatar = localStorage.getItem('agenteAvatar');
      
      if (guardadoNombre) setNombreAgente(guardadoNombre.toUpperCase());
      if (guardadoNivel) setNivelAgente(parseInt(guardadoNivel));
      if (guardadoAvatar) setAvatarAgente(guardadoAvatar);
    };

    sincronizarDatos();

    const handleMouseMove = (e: MouseEvent) => {
      rawMouseX.set(e.clientX);
      rawMouseY.set(e.clientY);
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
  }, []); // Dependencia vacía para que no se reinicie con el mouse

  const handleLogout = () => {
    localStorage.clear(); // Limpieza profunda
    navigate('/');
  };

  const misiones = [
    { 
      id: 1, 
      nivelReq: 1,
      titulo: 'Alerta Volcánica', 
      path: '/volcan', 
      desc: 'Protocolos ante caída de ceniza y lahares.', 
      color: 'from-orange-600 to-red-600',
      icono: <Mountain className="w-8 h-8 text-white" /> 
    },
    { 
      id: 2, 
      nivelReq: 2,
      titulo: 'Inundaciones', 
      path: '/inundacion', 
      desc: 'Gestión de riesgos en zonas de ríos y lluvias.', 
      color: 'from-blue-600 to-cyan-600',
      icono: <Wind className="w-8 h-8 text-white" /> 
    },
    { 
      id: 3, 
      nivelReq: 3,
      titulo: 'Evacuación', 
      path: '/evacuacion', 
      desc: 'Rutas seguras y puntos de encuentro del distrito.', 
      color: 'from-emerald-600 to-teal-600',
      icono: <Navigation className="w-8 h-8 text-white" /> 
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#010413] text-white p-6 md:p-16 relative overflow-hidden cursor-none">
      
      {/* 🖱️ CURSOR TÁCTICO PERSONALIZADO */}
      <motion.div
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
      >
        <motion.div 
          animate={{ 
            scale: isHovering ? 1.5 : 1, 
            borderColor: isHovering ? '#f97316' : '#22d3ee',
            backgroundColor: isHovering ? 'rgba(249,115,22,0.1)' : 'rgba(34,211,238,0.1)'
          }}
          className="w-8 h-8 border-2 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] backdrop-blur-[1px]"
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff]" />
        </motion.div>
      </motion.div>

      {/* HEADER TÁCTICO */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center space-x-3 text-cyan-400 mb-2">
            <Activity size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Terminal Agente Distrito 18D03</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white">
              BIENVENIDO, <span className="text-orange-500">{nombreAgente}</span>
            </h1>
            
            <div className="flex space-x-3">
              <div className="flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl text-orange-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <Trophy size={14} />
                <span>Rango: {nivelAgente >= 4 ? 'COMANDANTE' : `Nivel ${nivelAgente}`}</span>
              </div>

              {nivelAgente >= 4 && (
                <motion.button 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowCredencial(true)}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 px-6 py-2 rounded-xl text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(234,179,8,0.6)] border-2 border-yellow-300/50"
                >
                  <Award size={14} className="animate-bounce" />
                  <span>Obtener Credencial</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <button onClick={handleLogout} className="flex items-center space-x-3 bg-red-500/10 border border-red-500/30 px-6 py-3 rounded-2xl text-red-500 text-[10px] font-black uppercase hover:bg-red-500 hover:text-black transition-all">
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </header>

      {/* GRID DE MISIONES BLOQUEABLES */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {misiones.map((mision, index) => {
          const estaBloqueada = nivelAgente < mision.nivelReq;
          return (
            <motion.div
              key={mision.id}
              onClick={() => !estaBloqueada && navigate(mision.path)}
              onMouseEnter={() => !estaBloqueada && setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!estaBloqueada ? { y: -10, scale: 1.02 } : {}}
              className={`group relative p-10 rounded-[3rem] border-2 flex flex-col items-center text-center overflow-hidden transition-all duration-500 ${
                estaBloqueada 
                ? 'bg-slate-950/40 border-white/5 opacity-40 cursor-not-allowed' 
                : `bg-gradient-to-br ${mision.color} border-white/20 shadow-2xl hover:shadow-cyan-500/20`
              }`}
            >
              {estaBloqueada && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-20">
                  <div className="flex flex-col items-center text-slate-400">
                    <Lock size={40} className="mb-2" />
                    <span className="text-[12px] font-black uppercase tracking-widest">Nivel {mision.nivelReq} Requerido</span>
                  </div>
                </div>
              )}
              
              <div className="mb-8 p-6 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform">
                {mision.icono}
              </div>
              <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter text-white">{mision.titulo}</h2>
              <p className="text-white/70 text-xs leading-relaxed font-medium mb-6 uppercase tracking-wide">{mision.desc}</p>
              
              {!estaBloqueada && (
                <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-4 py-2 rounded-full">
                  Iniciar Protocolo <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 🎖️ MODAL DE CREDENCIAL HOLOGRÁFICA */}
      <AnimatePresence>
        {showCredencial && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotateY: 90 }} 
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-slate-800 to-[#020617] p-1 rounded-[3.5rem] shadow-[0_0_100px_rgba(234,179,8,0.4)] border border-yellow-500/50"
            >
              <div className="relative bg-slate-900/95 h-full rounded-[3.4rem] p-10 flex flex-col items-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-yellow-500/20" />
                <motion.div animate={{ y: [-100, 400] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-cyan-500/20 to-transparent blur-xl pointer-events-none" />

                <h3 className="text-[10px] text-yellow-500 font-black tracking-widest uppercase mb-8">Credencial de Mando - Distrito 18D03</h3>

                <div className="relative w-48 h-48 bg-gradient-to-tr from-yellow-900/40 to-amber-900/40 rounded-[3rem] border-2 border-yellow-500/40 flex items-center justify-center mb-8 shadow-inner">
                  <span className="text-9xl drop-shadow-2xl select-none">{avatarAgente === 'chica' ? '👧🏽' : '👦🏽'}</span>
                  <div className="absolute -bottom-4 bg-yellow-500 text-black text-[12px] font-black px-6 py-2 rounded-full uppercase shadow-xl border-2 border-slate-900">COMANDANTE ÉLITE</div>
                </div>

                <div className="text-center space-y-4 mb-8">
                  <div>
                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Agente Autorizado</p>
                    <p className="text-3xl text-white font-black uppercase tracking-tight">{nombreAgente}</p>
                  </div>
                  <div className="flex justify-center space-x-8">
                    <div className="text-center">
                      <p className="text-[8px] text-slate-500 font-black uppercase">Estatus</p>
                      <p className="text-xs text-emerald-400 font-black uppercase">ACTIVO</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] text-slate-500 font-black uppercase">Academia</p>
                      <p className="text-xs text-cyan-400 font-black uppercase tracking-tighter">ESPOCH</p>
                    </div>
                  </div>
                </div>

                <div className="w-full flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                  <QrCode size={52} className="text-yellow-500/70" />
                  <div className="text-right">
                    <p className="text-[8px] text-slate-400 font-mono tracking-widest uppercase">AUTH_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    <p className="text-[8px] text-yellow-500/40 font-mono uppercase mt-1 tracking-tighter">Sincronizado con Distrito 18D03</p>
                  </div>
                </div>

                <button onClick={() => setShowCredencial(false)} className="mt-8 text-slate-500 hover:text-white transition-colors bg-white/5 p-4 rounded-full">
                  <XSquare size={24} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-16 flex justify-between items-center opacity-40">
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
