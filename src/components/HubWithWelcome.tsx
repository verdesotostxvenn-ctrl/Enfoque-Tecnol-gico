import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Compass, MapPinned, ShieldCheck, Sparkles, X } from 'lucide-react';
import KidHub from './KidHub';
import TerritorialMapView from './TerritorialMapView';
import { fetchTerritorialMap, TERRITORIAL_IDS, type GeoJsonFeatureCollection } from '../utils/territorialMaps';

const AVATARS = {
  chica: 'https://blogger.googleusercontent.com/img/a/AVvXsEh_PnIcFYcgmsvgfKqk4Mr0s40x0a5f1_pIFmBRlR0oVInL1-uaLQIez5BrYNp-ua4-mBmHqb2A8Ox4tElSIJx3LtHnBaO-cGTxzHomjYO1f2X6KQzCYn8I0LmpqNe6o1UiXhc814JjCv0hWJ3kME5gcDJ1czrxl7xYge9BE214gnYyrIHHqxwuTMyoxPjd',
  chico: 'https://blogger.googleusercontent.com/img/a/AVvXsEhGuah8gRxjKHRH2XeN_K7ew3dlo-4QNWudy46AsoT91CiPXkrU9JDEA1wQ1iyIcYj23qQGhITb2EJpIMP1bww_g24vx1-yYp6dYz1agR_nWX6pazjghCNOXXKGvdI0nzDG173acHzltH-fCPlxYYkVQhA47V7aFNiZmVH4HAZf8OTIqtiu0DiI7SIOd5Qe'
};

