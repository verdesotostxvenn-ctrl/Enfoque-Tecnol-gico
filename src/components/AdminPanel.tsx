import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  EyeOff,
  Filter,
  Lock,
  RefreshCw,
  School,
  Search,
  ShieldCheck,
  Target,
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

type EstadoAlerta = {
  label: string;
  description: string;
  className: string;
  dotClassName: string;
};

type EscenarioId = 'todos' | 'volcan' | 'inundacion' | 'evacuacion';

const ADMIN_PIN = '1328';

const avatarImages = {
  chica:
    'https://blogger.googleusercontent.com/img/a/AVvXsEh_PnIcFYcgmsvgfKqk4Mr0s40x0a5f1_pIFmBRlR0oVInL1-uaLQIez5BrYNp-ua4-mBmHqb2A8Ox4tElSIJx3LtHnBaO-cGTxzHomjYO1f2X6KQzCYn8I0LmpqNe6o1UiXhc814JjCv0hWJ3kME5gcDJ1czrxl7xYge9BE214gnYyrIHHqxwuTMyoxPjd',
  chico:
    'https://blogger.googleusercontent.com/img/a/AVvXsEhGuah8gRxjKHRH2XeN_K7ew3dlo-4QNWudy46AsoT91CiPXkrU9JDEA1wQ1iyIcYj23qQGhITb2EJpIMP1bww_g24vx1-yYp6dYz1agR_nWX6pazjghCNOXXKGvdI0nzDG173acHzltH-fCPlxYYkVQhA47V7aFNiZmVH4HAZf8OTIqtiu0DiI7SIOd5Qe'
};

const escuelasDistrito = [
  'Colegio De Bachillerato Pcei Agoyán',
  'Escuela Augusto N Martinez',
  'Escuela Gonzalo Pizarro',
  'Escuela Gran Ducado De Luxemburgo',
  'Escuela Jose Ignacio Vela',
  'Escuela Leonidas Garcia',
  'Escuela Manuel Andrade',
  'Escuela Nicolas Vasconez',
  'Escuela Pablo Arturo Suarez',
  'Escuela Pedro Vicente Maldonado',
  'Extensión Unidad Educativa San Pio X',
  'Gonzalo Abad Grijalva',
  'Unidad Educativa Baños',
  'Unidad Educativa Doctor Misael Acosta Solis',
  'Unidad Educativa Fray Sebastian Acosta',
  'Unidad Educativa Oscar Efren Reyes',
  'Unidad Educativa Palomino Flores',
  'Unidad Educativa Puerta Del Dorado',
  'Unidad Educativa Rio Negro'
];

const edadesDisponibles = [6, 7, 8, 9, 10, 11];

const escenarios: Array<{
  id: EscenarioId;
  label: string;
  shortLabel: string;
}> = [
  { id: 'todos', label: 'Todos los escenarios', shortLabel: 'General' },
  { id: 'volcan', label: 'Actividad volcánica', shortLabel: 'Volcán' },
  { id: 'inundacion', label: 'Inundación', shortLabel: 'Inundación' },
  { id: 'evacuacion', label: 'Evacuación', shortLabel: 'Evacuación' }
];

const pad = (value: number) => String(value).padStart(2, '0');

