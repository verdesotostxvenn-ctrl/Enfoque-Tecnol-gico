import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Lock, Unlock, Cpu, XSquare } from 'lucide-react';

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
  const [status, setStatus] = useState<'idle' | 'scanning' | 'granted' | 'denied'>('idle');

  const preguntas: Record<string, Question[]> = {
    volcan: [
      { pregunta: "¿QUÉ DEBES USAR PARA PROTEGER TUS VÍAS RESPIRATORIAS DE LA CENIZA?", opciones: ["MASCARILLA N95", "BUFANDA DE TELA", "NINGUNA PROTECCIÓN"], correcta: 0 },
      { pregunta: "¿QUÉ PROTOCOLO APLICAS CON LOS DEPÓSITOS DE AGUA?", opciones: ["VACIARLOS INMEDIATAMENTE", "CUBRIRLOS HERMÉTICAMENTE", "DEJARLOS EXPUESTOS"], correcta: 1 },
      { pregunta: "SI USAS LENTES DE CONTACTO, ¿QUÉ ACCIÓN DEBES TOMAR?", opciones: ["USAR GAFAS PROTECTORAS", "MANTENERLOS PUESTOS", "USAR LENTES DE SOL"], correcta: 0 }
    ],
    inundacion: [
      { pregunta: "SI EL AGUA INGRESA AL PERÍMETRO, ¿QUÉ DESCONECTAS PRIMERO?", opciones: ["SISTEMA DE RADIO", "RED ELÉCTRICA PRINCIPAL", "DISPOSITIVOS MÓVILES"], correcta: 1 },
      { pregunta: "¿HACIA DÓNDE DEBE DIRIGIRSE LA EVACUACIÓN?", opciones: ["CALLES PRINCIPALES", "ZONAS DE MAYOR ALTITUD", "SÓTANOS ESTRUCTURALES"], correcta: 1 },
      { pregunta: "¿QUÉ ELEMENTOS SON CRÍTICOS EN LA MOCHILA DE EMERGENCIA?", opciones: ["ENTRETENIMIENTO", "BOTIQUÍN Y LINTERNA TÁCTICA", "DOCUMENTOS ANTIGUOS"], correcta: 1 }
    ],
    evacuacion: [
      { pregunta: "¿QUÉ HERRAMIENTA ES VITAL PARA MANTENER LA CALMA?", opciones: ["SEGUIR LA SEÑALÉTICA VERDE", "CORRER RÁPIDO", "GRITAR POR AYUDA"], correcta: 0 },
      { pregunta: "¿DÓNDE DEBES REUNIRTE CON TU EQUIPO?", opciones: ["DENTRO DEL EDIFICIO", "PUNTO DE ENCUENTRO ESTABLECIDO", "EN EL AUTO"], correcta: 1 },
      { pregunta: "¿QUÉ DEBES EVITAR DURANTE LA EVACUACIÓN?", opciones: ["USAR LAS ESCALERAS", "AYUDAR A OTROS", "USAR ASCENSORES"], correcta: 2 }
    ]
  };

  const actualQuestions = preguntas[tipo] || preguntas.volcan;
  const progreso = Math.round((step / actualQuestions.length) * 100);

  const handleSelect = (index: number) => {
    if (status !== 'idle') return;
    setSelected(index);
    setStatus('scanning');

    // Simulamos el tiempo de "desencriptación" de la respuesta
    setTimeout(() => {
      if (index === actualQuestions[step].correcta) {
        setStatus('granted');
        setTimeout(() => {
          if (step + 1 < actualQuestions.length) {
            setStep(step + 1);
            setSelected(null);
            setStatus('idle');
          } else {
            onWin();
          }
        }, 1500);
      } else {
        setStatus('denied');
        setTimeout(() => {
          setSelected(null);
          setStatus('idle');
        }, 2000);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm font-mono">
      {/* Scanlines effect (líneas de terminal antigua) */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-[201] opacity-50" />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-[#050505] border border-emerald-500/30 p-8 rounded-lg max-w-2xl w-full shadow-[0_0_40px_rgba(16,185,129,0.15)] z-[202] overflow-hidden"
      >
        {/* Barra superior de la terminal */}
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4 mb-6">
          <div className="flex items-center space-x-3 text-emerald-500">
            <Terminal size={18} />
            <span className="text-xs tracking-widest">SISTEMA_EVALUACION_V1.0</span>
          </div>
          <button onClick={onClose} className="text-emerald-500/50 hover:text-red-500 transition-colors">
            <XSquare size={20} />
          </button>
        </div>

        {/* HUD de Progreso */}
        <div className="flex items-center justify-between text-[10px] text-emerald-500/70 mb-8">
          <span>{'>'} ANALIZANDO_AMENAZA: {tipo.toUpperCase()}</span>
          <span>DESENCRIPTADO: {progreso}% [{Array(step).fill('█').join('')}{Array(actualQuestions.length - step).fill('-').join('')}]</span>
        </div>

        <header className="mb-8 min-h-[5rem]">
          <motion.h2 
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl md:text-2xl font-bold text-emerald-400 leading-tight"
          >
            {'> '} {actualQuestions[step].pregunta}
            <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>_</motion.span>
          </motion.h2>
        </header>

        <div className="space-y-3 mb-6">
          {actualQuestions[step].opciones.map((opcion, index) => {
            let buttonStyle = "border-emerald-500/20 text-emerald-500/70 hover:bg-emerald-500/10 hover:border-emerald-500/50";
            let prefix = "[ ]";

            if (selected === index) {
              if (status === 'scanning') {
                buttonStyle = "border-yellow-500 text-yellow-400 bg-yellow-500/10 animate-pulse";
                prefix = "[*]";
              } else if (status === 'granted') {
                buttonStyle = "border-emerald-500 text-emerald-400 bg-emerald-500/20";
                prefix = "[+]";
              } else if (status === 'denied') {
                buttonStyle = "border-red-500 text-red-500 bg-red-500/10";
                prefix = "[-]";
              }
            } else if (status !== 'idle') {
              buttonStyle = "border-white/5 text-white/20 opacity-50"; // Dim other options
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={status !== 'idle'}
                className={`w-full p-4 border text-left text-sm transition-all flex items-center space-x-4 ${buttonStyle}`}
              >
                <span className="w-8">{prefix}</span>
                <span>{opcion}</span>
              </button>
            );
          })}
        </div>

        {/* Consola de estado inferior */}
        <div className="h-12 border-t border-emerald-500/20 pt-4 flex items-center">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center text-emerald-500/50 text-xs">
                <Cpu size={14} className="mr-2" /> ESPERANDO_INPUT_DEL_USUARIO...
              </motion.div>
            )}
            {status === 'scanning' && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center text-yellow-500 text-xs font-bold">
                <Lock size={14} className="mr-2 animate-spin" /> VERIFICANDO_INTEGRIDAD_DE_DATOS...
              </motion.div>
            )}
            {status === 'granted' && (
              <motion.div key="granted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center text-emerald-400 text-xs font-bold">
                <Unlock size={14} className="mr-2" /> ACCESO_CONCEDIDO. RESPUESTA_CORRECTA.
              </motion.div>
            )}
            {status === 'denied' && (
              <motion.div key="denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center text-red-500 text-xs font-bold">
                <XSquare size={14} className="mr-2" /> ERROR_CRÍTICO. RESPUESTA_INCORRECTA.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Quiz;
