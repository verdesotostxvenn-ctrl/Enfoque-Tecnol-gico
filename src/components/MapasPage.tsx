import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Database, Info, Layers3, Maximize2, Minus, Move, Plus, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { PaletteName, renderGeoTiffSource, susceptibilityPalettes } from '../utils/geotiffRenderer';

const FALLBACK_MAPA_URL = 'https://blogger.googleusercontent.com/img/a/AVvXsEgoBR_tyDWvpHNWIIr4exwvwEhWkAJKojndFPjuAEU9rITfY1DmsDPkKDo6TN7q6DwlfiCUrkWt4XIa-Vmp88WdgghLYYVPJRJyt_UEIHDtrkpQ_6guba1jv5pCpwD5hs50Fyzmnk76qagF_CAXoQTzm9EfVRMIwCRBqXhp7L4_-Ez2wLhczbzcB37WWqo';

const paletteLabels: Record<PaletteName, string> = {
  institucional: 'Original',
  semaforo: 'Semáforo',
  contraste: 'Contraste',
  azul: 'Azul',
  gris: 'Gris'
};

type MapaRecord = {
  id: string;
  titulo: string | null;
  descripcion: string | null;
  tif_url: string | null;
  preview_url: string | null;
  updated_at: string | null;
};

const MapasPage = () => {
  const navigate = useNavigate();
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [mapaUrl, setMapaUrl] = useState(FALLBACK_MAPA_URL);
  const [previewUrl, setPreviewUrl] = useState(FALLBACK_MAPA_URL);
  const [tifUrl, setTifUrl] = useState('');
  const [titulo, setTitulo] = useState('Mapa de amenaza por inundaciones');
  const [descripcion, setDescripcion] = useState('Visualiza el mapa temático de susceptibilidad. Puedes acercar, alejar y mover el mapa para revisar las zonas de riesgo.');
  const [estado, setEstado] = useState('Cargando mapa publicado...');
  const [isLoading, setIsLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [activePalette, setActivePalette] = useState<PaletteName>('institucional');
  const [counts, setCounts] = useState<Record<number, number> | null>(null);
  const [renderMode, setRenderMode] = useState<'tif' | 'preview' | 'fallback'>('fallback');

  const selectedLegend = useMemo(() => susceptibilityPalettes[activePalette], [activePalette]);

  useEffect(() => {
    const cargarMapaPublicado = async () => {
      setIsLoading(true);
      setEstado('Buscando mapa publicado...');

      try {
        if (!isSupabaseConfigured) {
          setEstado('Mostrando mapa base. Supabase todavía no está configurado para mapas publicados.');
          setMapaUrl(FALLBACK_MAPA_URL);
          setPreviewUrl(FALLBACK_MAPA_URL);
          setRenderMode('fallback');
          return;
        }

        const { data, error } = await supabase
          .from('mapas_recursos')
          .select('id, titulo, descripcion, tif_url, preview_url, updated_at')
          .eq('id', 'inundaciones')
          .maybeSingle();

        if (error) throw error;

        const mapa = data as MapaRecord | null;

        if (!mapa) {
          setEstado('Mostrando mapa base. Aún no hay un GeoTIFF publicado desde /admin/mapas.');
          setMapaUrl(FALLBACK_MAPA_URL);
          setPreviewUrl(FALLBACK_MAPA_URL);
          setRenderMode('fallback');
          return;
        }

        setTitulo(mapa.titulo || 'Mapa de amenaza por inundaciones');
        setDescripcion(mapa.descripcion || 'Mapa temático de susceptibilidad por inundaciones.');
        setUpdatedAt(mapa.updated_at);
        setPreviewUrl(mapa.preview_url || FALLBACK_MAPA_URL);

        if (mapa.tif_url) {
          setTifUrl(mapa.tif_url);
          setEstado('GeoTIFF publicado encontrado. Preparando simbología editable...');
          return;
        }

        if (mapa.preview_url) {
          setMapaUrl(mapa.preview_url);
          setRenderMode('preview');
          setEstado('Mapa publicado como imagen. Para cambiar colores en vivo, publica también el .tif.');
          return;
        }

        setEstado('Registro encontrado, pero no tiene archivo de mapa.');
        setMapaUrl(FALLBACK_MAPA_URL);
        setRenderMode('fallback');
      } catch (error) {
        console.error(error);
        setEstado('No se pudo cargar el mapa publicado. Mostrando mapa base.');
        setMapaUrl(FALLBACK_MAPA_URL);
        setRenderMode('fallback');
      } finally {
        setIsLoading(false);
      }
    };

    cargarMapaPublicado();
  }, []);

  useEffect(() => {
    if (!tifUrl) return;

    let cancelled = false;

    const renderizar = async () => {
      setIsLoading(true);
      setEstado(`Renderizando GeoTIFF con paleta ${paletteLabels[activePalette]}...`);

      try {
        const rendered = await renderGeoTiffSource(tifUrl, 1600, selectedLegend);
        if (cancelled) return;

        setMapaUrl(rendered.dataUrl);
        setCounts(rendered.counts);
        setRenderMode('tif');
        setEstado('GeoTIFF renderizado. Puedes cambiar colores, mover, acercar y revisar la leyenda.');
      } catch (error) {
        console.error(error);
        if (cancelled) return;

        setMapaUrl(previewUrl || FALLBACK_MAPA_URL);
        setRenderMode(previewUrl ? 'preview' : 'fallback');
        setEstado('No se pudo leer el .tif en el navegador. Mostrando vista previa PNG.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    renderizar();

    return () => {
      cancelled = true;
    };
  }, [tifUrl, activePalette, previewUrl, selectedLegend]);

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 4));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.65));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;

    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await viewerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn('No se pudo activar pantalla completa:', error);
    }
  };

  return (
    <main className="min-h-screen bg-[#010413] text-white p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-44 -left-32 h-[34rem] w-[34rem] rounded-full bg-cyan-500/20 blur-[130px]" />
        <div className="absolute -bottom-44 -right-32 h-[34rem] w-[34rem] rounded-full bg-emerald-500/18 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:34px_34px] opacity-35" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl space-y-5">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-5 md:p-7 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
          <div className="flex flex-wrap gap-3 mb-5">
            <button
              onClick={() => navigate('/hub')}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 hover:bg-white/15"
            >
              <ArrowLeft size={16} /> Volver al centro de mando
            </button>
            <button
              onClick={() => navigate('/admin/mapas')}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 hover:bg-cyan-400/20"
            >
              <Database size={16} /> Gestión de mapas
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.32em] mb-2">Caja de herramientas / Mapas</p>
              <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-none">{titulo}</h1>
              <p className="mt-4 max-w-3xl text-slate-300 font-semibold leading-relaxed">{descripcion}</p>
            </div>

            <div className="rounded-[1.7rem] border border-cyan-300/20 bg-cyan-400/10 p-4 flex items-start gap-3">
              <Info className="text-cyan-300 shrink-0" size={22} />
              <p className="text-sm text-cyan-50/80 font-semibold leading-relaxed">
                Los estudiantes ven el mapa publicado. Si hay GeoTIFF disponible, pueden cambiar la simbología de colores en vivo.
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 md:p-5 shadow-2xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">Visor interactivo</p>
                <p className="text-sm text-slate-400 font-semibold mt-1">{estado}</p>
              </div>

              <div className="flex gap-2">
                <ControlButton label="Alejar" onClick={zoomOut}><Minus size={17} /></ControlButton>
                <ControlButton label="Acercar" onClick={zoomIn}><Plus size={17} /></ControlButton>
                <ControlButton label="Reiniciar" onClick={resetView}><RotateCcw size={17} /></ControlButton>
                <ControlButton label="Pantalla completa" onClick={toggleFullscreen}><Maximize2 size={17} /></ControlButton>
              </div>
            </div>

            <div
              ref={viewerRef}
              data-cursor="interactive"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => setDragging(false)}
              className={`relative h-[62vh] min-h-[420px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-black select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/90 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-cyan-100">
                    Procesando mapa...
                  </div>
                </div>
              )}

              <img
                src={mapaUrl}
                alt="Mapa de amenaza por inundaciones"
                draggable={false}
                className="absolute left-1/2 top-1/2 max-w-none rounded-xl shadow-2xl"
                style={{
                  width: '86%',
                  transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
                  transformOrigin: 'center center'
                }}
              />

              <div className="absolute left-4 top-4 rounded-2xl bg-black/55 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 backdrop-blur-md border border-white/10">
                Zoom: {Math.round(zoom * 100)}%
              </div>

              <div className="absolute bottom-4 left-4 rounded-2xl bg-black/55 px-4 py-3 text-xs font-bold text-white/80 backdrop-blur-md border border-white/10 flex items-center gap-2">
                <Move size={16} className="text-cyan-300" /> Mover con el mouse o touch
              </div>

              <div className="absolute bottom-4 right-4 rounded-2xl bg-black/55 px-4 py-3 text-xs font-bold text-white/80 backdrop-blur-md border border-white/10">
                Modo: {renderMode === 'tif' ? 'GeoTIFF editable' : renderMode === 'preview' ? 'PNG publicado' : 'Base'}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Layers3 className="text-cyan-300" size={22} />
                <div>
                  <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.3em]">Simbología</p>
                  <h2 className="text-2xl font-black">Cambiar colores</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(susceptibilityPalettes) as PaletteName[]).map((palette) => (
                  <button
                    key={palette}
                    onClick={() => setActivePalette(palette)}
                    disabled={renderMode !== 'tif' && !tifUrl}
                    className={`rounded-2xl border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition-all ${
                      activePalette === palette
                        ? 'border-cyan-300 bg-cyan-400 text-slate-950'
                        : 'border-white/10 bg-slate-950/55 text-slate-300 hover:border-cyan-300/50'
                    }`}
                  >
                    {paletteLabels[palette]}
                  </button>
                ))}
              </div>
              {renderMode !== 'tif' && (
                <p className="mt-3 text-xs font-bold text-orange-200/80">
                  Para cambiar colores en vivo, el visor necesita leer el .tif publicado. Si falla, muestra el PNG como respaldo.
                </p>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
              <p className="text-orange-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Leyenda</p>
              <h2 className="text-2xl font-black mb-4">Susceptibilidad</h2>
              <div className="space-y-3">
                {selectedLegend.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 p-3">
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-10 rounded-lg border border-white/20" style={{ backgroundColor: item.color }} />
                      <span className="font-black text-sm">{item.label}</span>
                    </div>
                    {counts && <span className="text-[10px] font-bold text-slate-500">{counts[item.value]?.toLocaleString('es-EC')}</span>}
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-emerald-300/20 bg-emerald-400/10 p-5"
            >
              <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.28em] mb-2">Uso educativo</p>
              <h3 className="text-xl font-black">¿Para qué sirve?</h3>
              <p className="mt-3 text-slate-300 text-sm font-semibold leading-relaxed">
                Ayuda a identificar zonas con mayor amenaza de inundación y a conversar sobre rutas seguras, puntos de encuentro y prevención comunitaria.
              </p>
              {updatedAt && (
                <p className="mt-4 text-xs font-bold text-slate-500">Última actualización: {new Date(updatedAt).toLocaleString('es-EC')}</p>
              )}
            </motion.div>
          </aside>
        </section>
      </section>
    </main>
  );
};

const ControlButton = ({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    title={label}
    className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white hover:bg-cyan-400 hover:text-slate-950 transition-colors"
  >
    {children}
  </button>
);

export default MapasPage;