const HubWithWelcome = () => {
  const [open, setOpen] = useState(() => sessionStorage.getItem('introTerritorialVista') !== 'true');
  const [step, setStep] = useState(0);
  const [cantones, setCantones] = useState<GeoJsonFeatureCollection | null>(null);
  const [parroquias, setParroquias] = useState<GeoJsonFeatureCollection | null>(null);

  const nombre = localStorage.getItem('agenteNombre') || 'Agente';
  const avatarKey = localStorage.getItem('agenteAvatar') === 'chica' ? 'chica' : 'chico';

  const loadTerritorialMaps = useCallback(async () => {
    try {
      const [cantonalMap, parishMap] = await Promise.all([
        fetchTerritorialMap(TERRITORIAL_IDS.cantones),
        fetchTerritorialMap(TERRITORIAL_IDS.parroquias)
      ]);
      setCantones(cantonalMap);
      setParroquias(parishMap);
    } catch (error) {
      console.warn('Mapas territoriales todavía no disponibles:', error);
    }
  }, []);

  useEffect(() => {
    const refresh = () => loadTerritorialMaps();
    const visibility = () => {
      if (!document.hidden) loadTerritorialMaps();
    };

    loadTerritorialMaps();
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('territorialMapsUpdated', refresh as EventListener);
    document.addEventListener('visibilitychange', visibility);

    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('territorialMapsUpdated', refresh as EventListener);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [loadTerritorialMaps]);

  useEffect(() => {
    if (open && step > 0) loadTerritorialMaps();
  }, [open, step, loadTerritorialMaps]);

  const close = () => {
    sessionStorage.setItem('introTerritorialVista', 'true');
    setOpen(false);
  };

  const titles = [
    <>¡Bienvenido, <span className="text-yellow-300">{nombre}</span>!</>,
    <>Encuentra nuestra base en <span className="text-cyan-300">Tungurahua</span></>,
    <>Explora un territorio de <span className="text-emerald-300">colores y retos</span></>
  ];

  const descriptions = [
    'Un Agente de Prevención observa, aprende y sabe cómo ayudar. Prepárate para conocer mejor Baños de Agua Santa.',
    'Baños está resaltado para que descubras dónde comienza tu aventura de seguridad y prevención.',
    'Cada parroquia tiene ríos, montañas y riesgos diferentes. Conocerlas te ayuda a tomar mejores decisiones.'
  ];

  return (
    <>
      <KidHub />

      <button
        type="button"
        onClick={() => { setStep(0); setOpen(true); loadTerritorialMaps(); }}
        className="fixed bottom-5 right-5 z-40 rounded-full border-4 border-white bg-gradient-to-br from-orange-500 to-pink-500 p-4 text-white shadow-2xl transition hover:-translate-y-1 hover:scale-105"
        aria-label="Abrir introducción territorial"
      >
        <Compass size={27} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#071D4A]/80 p-3 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section
              className="relative h-[min(90vh,780px)] w-full max-w-6xl overflow-hidden rounded-[2.7rem] border-4 border-white bg-white shadow-[0_40px_140px_rgba(0,0,0,.5)]"
              initial={{ y: 30, scale: .96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: .97 }}
            >
              <button onClick={close} className="absolute right-4 top-4 z-30 rounded-full border-4 border-white bg-rose-500 p-3 text-white shadow-lg hover:bg-rose-400" aria-label="Cerrar"><X size={20} /></button>

              <AnimatePresence mode="wait">
                <motion.div key={step} className="grid h-full grid-cols-1 lg:grid-cols-[.82fr_1.18fr]" initial={{ opacity: 0, x: 34 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -34 }} transition={{ duration: .26 }}>
                  <div className="relative flex flex-col justify-between overflow-hidden border-b-4 border-white bg-gradient-to-br from-[#0B4BB3] via-[#176ED8] to-[#16B7D8] p-6 text-white lg:border-b-0 lg:border-r-4 lg:p-9">
                    <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full border-[28px] border-yellow-300/80" />
                    <div className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full border-[32px] border-pink-400/55" />

                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 rounded-full border-2 border-white/35 bg-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[.2em] backdrop-blur-md"><Sparkles size={16} className="text-yellow-300" /> Mapa de aventura 18D03</div>
                      <h2 className="mt-5 text-4xl font-black leading-[.95] tracking-tight md:text-6xl">{titles[step]}</h2>
                      <p className="mt-5 text-base font-bold leading-relaxed text-cyan-50 md:text-lg">{descriptions[step]}</p>
                    </div>

                    <div className="relative z-10 mt-6">
                      <div className="mb-5 flex gap-2">
                        {[0, 1, 2].map((item) => (
                          <button key={item} onClick={() => setStep(item)} className={`h-3 rounded-full border-2 border-white transition-all ${step === item ? 'w-14 bg-yellow-300' : 'w-8 bg-white/25'}`} aria-label={`Ir a pestaña ${item + 1}`} />
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <button disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} className="rounded-2xl border-2 border-white/40 bg-white/15 px-4 py-3 font-black text-white backdrop-blur-md disabled:opacity-30"><ArrowLeft /></button>
                        {step < 2 ? (
                          <button onClick={() => setStep((current) => Math.min(2, current + 1))} className="flex items-center gap-2 rounded-2xl bg-yellow-300 px-5 py-4 text-xs font-black uppercase tracking-widest text-[#071D4A] shadow-lg hover:-translate-y-1">Desliza para explorar <ArrowRight size={17} /></button>
                        ) : (
                          <button onClick={close} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:-translate-y-1"><ShieldCheck size={18} /> ¡Aceptar misión!</button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative min-h-0 overflow-auto bg-[#F7FAFF] p-5 lg:p-8">
                    {step === 0 && (
                      <div className="flex h-full min-h-[420px] items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-orange-300/45 blur-3xl" />
                          <img src={AVATARS[avatarKey]} alt="Avatar elegido" className="relative z-10 h-72 w-72 rounded-[3rem] border-4 border-white bg-gradient-to-br from-violet-100 to-cyan-100 object-contain p-5 shadow-2xl md:h-96 md:w-96" />
                          <div className="absolute -bottom-3 -right-3 z-20 rounded-2xl border-4 border-white bg-[#176ED8] p-4 text-white shadow-xl"><MapPinned size={32} /></div>
                        </div>
                      </div>
                    )}
                    {step === 1 && <TerritorialMapView collection={cantones} mode="cantones" className="h-full min-h-[430px]" />}
                    {step === 2 && <TerritorialMapView collection={parroquias} mode="parroquias" className="h-full min-h-[430px]" />}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HubWithWelcome;
