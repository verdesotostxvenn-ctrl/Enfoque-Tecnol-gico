import JSZip from 'jszip';
import shp from 'shpjs';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

export type Position = [number, number];

export type GeoJsonGeometry = {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: Position[][] | Position[][][];
};

export type GeoJsonFeature = {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: GeoJsonGeometry | null;
};

export type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  name?: string;
  fileName?: string;
  features: GeoJsonFeature[];
};

export const TERRITORIAL_IDS = {
  cantones: 'territorial-cantones',
  parroquias: 'territorial-parroquias'
} as const;

const publicMapCache = new Map<string, GeoJsonFeatureCollection>();

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const getFeatureName = (feature: GeoJsonFeature, fallback = 'Territorio') => {
  const entries = Object.entries(feature.properties || {});
  const preferred = entries.find(([key, value]) => {
    if (typeof value !== 'string' && typeof value !== 'number') return false;
    const normalizedKey = normalize(key);
    return (
      normalizedKey.includes('nombre') ||
      normalizedKey.includes('name') ||
      normalizedKey.includes('dpa_des') ||
      normalizedKey.includes('canton') ||
      normalizedKey.includes('parroquia')
    );
  });

  if (preferred) return String(preferred[1]);

  const firstText = entries.find(([, value]) => typeof value === 'string' && value.trim());
  return firstText ? String(firstText[1]) : fallback;
};

export const isBanosFeature = (feature: GeoJsonFeature) => {
  const searchable = Object.values(feature.properties || {})
    .filter((value) => typeof value === 'string' || typeof value === 'number')
    .join(' ');
  return normalize(searchable).includes('banos');
};

const isPolygonGeometry = (geometry: any): geometry is GeoJsonGeometry =>
  geometry?.type === 'Polygon' || geometry?.type === 'MultiPolygon';

export const normalizeFeatureCollection = (value: unknown, forcedName = ''): GeoJsonFeatureCollection => {
  const candidate = value as any;

  if (candidate?.type === 'FeatureCollection' && Array.isArray(candidate.features)) {
    const features = candidate.features
      .filter((feature: any) => feature?.type === 'Feature' && isPolygonGeometry(feature.geometry))
      .map((feature: any) => ({
        type: 'Feature' as const,
        properties: feature.properties && typeof feature.properties === 'object' ? feature.properties : {},
        geometry: feature.geometry
      }));

    if (!features.length) throw new Error('Una de las capas no contiene polígonos válidos.');

    return {
      type: 'FeatureCollection',
      name: candidate.name || forcedName,
      fileName: candidate.fileName || forcedName,
      features
    };
  }

  if (candidate?.type === 'Feature' && isPolygonGeometry(candidate.geometry)) {
    return {
      type: 'FeatureCollection',
      name: forcedName,
      fileName: forcedName,
      features: [{
        type: 'Feature',
        properties: candidate.properties && typeof candidate.properties === 'object' ? candidate.properties : {},
        geometry: candidate.geometry
      }]
    };
  }

  throw new Error('El archivo no contiene un mapa vectorial válido.');
};

