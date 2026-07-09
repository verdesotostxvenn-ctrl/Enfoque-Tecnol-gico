import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpenCheck, Clock, PlayCircle, ShieldCheck, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VIDEO_EMBED_URL = '';

const VideosPage = () => {
  const navigate = useNavigate();
  const hasVideo = Boolean(VIDEO_EMBED_URL);

  return (
    <main className="min-h-screen bg-[#010413] text-white p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-44 -right-32 h-[34rem] w-[34rem] rounded-full bg-orange-500/20 blur-[130px]" />
        <div className="absolute -bottom-44 -left-32 h-[34rem] w-[34rem] rounded-full bg-purple-500/18 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:34px_34px] opacity-35" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl space-y-5">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-5 md:p-7 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
          <button
            onClick={() => navigate('/hub')}
            className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-orange-100 hover:bg-white/15"
          >
            <ArrowLeft size={16} /> Volver al centro de mando
          </button>

          <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-orange-300 text-[10px] font-black uppercase tracking-[0.32em] mb-2">Caja de herramientas / Videos</p>
              <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-none">Videos educativos</h1>
              <p className="mt-4 max-w-3xl text-slate-300 font-semibold leading-relaxed">
                Espacio preparado para colocar un video principal sobre prevención, gestión de riesgos o el módulo que el docente indique.
              </p>
            </div>

            <div className="rounded-[1.7rem] border border-orange-300/20 bg-orange-400/10 p-4 flex items-start gap-3">
              <ShieldCheck className="text-orange-300 shrink-0" size={22} />
              <p className="text-sm text-orange-50/80 font-semibold leading-relaxed">
                Cuando me pases el link de YouTube, Drive o video público, lo conecto aquí para que se vea integrado y profesional.
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 md:p-5 shadow-2xl">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300">Reproductor principal</p>
              <h2 className="mt-1 text-2xl md:text-3xl font-black">Cápsula de prevención</h2>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-[1.6rem] border border-white/10 bg-black shadow-2xl">
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

          <aside className="space-y-4">
            <InfoCard icon={<Video />} title="Formato recomendado" text="Mejor usar un link de YouTube en modo público o no listado. También puede ser Drive si el archivo tiene permisos públicos." />
            <InfoCard icon={<Clock />} title="Duración ideal" text="Para niños, lo ideal es un video corto de 2 a 5 minutos con instrucciones claras y visuales." />
            <InfoCard icon={<BookOpenCheck />} title="Uso en clase" text="El video puede ir antes del quiz para explicar el tema y preparar al estudiante antes de iniciar la misión." />
          </aside>
        </section>
      </section>
    </main>
  );
};

const InfoCard = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-400/10 text-orange-300 border border-orange-300/20">
      {icon}
    </div>
    <h3 className="text-xl font-black">{title}</h3>
    <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-400">{text}</p>
  </article>
);

export default VideosPage;
