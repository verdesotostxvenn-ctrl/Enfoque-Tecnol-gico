import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  Filter,
  RefreshCw,
  School,
  Search,
  ShieldAlert,
  Trash2,
  Trophy,
  Users
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

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

type EstadoFiltro = 'todos' | 'completos' | 'pendientes';

const AdminPanel = () => {
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [escuelaFiltro, setEscuelaFiltro] = useState('todas');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('todos');
  const [registroSeleccionado, setRegistroSeleccionado] = useState<Agente | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cargarDatos = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('agentes')
        .select('id, created_at, nombre, institucion, edad, avatar, nivel, mision_volcan, mision_inundacion, mision_evacuacion, ultima_conexion')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgentes((data || []) as Agente[]);
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudieron cargar los registros. Revisa las variables de Supabase y las políticas RLS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const escuelas = useMemo(() => {
    return Array.from(new Set(agentes.map((a) => a.institucion || 'Sin institución'))).sort();
  }, [agentes]);

  const agentesFiltrados = useMemo(() => {
    const q = normalizar(busqueda);

    return agentes.filter((agente) => {
      const nombre = normalizar(agente.nombre || '');
      const escuela = agente.institucion || 'Sin institución';
      const progreso = obtenerProgreso(agente);

      const coincideBusqueda = !q || nombre.includes(q) || normalizar(escuela).includes(q);
      const coincideEscuela = escuelaFiltro === 'todas' || escuela === escuelaFiltro;
      const coincideEstado =
        estadoFiltro === 'todos' ||
        (estadoFiltro === 'completos' && progreso === 100) ||
        (estadoFiltro === 'pendientes' && progreso < 100);

      return coincideBusqueda && coincideEscuela && coincideEstado;
    });
  }, [agentes, busqueda, escuelaFiltro, estadoFiltro]);

  const stats = useMemo(() => {
    const total = agentesFiltrados.length;
    const completados = agentesFiltrados.filter((a) => obtenerProgreso(a) === 100).length;
    const progresoPromedio = total
      ? Math.round(agentesFiltrados.reduce((acc, a) => acc + obtenerProgreso(a), 0) / total)
      : 0;
    const escuelasActivas = new Set(agentesFiltrados.map((a) => a.institucion || 'Sin institución')).size;

    return { total, completados, progresoPromedio, escuelasActivas };
  }, [agentesFiltrados]);

  const eliminarRegistro = async () => {
    if (!registroSeleccionado) return;

    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase no está configurado. No se puede eliminar desde el panel.');
      setRegistroSeleccionado(null);
      return;
    }

    setDeletingId(registroSeleccionado.id);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('agentes').delete().eq('id', registroSeleccionado.id);

      if (error) throw error;

      setAgentes((prev) => prev.filter((item) => item.id !== registroSeleccionado.id));
      setRegistroSeleccionado(null);
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudo eliminar el registro. Verifica que exista una política DELETE en Supabase.');
    } finally {
      setDeletingId(null);
    }
  };

  const exportarCSV = () => {
    const encabezado = [
      'Nombre',
      'Edad',
      'Institución',
      'Nivel',
      'Progreso',
      'Volcán',
      'Inundación',
      'Evacuación',
      'Registro',
      'Última conexión'
    ];

    const filas = agentesFiltrados.map((a) => [
      a.nombre || 'Sin nombre',
      a.edad ?? 'N/A',
      a.institucion || 'Sin institución',
      a.nivel ?? 1,
      `${obtenerProgreso(a)}%`,
      a.mision_volcan ? 'Completada' : 'Pendiente',
      a.mision_inundacion ? 'Completada' : 'Pendiente',
      a.mision_evacuacion ? 'Completada' : 'Pendiente',
      formatearFecha(a.created_at),
      formatearFecha(a.ultima_conexion)
    ]);

    const csv = [encabezado, ...filas]
      .map((fila) => fila.map((celda) => `"${String(celda).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mision-prevencion-registros-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="admin-dashboard-pro min-h-screen bg-slate-100 text-slate-950 p-4 md:p-6">
      <style>
        {`
          .admin-dashboard-pro,
          .admin-dashboard-pro * {
            cursor: auto !important;
          }

          .admin-dashboard-pro button,
          .admin-dashboard-pro select,
          .admin-dashboard-pro .admin-clickable {
            cursor: pointer !important;
          }

          .admin-dashboard-pro input {
            cursor: text !important;
          }
        `}
      </style>

      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] bg-slate-950 text-white p-6 md:p-8 shadow-2xl overflow-hidden relative">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-cyan-300 text-xs font-black uppercase tracking-[0.28em] mb-2">Dashboard administrativo</p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">Registros de Misión Prevención</h1>
              <p className="text-slate-300 mt-3 max-w-2xl font-semibold">
                Entrada directa sin PIN para revisar estudiantes, progreso, instituciones y datos del plan piloto.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={cargarDatos}
                className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 font-black uppercase text-xs tracking-widest hover:bg-white/15 flex items-center gap-2"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
              </button>
              <button
                onClick={exportarCSV}
                className="rounded-2xl bg-cyan-400 text-slate-950 px-4 py-3 font-black uppercase text-xs tracking-widest hover:bg-cyan-300 flex items-center gap-2"
              >
                <Download size={16} /> Exportar
              </button>
            </div>
          </div>
        </header>

        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-bold flex items-center gap-3">
            <ShieldAlert size={20} /> {errorMsg}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard icon={<Users />} label="Participantes" value={stats.total} tone="cyan" />
          <MetricCard icon={<School />} label="Instituciones" value={stats.escuelasActivas} tone="orange" />
          <MetricCard icon={<BarChart3 />} label="Progreso promedio" value={`${stats.progresoPromedio}%`} tone="emerald" />
          <MetricCard icon={<Trophy />} label="Completaron todo" value={stats.completados} tone="purple" />
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-4 md:p-5 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por nombre o institución..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <select
              value={escuelaFiltro}
              onChange={(event) => setEscuelaFiltro(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-cyan-500"
            >
              <option value="todas">Todas las instituciones</option>
              {escuelas.map((escuela) => (
                <option key={escuela} value={escuela}>{escuela}</option>
              ))}
            </select>

            <select
              value={estadoFiltro}
              onChange={(event) => setEstadoFiltro(event.target.value as EstadoFiltro)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-cyan-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="completos">Completaron</option>
              <option value="pendientes">Pendientes</option>
            </select>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-4 md:p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Base de datos</p>
              <h2 className="text-xl font-black">Registros encontrados: {agentesFiltrados.length}</h2>
            </div>
            <Filter className="text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-5 py-4">Estudiante</th>
                  <th className="px-5 py-4">Institución</th>
                  <th className="px-5 py-4">Edad</th>
                  <th className="px-5 py-4">Nivel</th>
                  <th className="px-5 py-4">Progreso</th>
                  <th className="px-5 py-4">Misiones</th>
                  <th className="px-5 py-4">Registro</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center font-black text-slate-500">Cargando registros...</td>
                  </tr>
                ) : agentesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center font-black text-slate-500">No hay registros para mostrar.</td>
                  </tr>
                ) : (
                  agentesFiltrados.map((agente) => {
                    const progreso = obtenerProgreso(agente);

                    return (
                      <tr key={agente.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-black text-slate-950">{agente.nombre || 'Sin nombre'}</div>
                          <div className="text-xs font-bold text-slate-500">Avatar: {agente.avatar || 'N/A'}</div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-600">{agente.institucion || 'Sin institución'}</td>
                        <td className="px-5 py-4 font-bold">{agente.edad ?? 'N/A'}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">Nivel {agente.nivel ?? 1}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="w-36 rounded-full bg-slate-100 h-3 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500" style={{ width: `${progreso}%` }} />
                          </div>
                          <div className="text-xs font-black text-slate-500 mt-1">{progreso}%</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1.5">
                            <MissionDot active={Boolean(agente.mision_volcan)} label="V" />
                            <MissionDot active={Boolean(agente.mision_inundacion)} label="I" />
                            <MissionDot active={Boolean(agente.mision_evacuacion)} label="E" />
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-500">{formatearFecha(agente.created_at)}</td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setRegistroSeleccionado(agente)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-red-700 hover:bg-red-100"
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {registroSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 size={26} />
            </div>
            <h3 className="text-2xl font-black">Eliminar registro</h3>
            <p className="mt-2 text-slate-600 font-semibold">
              ¿Seguro que deseas eliminar a <strong>{registroSeleccionado.nombre || 'este estudiante'}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setRegistroSeleccionado(null)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarRegistro}
                disabled={deletingId === registroSeleccionado.id}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-black uppercase tracking-wider text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deletingId === registroSeleccionado.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
};

const MetricCard = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone: string }) => {
  const tones: Record<string, string> = {
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100'
  };

  return (
    <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-lg">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border ${tones[tone] || tones.cyan}`}>
        {icon}
      </div>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
};

const MissionDot = ({ active, label }: { active: boolean; label: string }) => (
  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
    {active ? <CheckCircle2 size={15} /> : label}
  </span>
);

const obtenerProgreso = (agente: Agente) => {
  const completadas = [agente.mision_volcan, agente.mision_inundacion, agente.mision_evacuacion].filter(Boolean).length;
  return Math.round((completadas / 3) * 100);
};

const formatearFecha = (value: string | null) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const normalizar = (value: string) => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export default AdminPanel;
