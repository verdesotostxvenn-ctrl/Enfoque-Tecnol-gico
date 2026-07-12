import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Compass, MapPinned, ShieldCheck, X } from 'lucide-react';
import Hub from './Hub';
import TerritorialMapView from './TerritorialMapView';
import { fetchTerritorialMap, TERRITORIAL_IDS, type GeoJsonFeatureCollection } from '../utils/territorialMaps';

const AVATARS = {
  chica: 'https://blogger.googleusercontent.com/img/a/AVvXsEh_PnIcFYcgmsvgfKqk4Mr0s40x0a5f1_pIFmBRlR0oVInL1-uaLQIez5BrYNp-ua4-mBmHqb2A8Ox4tElSIJx3LtHnBaO-cGTxzHomjYO1f2X6KQzCYn8I0LmpqNe6o1UiXhc814JjCv0hWJ3kME5gcDJ1czrxl7xYge9BE214gnYyrIHHqxwuTMyoxPjd',
  chico: 'https://blogger.googleusercontent.com/img/a/AVvXsEhGuah8gRxjKHRH2XeN_K7ew3dlo-4QNWudy46AsoT91CiPXkrU9JDEA1wQ1iyIcYj23qQGhITb2EJpIMP1bww_g24vx1-yYp6dYz1agR_nWX6pazjghCNOXXKGvdI0nzDG173acHzltH-fCPlxYYkVQhA47V7aFNiZmVH4HAZf8OTIqtiu0DiI7SIOd5Qe'
};

const HubWithWelcome = () => {
  const [open, setOpen] = useState(() => localStorage.getItem('introTerritorialVista') !== 'true');
  const [step, setStep] = useState(0);
  const [cantones, setCantones] = useState<GeoJsonFeatureCollection | null>(null);
  const [parroquias, setParroquias] = useState<GeoJsonFeatureCollection | null>(null);

  const nombre = localStorage.getItem('agenteNombre') || 'Agente';
  const avatarKey = localStorage.getItem('agenteAvatar') === 'chica' ? 'chica' : 'chico';

  useEffect(() => {
    Promise.all([
      fetchTerritorialMap(TERRITORIAL_IDS.cantones),
      fetchTerritorialMap(TERRITORIAL_IDS.parroquias)
    ]).then(([c, p]) => {
      setCantones(c);
      setParroquias(p);
    }).catch((error) => console.warn('Mapas territoriales todavía no disponibles:', error));
  }, []);

  const close = () => {
    localStorage.setItem('introTerritorialVista', 'true');
    setOpen(false);
  };

  return (
    <>
      <Hub />
      <button
        type="button"
        onClick={() => { setStep(0); setOpen(true); }}
        className="fixed bottom-5 right-5 z-40 rounded-full border border-cyan-300/30 bg-slate-950/90 p-4 text-cyan-200 shadow-2xl backdrop-blur-xl hover:bg-cyan-400 hover:text-slate-950"
        aria-label="Abrir introducción territorial"
      >
        <Compass size={24} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section className="relative grid h-[min(88vh,760px)] w-full max-w-6xl overflow-hidden rounded-[2.2rem] border border-white/15 bg-[#06101f] shadow-[0_40px_140px_rgba(0,0,0,.65)]" initial={{ y: 30, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .98 }}>
              <button onClick={close} className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-black/40 p-3 text-white hover:bg-red-500/30" aria-label="Cerrar"><X size={20} /></button>

              <AnimatePresence mode="wait">
                <motion.div key={step} className="grid h-full grid-cols-1 lg:grid-cols-[.82fr_1.18fr]" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: .28 }}>
                  <div className="relative flex flex-col justify-between overflow-hidden border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:p-9">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.24),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,.22),transparent_44%)]" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[.32em] text-cyan-300">Zona de patrullaje · 18D03</p>
                      <h2 className="mt-4 text-4xl font-black leading-[.95] tracking-tight md:text-6xl">
                        {step === 0 && <>¡Hola, <span className="text-orange-400">{nombre}</span>!</>}
                        {step === 1 && <>Nuestro rincón en <span className="text-cyan-300">Tungurahua</span></>}
                        {step === 2 && <>Un territorio de <span className="text-emerald-300">colores y retos</span></>}
                      </h2>
                      <p className="mt-5 text-base font-semibold leading-relaxed text-slate-300 md:text-lg">
                        {step === 0 && '¿Crees que conoces Baños de Agua Santa al 100%? Un verdadero Agente de Prevención no solo admira su ciudad: sabe cómo protegerla.'}
                        {step === 1 && 'El cantón Baños de Agua Santa, marcado en rojo, es nuestra base. Forma parte de una provincia llena de turismo, aventura y fuerzas de la naturaleza.'}
                        {step === 2 && 'Cada parroquia tiene ríos, montañas y amenazas diferentes. Tu misión es aprender a responder con seguridad en cada rincón.'}
                      </p>
                    </div>

                    <div className="relative z-10 mt-6">
                      <div className="mb-5 flex gap-2">{[0,1,2].map((item) => <button key={item} onClick={() => setStep(item)} className={`h-2 rounded-full transition-all ${step === item ? 'w-12 bg-cyan-300' : 'w-6 bg-white/20'}`} aria-label={`Ir a pestaña ${item + 1}`} />)}</div>
                      <div className="flex items-center justify-between gap-3">
                        <button disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-black text-white disabled:opacity-25"><ArrowLeft /></button>
                        {step < 2 ? (
                          <button onClick={() => setStep((s) => Math.min(2, s + 1))} className="flex items-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-cyan-200">Desliza para explorar <ArrowRight size={17} /></button>
                        ) : (
                          <button onClick={close} className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-orange-400"><ShieldCheck size={17} /> ¡Aceptar misión!</button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative min-h-0 overflow-auto bg-slate-900/50 p-5 lg:p-8">
                    {step === 0 && (
                      <div className="flex h-full min-h-[420px] items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-orange-500/25 blur-3xl" />
                          <img src={AVATARS[avatarKey]} alt="Avatar elegido" className="relative z-10 h-72 w-72 rounded-[3rem] border border-white/10 bg-white/5 object-contain p-5 shadow-2xl md:h-96 md:w-96" />
                          <div className="absolute -bottom-3 -right-3 z-20 rounded-2xl border border-cyan-300/20 bg-slate-950/90 p-4 text-cyan-200 shadow-xl"><MapPinned size={30} /></div>
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
