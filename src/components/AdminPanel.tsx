import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Filter,
  LockKeyhole,
  LogOut,
  RefreshCw,
  School,
  Search,
  ShieldAlert,
  Timer,
  Trophy,
  Users,
  XCircle
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

type Escenario = 'todos' | 'volcan' | 'inundacion' | 'evacuacion';

const ADMIN_PIN = '1328';

const avatarImages = {
  chica:
    'https://blogger.googleusercontent.com/img/a/AVvXsEh_PnIcFYcgmsvgfKqk4Mr0s40x0a5f1_pIFmBRlR0oVInL1-uaLQIez5BrYNp-ua4-mBmHqb2A8Ox4tElSIJx3LtHnBaO-cGTxzHomjYO1f2X6KQzCYn8I0LmpqNe6o1UiXhc814JjCv0hWJ3kME5gcDJ1czrxl7xYge9BE214gnYyrIHHqxwuTMyoxPjd',
  chico:
    'https://blogger.googleusercontent.com/img/a/AVvXsEhGuah8gRxjKHRH2XeN_K7ew3dlo-4QNWudy46AsoT91CiPXkrU9JDEA1wQ1iyIcYj23qQGhITb2EJpIMP1bww_g24vx1-yYp6dYz1agR_nWX6pazjghCNOXXKGvdI0nzDG173acHzltH-fCPlxYYkVQhA47V7aFNiZmVH4HAZf8OTIqtiu0DiI7SIOd5Qe'
};

