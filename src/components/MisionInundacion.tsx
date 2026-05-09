import React, { useState, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { ChevronLeft, ZapOff, MapPin, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Quiz from './Quiz';

const MisionInundacion = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setCursorVisible(true);
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

  const handleWinQuiz = async () => {
    setShowQuiz(false);
    setLoading(true);

    const nombre = localStorage.getItem('agenteNombre');

    if (!nombre) {
      alert('No se encontró el nombre del agente. Vuelve al lobby para registrarte.');
      setLoading(false);
      navigate('/');
      return;
    }

    const { error } = await supabase
      .from('agentes')
      .update({
        mision_inundacion: true,
        nivel: 3,
        ultima_conexion: new Date().toISOString()
      })
      .eq('nombre', nombre);

    if (!error) {
      setIsCompleted(true);
      localStorage.setItem('agenteNivel', '3');
      window.dispatchEvent(new Event('agenteNivelActualizado'));

      setTimeout(() => {
        navigate('/hub');
      }, 2000);
    } else {
      console.error('Error Supabase MisionInundacion:', error);
      alert('Error en la sincronización del reporte.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden cursor-none">
      <motion.div
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform'
        }}
      >
        <motion.div
          animate={{
            scale: isHovering ? 1.4 : 1,
            borderColor: isHovering ? '#38bdf8' : '#22d3ee'
          }}
          className="w-7 h-7 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]"
        >
          <div className="w-1 h-1 bg-white rounded-full" />
        </motion.div>
      </motion.div>

      <button
        onClick={() => navigate('/hub')}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="relative z-10 flex items-center text-cyan-400 mb-8 hover:text-cyan-300 transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="text-xs font-black uppercase tracking-widest text-white ml-2">
          Volver al Hub
        </span>
      </button>

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-12">
          <h2 className="text-blue-500 font-black text-xs uppercase tracking-[0.4em] mb-2">
            Protocolo Hídrico
          </h2>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
            INUNDACIONES
          </h1>
        </header>

        <div
          onMouseEnter={() => setCursorVisible(false)}
          onMouseLeave={() => setCursorVisible(true)}
          className="aspect-video w-full rounded-[2rem] overflow-hidden border border-white/5 mb-12 shadow-2xl bg-black"
        >
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/jfK_I5yQi8E?autoplay=0&rel=0"
            title="Prevención Inundaciones"
            frameBorder="0"
            allowFullScreen
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-blue-500/20 backdrop-blur-md">
            <ZapOff className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2 text-white">Desconecta la Energía</h3>
            <p className="text-slate-400 text-sm">
              Si el agua entra en casa, corta la luz de inmediato para evitar cortocircuitos.
            </p>
          </div>

          <div className="bg-slate-900/50 p-8 rounded-3xl border border-blue-500/20 backdrop-blur-md">
            <MapPin className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2 text-white">Zonas Altas</h3>
            <p className="text-slate-400 text-sm">
              Ubica el punto más alto de tu escuela o comunidad y dirígete allí sin correr.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowQuiz(true)}
          disabled={loading || isCompleted}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`w-full p-6 rounded-3xl font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-3 ${
            isCompleted
              ? 'bg-emerald-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)] active:scale-95'
          }`}
        >
          {loading ? (
            'PROCESANDO...'
          ) : isCompleted ? (
            <>
              <CheckCircle2 size={20} />
              <span>NIVEL 3 DESBLOQUEADO</span>
            </>
          ) : (
            'INICIAR EVALUACIÓN'
          )}
        </button>
      </div>

      {showQuiz && (
        <Quiz
          tipo="inundacion"
          onClose={() => setShowQuiz(false)}
          onWin={handleWinQuiz}
        />
      )}
    </div>
  );
};

export default MisionInundacion;
