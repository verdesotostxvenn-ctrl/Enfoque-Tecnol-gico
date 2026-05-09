import React, { useState, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { ChevronLeft, Briefcase, Users, Bell, CheckCircle2, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Quiz from './Quiz';

const MisionEvacuacion = () => {
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
        mision_evacuacion: true,
        nivel: 4,
        ultima_conexion: new Date().toISOString()
      })
      .eq('nombre', nombre);

    if (!error) {
      setIsCompleted(true);
      localStorage.setItem('agenteNivel', '4');
      window.dispatchEvent(new Event('agenteNivelActualizado'));

      setTimeout(() => {
        navigate('/hub');
      }, 2000);
    } else {
      console.error('Error Supabase MisionEvacuacion:', error);
      alert('Fallo en la comunicación con el servidor central.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#010413] text-white p-6 md:p-12 relative overflow-hidden cursor-none">
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform'
        }}
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
      >
        <motion.div
          animate={{
            scale: isHovering ? 1.4 : 1,
            borderColor: isHovering ? '#34d399' : '#10b981'
          }}
          className="w-6 h-6 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-white/5"
        >
          <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_5px_#fff]" />
        </motion.div>
      </motion.div>

      <button
        onClick={() => navigate('/hub')}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="relative z-10 flex items-center space-x-2 text-white/50 hover:text-emerald-400 transition-colors mb-12"
      >
        <ChevronLeft size={20} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">
          Regresar al Hub
        </span>
      </button>

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <div className="flex justify-center items-center space-x-3 text-emerald-500 mb-4">
            <Activity size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">
              Logística de Emergencia
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">
            RUTAS DE <br />
            <span className="text-emerald-500">EVACUACIÓN</span>
          </h1>
        </header>

        <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-[3rem] mb-12 flex flex-col items-center backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          <Bell size={48} className="text-emerald-500 mb-6 animate-ring" />

          <p className="text-center text-xl md:text-2xl font-bold max-w-2xl text-white leading-tight">
            Sigue siempre la señalética verde. Mantener la calma es tu herramienta más poderosa
            para salvar vidas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="flex space-x-6 items-start bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
            <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-500 shrink-0 shadow-lg shadow-emerald-500/10">
              <Briefcase />
            </div>

            <div>
              <h3 className="font-black text-lg mb-1 text-white uppercase tracking-tighter">
                Kit de Supervivencia
              </h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                Debe contener: Botiquín de primer auxilio, linterna con pilas extra, radio AM/FM
                y agua embotellada.
              </p>
            </div>
          </div>

          <div className="flex space-x-6 items-start bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
            <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-500 shrink-0 shadow-lg shadow-emerald-500/10">
              <Users />
            </div>

            <div>
              <h3 className="font-black text-lg mb-1 text-white uppercase tracking-tighter">
                Puntos Seguros
              </h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                Establece un punto de encuentro familiar fuera de la zona de riesgo. Conoce los
                albergues del distrito.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowQuiz(true)}
          disabled={loading || isCompleted}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`w-full p-6 rounded-[2rem] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center space-x-3 text-sm ${
            isCompleted
              ? 'bg-emerald-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_15px_40px_rgba(16,185,129,0.3)] active:scale-95'
          }`}
        >
          {loading ? (
            'CARGANDO DATOS...'
          ) : isCompleted ? (
            <>
              <CheckCircle2 size={20} />
              <span>COMANDANTE GRADUADO</span>
            </>
          ) : (
            'EXAMEN FINAL DE GRADUACIÓN'
          )}
        </button>
      </div>

      {showQuiz && (
        <Quiz
          tipo="evacuacion"
          onClose={() => setShowQuiz(false)}
          onWin={handleWinQuiz}
        />
      )}
    </div>
  );
};

export default MisionEvacuacion;