const onlyDate = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatDate = (value: string | null) => {
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

const missionCount = (agente: Agente) =>
  Number(Boolean(agente.mision_volcan)) +
  Number(Boolean(agente.mision_inundacion)) +
  Number(Boolean(agente.mision_evacuacion));

const progressPercent = (agente: Agente) => Math.round((missionCount(agente) / 3) * 100);

const getEscenarioStatus = (agente: Agente, escenario: EscenarioId) => {
  if (escenario === 'volcan') return Boolean(agente.mision_volcan);
  if (escenario === 'inundacion') return Boolean(agente.mision_inundacion);
  if (escenario === 'evacuacion') return Boolean(agente.mision_evacuacion);
  return missionCount(agente) === 3;
};

const getEstadoAlerta = (agente: Agente): EstadoAlerta => {
  const count = missionCount(agente);

  if (count >= 3) {
    return {
      label: 'Óptimo',
      description: 'Completó todos los módulos registrados.',
      className: 'bg-emerald-400/12 text-emerald-200 border-emerald-300/25',
      dotClassName: 'bg-emerald-300'
    };
  }

  if (count >= 1) {
    return {
      label: 'En desarrollo',
      description: 'Tiene avance, pero aún faltan módulos.',
      className: 'bg-yellow-400/12 text-yellow-100 border-yellow-300/25',
      dotClassName: 'bg-yellow-300'
    };
  }

  return {
    label: 'Vulnerable',
    description: 'Aún no registra módulos completados.',
    className: 'bg-red-400/12 text-red-200 border-red-300/25',
    dotClassName: 'bg-red-300'
  };
};

const getAvatarLabel = (avatar: string | null) => {
  if (avatar === 'chica') return 'Niña';
  if (avatar === 'chico') return 'Niño';
  return 'Sin avatar';
};

const getAvatarImage = (avatar: string | null) => {
  if (avatar === 'chica') return avatarImages.chica;
  if (avatar === 'chico') return avatarImages.chico;
  return '';
};

const escapeExcel = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

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
  const [edadMin, setEdadMin] = useState('todas');
  const [edadMax, setEdadMax] = useState('todas');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [escenario, setEscenario] = useState<EscenarioId>('todos');
  const [modoAnonimo, setModoAnonimo] = useState(false);

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
    const desdeDatos = agentes
      .map((item) => item.institucion || 'Sin institución')
      .filter(Boolean);

    return Array.from(new Set([...escuelasDistrito, ...desdeDatos])).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [agentes]);

  const agentesFiltrados = useMemo(() => {
    return agentes.filter((agente) => {
      const nombre = agente.nombre || '';
      const escuela = agente.institucion || 'Sin institución';
      const edad = agente.edad;
      const fecha = onlyDate(agente.created_at);

      const coincideBusqueda =
        nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        escuela.toLowerCase().includes(busqueda.toLowerCase()) ||
        getAvatarLabel(agente.avatar).toLowerCase().includes(busqueda.toLowerCase());

      const coincideEscuela =
        filtroEscuela === 'todas' || escuela === filtroEscuela;

      const coincideEdadMin =
        edadMin === 'todas' || (typeof edad === 'number' && edad >= Number(edadMin));

      const coincideEdadMax =
        edadMax === 'todas' || (typeof edad === 'number' && edad <= Number(edadMax));

      const coincideFechaInicio =
        !fechaInicio || (fecha && fecha >= fechaInicio);

      const coincideFechaFin = !fechaFin || (fecha && fecha <= fechaFin);

      return (
        coincideBusqueda &&
        coincideEscuela &&
        coincideEdadMin &&
        coincideEdadMax &&
        coincideFechaInicio &&
        coincideFechaFin
      );
    });
  }, [agentes, busqueda, filtroEscuela, edadMin, edadMax, fechaInicio, fechaFin]);

  const totalParticipantes = agentesFiltrados.length;

  const completaronTodo = useMemo(
    () => agentesFiltrados.filter((item) => missionCount(item) === 3).length,
    [agentesFiltrados]
  );

  const progresoPromedio = useMemo(() => {
    if (agentesFiltrados.length === 0) return 0;
    const total = agentesFiltrados.reduce((sum, item) => sum + progressPercent(item), 0);
    return Math.round(total / agentesFiltrados.length);
  }, [agentesFiltrados]);

  const mejorEscuela = useMemo(() => {
    const conteo: Record<string, { total: number; progreso: number }> = {};

    agentesFiltrados.forEach((item) => {
      const escuela = item.institucion || 'Sin institución';

      if (!conteo[escuela]) {
        conteo[escuela] = { total: 0, progreso: 0 };
      }

      conteo[escuela].total += 1;
      conteo[escuela].progreso += progressPercent(item);
    });

    const ranking = Object.entries(conteo)
      .map(([escuela, data]) => ({
        escuela,
        promedio: data.total > 0 ? Math.round(data.progreso / data.total) : 0,
        total: data.total
      }))
      .sort((a, b) => b.promedio - a.promedio || b.total - a.total);

    return ranking[0] || null;
  }, [agentesFiltrados]);

  const rankingEscuelas = useMemo(() => {
    const conteo: Record<string, { total: number; progreso: number }> = {};

    agentesFiltrados.forEach((item) => {
      const escuela = item.institucion || 'Sin institución';

      if (!conteo[escuela]) {
        conteo[escuela] = { total: 0, progreso: 0 };
      }

      conteo[escuela].total += 1;
      conteo[escuela].progreso += progressPercent(item);
    });

    return Object.entries(conteo)
      .map(([escuela, data]) => ({
        escuela,
        total: data.total,
        promedio: data.total > 0 ? Math.round(data.progreso / data.total) : 0
      }))
      .sort((a, b) => b.promedio - a.promedio || b.total - a.total)
      .slice(0, 8);
  }, [agentesFiltrados]);

  const registrosPorFecha = useMemo(() => {
    const conteo: Record<string, number> = {};

    agentesFiltrados.forEach((item) => {
      const fecha = onlyDate(item.created_at) || 'Sin fecha';
      conteo[fecha] = (conteo[fecha] || 0) + 1;
    });

    return Object.entries(conteo).sort((a, b) => b[0].localeCompare(a[0]));
  }, [agentesFiltrados]);

  const distribucionAlertas = useMemo(() => {
    return agentesFiltrados.reduce(
      (acc, item) => {
        const estado = getEstadoAlerta(item).label;

        if (estado === 'Óptimo') acc.optimo += 1;
        if (estado === 'En desarrollo') acc.desarrollo += 1;
        if (estado === 'Vulnerable') acc.vulnerable += 1;

        return acc;
      },
      { optimo: 0, desarrollo: 0, vulnerable: 0 }
    );
  }, [agentesFiltrados]);

  const escenarioSeleccionado = escenarios.find((item) => item.id === escenario) || escenarios[0];

  const iniciarSesion = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('adminAutorizado', 'true');
      setAuthorized(true);
      setPin('');
      setErrorMsg('');
      return;
    }

    setErrorMsg('PIN incorrecto. Intenta nuevamente.');
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem('adminAutorizado');
    setAuthorized(false);
    setPin('');
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEscuela('todas');
    setEdadMin('todas');
    setEdadMax('todas');
    setFechaInicio('');
    setFechaFin('');
    setEscenario('todos');
  };

  const displayName = (agente: Agente, index: number) => {
    if (modoAnonimo) return `Estudiante_${String(index + 1).padStart(3, '0')}`;
    return agente.nombre || 'Sin nombre';
  };

  const exportarExcel = () => {
    const encabezados = [
      'ID / Nombre del Estudiante',
      'Edad',
      'Unidad Educativa',
      'Avatar',
      'Escenario Evaluado',
      'Estado del Escenario',
      'Misiones Completadas',
      'Progreso (%)',
      'Tiempo de Resolución',
      'Precisión Promedio',
      'Puntaje Final',
      'Estado de Alerta',
      'Fecha de Registro',
      'Última Conexión'
    ];

    const filas = agentesFiltrados.map((item, index) => {
      const estado = getEstadoAlerta(item);
      const estadoEscenario = getEscenarioStatus(item, escenario)
        ? 'Completado'
        : 'Pendiente';

      return [
        displayName(item, index),
        item.edad ?? 'N/A',
        item.institucion || 'Sin institución',
        getAvatarLabel(item.avatar),
        escenarioSeleccionado.label,
        estadoEscenario,
        `${missionCount(item)} de 3`,
        `${progressPercent(item)}%`,
        'N/D',
        'N/D',
        `${progressPercent(item)}% preliminar`,
        estado.label,
        formatDate(item.created_at),
        formatDate(item.ultima_conexion)
      ];
    });

    const tableRows = [encabezados, ...filas]
      .map(
        (row, rowIndex) =>
          `<tr>${row
            .map(
              (cell) =>
                `<td style="border:1px solid #d9d9d9;padding:6px;${
                  rowIndex === 0 ? 'font-weight:bold;background:#f2f2f2;' : ''
                }">${escapeExcel(cell)}</td>`
            )
            .join('')}</tr>`
      )
      .join('');

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; }
          </style>
        </head>
        <body>
          <table>${tableRows}</table>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `mision-prevencion-resultados-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();

    URL.revokeObjectURL(url);
  };

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#010413] text-white flex items-center justify-center p-4 relative overflow-hidden cursor-auto">
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
              <h1 className="text-2xl font-black uppercase">Admin Panel</h1>
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
                  inputMode="numeric"
                  className="w-full bg-transparent outline-none text-white font-black tracking-[0.35em]"
                />

                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  className="text-white/50 hover:text-cyan-300 transition-colors"
                  aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
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
    <main className="min-h-screen bg-[#010413] text-white p-4 md:p-6 relative overflow-hidden cursor-auto">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-10 w-[32rem] h-[32rem] bg-orange-500/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[36rem] h-[36rem] bg-cyan-400/18 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      <section className="relative z-10 max-w-[1500px] mx-auto">
        <header className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 text-orange-400 mb-2">
              <Activity size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.32em]">
                Distrito 18D03 · Misión Prevención
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              Dashboard de Resultados
            </h1>

            <p className="text-slate-300 text-sm md:text-base mt-2 max-w-3xl">
              Panel de seguimiento para registros estudiantiles, instituciones, módulos de riesgo y exportación para análisis.
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
              onClick={exportarExcel}
              className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-300/20 rounded-2xl px-4 py-3 font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Download size={16} />
              Exportar Excel
            </button>

            <button
              type="button"
              onClick={() => setModoAnonimo((prev) => !prev)}
              className="bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-300/20 rounded-2xl px-4 py-3 font-bold text-sm flex items-center gap-2 transition-all"
            >
              <ShieldCheck size={16} />
              {modoAnonimo ? 'Ver nombres' : 'Anonimizar'}
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

        <section className="bg-white/7 border border-white/10 rounded-[2rem] p-4 md:p-5 backdrop-blur-2xl mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-cyan-300" />
            <h2 className="font-black uppercase tracking-[0.18em] text-sm">
              Filtros de búsqueda
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
            <label className="xl:col-span-2">
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                Buscar
              </span>
              <div className="mt-2 bg-black/35 border border-white/10 rounded-2xl px-3 py-3 flex items-center gap-2">
                <Search size={16} className="text-cyan-300" />
                <input
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Nombre, institución o avatar..."
                  className="w-full bg-transparent outline-none text-sm font-bold"
                />
              </div>
            </label>

            <label className="xl:col-span-2">
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                Unidad Educativa
              </span>
              <select
                value={filtroEscuela}
                onChange={(event) => setFiltroEscuela(event.target.value)}
                className="mt-2 w-full bg-black/35 border border-white/10 rounded-2xl px-3 py-3 text-sm font-bold outline-none"
              >
                <option value="todas">Seleccionar todas</option>
                {escuelas.map((escuela) => (
                  <option key={escuela} value={escuela}>
                    {escuela}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                Edad mínima
              </span>
              <select
                value={edadMin}
                onChange={(event) => setEdadMin(event.target.value)}
                className="mt-2 w-full bg-black/35 border border-white/10 rounded-2xl px-3 py-3 text-sm font-bold outline-none"
              >
                <option value="todas">Todas</option>
                {edadesDisponibles.map((edad) => (
                  <option key={edad} value={edad}>
                    {edad} años
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                Edad máxima
              </span>
              <select
                value={edadMax}
                onChange={(event) => setEdadMax(event.target.value)}
                className="mt-2 w-full bg-black/35 border border-white/10 rounded-2xl px-3 py-3 text-sm font-bold outline-none"
              >
                <option value="todas">Todas</option>
                {edadesDisponibles.map((edad) => (
                  <option key={edad} value={edad}>
                    {edad} años
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                Escenario de riesgo
              </span>
              <select
                value={escenario}
                onChange={(event) => setEscenario(event.target.value as EscenarioId)}
                className="mt-2 w-full bg-black/35 border border-white/10 rounded-2xl px-3 py-3 text-sm font-bold outline-none"
              >
                {escenarios.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

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

            <div className="flex items-end">
              <button
                type="button"
                onClick={limpiarFiltros}
                className="w-full bg-white/8 hover:bg-white/12 border border-white/10 rounded-2xl px-4 py-3 font-black text-xs uppercase tracking-[0.16em] transition-all"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4 mb-5">
          <StatCard
            title="Participantes"
            value={totalParticipantes}
            icon={<Users size={22} />}
            subtitle="según filtros aplicados"
          />
          <StatCard
            title="Tiempo medio"
            value="N/D"
            icon={<Clock3 size={22} />}
            subtitle="requiere guardar tiempo_real"
          />
          <StatCard
            title="Precisión"
            value="N/D"
            icon={<Target size={22} />}
            subtitle="requiere respuestas correctas"
          />
          <StatCard
            title="Completaron"
            value={completaronTodo}
            icon={<CheckCircle2 size={22} />}
            subtitle="las 3 misiones actuales"
          />
          <StatCard
            title="Mejor escuela"
            value={mejorEscuela ? `${mejorEscuela.promedio}%` : 'N/D'}
            icon={<Trophy size={22} />}
            subtitle={mejorEscuela ? mejorEscuela.escuela : 'sin datos'}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-5 mb-5">
          <section className="bg-white/7 border border-white/10 rounded-[2rem] p-4 md:p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-black uppercase tracking-[0.18em] text-sm flex items-center gap-2">
                <School size={16} className="text-cyan-300" />
                Desempeño por institución
              </h2>
              <span className="text-[10px] font-black text-cyan-200 bg-cyan-400/10 border border-cyan-300/20 px-3 py-1 rounded-full">
                Promedio por misiones
              </span>
            </div>

            <div className="space-y-3">
              {rankingEscuelas.length === 0 && (
                <p className="text-slate-400 text-sm">No hay datos para mostrar.</p>
              )}

              {rankingEscuelas.map((item, index) => (
                <div key={item.escuela}>
                  <div className="flex items-start justify-between gap-3 text-xs font-bold mb-1">
                    <span className="text-slate-200">
                      {index + 1}. {item.escuela}
                    </span>
                    <span className="text-cyan-200 whitespace-nowrap">
                      {item.promedio}% · {item.total}
                    </span>
                  </div>

                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400/70 rounded-full"
                      style={{ width: `${item.promedio}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/7 border border-white/10 rounded-[2rem] p-4 md:p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-black uppercase tracking-[0.18em] text-sm flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-300" />
                Estado de alerta
              </h2>
              <span className="text-[10px] font-black text-orange-200 bg-orange-400/10 border border-orange-300/20 px-3 py-1 rounded-full">
                Semáforo automático
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <AlertCard label="Óptimo" value={distribucionAlertas.optimo} colorClass="bg-emerald-300" />
              <AlertCard label="En desarrollo" value={distribucionAlertas.desarrollo} colorClass="bg-yellow-300" />
              <AlertCard label="Vulnerable" value={distribucionAlertas.vulnerable} colorClass="bg-red-300" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[180px] overflow-auto pr-1">
              {registrosPorFecha.length === 0 && (
                <p className="text-slate-400 text-sm">No hay datos para mostrar.</p>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 md:p-5 border-b border-white/10">
            <div>
              <h2 className="font-black uppercase tracking-[0.18em] text-sm">
                Tabla detallada de desempeño estudiantil
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Ordenada del registro más nuevo al más antiguo. Escenario activo: {escenarioSeleccionado.label}.
              </p>
            </div>

            <div className="text-xs font-black text-cyan-200 bg-cyan-400/10 border border-cyan-300/20 px-3 py-2 rounded-full">
              {agentesFiltrados.length} resultados
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[1220px] text-sm">
              <thead className="bg-black/35 text-slate-300">
                <tr>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Unidad Educativa</TableHead>
                  <TableHead>Escenario</TableHead>
                  <TableHead>Respuestas correctas</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Puntaje final</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-300">
                      Cargando registros...
                    </td>
                  </tr>
                )}

                {!loading && agentesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-300">
                      No hay registros con esos filtros.
                    </td>
                  </tr>
                )}

                {!loading &&
                  agentesFiltrados.map((agente, index) => {
                    const estado = getEstadoAlerta(agente);
                    const avatarUrl = getAvatarImage(agente.avatar);
                    const escenarioOk = getEscenarioStatus(agente, escenario);

                    return (
                      <tr
                        key={agente.id}
                        className="border-t border-white/8 hover:bg-white/[0.04] transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={getAvatarLabel(agente.avatar)}
                                className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 object-cover p-1"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-2xl bg-orange-400/12 border border-orange-300/20 flex items-center justify-center text-orange-200">
                                <User size={18} />
                              </div>
                            )}

                            <div>
                              <p className="font-black text-white">
                                {displayName(agente, index)}
                              </p>
                              <p className="text-xs text-slate-400">
                                {getAvatarLabel(agente.avatar)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="bg-purple-400/12 border border-purple-300/20 text-purple-200 px-3 py-1 rounded-full font-black text-xs">
                            {agente.edad ?? 'N/A'}
                          </span>
                        </td>

                        <td className="p-4 text-slate-200 font-bold">
                          {agente.institucion || 'Sin institución'}
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-black text-white">
                              {escenarioSeleccionado.shortLabel}
                            </span>
                            <span
                              className={`w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.12em] border ${
                                escenarioOk
                                  ? 'bg-emerald-400/12 text-emerald-200 border-emerald-300/20'
                                  : 'bg-slate-400/10 text-slate-300 border-white/10'
                              }`}
                            >
                              {escenarioOk ? 'Completado' : 'Pendiente'}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 text-xs">
                              N/D por ahora
                            </span>
                            <span className="text-[10px] text-slate-500">
                              requiere registrar respuestas
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 text-xs">
                              N/D
                            </span>
                            <span className="text-[10px] text-slate-500">
                              requiere tiempo_real
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="min-w-[120px]">
                            <div className="flex items-center justify-between text-xs font-black mb-1">
                              <span>{progressPercent(agente)}%</span>
                              <span className="text-slate-500">{missionCount(agente)}/3</span>
                            </div>
                            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-400/80 rounded-full"
                                style={{ width: `${progressPercent(agente)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div
                            className={`border rounded-2xl px-3 py-2 min-w-[150px] ${estado.className}`}
                            title={estado.description}
                          >
                            <div className="flex items-center gap-2 font-black text-xs">
                              <span className={`w-2.5 h-2.5 rounded-full ${estado.dotClassName}`} />
                              {estado.label}
                            </div>
                            <p className="text-[10px] opacity-80 mt-1">
                              {estado.description}
                            </p>
                          </div>
                        </td>

                        <td className="p-4 text-slate-300 font-semibold">
                          {formatDate(agente.created_at)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-4 bg-orange-500/10 border border-orange-300/20 rounded-2xl p-4 text-orange-100 text-sm leading-relaxed">
          <strong>Nota técnica:</strong> el tiempo medio, la precisión y el puntaje final real necesitan que las misiones guarden segundos, respuestas correctas y puntaje en Supabase. Por ahora el semáforo y el progreso se calculan con las misiones completadas que ya existen.
        </div>
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
  value: React.ReactNode;
  subtitle: string;
  icon: React.ReactNode;
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="bg-white/7 border border-white/10 rounded-[1.6rem] p-4 backdrop-blur-2xl shadow-[0_18px_50px_rgba(0,0,0,0.25)] min-h-[130px]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.22em]">
            {title}
          </p>
          <p className="text-2xl md:text-3xl font-black mt-2 break-words">
            {value}
          </p>
          <p className="text-slate-400 text-xs mt-2 line-clamp-2">
            {subtitle}
          </p>
        </div>

        <div className="bg-cyan-400/12 border border-cyan-300/20 text-cyan-200 p-3 rounded-2xl shrink-0">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const AlertCard = ({
  label,
  value,
  colorClass
}: {
  label: string;
  value: number;
  colorClass: string;
}) => {
  return (
    <div className="bg-black/30 border border-white/10 rounded-2xl p-3">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${colorClass}`} />
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
          {label}
        </p>
      </div>
      <p className="text-3xl font-black mt-2">{value}</p>
    </div>
  );
};

const TableHead = ({ children }: { children: React.ReactNode }) => {
  return (
    <th className="text-left p-4 font-black uppercase text-[10px] tracking-[0.18em]">
      {children}
    </th>
  );
};

export default AdminPanel;
