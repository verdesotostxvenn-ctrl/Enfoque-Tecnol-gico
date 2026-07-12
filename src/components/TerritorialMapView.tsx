import { useMemo, useState } from 'react';
import type { GeoJsonFeature, GeoJsonFeatureCollection, Position } from '../utils/territorialMaps';
import { getFeatureName, isBanosFeature } from '../utils/territorialMaps';

type Props = {
  collection: GeoJsonFeatureCollection | null;
  mode: 'cantones' | 'parroquias';
  className?: string;
};

const COLORS = ['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#3b82f6', '#84cc16'];

const flattenPositions = (feature: GeoJsonFeature): Position[] => {
  if (!feature.geometry) return [];
  const coords = feature.geometry.coordinates as any;
  const output: Position[] = [];
  const walk = (value: any) => {
    if (Array.isArray(value) && typeof value[0] === 'number' && typeof value[1] === 'number') output.push(value as Position);
    else if (Array.isArray(value)) value.forEach(walk);
  };
  walk(coords);
  return output;
};

const TerritorialMapView = ({ collection, mode, className = '' }: Props) => {
  const [activeName, setActiveName] = useState('');

  const projected = useMemo(() => {
    if (!collection?.features.length) return null;
    const points = collection.features.flatMap(flattenPositions);
    if (!points.length) return null;

    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = Math.max(maxX - minX, 0.000001);
    const height = Math.max(maxY - minY, 0.000001);
    const pad = 24;
    const viewW = 760;
    const viewH = 470;
    const scale = Math.min((viewW - pad * 2) / width, (viewH - pad * 2) / height);
    const offsetX = (viewW - width * scale) / 2;
    const offsetY = (viewH - height * scale) / 2;
    const p = ([x, y]: Position) => [offsetX + (x - minX) * scale, viewH - (offsetY + (y - minY) * scale)];

    const pathFor = (feature: GeoJsonFeature) => {
      if (!feature.geometry) return '';
      const polygons = feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates as Position[][]]
        : feature.geometry.coordinates as Position[][][];
      return polygons.map((polygon) => polygon.map((ring) => ring.map((point, index) => {
        const [x, y] = p(point);
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      }).join(' ') + ' Z').join(' ')).join(' ');
    };

    return { viewW, viewH, pathFor };
  }, [collection]);

  if (!collection || !projected) {
    return (
      <div className={`flex min-h-[300px] items-center justify-center rounded-[1.8rem] border border-dashed border-white/15 bg-slate-950/70 p-8 text-center ${className}`}>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">Mapa territorial pendiente</p>
          <p className="mt-3 max-w-md text-sm font-semibold leading-relaxed text-slate-400">Sube la carpeta de Cantones y Parroquias desde la gestión territorial. Cuando se publique, aparecerá aquí automáticamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white p-3 shadow-2xl ${className}`}>
      <svg viewBox={`0 0 ${projected.viewW} ${projected.viewH}`} className="h-full min-h-[300px] w-full" role="img" aria-label={mode === 'cantones' ? 'Mapa de cantones de Tungurahua' : 'Mapa de parroquias de Baños'}>
        {collection.features.map((feature, index) => {
          const name = getFeatureName(feature, `${mode === 'cantones' ? 'Cantón' : 'Parroquia'} ${index + 1}`);
          const banos = isBanosFeature(feature);
          const fill = mode === 'cantones' ? (banos ? '#ef4444' : '#cbd5e1') : COLORS[index % COLORS.length];
          return (
            <path
              key={`${name}-${index}`}
              d={projected.pathFor(feature)}
              fill={fill}
              stroke={banos ? '#7f1d1d' : '#0f172a'}
              strokeWidth={banos ? 3 : 1.4}
              className="cursor-interactive transition-opacity hover:opacity-80"
              onPointerEnter={() => setActiveName(name)}
              onPointerLeave={() => setActiveName('')}
            >
              <title>{name}</title>
            </path>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-slate-950/90 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-xl">
        {activeName || (mode === 'cantones' ? 'Explora los cantones' : 'Explora las parroquias')}
      </div>
      {mode === 'cantones' && (
        <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-black text-slate-900 shadow-xl">
          <span className="h-3 w-3 rounded-full bg-red-500" /> Baños de Agua Santa
        </div>
      )}
    </div>
  );
};

export default TerritorialMapView;
