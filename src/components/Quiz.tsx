import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertCircle, BrainCircuit, Lightbulb, ChevronRight } from 'lucide-react';

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
  const [failed, setFailed] = useState(false);

  // Banco de preguntas tácticas
  const preguntas: Record<string, Question[]> = {
    volcan: [
      { pregunta: "¿Qué debes usar para proteger tus pulmones de la ceniza?", opciones: ["Mascarilla", "Bufanda normal", "Nada"], correcta: 0 },
      { pregunta: "¿Qué debes hacer con los depósitos de agua?", opciones: ["Dejarlos abiertos", "Cubrirlos", "Vaciar todo"], correcta: 1 },
      { pregunta: "Si usas lentes de contacto, ¿qué es mejor usar?", opciones: ["Gafas protectoras", "Nada", "Lentes de sol"], correcta: 0 }
    ],
    inundacion: [
      { pregunta: "Si el agua entra en casa, ¿qué desconectas primero?", opciones: ["La radio", "La energía eléctrica", "La televisión"], correcta: 1 },
      { pregunta: "¿Hacia dónde debes dirigirte en una inundación?", opciones: ["A la calle", "A zonas altas", "Al sótano"], correcta: 1 },
      { pregunta: "¿Qué debe tener tu mochila de emergencia?", opciones: ["Juguetes", "Botiquín y linterna", "Libros"], correcta: 1 }
    ]
  };

  const actualQuestions = preguntas[tipo] || preguntas.volcan;

  const handleNext = () => {
    if (selected === actualQuestions[step].correcta) {
      if (step + 1 < actualQuestions.length) {
        setStep(step + 1);
        setSelected(null);
        setFailed(false);
      } else {
        onWin(); // ¡Ganó el quiz!
      }
    } else {
      setFailed(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-[#450a0a] border-2 border-red-500/30 p-8 md:p-12 rounded-[3rem] max-w-2xl w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]"
      >
        {/* Emojis dinámicos dentro de la nube */}
        <div className="absolute -top-6 -right-6 flex space-x-3 bg-slate-900 p-4 rounded-full border border-red-500/20">
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl">💡</motion.span>
          <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} className="text-3xl">🧠</motion.span>
        </div>

        <header className="mb-8">
          <div className="flex items-center space-x-3 text-red-400 mb-2">
            <BrainCircuit size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Desafío de Agente: Nivel {step + 1}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            {actualQuestions[step].pregunta}
          </h2>
        </header>

        <div className="space-y-4 mb-10">
          {actualQuestions[step].opciones.map((opcion, index) => (
            <button
              key={index}
              onClick={() => setSelected(index)}
              className={`w-full p-5 rounded-2xl border-2 text-left font-bold transition-all ${
                selected === index 
                ? 'border-red-500 bg-red-500/20 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : 'border-white/5 bg-black/40 text-slate-400 hover:bg-white/5'
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white">Abortar</button>
          
          <button 
            disabled={selected === null}
            onClick={handleNext}
            className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center space-x-3 disabled:opacity-20 transition-all"
          >
            <span>{step + 1 === actualQuestions.length ? 'Finalizar' : 'Siguiente'}</span>
            <ChevronRight size={18} />
          </button>
        </div>

        <AnimatePresence>
          {failed && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-12 left-0 right-0 text-center text-red-500 font-bold text-xs uppercase tracking-widest">
              Respuesta incorrecta. ¡Analiza de nuevo, Agente!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Quiz;
