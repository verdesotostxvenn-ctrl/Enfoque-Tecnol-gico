import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
  Award,
  ChevronRight,
  Droplets,
  Flame,
  Lock,
  LogOut,
  Mountain,
  Navigation,
  QrCode,
  ShieldCheck,
  Sparkles,
  Trophy,
  Waves,
  Wind,
  XSquare
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

type AvatarTipo = 'chico' | 'chica';

type Mision = {
  id: number;
  nivelReq: number;
  titulo: string;
  path: string;
  desc: string;
  etiqueta: string;
  icono: React.ReactNode;
  colorCard: string;
  glow: string;
};

const AVATARES: Record<AvatarTipo, Record<number, string>> = {
  chico: {
    1: 'https://blogger.googleusercontent.com/img/a/AVvXsEhGuah8gRxjKHRH2XeN_K7ew3dlo-4QNWudy46AsoT91CiPXkrU9JDEA1wQ1iyIcYj23qQGhITb2EJpIMP1bww_g24vx1-yYp6dYz1agR_nWX6pazjghCNOXXKGvdI0nzDG173acHzltH-fCPlxYYkVQhA47V7aFNiZmVH4HAZf8OTIqtiu0DiI7SIOd5Qe',
    2: 'https://blogger.googleusercontent.com/img/a/AVvXsEizXHFAdZxxjxs6OyKA5mDb36jBuoKPO-Vk2GPY8g4xCtANZkapvPFu6IswUMUz0Iqwy50NccyHZi-4QXFZ_JvJiFOOAS9gTMl8ZcFKMvtNrn5ihXFhqNp4ENNgQVFXeQ2vwFCyF7TDOMsNsyW4MLTdz0QhEEZ44mkHlnsekTt6HFkZrUE7Qll34AJpjha6',
    3: 'https://blogger.googleusercontent.com/img/a/AVvXsEjsMXigzB_LoYR9gB8IGUvpI3V-KLoW02oxQeRZBWpCOu9f7Sf7oYJrwG3xgqCUyYQr_q3gdEFtUUl2XdimRlauT2Ic2NcroGfolDI__HIpw_tYZ6DTP3LEuIXgfAr2EVs4mth6sxyZIiqFMEVg22xeRRmm0vjrq8_JWvspQcVNZS7NN53SXUoD0VWU0gxy',
    4: 'https://blogger.googleusercontent.com/img/a/AVvXsEg60OHSsVV0ARSpxIUSSm4CFgRpnvmvRgC8wXrfsPZolyMMjv0XfD6FjPmrWl5St0jtk7s0nMrip8YNe3EvmYMg82ywuxuTb25CnGBXgFF1pbDX5wuxlr37jlu8iGMJnmKM8HAGhkpqmk_qOh2jsSkpRIiWtcB_7t--iRrV3CKDiwKf1xagpoPPfrPwzHfW'
  },
  chica: {
    1: 'https://blogger.googleusercontent.com/img/a/AVvXsEh_PnIcFYcgmsvgfKqk4Mr0s40x0a5f1_pIFmBRlR0oVInL1-uaLQIez5BrYNp-ua4-mBmHqb2A8Ox4tElSIJx3LtHnBaO-cGTxzHomjYO1f2X6KQzCYn8I0LmpqNe6o1UiXhc814JjCv0hWJ3kME5gcDJ1czrxl7xYge9BE214gnYyrIHHqxwuTMyoxPjd',
    2: 'https://blogger.googleusercontent.com/img/a/AVvXsEhfE1YuYhKeV-RKSJUozUqSkCcyNku3wKaWWP6sCRkawGbLiNgLNA99FmSzujPF1GzPGQ_7bILulbKvxf5hWmpKeVfJ_I3KR0UZmgi9w2HvAGcIrnN8ejwf2sRf8pZmfjcWaRbjVCyL6f9XkduD8p5HTACV7ZGUVG2jHaWWZBjdYz56ySfT1KWEekFwOywH',
    3: 'https://blogger.googleusercontent.com/img/a/AVvXsEgmmVnvklrj30hV9u-vS-4nR49K3Un01KgxyhfPa0aP-ZTnplUEkvYOEl5x4J5YjG3zuTp6tndz8OLDNrkLJV7xgpYsvxky2todbBdI18RYlz20kKDbUNoBTLK6MuH-9Nz8w73_WBSiLNQe8-v9HYqsKbtcvqGn6vWpbUgCzgH0QX6miPmMKvmxUd0d8Pvl',
    4: 'https://blogger.googleusercontent.com/img/a/AVvXsEjY414YVLYIT9NFgJb1K8r94Rh7KNy1JpGCj5GBjfzWjmfPtf2aUjn5DGMb0Iy9n1J-8CJ9OC4e_QOwx8nJDweTB_MalUg5CEDJwwiLtMvKvVrV9m2p4mgWrkVTYSrmR1jtDJ42PLmiXDZ2mrrhUHwurD-eITZ7L4CjFJCiRjtEx3Hz8hMJQu6d7pFR6clS'
  }
};

