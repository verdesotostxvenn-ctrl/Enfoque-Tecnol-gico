import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ChevronRight, HelpCircle, MapPin, School, User, Users } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Lobby = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  const escuelasDisponibles = [
    'Escuela Río Blanco',
    'Escuela Río Verde',
    'U.E. Baños',
    'Unidad Educativa 04',
    'Unidad Educativa 05',
    'Unidad Educativa 06',
    'Unidad Educativa 07',
    'Unidad Educativa 08',
    'Unidad Educativa 09',
    'Unidad Educativa 10',
    'Unidad Educativa 11',
    'Unidad Educativa 12'
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nombre.trim() || !escuela || !avatar) return;

    setLoading(true);

    const nombreLimpio = nombre.trim();

    localStorage.setItem('agenteNombre', nombreLimpio);
    localStorage.setItem('agenteEscuela', escuela);
    localStorage.setItem('agenteAvatar', avatar);
    localStorage.setItem('agenteNivel', '1');
    localStorage.setItem('misionVolcanCompletada', 'false');
    localStorage.setItem('misionInundacionCompletada', 'false');
    localStorage.setItem('misionEvacuacionCompletada', 'false');

    window.dispatchEvent(new Event('agenteNivelActualizado'));

    try {
      const { error } = await supabase.from('agentes').insert([
        {
          nombre: nombreLimpio,
          institucion: escuela
        }
      ]);

      if (error) {
        console.warn('Supabase no sincronizó, pero el agente fue guardado localmente:', error.message);
      }
    } catch (error) {
      console.warn('Fallo Supabase. Registro local guardado:', error);
    }

    setTimeout(() => {
      setLoading(false);
      navigate('/hub');
    }, 700);
  };

  return (
    <div className="min-h-screen w-full bg-[#010413] text-white p-5 md:p-10 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-6xl bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-2xl shadow-2xl grid grid-cols-1 lg:grid-cols-2"
      >
        <div className="p-8 md:p-14 bg-slate-950/50 border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="flex items-center gap-3 text-orange-500 mb-6">
            <Activity size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Distrito 18D03
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tighter uppercase mb-6">
            Misión <br />
            <span className="text-orange-500">Prevención</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-md mb-10">
            Plataforma educativa de gestión de riesgos para entrenar agentes infantiles en prevención, emergencia y evacuación.
          </p>

          <div className="relative w-40">
            <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full" />
            <img
              src="https://blogger.googleusercontent.com/img/a/AVvXsEhwwQia3e2LdO2aVrT1GFE6Cojzx6-lve9qceOZH3IiwXtV3wYKFiTioE7lSASVOnjdUexdIJwv9PUVScy_iupzCzzbbGUp7S1ByxBcJWK8fsZVexSyKj2oh7VgnJZ7iC4bkUjuko0R7SH-Lzgii-JsZmRgbdNWqQlwFlQ194py9fA-fCIIhM1HrHesW3pv"
              alt="Logo"
              className="relative z-10 w-full h-auto drop-shadow-2xl"
            />
          </div>

          <div className="mt-10 pt-6 border-t border-white/10">
            <p className="text-xs text-white/80 font-bold italic border-l-2 border-orange-500 pl-4 uppercase">
              “Un buen conocimiento del riesgo ayuda a mejorar la resiliencia comunitaria”
            </p>
          </div>
        </div>

        <div className="p-8 md:p-14 bg-black/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center mb-2">
                <User size={14} className="mr-2 text-orange-500" />
                Registro de identidad
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Escribe tu nombre..."
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center mb-2">
                <School size={14} className="mr-2 text-cyan-400" />
                Unidad educativa local
              </label>

              <div className="relative">
                <select
                  value={escuela}
                  onChange={(e) => setEscuela(e.target.value)}
                  className="w-full appearance-none bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-cyan-400"
                  required
                >
                  <option value="">Seleccionar escuela...</option>
                  {escuelasDisponibles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center mb-3">
                <Users size={14} className="mr-2 text-white" />
                Selecciona tu agente
              </label>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAvatar('chica')}
                  className={`p-5 rounded-3xl border transition-all ${
                    avatar === 'chica'
                      ? 'bg-orange-500/20 border-orange-500 scale-[1.03] shadow-[0_0_25px_rgba(249,115,22,0.25)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-6xl mb-3">👧🏽</div>
                  <div className="text-[10px] font-black uppercase tracking-widest">Niña</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAvatar('chico')}
                  className={`p-5 rounded-3xl border transition-all ${
                    avatar === 'chico'
                      ? 'bg-cyan-500/20 border-cyan-400 scale-[1.03] shadow-[0_0_25px_rgba(34,211,238,0.25)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-6xl mb-3">👦🏽</div>
                  <div className="text-[10px] font-black uppercase tracking-widest">Niño</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !nombre.trim() || !escuela || !avatar}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-30 rounded-2xl p-5 text-white font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Preparando misión...' : 'Comenzar aventura'}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>

          <div className="mt-8 bg-red-600/10 border border-red-500/30 p-6 rounded-[2rem]">
            <div className="flex gap-3">
              <HelpCircle className="text-red-400 shrink-0" size={22} />
              <div>
                <h4 className="text-red-300 font-black text-[10px] uppercase tracking-widest mb-1">
                  ¿Sabías que?
                </h4>
                <p className="text-white text-xs leading-relaxed font-semibold">
                  El riesgo es una construcción social: no hay riesgo si no existen personas expuestas y vulnerables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;
