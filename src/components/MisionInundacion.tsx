import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  Droplets,
  LifeBuoy,
  MapPin,
  PlayCircle,
  Radar,
  ShieldCheck,
  Sparkles,
  Waves,
  ZapOff
} from 'lucide-react';
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

  const rawMouseX = useMotionValue(-100);
  const rawMouseY = useMotionValue(-100);
  const mouseX = useSpring(rawMouseX, { stiffness: 1100, damping: 55 });
  const mouseY = useSpring(rawMouseY, { stiffness: 1100, damping: 55 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      rawMouseX.set(e.clientX);
      rawMouseY.set(e.clientY);
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
  }, [rawMouseX, rawMouseY]);

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

    localStorage.setItem('agenteNivel', '3');
    localStorage.setItem('misionInundacionCompletada', 'true');
    window.dispatchEvent(new Event('agenteNivelActualizado'));

    try {
      const { error } = await supabase
        .from('agentes')
        .update({
          mision_inundacion: true,
          nivel: 3,
          ultima_conexion: new Date().toISOString()
        })
        .eq('nombre', nombre);

      if (error) {
        console.warn(
          'Supabase no sincronizó Inundación, pero el progreso local fue guardado:',
          error.message
        );
      }
    } catch (error) {
      console.warn('Fallo de conexión con Supabase. Progreso local guardado:', error);
    }

    setIsCompleted(true);

    setTimeout(() => {
      setLoading(false);
      navigate('/hub');
    }, 1300);
  };

  const consejos = [
    {
      icono: <ZapOff size={20} />,
      titulo: 'Desconecta energía',
      texto: 'Corta la luz si el agua entra en casa.'
    },
    {
      icono: <MapPin size={20} />,
      titulo: 'Busca zonas altas',
      texto: 'Dirígete a lugares seguros sin correr.'
    },
    {
      icono: <LifeBuoy size={20} />,
      titulo: 'No cruces corrientes',
      texto: 'El agua puede arrastrar personas y objetos.'
    }
  ];

  return (
    <main className="h-screen max-h-screen bg-[#010413] text-white relative overflow-hidden cursor-none p-3 md:p-5">
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%'
        }}
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
      >
        <motion.div
          animate={{
            scale: isHovering ? 1.08 : 1,
            borderColor: isHovering ? '#38bdf8' : '#22d3ee',
            backgroundColor: isHovering
              ? 'rgba(56,189,248,0.08)'
              : 'rgba(34,211,238,0.08)'
          }}
          transition={{ duration: 0.1 }}
          className="w-4 h-4 border rounded-full flex items-center justify-center shadow-[0_0_16px_rgba(34,211,238,0.6)] backdrop-blur-sm"
        >
          <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#fff]" />
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 19, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 w-[1120px] h-[1120px] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-cyan-400/35 rounded-full blur-[125px]" />
          <div className="absolute bottom-10 right-0 w-[430px] h-[430px] bg-blue-500/28 rounded-full blur-[135px]" />
          <div className="absolute left-0 top-1/2 w-80 h-80 bg-sky-300/18 rounded-full blur-[120px]" />
        </motion.div>

        <motion.div
          animate={{
            x: [-90, 100, -90],
            y: [35, -65, 35],
            opacity: [0.24, 0.5, 0.24]
          }}
          transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-28 -left-24 w-[500px] h-[500px] bg-cyan-500/25 rounded-full blur-[130px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      <section className="relative z-10 h-full max-w-7xl mx-auto grid grid-rows-[auto_1fr] gap-4">
        <header className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] px-5 py-4 flex items-center justify-between gap-4 shadow-2xl">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-cyan-300 mb-1">
              <Waves size={15} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.35em]">
                Protocolo hídrico activado
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              Inundaciones <span className="text-cyan-400">Seguras</span>
            </h1>
          </div>

          <button
            onClick={() => navigate('/hub')}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-white/60 text-[10px] font-black uppercase tracking-widest hover:text-cyan-300 hover:border-cyan-400/40 transition-all"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Volver al Hub</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-4 min-h-0">
          <section className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] overflow-hidden min-h-0 grid grid-rows-[1fr_auto]">
            <div
              onMouseEnter={() => setCursorVisible(false)}
              onMouseLeave={() => setCursorVisible(true)}
              className="relative bg-black/60 min-h-0"
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/jfK_I5yQi8E?autoplay=0&rel=0"
                title="Prevención Inundaciones"
                frameBorder="0"
                allowFullScreen
              />

              <div className="absolute left-4 top-4 bg-black/45 border border-white/10 backdrop-blur-xl rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Droplets size={16} />
                  <span className="text-[9px] font-black uppercase tracking-[0.24em]">
                    Misión 02
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-5 bg-slate-950/60 border-t border-white/10">
              <div className="flex items-start gap-3">
                <div className="bg-cyan-500/15 border border-cyan-400/20 p-3 rounded-2xl text-cyan-300">
                  <Radar size={20} />
                </div>

                <div>
                  <h3 className="text-cyan-300 font-black text-[10px] uppercase tracking-[0.25em] mb-1">
                    Análisis de misión
                  </h3>
                  <p className="text-white/70 text-xs md:text-sm leading-relaxed font-semibold">
                    Las inundaciones pueden avanzar rápido. La clave es reconocer zonas altas,
                    cortar la energía y nunca cruzar corrientes de agua en movimiento.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="grid grid-rows-[auto_1fr_auto] gap-4 min-h-0">
            <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-5">
              <div className="flex items-center gap-2 text-cyan-300 mb-2">
                <Sparkles size={16} />
                <span className="text-[9px] font-black uppercase tracking-[0.28em]">
                  Objetivo
                </span>
              </div>
              <p className="text-sm text-white/75 font-semibold leading-relaxed">
                Mira la cápsula, domina las reglas de seguridad y completa la evaluación para subir al Nivel 3.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 min-h-0">
              {consejos.map((item) => (
                <motion.div
                  key={item.titulo}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-cyan-500/15 border border-cyan-400/20 p-2.5 rounded-2xl text-cyan-300">
                      {item.icono}
                    </div>

                    <div>
                      <h4 className="font-black text-[10px] uppercase tracking-widest mb-1 text-white">
                        {item.titulo}
                      </h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed font-semibold uppercase">
                        {item.texto}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              type="button"
              onClick={() => setShowQuiz(true)}
              disabled={loading || isCompleted}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              whileHover={!loading && !isCompleted ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading && !isCompleted ? { scale: 0.97 } : {}}
              className={`w-full p-4 rounded-[1.5rem] font-black uppercase tracking-[0.22em] transition-all flex items-center justify-center gap-3 text-xs md:text-sm ${
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_15px_35px_rgba(34,211,238,0.28)]'
              } disabled:opacity-70`}
            >
              {loading ? (
                'Actualizando nivel...'
              ) : isCompleted ? (
                <>
                  <CheckCircle2 size={18} />
                  Nivel 3 desbloqueado
                </>
              ) : (
                <>
                  <PlayCircle size={18} />
                  Iniciar evaluación
                </>
              )}
            </motion.button>
          </aside>
        </div>
      </section>

      {showQuiz && (
        <Quiz
          tipo="inundacion"
          onClose={() => setShowQuiz(false)}
          onWin={handleWinQuiz}
        />
      )}
    </main>
  );
};

export default MisionInundacion;
