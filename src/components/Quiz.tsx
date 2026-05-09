import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Star, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

interface Question {
  pregunta: string;
  opciones: string[];
  correcta: number;
}

interface QuizProps {
  tipo: 'volcan' | 'inundacion' | 'evacuacion';
  onWin: () => void;
  onClose: () => void;
}

const Quiz: React.FC<QuizProps> = ({ tipo, onWin, onClose }) => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const preguntas: Record<string, Question[]> = {
    volcan: [
      { pregunta: "¿Qué debes usar para proteger tus pulmones de la ceniza?", opciones: ["Mascarilla N95", "Una bufanda delgada", "Nada, no hace daño"], correcta: 0 },
      { pregunta: "¿Qué debes hacer con los depósitos de agua en casa?", opciones: ["Dejarlos abiertos", "Cubrirlos muy bien", "Vaciarlos todos"], correcta: 1 },
      { pregunta: "Si usas lentes de contacto, ¿qué es mejor usar hoy?", opciones: ["Mis lentes de contacto", "No usar nada", "Gafas o lentes de armazón"], correcta: 2 }
    ],
    inundacion: [
      { pregunta: "Si el agua entra en casa, ¿qué desconectas primero?", opciones: ["La radio", "La energía eléctrica", "La televisión"], correcta: 1 },
      { pregunta: "¿Hacia dónde debes dirigirte en una inundación?", opciones: ["A la calle", "A zonas altas", "Al sótano"], correcta: 1 },
      { pregunta: "¿Qué debe tener tu mochila de emergencia?", opciones: ["Juguetes", "Botiquín y linterna", "Libros"], correcta: 1 }
    ],
    evacuacion: [
      { pregunta: "¿Qué herramienta es vital para mantener la calma?", opciones: ["Seguir la señalética", "Correr rápido", "Gritar fuerte"], correcta: 0 },
      { pregunta: "¿Dónde debes reunirte con tu familia?", opciones: ["Dentro de casa", "Punto de encuentro seguro", "En el auto"], correcta: 1 },
      { pregunta: "¿Qué debes evitar durante la evacuación?", opciones: ["Usar escaleras", "Ayudar a otros", "Usar ascensores"], correcta: 2 }
    ]
  };

  const actualQuestions = preguntas[tipo] || preguntas.volcan;

  const handleLevelUp = async () => {
    setIsSyncing(true);
    // Mapeo táctico de niveles
    const niveles = { volcan: 2, inundacion: 3, evacuacion: 4 };
    const nuevoNivel = niveles[tipo];
    const nombreAgente = localStorage.getItem('agenteNombre');

    try {
      if (nombreAgente) {
        // 1. Impacto en Supabase (Aseguramos que el nombre sea exacto)
        const { error } = await supabase
          .from('usuarios')
          .update({ nivel: nuevoNivel })
          .eq('nombre', nombreAgente);

        if (error) throw error;

        // 2. Actualización del "Chip de Memoria" Local
        localStorage.setItem('agenteNivel', nuevoNivel.toString());
        console.log(`🚀 Misión Confirmada. Agente ascendido a Nivel: ${nuevoNivel}`);
      }
      
      // Pequeña pausa para que el niño sienta la importancia del proceso
      setTimeout(() => {
        onWin(); 
      }, 1000);

    } catch (err) {
      console.error("❌ Error de comunicación con el centro de mando:", err);
      // Aun si falla internet, permitimos que onWin ocurra para no frustrar al niño, 
      // pero el localStorage ya debería estar listo.
      onWin();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelect = (index: number) => {
    if (status !== 'idle' || isSyncing) return; 
    setSelected(index);

    if (index === actualQuestions[step].correcta) {
      setStatus('correct');
      setScore(score + 100);
      setTimeout(() => {
        if (step + 1 < actualQuestions.length) {
          setStep(step + 1);
          setSelected(null);
          setStatus('idle');
        } else {
          handleLevelUp();
        }
      }, 1500);
    } else {
      setStatus('wrong');
      setTimeout(() => {
        setSelected(null);
        setStatus('idle');
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0, y: 50 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative bg-gradient-to-b from-[#500000] to-[#2a0000] border-4 border-red-500/50 p-8 md:p-12 rounded-[3.5rem] max-w-2xl w-full shadow-[0_0_60px_rgba(239,68,68,0.3)]"
      >
        {/* Nube de pensamiento - Puntero */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[25px] border-t-red-500/50"></div>
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[20px] border-t-[#2a0000]"></div>

        {/* 💡🧠 EMOJIS DINÁMICOS */}
        <div className="absolute -top-8 right-8 flex space-x-2 bg-black/40 p-4 rounded-full border-2 border-red-500/30 backdrop-blur-md shadow-xl">
          <motion.span animate={{ y: [0, -8, 0], rotate: [-10, 10, -10] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]">💡</motion.span>
          <motion.span animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }} className="text-4xl drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]">🧠</motion.span>
        </div>

        {/* HEADER: Puntaje y Nivel */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 bg-red-500/20 px-4 py-2 rounded-2xl border border-red-500/30 w-fit">
            <BrainCircuit size={20} className="text-red-400" />
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-red-200">Misión: {tipo.toUpperCase()}</span>
          </div>
          
          <motion.div 
            key={score}
            initial={{ scale: 1.5, color: '#facc15' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="flex items-center space-x-2 bg-yellow-500/20 px-4 py-2 rounded-2xl border border-yellow-500/50"
          >
            <Star className="text-yellow-400 fill-yellow-400" size={18} />
            <span className="font-black text-yellow-400">{score} XP</span>
          </motion.div>
        </header>

        {/* PREGUNTA O ESTADO DE SINCRONIZACIÓN */}
        {isSyncing ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="text-cyan-400 animate-spin" size={48} />
            <h2 className="text-xl font-black text-white uppercase tracking-tighter text-center">
              Enviando reporte al Distrito 18D03...
            </h2>
          </div>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-8 text-center drop-shadow-md">
              {actualQuestions[step].pregunta}
            </h2>

            <div className="space-y-4 mb-8">
              {actualQuestions[step].opciones.map((opcion, index) => {
                let btnBg = "bg-black/40 border-white/10 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]";
                let textColor = "text-slate-200";
                let Icon = null;
                let animation = {};

                if (selected === index) {
                  if (status === 'correct') {
                    btnBg = "bg-emerald-500 border-emerald-400 scale-[1.05] shadow-[0_0_30px_rgba(16,185,129,0.5)]";
                    textColor = "text-white";
                    Icon = <CheckCircle2 className="text-white" size={24} />;
                  } else if (status === 'wrong') {
                    btnBg = "bg-red-600 border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.5)]";
                    textColor = "text-white";
                    Icon = <XCircle className="text-white" size={24} />;
                    animation = { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } };
                  }
                } else if (status !== 'idle') {
                  btnBg = "bg-black/20 border-white/5 opacity-40";
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleSelect(index)}
                    disabled={status !== 'idle'}
                    whileTap={{ scale: 0.95 }}
                    animate={animation}
                    className={`w-full p-5 rounded-2xl border-2 font-black text-left md:text-lg transition-colors flex items-center justify-between ${btnBg} ${textColor}`}
                  >
                    <span>{opcion}</span>
                    {Icon && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>{Icon}</motion.div>}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        {/* FEEDBACK INFERIOR */}
        <div className="flex items-center justify-between mt-4 h-10">
          {!isSyncing && (
            <button onClick={onClose} className="text-red-300/60 font-bold uppercase text-[11px] tracking-widest hover:text-white transition-colors">
              Cancelar Misión
            </button>
          )}

          <AnimatePresence mode="wait">
            {status === 'wrong' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center text-red-400 font-bold text-sm uppercase tracking-widest">
                <AlertTriangle size={16} className="mr-2" /> ¡Cuidado Agente! Reintenta.
              </motion.div>
            )}
            {status === 'correct' && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center text-emerald-400 font-bold text-sm uppercase tracking-widest">
                <Star size={16} className="mr-2 fill-emerald-400" /> ¡Misión casi lista!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Quiz;
