import React, { useState, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { ChevronLeft, ShieldCheck, EyeOff, Droplets, Activity, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Quiz from './Quiz';

const MisionVolcan = () => {
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
        mision_volcan: true,
        nivel: 2,
        ultima_conexion: new Date().toISOString()
      })
      .eq('nombre', nombre);

    if (!error) {
      setIsCompleted(true);
      localStorage.setItem('agenteNivel', '2');
      window.dispatchEvent(new Event('agenteNivelActualizado'));

      setTimeout(() => {
        navigate('/hub');
      }, 2000);
    } else {
      console.error('Error Supabase MisionVolcan:', error);
      alert('Error en la sincronización del reporte.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#010413] text-white p-6 md:p-12 relative overflow-hidden cursor-none">

      <motion.div
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%', willChange: 'transform' }}
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
      >
        <motion.div
          animate={{
            scale: isHovering ? 1.4 : 1,
            borderColor: isHovering ? '#fb923c' : '#f97316'
          }}
          className="w-6 h-6 border-2 border-orange-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)] bg-white/5"
        >
          <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_5px_#fff]" />
        </motion.div>
      </motion.div>

      <button
        onClick={() => navigate('/hub')}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="relative z-10 flex items-center space-x-2 text-white/50 hover:text-orange-500 transition-colors mb-12"
      >
        <ChevronLeft size={20} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">
          Abortar Misión
        </span>
      </button>

      <div className="relative z-10 max-w-5xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center space-x-3 text-orange-500 mb-4">
            <Activity size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">
              Protocolo de Ceniza: Activado
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
            ALERTA <br />
            <span className="text-orange-500">VOLCÁNICA</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black/50 group relative">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/S2Y2P3w8Hps?autoplay=0&rel=0"
                title="Prevención Volcán"
                frameBorder="0"
                allowFullScreen
              />
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5">
              <h3 className="text-orange-500 font-black text-xs uppercase tracking-widest mb-4">
                Análisis de Misión
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                El volcán Tungurahua es parte de nuestra identidad en el Distrito 18D03.
                Aprender a convivir con su actividad es la base de nuestra resiliencia.
                Asegúrate de identificar las zonas de lahares en Baños.
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
              <ShieldCheck className="text-orange-500 mb-3" size={24} />
              <h4 className="font-black text-[10px] uppercase tracking-widest mb-2">
                Protección Facial
              </h4>
              <p className="text-slate-400 text-[11px] leading-tight font-medium uppercase">
                Usa mascarilla N95 para evitar respirar micro-cristales de roca (ceniza).
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
              <EyeOff className="text-orange-500 mb-3" size={24} />
              <h4 className="font-black text-[10px] uppercase tracking-widest mb-2">
                Visión Segura
              </h4>
              <p className="text-slate-400 text-[11px] leading-tight font-medium uppercase">
                No uses lentes de contacto. La ceniza puede rayar tu córnea permanentemente.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
              <Droplets className="text-orange-500 mb-3" size={24} />
              <h4 className="font-black text-[10px] uppercase tracking-widest mb-2">
                Reserva Hídrica
              </h4>
              <p className="text-slate-400 text-[11px] leading-tight font-medium uppercase">
                Cubre tanques de agua. La ceniza acidifica y contamina el suministro.
              </p>
            </div>

            <button
              onClick={() => setShowQuiz(true)}
              disabled={loading || isCompleted}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className={`mt-4 w-full p-6 rounded-3xl font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-3 ${
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.3)] active:scale-95'
              }`}
            >
              {loading ? (
                'ENVIANDO REPORTE...'
              ) : isCompleted ? (
                <>
                  <CheckCircle2 size={20} />
                  <span>MISIÓN LOGRADA</span>
                </>
              ) : (
                'INICIAR EVALUACIÓN'
              )}
            </button>
          </div>
        </div>
      </div>

      {showQuiz && (
        <Quiz
          tipo="volcan"
          onClose={() => setShowQuiz(false)}
          onWin={handleWinQuiz}
        />
      )}
    </div>
  );
};

export default MisionVolcan;
