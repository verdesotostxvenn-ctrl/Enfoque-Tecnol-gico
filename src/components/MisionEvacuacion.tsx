import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  Bell,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  Flag,
  MapPinned,
  PlayCircle,
  Route,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users
} from 'lucide-react';
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

    localStorage.setItem('agenteNivel', '4');
    localStorage.setItem('misionEvacuacionCompletada', 'true');
    window.dispatchEvent(new Event('agenteNivelActualizado'));

    try {
      const { error } = await supabase
        .from('agentes')
        .update({
          mision_evacuacion: true,
          nivel: 4,
          ultima_conexion: new Date().toISOString()
        })
        .eq('nombre', nombre);

      if (error) {
        console.warn(
          'Supabase no sincronizó Evacuación, pero el progreso local fue guardado:',
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
      icono: <Briefcase size={20} />,
      titulo: 'Kit de supervivencia',
      texto: 'Botiquín, linterna, radio y agua embotellada.'
    },
    {
      icono: <Users size={20} />,
      titulo: 'Punto familiar',
      texto: 'Define un lugar seguro para reunirse.'
    },
    {
      icono: <MapPinned size={20} />,
      titulo: 'Ruta señalizada',
      texto: 'Sigue la señalética verde y evita zonas de riesgo.'
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
            borderColor: isHovering ? '#34d399' : '#10b981',
            backgroundColor: isHovering
              ? 'rgba(52,211,153,0.08)'
              : 'rgba(16,185,129,0.08)'
          }}
          transition={{ duration: 0.1 }}
          className="w-4 h-4 border rounded-full flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.6)] backdrop-blur-sm"
        >
          <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#fff]" />
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 w-[1120px] h-[1120px] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-emerald-500/35 rounded-full blur-[125px]" />
          <div className="absolute bottom-10 right-0 w-[430px] h-[430px] bg-teal-500/28 rounded-full blur-[135px]" />
          <div className="absolute left-0 top-1/2 w-80 h-80 bg-cyan-300/18 rounded-full blur-[120px]" />
        </motion.div>

        <motion.div
          animate={{
            x: [-95, 110, -95],
            y: [40, -70, 40],
            opacity: [0.24, 0.5, 0.24]
          }}
          transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-28 -right-24 w-[510px] h-[510px] bg-emerald-500/25 rounded-full blur-[130px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      <section className="relative z-10 h-full max-w-7xl mx-auto grid grid-rows-[auto_1fr] gap-4">
        <header className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] px-5 py-4 flex items-center justify-between gap-4 shadow-2xl">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-emerald-300 mb-1">
              <Route size={15} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.35em]">
                Logística de emergencia activada
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              Rutas de <span className="text-emerald-400">Evacuación</span>
            </h1>
          </div>

          <button
            onClick={() => navigate('/hub')}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-white/60 text-[10px] font-black uppercase tracking-widest hover:text-emerald-300 hover:border-emerald-400/40 transition-all"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Volver al Hub</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4 min-h-0">
          <section className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] overflow-hidden min-h-0 grid grid-rows-[auto_1fr_auto]">
            <div className="p-5 border-b border-white/10 bg-slate-950/40">
              <div className="flex items-start gap-4">
                <motion.div
                  animate={{ rotate: [-4, 4, -4], scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-emerald-500/15 border border-emerald-400/20 p-4 rounded-[1.5rem] text-emerald-300"
                >
                  <Bell size={34} />
                </motion.div>

                <div>
                  <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                    Mensaje central
                  </p>
                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">
                    Mantener la calma salva vidas
                  </h2>
                </div>
              </div>
            </div>

            <div className="relative p-6 flex items-center justify-center overflow-hidden">
              <motion.div
                animate={{ x: ['-120%', '120%'] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 bottom-0 w-28 bg-emerald-300/10 blur-xl rotate-12"
              />

              <div className="relative z-10 max-w-2xl text-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="mx-auto mb-6 w-24 h-24 rounded-[2rem] bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-300 shadow-[0_0_50px_rgba(16,185,129,0.18)]"
                >
                  <Flag size={48} />
                </motion.div>

                <p className="text-xl md:text-3xl font-black text-white leading-tight mb-4">
                  Sigue siempre la señalética verde y avanza hacia el punto seguro más cercano.
                </p>

                <p className="text-sm md:text-base text-white/60 font-semibold leading-relaxed">
                  Esta es la evaluación final. Al aprobarla, el agente obtiene el rango de
                  Comandante y desbloquea su credencial digital.
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5 bg-slate-950/60 border-t border-white/10">
              <div className="flex items-start gap-3">
                <div className="bg-emerald-500/15 border border-emerald-400/20 p-3 rounded-2xl text-emerald-300">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h3 className="text-emerald-300 font-black text-[10px] uppercase tracking-[0.25em] mb-1">
                    Análisis de misión
                  </h3>
                  <p className="text-white/70 text-xs md:text-sm leading-relaxed font-semibold">
                    Una evacuación segura depende de conocer la ruta, mantener la calma y reunirse
                    en puntos previamente definidos por la familia o comunidad educativa.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="grid grid-rows-[auto_1fr_auto] gap-4 min-h-0">
            <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-5">
              <div className="flex items-center gap-2 text-emerald-300 mb-2">
                <Sparkles size={16} />
                <span className="text-[9px] font-black uppercase tracking-[0.28em]">
                  Objetivo final
                </span>
              </div>
              <p className="text-sm text-white/75 font-semibold leading-relaxed">
                Repasa las reglas de evacuación, completa el examen final y desbloquea el rango Comandante.
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
                    <div className="bg-emerald-500/15 border border-emerald-400/20 p-2.5 rounded-2xl text-emerald-300">
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
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_15px_35px_rgba(16,185,129,0.28)]'
              } disabled:opacity-70`}
            >
              {loading ? (
                'Graduando agente...'
              ) : isCompleted ? (
                <>
                  <CheckCircle2 size={18} />
                  Comandante graduado
                </>
              ) : (
                <>
                  <PlayCircle size={18} />
                  Examen final
                </>
              )}
            </motion.button>
          </aside>
        </div>
      </section>

      {showQuiz && (
        <Quiz
          tipo="evacuacion"
          onClose={() => setShowQuiz(false)}
          onWin={handleWinQuiz}
        />
      )}
    </main>
  );
};

export default MisionEvacuacion;
