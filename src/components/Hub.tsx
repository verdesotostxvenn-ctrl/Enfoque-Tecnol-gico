import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
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
  
  // ESTADOS DE PROGRESO
  const [nivelAgente, setNivelAgente] = useState(1); 
  const [avatarAgente, setAvatarAgente] = useState('chico'); 
  const [showCredencial, setShowCredencial] = useState(false);

  // CURSOR DE ALTO RENDIMIENTO (60 FPS)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  useEffect(() => {
    // FUNCIÓN DE SINCRONIZACIÓN TÁCTICA
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
    localStorage.removeItem('agenteNombre');
    localStorage.removeItem('agenteAvatar');
    localStorage.removeItem('agenteNivel');
    navigate('/');
  };

  const misiones = [
    { 
      id: 1, 
      nivelRequerido: 1,
      titulo: 'Alerta Volcánica', 
      path: '/volcan', 
      desc: 'Protocolos ante caída de ceniza y lahares.', 
      color: 'orange',
      icono: <Mountain className="w-8 h-8 text-orange-500" /> 
    },
    { 
      id: 2, 
      nivelRequerido: 2,
      titulo: 'Inundaciones', 
      path: '/inundacion', 
      desc: 'Gestión de riesgos en zonas de ríos y lluvias.', 
      color: 'blue',
      icono: <Wind className="w-8 h-8 text-blue-500" /> 
    },
    { 
      id: 3, 
      nivelRequerido: 3,
      titulo: 'Evacuación', 
      path: '/evacuacion', 
      desc: 'Rutas seguras y puntos de encuentro del distrito.', 
      color: 'emerald',
      icono: <Navigation className="w-8 h-8 text-emerald-500" /> 
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#010413] text-white p-6 md:p-16 relative overflow-hidden cursor-none">
      
      {/* 🖱️ CURSOR TÁCTICO */}
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
              <div className="flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl text-orange-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <Trophy size={14} />
                <span>Rango: {nivelAgente >= 4 ? 'COMANDANTE' : `Nivel ${nivelAgente}`}</span>
              </div>

              {nivelAgente >= 4 && (
                <motion.button 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowCredencial(true)}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-amber-600 px-4 py-2 rounded-xl text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.6)]"
                >
                  <Award size={14} className="animate-bounce" />
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
        {misiones.map((mision, index) => {
          const estaBloqueada = nivelAgente < mision.nivelRequerido;
          
          return (
            <motion.div
              key={mision.id}
              onClick={() => !estaBloqueada && navigate(mision.path)}
              onMouseEnter={() => !estaBloqueada && setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!estaBloqueada ? { y: -8, scale: 1.02 } : {}}
              className={`group relative p-10 rounded-[2.8rem] border flex flex-col items-center text-center overflow-hidden transition-all duration-500 ${
                estaBloqueada 
                ? 'bg-slate-950/20 border-white/5 opacity-40 cursor-not-allowed' 
                : 'bg-slate-900/40 backdrop-blur-3xl border-white/5 cursor-pointer hover:border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/10'
              }`}
            >
              {estaBloqueada && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
                  <div className="flex flex-col items-center text-slate-500">
                    <Lock size={32} className="mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Nivel {mision.nivelRequerido} Requerido</span>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              
              <div className={`mb-8 p-6 rounded-[2rem] transition-all duration-500 ring-1 ${
                estaBloqueada ? 'bg-white/5 ring-white/5' : 'bg-white/5 group-hover:bg-white/10 ring-white/10 group-hover:ring-cyan-500/30'
              }`}>
                {mision.icono}
              </div>
              <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter text-white group-hover:text-cyan-400 transition-colors">{mision.titulo}</h2>
              <p className="text-slate-400 text-xs leading-relaxed font-medium mb-6 uppercase tracking-wide">{mision.desc}</p>
              
              {!estaBloqueada && (
                <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Iniciar Protocolo <ChevronRight size={14} className="ml-1" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <footer className="mt-16 flex justify-between items-center opacity-40">
        <div className="flex items-center space-x-4">
          <Database size={14} className="text-cyan-500" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-white">Sincronización Satelital: OK</span>
        </div>
        <span className="text-[9px] font-bold text-white uppercase tracking-widest">ESPOCH - INVESTIGACIÓN RESILIENCIA 2026</span>
      </footer>

      {/* 👈 MODAL DE LA CREDENCIAL DE COMANDANTE (SOLO NIVEL 4) */}
      <AnimatePresence>
        {showCredencial && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotateY: 90 }} 
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-yellow-500/20 to-[#020617] p-1 rounded-3xl shadow-[0_0_80px_rgba(234,179,8,0.3)]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] rounded-3xl pointer-events-none" />
              
              <div className="relative bg-slate-900/95 border border-yellow-500/30 h-full rounded-[1.4rem] p-8 flex flex-col items-center overflow-hidden">
                
                {/* Rayo de luz holográfico */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-yellow-500/50 to-transparent opacity-20" />

                <div className="w-full flex justify-between items-start mb-8">
                  <div className="text-left">
                    <h3 className="text-[8px] text-yellow-500 font-black tracking-[0.3em] uppercase">Misión Prevención</h3>
                    <h2 className="text-[10px] text-white font-black tracking-widest uppercase">Distrito 18D03</h2>
                  </div>
                  <ShieldCheck className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" size={28} />
                </div>

                {/* Avatar Agente */}
                <div className="relative w-40 h-40 bg-gradient-to-tr from-yellow-900/40 to-amber-900/40 rounded-[2.5rem] border-2 border-yellow-500/40 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,191,0,0.05)_50%)] bg-[length:100%_4px] pointer-events-none rounded-[2.5rem]" />
                  <span className="text-8xl drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    {avatarAgente === 'chica' ? '👧🏽' : '👦🏽'}
                  </span>
                  <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-4 bg-yellow-500 text-black text-[10px] font-black tracking-[0.2em] px-5 py-2 rounded-full uppercase border-2 border-slate-900 shadow-xl"
                  >
                    COMANDANTE
                  </motion.div>
                </div>

                <div className="w-full space-y-6 mb-8 text-center">
                  <div>
                    <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase mb-1">Identidad Confirmada</p>
                    <p className="text-2xl text-white font-black uppercase tracking-tight">{nombreAgente}</p>
                  </div>
                  <div className="flex justify-center space-x-8">
                    <div>
                      <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase mb-1">Rango</p>
                      <p className="text-xs text-yellow-500 font-black uppercase tracking-widest">ÉLITE MAX</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase mb-1">Escuela</p>
                      <p className="text-xs text-cyan-400 font-black uppercase tracking-widest">ESPOCH</p>
                    </div>
                  </div>
                </div>

                {/* QR y Auth */}
                <div className="w-full flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                  <QrCode size={44} className="text-yellow-500/80" />
                  <div className="text-right">
                    <p className="text-[7px] text-slate-400 font-mono tracking-widest uppercase">ID_SESSION: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    <p className="text-[7px] text-yellow-500/50 font-mono tracking-widest mt-1 uppercase">Certificado por Distrito 18D03</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowCredencial(false)}
                  className="mt-8 text-slate-500 hover:text-white transition-colors"
                >
                  <XSquare size={24} />
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
