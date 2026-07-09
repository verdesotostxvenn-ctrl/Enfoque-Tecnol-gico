import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpenCheck, Clock, PlayCircle, ShieldCheck, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VIDEO_EMBED_URL = 'https://www.youtube.com/embed/opNwG7zrIVQ?rel=0&controls=0&modestbranding=1&playsinline=1&cc_load_policy=0&iv_load_policy=3&fs=0';

const VideosPage = () => {
  const navigate = useNavigate();
  const hasVideo = Boolean(VIDEO_EMBED_URL);

  return (
    <main className="h-screen overflow-hidden bg-[#010413] text-white p-3 md:p-4 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-44 -right-32 h-[34rem] w-[34rem] rounded-full bg-orange-500/20 blur-[130px]" />
        <div className="absolute -bottom-44 -left-32 h-[34rem] w-[34rem] rounded-full bg-purple-500/18 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:34px_34px] opacity-35" />
      </div>

      <section className="relative z-10 mx-auto flex h-full max-w-7xl flex-col gap-3 md:gap-4">
        <header className="shrink-0 rounded-[1.6rem] border border-white/10 bg-white/5 p-4 md:p-5 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <button
                onClick={() => navigate('/hub')}
                className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-100 hover:bg-white/15"
              >
                <ArrowLeft size={14} /> Volver
              </button>
              <p className="text-orange-300 text-[9px] font-black uppercase tracking-[0.28em] mb-1">Caja de herramientas / Videos</p>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-none">Videos educativos</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300 font-semibold leading-relaxed">
                Recurso audiovisual integrado para reforzar el aprendizaje antes de iniciar o revisar las misiones de prevención.
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-orange-300/20 bg-orange-400/10 p-3 flex items-start gap-3 lg:max-w-md">
              <ShieldCheck className="text-orange-300 shrink-0" size={20} />
              <p className="text-xs md:text-sm text-orange-50/80 font-semibold leading-relaxed">
                Mira el video y luego continúa con las misiones del centro de mando.
              </p>
            </div>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[1fr_320px] gap-3 md:gap-4">
          <div className="min-h-0 rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-3 md:p-4 shadow-2xl flex flex-col">
            <div className="mb-3 shrink-0">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-orange-300">Reproductor principal</p>
              <h2 className="mt-1 text-xl md:text-2xl font-black">Cápsula de prevención</h2>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.35rem] border border-white/10 bg-black shadow-2xl">
              {hasVideo ? (
                <iframe
                  src={VIDEO_EMBED_URL}
                  title="Video educativo"
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-6 text-center">
                  <motion.div
                    initial={{ scale: 0.88, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    className="mb-5 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-orange-500/15 text-orange-300 border border-orange-300/20 shadow-[0_0_50px_rgba(251,146,60,0.2)]"
                  >
                    <PlayCircle size={52} />
                  </motion.div>
                  <h3 className="text-2xl md:text-4xl font-black">Video pendiente</h3>
                  <p className="mt-3 max-w-xl text-slate-300 font-semibold leading-relaxed">
                    Esta sección ya está lista. Solo falta pegar el enlace del video principal para que aparezca aquí.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="min-h-0 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-1 xl:overflow-hidden">
            <InfoCard icon={<Video />} title="Video limpio" text="El reproductor queda integrado con menos elementos visuales de YouTube." />
            <InfoCard icon={<Clock />} title="Antes del quiz" text="Sirve para revisar conceptos clave antes de responder las actividades." />
            <InfoCard icon={<BookOpenCheck />} title="Uso en clase" text="Pueden verlo en grupo y luego continuar con las misiones." />
          </aside>
        </section>
      </section>
    </main>
  );
};

const InfoCard = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <article className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl min-h-0">
    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-400/10 text-orange-300 border border-orange-300/20">
      {icon}
    </div>
    <h3 className="text-lg font-black">{title}</h3>
    <p className="mt-2 text-xs md:text-sm font-semibold leading-relaxed text-slate-400">{text}</p>
  </article>
);

export default VideosPage;