const instituciones18D03 = [
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

const escenarios = [
  { value: 'todos', label: 'Todos los escenarios' },
  { value: 'volcan', label: 'Actividad volcánica' },
  { value: 'inundacion', label: 'Inundación' },
  { value: 'evacuacion', label: 'Evacuación' }
] as const;

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
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [filtroEscuela, setFiltroEscuela] = useState('todas');
  const [edadDesde, setEdadDesde] = useState('todas');
  const [edadHasta, setEdadHasta] = useState('todas');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroEscenario, setFiltroEscenario] = useState<Escenario>('todos');
  const [anonimizar, setAnonimizar] = useState(false);

  useEffect(() => {
    document.body.style.cursor = 'auto';
    document.documentElement.style.cursor = 'auto';

    return () => {
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
    };
  }, []);

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

  const agentesFiltrados = useMemo(() => {
    return agentes.filter((agente) => {
      const nombre = agente.nombre || '';
      const escuela = agente.institucion || 'Sin institución';
      const edad = agente.edad;
      const fecha = dateInputValue(agente.created_at);

      const busquedaNormalizada = normalizeText(busqueda);
      const nombreNormalizado = normalizeText(nombre);

      const coincideBusqueda =
        !busquedaNormalizada || nombreNormalizado.includes(busquedaNormalizada);

      const coincideEscuela =
        filtroEscuela === 'todas' || escuela === filtroEscuela;

      const coincideEdadDesde =
        edadDesde === 'todas' ||
        (typeof edad === 'number' && edad >= Number(edadDesde));

      const coincideEdadHasta =
        edadHasta === 'todas' ||
        (typeof edad === 'number' && edad <= Number(edadHasta));

      const coincideFechaInicio =
        !fechaInicio || (fecha && fecha >= fechaInicio);

      const coincideFechaFin = !fechaFin || (fecha && fecha <= fechaFin);

      const coincideEscenario =
        filtroEscenario === 'todos' ||
        getMissionStatus(agente, filtroEscenario) === true ||
        getMissionStatus(agente, filtroEscenario) === false;

      return (
        coincideBusqueda &&
        coincideEscuela &&
        coincideEdadDesde &&
        coincideEdadHasta &&
        coincideFechaInicio &&
        coincideFechaFin &&
        coincideEscenario
      );
    });
  }, [
    agentes,
    busqueda,
    filtroEscuela,
    edadDesde,
    edadHasta,
    fechaInicio,
    fechaFin,
    filtroEscenario
  ]);

  const sugerenciasNombres = useMemo(() => {
    const busquedaNormalizada = normalizeText(busqueda);

    if (!busquedaNormalizada) return [];

    const nombresUnicos = new Map<string, string>();

    agentes.forEach((agente) => {
      const nombre = (agente.nombre || '').trim();
      const nombreNormalizado = normalizeText(nombre);

      if (!nombre || !nombreNormalizado.includes(busquedaNormalizada)) return;

      nombresUnicos.set(nombreNormalizado, nombre);
    });

    return Array.from(nombresUnicos.values())
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 6);
  }, [agentes, busqueda]);

  const totalParticipantes = agentesFiltrados.length;

  const totalEscuelas = useMemo(() => {
    return new Set(
      agentesFiltrados.map((agente) => agente.institucion || 'Sin institución')
    ).size;
  }, [agentesFiltrados]);

  const progresoPromedio = useMemo(() => {
    if (agentesFiltrados.length === 0) return 0;

    const total = agentesFiltrados.reduce((sum, agente) => {
      return sum + getProgressPercent(agente);
    }, 0);

    return Math.round(total / agentesFiltrados.length);
  }, [agentesFiltrados]);

  const registrosHoy = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10);

    return agentesFiltrados.filter((agente) => {
      return dateInputValue(agente.created_at) === hoy;
    }).length;
  }, [agentesFiltrados]);

  const resumenEscuelas = useMemo(() => {
    const resumen: Record<
      string,
      {
        escuela: string;
        total: number;
        progresoTotal: number;
        volcan: number;
        inundacion: number;
        evacuacion: number;
      }
    > = {};

    agentesFiltrados.forEach((agente) => {
      const escuela = agente.institucion || 'Sin institución';

      if (!resumen[escuela]) {
        resumen[escuela] = {
          escuela,
          total: 0,
          progresoTotal: 0,
          volcan: 0,
          inundacion: 0,
          evacuacion: 0
        };
      }

      resumen[escuela].total += 1;
      resumen[escuela].progresoTotal += getProgressPercent(agente);
      resumen[escuela].volcan += Number(Boolean(agente.mision_volcan));
      resumen[escuela].inundacion += Number(Boolean(agente.mision_inundacion));
      resumen[escuela].evacuacion += Number(Boolean(agente.mision_evacuacion));
    });

    return Object.values(resumen)
      .map((item) => ({
        ...item,
        progreso: item.total > 0 ? Math.round(item.progresoTotal / item.total) : 0
      }))
      .sort((a, b) => b.progreso - a.progreso || b.total - a.total);
  }, [agentesFiltrados]);

  const mejorEscuela = resumenEscuelas[0];

  const registrosPorFecha = useMemo(() => {
    const conteo: Record<string, number> = {};

    agentesFiltrados.forEach((agente) => {
      const fecha = dateInputValue(agente.created_at) || 'Sin fecha';
      conteo[fecha] = (conteo[fecha] || 0) + 1;
    });

    return Object.entries(conteo).sort((a, b) => b[0].localeCompare(a[0]));
  }, [agentesFiltrados]);

  const resumenSemaforo = useMemo(() => {
    const resumen = {
      optimo: 0,
      desarrollo: 0,
      vulnerable: 0
    };

    agentesFiltrados.forEach((agente) => {
      const estado = getAlertStatus(agente).key;
      resumen[estado] += 1;
    });

    return resumen;
  }, [agentesFiltrados]);

  const iniciarSesion = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pin.trim() === ADMIN_PIN) {
      sessionStorage.setItem('adminAutorizado', 'true');
      setAuthorized(true);
      setPin('');
      setErrorMsg('');
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
    setMostrarSugerencias(false);
    setFiltroEscuela('todas');
    setEdadDesde('todas');
    setEdadHasta('todas');
    setFechaInicio('');
    setFechaFin('');
    setFiltroEscenario('todos');
  };

  const exportarExcel = () => {
    const filas = agentesFiltrados.map((agente, index) => {
      const nombreVisible = anonimizar
        ? `Estudiante_${String(index + 1).padStart(3, '0')}`
        : agente.nombre || 'Sin nombre';

      const progreso = getProgressPercent(agente);
      const alerta = getAlertStatus(agente);

      return [
        nombreVisible,
        agente.edad ?? 'N/A',
        agente.institucion || 'Sin institución',
        getScenarioExportText(agente, filtroEscenario),
        `${progreso}%`,
        'N/D',
        `${progreso}/100`,
        alerta.label,
        getAvatarLabel(agente.avatar),
        agente.nivel ?? 1,
        agente.mision_volcan ? 'Completada' : 'Pendiente',
        agente.mision_inundacion ? 'Completada' : 'Pendiente',
        agente.mision_evacuacion ? 'Completada' : 'Pendiente',
        formatDate(agente.created_at),
        formatDate(agente.ultima_conexion)
      ];
    });

    const encabezados = [
      'ID / Nombre del Estudiante',
      'Edad',
      'Unidad Educativa',
      'Escenario Evaluado',
      'Respuestas Correctas (%)',
      'Tiempo de Resolución',
      'Puntaje Final',
      'Estado de Alerta',
      'Avatar',
      'Nivel',
      'Misión Volcán',
      'Misión Inundación',
      'Misión Evacuación',
      'Fecha de Registro',
      'Última Conexión'
    ];

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            table { border-collapse: collapse; font-family: Arial, sans-serif; width: 100%; }
            th { background: #0f172a; color: #ffffff; font-weight: 700; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            tr:nth-child(even) { background: #f8fafc; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${encabezados.map((item) => `<th>${escapeHtml(item)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${filas
                .map(
                  (fila) =>
                    `<tr>${fila
                      .map((celda) => `<td>${escapeHtml(String(celda))}</td>`)
                      .join('')}</tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `mision-prevencion-resultados-${new Date()
      .toISOString()
      .slice(0, 10)}.xls`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const dashboardStyle = (
    <style>
      {`
        .admin-dashboard-pro,
        .admin-dashboard-pro * {
          cursor: auto !important;
        }

        .admin-dashboard-pro button,
        .admin-dashboard-pro select,
        .admin-dashboard-pro input[type="date"],
        .admin-dashboard-pro .admin-clickable {
          cursor: pointer !important;
        }

        .admin-dashboard-pro input[type="text"],
        .admin-dashboard-pro input[type="password"] {
          cursor: text !important;
        }

        .admin-dashboard-pro select option {
          background: #ffffff;
          color: #0f172a;
        }
      `}
    </style>
  );

  if (!authorized) {
    return (
      <main className="admin-dashboard-pro min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {dashboardStyle}

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-orange-300/30 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 w-full max-w-md rounded-[2rem] border border-white bg-white/90 p-7 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <LockKeyhole size={26} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
                Acceso administrativo
              </p>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
                Misión Prevención
              </h1>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold leading-relaxed text-slate-600">
              Ingresa el PIN para visualizar los registros, filtrar resultados y
              exportar datos para el análisis del plan piloto.
            </p>
          </div>

          <form onSubmit={iniciarSesion} className="space-y-4">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                PIN de acceso
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  placeholder="1328"
                  maxLength={4}
                  className="w-full bg-transparent text-lg font-black tracking-[0.35em] text-slate-950 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
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
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
                >
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-cyan-700"
            >
              Entrar al panel
            </button>
          </form>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="admin-dashboard-pro min-h-screen bg-slate-100 text-slate-900">
      {dashboardStyle}

      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <BarChart3 size={26} />
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <Activity size={14} className="text-emerald-600" />
                <span className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
                  Dashboard activo
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-4xl">
                Panel de Resultados
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Evaluación del plan piloto de Gestión de Riesgos de Desastres.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={cargarDatos}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>

            <button
              type="button"
              onClick={exportarExcel}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-500"
            >
              <Download size={16} />
              Exportar Excel
            </button>

            <button
              type="button"
              onClick={cerrarSesion}
              className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        {errorMsg && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMsg}
          </div>
        )}

        <section className="mb-5 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={17} className="text-cyan-700" />
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">
              Filtros de búsqueda
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <label className="relative xl:col-span-2">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                Buscar por nombre del estudiante
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-100">
                <Search size={16} className="text-cyan-700" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(event) => {
                    setBusqueda(event.target.value);
                    setMostrarSugerencias(true);
                  }}
                  onFocus={() => setMostrarSugerencias(true)}
                  onBlur={() => {
                    window.setTimeout(() => setMostrarSugerencias(false), 150);
                  }}
                  placeholder="Ej. María, Juan, José..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  autoComplete="off"
                />

                {busqueda && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusqueda('');
                      setMostrarSugerencias(false);
                    }}
                    className="rounded-xl p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Limpiar búsqueda"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {mostrarSugerencias && busqueda.trim() && sugerenciasNombres.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                  >
                    <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Coincidencias por nombre
                    </div>

                    {sugerenciasNombres.map((nombre) => (
                      <button
                        key={nombre}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setBusqueda(nombre);
                          setMostrarSugerencias(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-800"
                      >
                        <Users size={15} className="text-cyan-700" />
                        {nombre}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </label>

            <label>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                Desde
              </span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(event) => setFechaInicio(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                Hasta
              </span>
              <input
                type="date"
                value={fechaFin}
                onChange={(event) => setFechaFin(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                Edad desde
              </span>
              <select
                value={edadDesde}
                onChange={(event) => setEdadDesde(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
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
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                Edad hasta
              </span>
              <select
                value={edadHasta}
                onChange={(event) => setEdadHasta(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              >
                <option value="todas">Todas</option>
                {edadesDisponibles.map((edad) => (
                  <option key={edad} value={edad}>
                    {edad} años
                  </option>
                ))}
              </select>
            </label>

            <label className="xl:col-span-3">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                Unidad educativa
              </span>
              <select
                value={filtroEscuela}
                onChange={(event) => setFiltroEscuela(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              >
                <option value="todas">Seleccionar todas</option>
                {instituciones18D03.map((escuela) => (
                  <option key={escuela} value={escuela}>
                    {escuela}
                  </option>
                ))}
              </select>
            </label>

            <label className="xl:col-span-2">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                Escenario de riesgo
              </span>
              <select
                value={filtroEscenario}
                onChange={(event) =>
                  setFiltroEscenario(event.target.value as Escenario)
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              >
                {escenarios.map((escenario) => (
                  <option key={escenario.value} value={escenario.value}>
                    {escenario.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={limpiarFiltros}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Limpiar
              </button>
            </div>
          </div>
        </section>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <KpiCard
            title="Participantes"
            value={totalParticipantes}
            subtitle="según filtros"
            icon={<Users size={22} />}
            tone="cyan"
          />
          <KpiCard
            title="Registros hoy"
            value={registrosHoy}
            subtitle="actividad del día"
            icon={<CalendarDays size={22} />}
            tone="emerald"
          />
          <KpiCard
            title="Instituciones"
            value={totalEscuelas}
            subtitle="unidades educativas"
            icon={<School size={22} />}
            tone="indigo"
          />
          <KpiCard
            title="Progreso promedio"
            value={`${progresoPromedio}%`}
            subtitle="por misiones"
            icon={<CheckCircle2 size={22} />}
            tone="orange"
          />
          <KpiCard
            title="Tiempo medio"
            value="N/D"
            subtitle="requiere guardar segundos"
            icon={<Timer size={22} />}
            tone="slate"
          />
          <KpiCard
            title="Mejor desempeño"
            value={mejorEscuela ? `${mejorEscuela.progreso}%` : 'N/D'}
            subtitle={mejorEscuela ? mejorEscuela.escuela : 'sin datos'}
            icon={<Trophy size={22} />}
            tone="yellow"
          />
        </div>

        <section className="mb-5 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          <div className="flex items-start gap-3">
            <ShieldAlert size={20} className="mt-0.5 shrink-0" />
            <p>
              Las métricas de <strong>tiempo medio</strong>,{' '}
              <strong>precisión real</strong> y <strong>puntaje técnico</strong>{' '}
              aparecerán cuando el juego guarde segundos, respuestas correctas y
              puntajes por escenario. Mientras tanto, este panel calcula el avance
              con las misiones completadas que ya existen en Supabase.
            </p>
          </div>
        </section>

        <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">
                  Desempeño por institución
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Promedio de avance según misiones completadas.
                </p>
              </div>
              <School size={22} className="text-cyan-700" />
            </div>

            <div className="space-y-4">
              {resumenEscuelas.slice(0, 8).map((item, index) => (
                <div key={item.escuela}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-black text-slate-800">
                      {index + 1}. {item.escuela}
                    </p>
                    <p className="text-sm font-black text-cyan-700">
                      {item.progreso}%
                    </p>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-cyan-600 transition-all"
                      style={{ width: `${item.progreso}%` }}
                    />
                  </div>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {item.total} participante{item.total === 1 ? '' : 's'}
                  </p>
                </div>
              ))}

              {resumenEscuelas.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                  No hay datos con los filtros actuales.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">
                  Semáforo de alerta
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Clasificación automática por avance.
                </p>
              </div>
              <ShieldAlert size={22} className="text-orange-600" />
            </div>

            <div className="space-y-3">
              <AlertRow
                label="Óptimo"
                description="Conoce el protocolo y avanza rápido."
                value={resumenSemaforo.optimo}
                colorClass="bg-emerald-500"
                textClass="text-emerald-700"
                total={totalParticipantes}
              />
              <AlertRow
                label="En desarrollo"
                description="Tiene avance parcial y requiere refuerzo."
                value={resumenSemaforo.desarrollo}
                colorClass="bg-amber-500"
                textClass="text-amber-700"
                total={totalParticipantes}
              />
              <AlertRow
                label="Vulnerable"
                description="No registra misiones completadas."
                value={resumenSemaforo.vulnerable}
                colorClass="bg-red-500"
                textClass="text-red-700"
                total={totalParticipantes}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Registros por fecha
              </p>

              <div className="mt-3 grid max-h-56 grid-cols-1 gap-2 overflow-auto pr-1">
                {registrosPorFecha.map(([fecha, cantidad]) => (
                  <div
                    key={fecha}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
                  >
                    <span className="text-sm font-bold text-slate-700">
                      {fecha}
                    </span>
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-black text-white">
                      {cantidad}
                    </span>
                  </div>
                ))}

                {registrosPorFecha.length === 0 && (
                  <p className="text-sm font-semibold text-slate-500">
                    No hay fechas para mostrar.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">
                Tabla detallada de desempeño estudiantil
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Ordenada del registro más reciente al más antiguo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={anonimizar}
                  onChange={(event) => setAnonimizar(event.target.checked)}
                  className="h-4 w-4 accent-cyan-700"
                />
                Anonimizar nombres
              </label>

              <span className="rounded-full bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700">
                {agentesFiltrados.length} resultados
              </span>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Unidad Educativa</TableHead>
                  <TableHead>Escenario Evaluado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Puntaje</TableHead>
                  <TableHead>Estado de Alerta</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Última Conexión</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center font-bold text-slate-500">
                      Cargando registros...
                    </td>
                  </tr>
                )}

                {!loading && agentesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center font-bold text-slate-500">
                      No hay registros con los filtros actuales.
                    </td>
                  </tr>
                )}

                {!loading &&
                  agentesFiltrados.map((agente, index) => {
                    const progreso = getProgressPercent(agente);
                    const alerta = getAlertStatus(agente);
                    const nombreVisible = anonimizar
                      ? `Estudiante_${String(index + 1).padStart(3, '0')}`
                      : agente.nombre || 'Sin nombre';

                    return (
                      <tr
                        key={agente.id}
                        className="border-t border-slate-100 transition hover:bg-cyan-50/40"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getAvatarSrc(agente.avatar)}
                              alt={getAvatarLabel(agente.avatar)}
                              className="h-12 w-12 rounded-2xl border border-slate-200 bg-slate-50 object-cover p-1"
                            />
                            <div>
                              <p className="font-black text-slate-950">
                                {nombreVisible}
                              </p>
                              <p className="text-xs font-bold text-slate-500">
                                {getAvatarLabel(agente.avatar)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-black text-purple-700">
                            {agente.edad ?? 'N/A'}
                          </span>
                        </td>

                        <td className="max-w-[260px] p-4">
                          <p className="font-bold text-slate-700">
                            {agente.institucion || 'Sin institución'}
                          </p>
                        </td>

                        <td className="p-4">
                          <ScenarioBadges agente={agente} escenario={filtroEscenario} />
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-cyan-600"
                                style={{ width: `${progreso}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-slate-700">
                              {progreso}%
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                            {progreso}/100
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black ${alerta.className}`}
                          >
                            {alerta.icon}
                            {alerta.label}
                          </span>
                        </td>

                        <td className="p-4 font-semibold text-slate-600">
                          {formatDate(agente.created_at)}
                        </td>

                        <td className="p-4 font-semibold text-slate-600">
                          {formatDate(agente.ultima_conexion)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
};

const KpiCard = ({
  title,
  value,
  subtitle,
  icon,
  tone
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  tone: 'cyan' | 'emerald' | 'indigo' | 'orange' | 'slate' | 'yellow';
}) => {
  const toneClass = {
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100'
  }[tone];

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>

        <div className={`rounded-2xl border p-2.5 ${toneClass}`}>{icon}</div>
      </div>

      <p className="text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 line-clamp-2 text-xs font-bold text-slate-500">
        {subtitle}
      </p>
    </motion.article>
  );
};

const AlertRow = ({
  label,
  description,
  value,
  total,
  colorClass,
  textClass
}: {
  label: string;
  description: string;
  value: number;
  total: number;
  colorClass: string;
  textClass: string;
}) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className={`font-black ${textClass}`}>{label}</p>
          <p className="text-xs font-semibold text-slate-500">{description}</p>
        </div>
        <span className="text-xl font-black text-slate-950">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const ScenarioBadges = ({
  agente,
  escenario
}: {
  agente: Agente;
  escenario: Escenario;
}) => {
  if (escenario !== 'todos') {
    const ok = getMissionStatus(agente, escenario);
    return <MissionBadge label={scenarioLabel(escenario)} ok={ok} />;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <MissionBadge label="Volcán" ok={agente.mision_volcan} />
      <MissionBadge label="Inundación" ok={agente.mision_inundacion} />
      <MissionBadge label="Evacuación" ok={agente.mision_evacuacion} />
    </div>
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
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${
        ok
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}
    >
      {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {label}
    </span>
  );
};

const TableHead = ({ children }: { children: React.ReactNode }) => {
  return (
    <th className="p-4 text-[11px] font-black uppercase tracking-[0.16em]">
      {children}
    </th>
  );
};

const normalizeText = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

const getProgressPercent = (agente: Agente) => {
  const completadas =
    Number(Boolean(agente.mision_volcan)) +
    Number(Boolean(agente.mision_inundacion)) +
    Number(Boolean(agente.mision_evacuacion));

  return Math.round((completadas / 3) * 100);
};

const getAlertStatus = (agente: Agente) => {
  const progreso = getProgressPercent(agente);

  if (progreso >= 100) {
    return {
      key: 'optimo' as const,
      label: 'Óptimo',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      icon: <CheckCircle2 size={13} />
    };
  }

  if (progreso > 0) {
    return {
      key: 'desarrollo' as const,
      label: 'En desarrollo',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
      icon: <ShieldAlert size={13} />
    };
  }

  return {
    key: 'vulnerable' as const,
    label: 'Vulnerable',
    className: 'border-red-200 bg-red-50 text-red-700',
    icon: <XCircle size={13} />
  };
};

const getMissionStatus = (agente: Agente, escenario: Escenario) => {
  if (escenario === 'volcan') return Boolean(agente.mision_volcan);
  if (escenario === 'inundacion') return Boolean(agente.mision_inundacion);
  if (escenario === 'evacuacion') return Boolean(agente.mision_evacuacion);
  return true;
};

const scenarioLabel = (escenario: Escenario) => {
  if (escenario === 'volcan') return 'Volcán';
  if (escenario === 'inundacion') return 'Inundación';
  if (escenario === 'evacuacion') return 'Evacuación';
  return 'Resumen general';
};

const getScenarioExportText = (agente: Agente, escenario: Escenario) => {
  if (escenario !== 'todos') {
    return `${scenarioLabel(escenario)} - ${
      getMissionStatus(agente, escenario) ? 'Completada' : 'Pendiente'
    }`;
  }

  return `Volcán: ${
    agente.mision_volcan ? 'Completada' : 'Pendiente'
  } | Inundación: ${
    agente.mision_inundacion ? 'Completada' : 'Pendiente'
  } | Evacuación: ${agente.mision_evacuacion ? 'Completada' : 'Pendiente'}`;
};

const getAvatarLabel = (avatar: string | null) => {
  if (avatar === 'chica') return 'Niña';
  if (avatar === 'chico') return 'Niño';
  return 'No definido';
};

const getAvatarSrc = (avatar: string | null) => {
  if (avatar === 'chica') return avatarImages.chica;
  if (avatar === 'chico') return avatarImages.chico;
  return avatarImages.chico;
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

const dateInputValue = (value: string | null) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
};

const escapeHtml = (value: string) => {
  return value
    .split('&')
    .join('&amp;')
    .split('<')
    .join('&lt;')
    .split('>')
    .join('&gt;')
    .split('"')
    .join('&quot;')
    .split("'")
    .join('&#039;');
};

export default AdminPanel;
