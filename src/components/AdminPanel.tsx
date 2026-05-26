import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  CalendarDays,
  Download,
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  School,
  Search,
  ShieldCheck,
  Trophy,
  User,
  Users,
  X
} from 'lucide-react';
import { supabase } from '../supabaseClient';

type Agente = {
  id: string;
  created_at: string | null;
  nombre: string | null;
  institucion: string | null;
  edad: number | null;
  avatar: string | null;
  nivel: number | null;
  mision_volcan: boolean | null;
  mision_inundacion: boolean | null;
  mision_evacuacion: boolean | null;
  ultima_conexion: string | null;
};

const ADMIN_PIN = '1328';

const safeDate = (value: string | null) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha inválida';

  return date.toLocaleString('es-EC', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const onlyDate = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const AdminPanel = () => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [authorized, setAuthorized] = useState(
    sessionStorage.getItem('adminAutorizado') === 'true'
  );

  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [filtroEscuela, setFiltroEscuela] = useState('todas');
  const [filtroEdad, setFiltroEdad] = useState('todas');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('agentes')
        .select(
          'id, created_at, nombre, institucion, edad, avatar, nivel, mision_volcan, mision_inundacion, mision_evacuacion, ultima_conexion'
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAgentes((data || []) as Agente[]);
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudieron cargar los registros desde Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      cargarDatos();
    }
  }, [authorized]);

  const escuelas = useMemo(() => {
    const lista = agentes
      .map((item) => item.institucion || 'Sin institución')
      .filter(Boolean);

    return Array.from(new Set(lista)).sort((a, b) => a.localeCompare(b));
  }, [agentes]);

  const edades = useMemo(() => {
    const lista = agentes
      .map((item) => item.edad)
      .filter((item): item is number => typeof item === 'number');

    return Array.from(new Set(lista)).sort((a, b) => a - b);
  }, [agentes]);

  const agentesFiltrados = useMemo(() => {
    return agentes.filter((agente) => {
      const nombre = agente.nombre || '';
      const escuela = agente.institucion || 'Sin institución';
      const edad = agente.edad;
      const fecha = onlyDate(agente.created_at);

      const coincideBusqueda =
        nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        escuela.toLowerCase().includes(busqueda.toLowerCase());

      const coincideEscuela =
        filtroEscuela === 'todas' || escuela === filtroEscuela;

      const coincideEdad =
        filtroEdad === 'todas' || String(edad) === filtroEdad;

      const coincideFechaInicio =
        !fechaInicio || (fecha && fecha >= fechaInicio);

      const coincideFechaFin = !fechaFin || (fecha && fecha <= fechaFin);

      return (
        coincideBusqueda &&
        coincideEscuela &&
        coincideEdad &&
        coincideFechaInicio &&
        coincideFechaFin
      );
    });
  }, [agentes, busqueda, filtroEscuela, filtroEdad, fechaInicio, fechaFin]);

  const totalAgentes = agentesFiltrados.length;

  const registrosHoy = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return agentesFiltrados.filter((item) => onlyDate(item.created_at) === hoy)
      .length;
  }, [agentesFiltrados]);

  const misionesCompletadas = useMemo(() => {
    return agentesFiltrados.reduce((total, item) => {
      return (
        total +
        Number(Boolean(item.mision_volcan)) +
        Number(Boolean(item.mision_inundacion)) +
        Number(Boolean(item.mision_evacuacion))
      );
    }, 0);
  }, [agentesFiltrados]);

  const escuelasRegistradas = useMemo(() => {
    return new Set(
      agentesFiltrados.map((item) => item.institucion || 'Sin institución')
    ).size;
  }, [agentesFiltrados]);

  const rankingEscuelas = useMemo(() => {
    const conteo: Record<string, number> = {};

    agentesFiltrados.forEach((item) => {
      const escuela = item.institucion || 'Sin institución';
      conteo[escuela] = (conteo[escuela] || 0) + 1;
    });

    return Object.entries(conteo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [agentesFiltrados]);

  const registrosPorFecha = useMemo(() => {
    const conteo: Record<string, number> = {};

    agentesFiltrados.forEach((item) => {
      const fecha = onlyDate(item.created_at) || 'Sin fecha';
      conteo[fecha] = (conteo[fecha] || 0) + 1;
    });

    return Object.entries(conteo).sort((a, b) => b[0].localeCompare(a[0]));
  }, [agentesFiltrados]);

  const iniciarSesion = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('adminAutorizado', 'true');
      setAuthorized(true);
      setPin('');
    } else {
      setErrorMsg('PIN incorrecto. Intenta nuevamente.');
    }
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem('adminAutorizado');
    setAuthorized(false);
    setPin('');
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEscuela('todas');
    setFiltroEdad('todas');
    setFechaInicio('');
    setFechaFin('');
  };

  const exportarCSV = () => {
    const encabezados = [
      'Nombre',
      'Edad',
      'Institución',
      'Avatar',
      'Nivel',
      'Misión Volcán',
      'Misión Inundación',
      'Misión Evacuación',
      'Fecha de registro',
      'Última conexión'
    ];

    const filas = agentesFiltrados.map((item) => [
      item.nombre || '',
      item.edad ?? '',
      item.institucion || '',
      item.avatar || '',
      item.nivel ?? '',
      item.mision_volcan ? 'Completada' : 'Pendiente',
      item.mision_inundacion ? 'Completada' : 'Pendiente',
      item.mision_evacuacion ? 'Completada' : 'Pendiente',
      safeDate(item.created_at),
      safeDate(item.ultima_conexion)
    ]);

    const contenido = [encabezados, ...filas]
      .map((fila) =>
        fila
          .map((celda) => `"${String(celda).replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([contenido], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `mision-prevencion-registros-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    link.click();
    URL.revokeObjectURL(url);
  };

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#010413] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/30 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-cyan-400/25 rounded-full blur-[130px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative z-10 w-full max-w-md bg-white/8 border border-white/10 rounded-[2rem] p-6 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/15 border border-orange-400/20 p-3 rounded-2xl text-orange-300">
              <Lock size={24} />
            </div>
            <div>
              <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.28em]">
                Acceso restringido
              </p>
              <h1 className="text-2xl font-black uppercase">
                Admin Panel
              </h1>
            </div>
          </div>

          <form onSubmit={iniciarSesion} className="space-y-4">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Ingresa el PIN
              </span>

              <div className="mt-2 flex items-center gap-2 bg-black/45 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-orange-400 transition-all">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  placeholder="••••"
                  maxLength={4}
                  className="w-full bg-transparent outline-none text-white font-black tracking-[0.35em]"
                />

                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  className="text-white/50 hover:text-cyan-300 transition-colors"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <AnimatePresence>
              {errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-300 text-sm font-bold"
                >
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.012, y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500 rounded-2xl p-3.5 text-white font-black uppercase tracking-[0.2em] transition-all shadow-[0_18px_40px_rgba(249,115,22,0.28)]"
            >
              Entrar
            </motion.button>
          </form>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#010413] text-white p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-10 w-[32rem] h-[32rem] bg-orange-500/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[36rem] h-[36rem] bg-cyan-400/18 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      <section className="relative z-10 max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 text-orange-400 mb-2">
              <Activity size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.32em]">
                Misión Prevención
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              Panel de Resultados
            </h1>

            <p className="text-slate-300 text-sm md:text-base mt-2">
              Visualización profesional de estudiantes, escuelas, edades y misiones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={cargarDatos}
              disabled={loading}
              className="bg-white/8 hover:bg-white/12 border border-white/10 rounded-2xl px-4 py-3 font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>

            <button
              type="button"
              onClick={exportarCSV}
              className="bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-300/20 rounded-2xl px-4 py-3 font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Download size={16} />
              Exportar CSV
            </button>

            <button
              type="button"
              onClick={cerrarSesion}
              className="bg-red-500/12 hover:bg-red-500/20 border border-red-300/20 rounded-2xl px-4 py-3 font-bold text-sm flex items-center gap-2 transition-all"
            >
              <X size={16} />
              Salir
            </button>
          </div>
        </header>

        {errorMsg && (
          <div className="mb-4 bg-red-500/12 border border-red-300/20 rounded-2xl p-4 text-red-200 font-bold">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
          <StatCard
            title="Registros"
            value={totalAgentes}
            icon={<Users size={22} />}
            subtitle="según filtros"
          />
          <StatCard
            title="Hoy"
            value={registrosHoy}
            icon={<CalendarDays size={22} />}
            subtitle="registros del día"
          />
          <StatCard
            title="Escuelas"
            value={escuelasRegistradas}
            icon={<School size={22} />}
            subtitle="instituciones"
          />
          <StatCard
            title="Misiones"
            value={misionesCompletadas}
            icon={<Trophy size={22} />}
            subtitle="completadas"
          />
        </div>

        <section className="bg-white/7 border border-white/10 rounded-[2rem] p-4 md:p-5 backdrop-blur-2xl mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            <label className="xl:col-span-2">
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                Buscar
              </span>
              <div className="mt-2 bg-black/35 border border-white/10 rounded-2xl px-3 py-3 flex items-center gap-2">
                <Search size={16} className="text-cyan-300" />
                <input
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Nombre o institución..."
                  className="w-full bg-transparent outline-none text-sm font-bold"
                />
              </div>
            </label>

            <label>
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                Escuela
              </span>
              <select
                value={filtroEscuela}
                onChange={(event) => setFiltroEscuela(event.target.value)}
                className="mt-2 w-full bg-black/35 border border-white/10 rounded-2xl px-3 py-3 text-sm font-bold outline-none"
              >
                <option value="todas">Todas</option>
                {escuelas.map((escuela) => (
                  <option key={escuela} value={escuela}>
                    {escuela}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                Edad
              </span>
              <select
                value={filtroEdad}
                onChange={(event) => setFiltroEdad(event.target.value)}
                className="mt-2 w-full bg-black/35 border border-white/10 rounded-2xl px-3 py-3 text-sm font-bold outline-none"
              >
                <option value="todas">Todas</option>
                {edades.map((edad) => (
                  <option key={edad} value={edad}>
                    {edad} años
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={limpiarFiltros}
                className="w-full bg-white/8 hover:bg-white/12 border border-white/10 rounded-2xl px-4 py-3 font-black text-xs uppercase tracking-[0.16em] transition-all"
              >
                Limpiar
              </button>
            </div>

            <label>
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                Desde
              </span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(event) => setFechaInicio(event.target.value)}
                className="mt-2 w-full bg-black/35 border border-white/10 rounded-2xl px-3 py-3 text-sm font-bold outline-none"
              />
            </label>

            <label>
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                Hasta
              </span>
              <input
                type="date"
                value={fechaFin}
                onChange={(event) => setFechaFin(event.target.value)}
                className="mt-2 w-full bg-black/35 border border-white/10 rounded-2xl px-3 py-3 text-sm font-bold outline-none"
              />
            </label>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5 mb-5">
          <section className="bg-white/7 border border-white/10 rounded-[2rem] p-4 md:p-5 backdrop-blur-2xl">
            <h2 className="font-black uppercase tracking-[0.18em] text-sm mb-4 flex items-center gap-2">
              <School size={16} className="text-cyan-300" />
              Top escuelas
            </h2>

            <div className="space-y-3">
              {rankingEscuelas.length === 0 && (
                <p className="text-slate-400 text-sm">
                  No hay datos para mostrar.
                </p>
              )}

              {rankingEscuelas.map(([escuela, cantidad], index) => {
                const porcentaje =
                  totalAgentes > 0 ? Math.round((cantidad / totalAgentes) * 100) : 0;

                return (
                  <div key={escuela}>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-slate-200">
                        {index + 1}. {escuela}
                      </span>
                      <span className="text-cyan-200">{cantidad}</span>
                    </div>

                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400/70 rounded-full"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white/7 border border-white/10 rounded-[2rem] p-4 md:p-5 backdrop-blur-2xl">
            <h2 className="font-black uppercase tracking-[0.18em] text-sm mb-4 flex items-center gap-2">
              <CalendarDays size={16} className="text-orange-300" />
              Registros por fecha
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-auto pr-1">
              {registrosPorFecha.length === 0 && (
                <p className="text-slate-400 text-sm">
                  No hay datos para mostrar.
                </p>
              )}

              {registrosPorFecha.map(([fecha, cantidad]) => (
                <div
                  key={fecha}
                  className="bg-black/30 border border-white/10 rounded-2xl p-3"
                >
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    {fecha}
                  </p>
                  <p className="text-2xl font-black text-white mt-1">
                    {cantidad}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white/7 border border-white/10 rounded-[2rem] backdrop-blur-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-white/10">
            <div>
              <h2 className="font-black uppercase tracking-[0.18em] text-sm">
                Registros de estudiantes
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Ordenados del más nuevo al más antiguo.
              </p>
            </div>

            <div className="text-xs font-black text-cyan-200 bg-cyan-400/10 border border-cyan-300/20 px-3 py-2 rounded-full">
              {agentesFiltrados.length} resultados
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead className="bg-black/35 text-slate-300">
                <tr>
                  <th className="text-left p-4 font-black uppercase text-[10px] tracking-[0.18em]">
                    Estudiante
                  </th>
                  <th className="text-left p-4 font-black uppercase text-[10px] tracking-[0.18em]">
                    Escuela
                  </th>
                  <th className="text-left p-4 font-black uppercase text-[10px] tracking-[0.18em]">
                    Edad
                  </th>
                  <th className="text-left p-4 font-black uppercase text-[10px] tracking-[0.18em]">
                    Nivel
                  </th>
                  <th className="text-left p-4 font-black uppercase text-[10px] tracking-[0.18em]">
                    Misiones
                  </th>
                  <th className="text-left p-4 font-black uppercase text-[10px] tracking-[0.18em]">
                    Registro
                  </th>
                  <th className="text-left p-4 font-black uppercase text-[10px] tracking-[0.18em]">
                    Última conexión
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-300">
                      Cargando registros...
                    </td>
                  </tr>
                )}

                {!loading && agentesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-300">
                      No hay registros con esos filtros.
                    </td>
                  </tr>
                )}

                {!loading &&
                  agentesFiltrados.map((agente) => (
                    <tr
                      key={agente.id}
                      className="border-t border-white/8 hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-orange-400/12 border border-orange-300/20 flex items-center justify-center text-orange-200">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="font-black text-white">
                              {agente.nombre || 'Sin nombre'}
                            </p>
                            <p className="text-xs text-slate-400">
                              Avatar: {agente.avatar || 'No definido'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-200 font-bold">
                        {agente.institucion || 'Sin institución'}
                      </td>

                      <td className="p-4">
                        <span className="bg-purple-400/12 border border-purple-300/20 text-purple-200 px-3 py-1 rounded-full font-black text-xs">
                          {agente.edad ?? 'N/A'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="bg-cyan-400/12 border border-cyan-300/20 text-cyan-200 px-3 py-1 rounded-full font-black text-xs">
                          Nivel {agente.nivel ?? 1}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          <MissionBadge label="Volcán" ok={agente.mision_volcan} />
                          <MissionBadge
                            label="Inundación"
                            ok={agente.mision_inundacion}
                          />
                          <MissionBadge
                            label="Evacuación"
                            ok={agente.mision_evacuacion}
                          />
                        </div>
                      </td>

                      <td className="p-4 text-slate-300 font-semibold">
                        {safeDate(agente.created_at)}
                      </td>

                      <td className="p-4 text-slate-300 font-semibold">
                        {safeDate(agente.ultima_conexion)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="bg-white/7 border border-white/10 rounded-[1.6rem] p-4 backdrop-blur-2xl shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.22em]">
            {title}
          </p>
          <p className="text-3xl md:text-4xl font-black mt-1">
            {value}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {subtitle}
          </p>
        </div>

        <div className="bg-cyan-400/12 border border-cyan-300/20 text-cyan-200 p-3 rounded-2xl">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const MissionBadge = ({
  label,
  ok
}: {
  label: string;
  ok: boolean | null;
}) => {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.12em] border ${
        ok
          ? 'bg-emerald-400/12 text-emerald-200 border-emerald-300/20'
          : 'bg-slate-400/10 text-slate-300 border-white/10'
      }`}
    >
      {ok ? '✓ ' : '• '}
      {label}
    </span>
  );
};

export default AdminPanel;