const extractCollections = (value: unknown): GeoJsonFeatureCollection[] => {
  if (Array.isArray(value)) {
    return value.map((item, index) => normalizeFeatureCollection(item, `capa-${index + 1}`));
  }

  const candidate = value as any;
  if (candidate?.type === 'FeatureCollection' || candidate?.type === 'Feature') {
    return [normalizeFeatureCollection(candidate)];
  }

  if (candidate && typeof candidate === 'object') {
    return Object.entries(candidate)
      .map(([key, item]) => {
        try {
          return normalizeFeatureCollection(item, key);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as GeoJsonFeatureCollection[];
  }

  return [];
};

export const classifyCollections = (value: unknown) => {
  const collections = extractCollections(value);
  let cantones: GeoJsonFeatureCollection | null = null;
  let parroquias: GeoJsonFeatureCollection | null = null;

  for (const collection of collections) {
    const title = normalize(`${collection.fileName || ''} ${collection.name || ''}`);
    if (title.includes('parroquia')) parroquias = collection;
    else if (title.includes('canton')) cantones = collection;
  }

  if (!cantones || !parroquias) {
    for (const collection of collections) {
      const propertyKeys = collection.features
        .flatMap((feature) => Object.keys(feature.properties || {}))
        .map(normalize)
        .join(' ');

      if (!parroquias && propertyKeys.includes('parro')) parroquias = collection;
      else if (!cantones && propertyKeys.includes('canton')) cantones = collection;
    }
  }

  if (collections.length === 2) {
    cantones ||= collections.find((collection) => collection !== parroquias) || null;
    parroquias ||= collections.find((collection) => collection !== cantones) || null;
  }

  return { cantones, parroquias, collections };
};

export const parseTerritorialFiles = async (files: File[]) => {
  if (!files.length) throw new Error('Selecciona la carpeta o el ZIP con Cantones y Parroquias.');

  const directZip = files.find((file) => /\.zip$/i.test(file.name));
  let buffer: ArrayBuffer;

  if (directZip) {
    buffer = await directZip.arrayBuffer();
  } else {
    const required = files.filter((file) => /\.(shp|shx|dbf|prj|cpg)$/i.test(file.name));
    const shapeFiles = required.filter((file) => /\.shp$/i.test(file.name));

    if (shapeFiles.length < 2) {
      throw new Error('La carpeta debe incluir por lo menos Cantones.shp y Parroquias.shp con sus archivos acompañantes.');
    }

    const zip = new JSZip();
    for (const file of required) {
      const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
      zip.file(relativePath.split('/').pop() || file.name, await file.arrayBuffer());
    }
    buffer = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
  }

  const parsed = await shp(buffer as any);
  const classified = classifyCollections(parsed);

  if (!classified.cantones || !classified.parroquias) {
    const detectedNames = classified.collections.map((collection) => collection.fileName || collection.name || 'capa').join(', ');
    throw new Error(`Se leyó el archivo, pero no pude reconocer Cantones y Parroquias. Capas detectadas: ${detectedNames || 'ninguna'}. Mantén los nombres Cantones.* y Parroquias.*.`);
  }

  return {
    cantones: classified.cantones,
    parroquias: classified.parroquias
  };
};

export const publishTerritorialMaps = async (
  cantones: GeoJsonFeatureCollection,
  parroquias: GeoJsonFeatureCollection
) => {
  if (!isSupabaseConfigured) {
    throw new Error('La conexión de almacenamiento todavía no está configurada. Revisa las variables de Supabase en Vercel.');
  }

  const folder = `territorial/${Date.now()}`;
  const payloads = [
    {
      id: TERRITORIAL_IDS.cantones,
      title: 'Cantones de Tungurahua',
      description: 'Ubicación provincial con Baños de Agua Santa destacado.',
      filename: 'cantones.geojson',
      collection: cantones
    },
    {
      id: TERRITORIAL_IDS.parroquias,
      title: 'Parroquias de Baños de Agua Santa',
      description: 'Territorio cantonal dividido por parroquias.',
      filename: 'parroquias.geojson',
      collection: parroquias
    }
  ];

  for (const item of payloads) {
    const path = `${folder}/${item.filename}`;
    const blob = new Blob([JSON.stringify(item.collection)], { type: 'application/geo+json' });
    const { error: uploadError } = await supabase.storage.from('mapas').upload(path, blob, {
      upsert: true,
      contentType: 'application/geo+json'
    });
    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage.from('mapas').getPublicUrl(path);
    const { error: dbError } = await supabase.from('mapas_recursos').upsert({
      id: item.id,
      titulo: item.title,
      descripcion: item.description,
      tif_url: null,
      preview_url: publicData.publicUrl,
      storage_folder: folder,
      updated_at: new Date().toISOString()
    });
    if (dbError) throw dbError;
    publicMapCache.set(item.id, item.collection);
  }

  return folder;
};

export const fetchTerritorialMap = async (id: string) => {
  const cached = publicMapCache.get(id);
  if (cached) return cached;
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('mapas_recursos')
    .select('preview_url')
    .eq('id', id)
    .maybeSingle();

  if (error || !data?.preview_url) return null;

  const response = await fetch(data.preview_url, { cache: 'no-store' });
  if (!response.ok) throw new Error('No se pudo descargar el mapa territorial publicado.');
  const collection = normalizeFeatureCollection(await response.json());
  publicMapCache.set(id, collection);
  return collection;
};