const misiones: Mision[] = [
  {
    id: 1,
    nivelReq: 1,
    titulo: 'Alerta Volcánica',
    path: '/volcan',
    desc: 'Supera el reto de ceniza, protección facial y seguridad.',
    etiqueta: 'Misión 01',
    icono: <Mountain className="w-7 h-7 text-white" />,
    colorCard: 'from-orange-600 via-red-600 to-rose-700',
    glow: 'shadow-orange-500/25'
  },
  {
    id: 2,
    nivelReq: 2,
    titulo: 'Inundaciones',
    path: '/inundacion',
    desc: 'Aprende rutas altas, energía segura y reacción rápida.',
    etiqueta: 'Misión 02',
    icono: <Wind className="w-7 h-7 text-white" />,
    colorCard: 'from-blue-600 via-cyan-600 to-sky-700',
    glow: 'shadow-cyan-500/25'
  },
  {
    id: 3,
    nivelReq: 3,
    titulo: 'Evacuación',
    path: '/evacuacion',
    desc: 'Completa el protocolo final y gana tu credencial.',
    etiqueta: 'Misión 03',
    icono: <Navigation className="w-7 h-7 text-white" />,
    colorCard: 'from-emerald-600 via-teal-600 to-green-700',
    glow: 'shadow-emerald-500/25'
  }
];

const Hub = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isHovering, setIsHovering] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [nombreAgente, setNombreAgente] = useState('AGENTE');
  const [escuelaAgente, setEscuelaAgente] = useState('ACADEMIA');
  const [nivelAgente, setNivelAgente] = useState(1);
  const [avatarAgente, setAvatarAgente] = useState<AvatarTipo>('chico');
  const [showCredencial, setShowCredencial] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lastLevel, setLastLevel] = useState(1);

  const rawMouseX = useMotionValue(-100);
  const rawMouseY = useMotionValue(-100);
  const mouseX = useSpring(rawMouseX, { stiffness: 1100, damping: 55 });
  const mouseY = useSpring(rawMouseY, { stiffness: 1100, damping: 55 });

  const authId = useMemo(() => {
    const existente = localStorage.getItem('agenteAuthId');
    if (existente) return existente;
    const nuevo = Math.random().toString(36).substring(2, 11).toUpperCase();
    localStorage.setItem('agenteAuthId', nuevo);
    return nuevo;
  }, []);

  const porcentajeProgreso = useMemo(() => {
    if (nivelAgente <= 1) return 0;
    if (nivelAgente === 2) return 33;
    if (nivelAgente === 3) return 66;
    return 100;
  }, [nivelAgente]);

  const avatarActual = useMemo(() => {
    const nivelSeguro = Math.min(Math.max(nivelAgente, 1), 4);
    return AVATARES[avatarAgente]?.[nivelSeguro] || AVATARES.chico[1];
  }, [avatarAgente, nivelAgente]);

  const siguienteObjetivo = useMemo(() => {
    if (nivelAgente === 1) return 'Completa Alerta Volcánica para desbloquear Inundaciones.';
    if (nivelAgente === 2) return 'Completa Inundaciones para desbloquear Evacuación.';
    if (nivelAgente === 3) return 'Completa Evacuación para convertirte en Comandante.';
    return 'Misión completa. Credencial de Comandante disponible.';
  }, [nivelAgente]);

  const sincronizarDatos = useCallback(() => {
    const guardadoNombre = localStorage.getItem('agenteNombre');
    const guardadoEscuela = localStorage.getItem('agenteEscuela');
    const guardadoNivel = localStorage.getItem('agenteNivel');
    const guardadoAvatar = localStorage.getItem('agenteAvatar');

    if (guardadoNombre) setNombreAgente(guardadoNombre.toUpperCase());
    if (guardadoEscuela) setEscuelaAgente(guardadoEscuela.toUpperCase());

    if (guardadoAvatar === 'chica' || guardadoAvatar === 'chico') {
      setAvatarAgente(guardadoAvatar);
    }

    const nivelNumerico = Number(guardadoNivel);
    const nivelSeguro =
      !Number.isNaN(nivelNumerico) && nivelNumerico >= 1
        ? Math.min(nivelNumerico, 4)
        : 1;

    setNivelAgente((prev) => {
      if (nivelSeguro > prev) {
        setLastLevel(nivelSeguro);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2800);
      }
      return nivelSeguro;
    });

    if (!guardadoNivel) localStorage.setItem('agenteNivel', '1');
  }, []);

  useEffect(() => {
    sincronizarDatos();
  }, [location.pathname, sincronizarDatos]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      rawMouseX.set(e.clientX);
      rawMouseY.set(e.clientY);
    };

    const handleMouseLeave = () => setCursorVisible(false);
    const handleMouseEnter = () => setCursorVisible(true);
    const handleFocus = () => sincronizarDatos();

    const handleVisibilityChange = () => {
      if (!document.hidden) sincronizarDatos();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'agenteNivel' ||
        e.key === 'agenteNombre' ||
        e.key === 'agenteAvatar' ||
        e.key === 'agenteEscuela'
      ) {
        sincronizarDatos();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('agenteNivelActualizado', handleFocus);
    window.addEventListener('pageshow', handleFocus);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('agenteNivelActualizado', handleFocus);
      window.removeEventListener('pageshow', handleFocus);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [rawMouseX, rawMouseY, sincronizarDatos]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <main className="h-screen max-h-screen w-full bg-[#010413] text-white relative overflow-hidden cursor-none p-3 md:p-5">
      <motion.div
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
      >
        <motion.div
          animate={{
            scale: isHovering ? 1.1 : 1,
            borderColor: isHovering ? '#fb923c' : '#22d3ee',
            backgroundColor: isHovering ? 'rgba(249,115,22,0.08)' : 'rgba(34,211,238,0.08)'
          }}
          className="w-4 h-4 border rounded-full flex items-center justify-center shadow-[0_0_16px_rgba(34,211,238,0.55)] backdrop-blur-sm"
        >
          <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#fff]" />
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 w-[1150px] h-[1150px] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-cyan-500/25 rounded-full blur-[125px]" />
          <div className="absolute bottom-10 right-0 w-[440px] h-[440px] bg-orange-500/28 rounded-full blur-[135px]" />
          <div className="absolute left-0 top-1/2 w-80 h-80 bg-emerald-500/20 rounded-full blur-[125px]" />
          <div className="absolute right-1/3 top-1/4 w-72 h-72 bg-fuchsia-500/16 rounded-full blur-[115px]" />
        </motion.div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      <section className="relative z-10 h-full max-w-7xl mx-auto grid grid-rows-[auto_1fr] gap-4">
        <header className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] px-5 py-4 flex items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative hidden sm:block">
              <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-2xl" />
              <img
                src={avatarActual}
                alt="Avatar del agente"
                className="relative w-20 h-20 rounded-[1.7rem] object-cover border border-white/15 bg-white/10"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-cyan-300 mb-1">
                <ShieldCheck size={15} className="animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.35em]">
                  Centro de mando 18D03
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none truncate">
                Bienvenido, <span className="text-orange-500">{nombreAgente}</span>
              </h1>

              <p className="text-[9px] md:text-[10px] text-white/45 font-black uppercase tracking-[0.24em] mt-2 truncate">
                {escuelaAgente}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              key={nivelAgente}
              initial={{ scale: 0.85, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="hidden md:flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-3 rounded-2xl text-orange-300 text-[10px] font-black uppercase tracking-widest"
            >
              <Trophy size={15} />
              {nivelAgente >= 4 ? 'Comandante' : `Nivel ${nivelAgente}`}
            </motion.div>

            {nivelAgente >= 4 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowCredencial(true)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 px-4 py-3 rounded-2xl text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(234,179,8,0.45)]"
              >
                <Award size={15} />
                Credencial
              </motion.button>
            )}

            <button
              onClick={handleLogout}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.35fr] gap-4 min-h-0">
          <aside className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-5 overflow-hidden flex flex-col justify-between relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/8 via-transparent to-orange-500/8" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[9px] text-cyan-300 font-black uppercase tracking-[0.3em]">
                    Rango actual
                  </p>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mt-1">
                    {nivelAgente >= 4 ? 'Comandante' : `Nivel ${nivelAgente}`}
                  </h2>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-2xl" />
                  <img
                    src={avatarActual}
                    alt="Avatar evolutivo"
                    className="relative w-28 h-28 md:w-36 md:h-36 rounded-[2rem] object-cover bg-white/10 border border-white/15 shadow-2xl"
                  />
                </div>
              </div>

              <div className="relative h-28 rounded-[1.7rem] bg-slate-950/70 border border-cyan-400/20 overflow-hidden shadow-inner mb-4">
                <motion.div
                  initial={{ height: '0%' }}
                  animate={{ height: `${porcentajeProgreso}%` }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600 via-cyan-400 to-sky-300"
                >
                  <motion.div
                    animate={{ x: ['-20%', '20%', '-20%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-5 left-[-10%] w-[120%] h-10 bg-white/25 rounded-[50%] blur-[2px]"
                  />
                  <motion.div
                    animate={{ x: ['20%', '-20%', '20%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-4 left-[-10%] w-[120%] h-8 bg-cyan-100/20 rounded-[50%]"
                  />
                </motion.div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Droplets size={22} className="text-cyan-100 mb-1 drop-shadow" />
                  <p className="text-3xl font-black text-white drop-shadow-lg">{porcentajeProgreso}%</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-50/80">
                    Progreso de agente
                  </p>
                </div>
              </div>

              <div className="bg-black/25 border border-white/10 rounded-[1.5rem] p-4">
                <div className="flex items-center gap-2 text-emerald-300 mb-2">
                  <Waves size={16} />
                  <span className="text-[9px] font-black uppercase tracking-[0.25em]">
                    Objetivo
                  </span>
                </div>
                <p className="text-xs md:text-sm text-white/75 font-semibold leading-relaxed">
                  {siguienteObjetivo}
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((step) => {
                const activo = nivelAgente > step;
                return (
                  <div
                    key={step}
                    className={`h-2 rounded-full ${
                      activo ? 'bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)]' : 'bg-white/10'
                    }`}
                  />
                );
              })}
            </div>
          </aside>

          <section className="grid grid-rows-[auto_1fr] gap-4 min-h-0">
            <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="text-[9px] text-orange-300 font-black uppercase tracking-[0.32em]">
                  Protocolo de ascenso
                </p>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-1">
                  Completa los retos para subir de nivel
                </h2>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                <Flame size={16} className="text-orange-400" />
                Cada misión aprobada desbloquea la siguiente
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
              {misiones.map((mision, index) => {
                const estaBloqueada = nivelAgente < mision.nivelReq;
                const completada = nivelAgente > mision.nivelReq;
                const activa = nivelAgente === mision.nivelReq;

                return (
                  <motion.button
                    key={mision.id}
                    type="button"
                    onClick={() => !estaBloqueada && navigate(mision.path)}
                    onMouseEnter={() => !estaBloqueada && setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={!estaBloqueada ? { y: -8, scale: 1.02 } : {}}
                    whileTap={!estaBloqueada ? { scale: 0.97 } : {}}
                    className={`relative rounded-[2rem] border overflow-hidden text-left p-5 flex flex-col justify-between min-h-[270px] transition-all ${
                      estaBloqueada
                        ? 'bg-slate-950/55 border-white/5 opacity-55'
                        : `bg-gradient-to-br ${mision.colorCard} border-white/15 shadow-2xl ${mision.glow}`
                    }`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_40%)]" />

                    {!estaBloqueada && (
                      <motion.div
                        animate={{ x: ['-120%', '120%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-0 bottom-0 w-24 bg-white/10 blur-xl rotate-12"
                      />
                    )}

                    {estaBloqueada && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-sm">
                        <div className="text-center">
                          <Lock size={34} className="mx-auto mb-2 text-white/45" />
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">
                            Nivel {mision.nivelReq} requerido
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-md">
                          {mision.icono}
                        </div>

                        <span
                          className={`text-[9px] font-black uppercase tracking-[0.22em] px-3 py-1 rounded-full border ${
                            completada
                              ? 'bg-emerald-400/20 border-emerald-200/30 text-emerald-100'
                              : activa
                                ? 'bg-white/20 border-white/30 text-white'
                                : 'bg-black/20 border-white/10 text-white/50'
                          }`}
                        >
                          {completada ? 'Completada' : activa ? 'Activa' : 'Bloqueada'}
                        </span>
                      </div>

                      <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/65 mb-2">
                        {mision.etiqueta}
                      </p>

                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-3">
                        {mision.titulo}
                      </h3>

                      <p className="text-xs text-white/75 leading-relaxed font-semibold uppercase">
                        {mision.desc}
                      </p>
                    </div>

                    <div className="relative z-10 mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
                        {completada ? (
                          <>
                            <Trophy size={15} />
                            Lograda
                          </>
                        ) : activa ? (
                          <>
                            <Sparkles size={15} />
                            Iniciar reto
                          </>
                        ) : (
                          <>
                            <Lock size={15} />
                            Esperando
                          </>
                        )}
                      </div>

                      {!estaBloqueada && <ChevronRight size={18} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
        </div>
      </section>

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 backdrop-blur-xl p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              className="relative w-full max-w-md bg-slate-950 border border-cyan-400/30 rounded-[2.5rem] p-8 text-center shadow-[0_0_90px_rgba(34,211,238,0.25)] overflow-hidden"
            >
              <div className="relative z-10">
                <div className="mx-auto w-28 h-28 rounded-[2rem] bg-white/10 border border-white/15 p-1 mb-5">
                  <img
                    src={avatarActual}
                    alt="Nuevo avatar"
                    className="w-full h-full rounded-[1.7rem] object-cover"
                  />
                </div>

                <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.35em] mb-2">
                  Ascenso confirmado
                </p>

                <h2 className="text-4xl font-black uppercase tracking-tighter mb-3">
                  ¡Nivel {lastLevel} desbloqueado!
                </h2>

                <p className="text-sm text-white/65 font-semibold">
                  Tu avatar evolucionó y una nueva misión está disponible.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCredencial && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-slate-800 to-[#020617] p-1 rounded-[3.5rem] shadow-[0_0_100px_rgba(234,179,8,0.4)] border border-yellow-500/50"
            >
              <div className="relative bg-slate-900/95 h-full rounded-[3.4rem] p-10 flex flex-col items-center overflow-hidden">
                <motion.div
                  animate={{ y: [-100, 430] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-cyan-500/20 to-transparent blur-xl pointer-events-none"
                />

                <h3 className="text-[10px] text-yellow-500 font-black tracking-widest uppercase mb-8 text-center">
                  Credencial de Mando - Distrito 18D03
                </h3>

                <div className="relative w-48 h-48 bg-gradient-to-tr from-yellow-900/40 to-amber-900/40 rounded-[3rem] border-2 border-yellow-500/40 flex items-center justify-center mb-8 shadow-inner overflow-hidden">
                  <img
                    src={AVATARES[avatarAgente][4]}
                    alt="Comandante"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute -bottom-1 bg-yellow-500 text-black text-[12px] font-black px-6 py-2 rounded-full uppercase shadow-xl border-2 border-slate-900">
                    Comandante élite
                  </div>
                </div>

                <div className="text-center space-y-4 mb-8">
                  <div>
                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">
                      Agente autorizado
                    </p>
                    <p className="text-3xl text-white font-black uppercase tracking-tight">
                      {nombreAgente}
                    </p>
                  </div>

                  <div className="flex justify-center space-x-8">
                    <div className="text-center">
                      <p className="text-[8px] text-slate-500 font-black uppercase">Estatus</p>
                      <p className="text-xs text-emerald-400 font-black uppercase">Activo</p>
                    </div>

                    <div className="text-center">
                      <p className="text-[8px] text-slate-500 font-black uppercase">Academia</p>
                      <p className="text-xs text-cyan-400 font-black uppercase tracking-tighter">
                        {escuelaAgente}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                  <QrCode size={52} className="text-yellow-500/70" />
                  <div className="text-right">
                    <p className="text-[8px] text-slate-400 font-mono tracking-widest uppercase">
                      AUTH_ID: {authId}
                    </p>
                    <p className="text-[8px] text-yellow-500/40 font-mono uppercase mt-1 tracking-tighter">
                      Certificado digital de prevención
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCredencial(false)}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="mt-8 text-slate-500 hover:text-white transition-colors bg-white/5 p-4 rounded-full"
                >
                  <XSquare size={24} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Hub;
