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

export type TerritorialStorageMode = 'bucket' | 'database' | 'local';

const publicMapCache = new Map<string, GeoJsonFeatureCollection>();
const STORAGE_BUCKET = 'mapas';
const LOCAL_PREFIX = 'mision-prevencion:territorio:';

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
      throw new Error('La carpeta debe incluir Cantones.shp y Parroquias.shp con sus archivos acompañantes.');
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

const simplifyRing = (ring: Position[], maxPoints = 180): Position[] => {
  const valid = ring.filter((point) => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]));
  if (valid.length <= maxPoints) return valid;

  const step = Math.ceil(valid.length / maxPoints);
  const sampled = valid.filter((_, index) => index === 0 || index === valid.length - 1 || index % step === 0);
  const first = sampled[0];
  const last = sampled[sampled.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) sampled.push(first);
  return sampled;
};

const optimizeCollectionForPublishing = (collection: GeoJsonFeatureCollection): GeoJsonFeatureCollection => ({
  type: 'FeatureCollection',
  name: collection.name,
  fileName: collection.fileName,
  features: collection.features.map((feature) => {
    if (!feature.geometry) return feature;

    const geometry: GeoJsonGeometry = feature.geometry.type === 'Polygon'
      ? {
          type: 'Polygon',
          coordinates: (feature.geometry.coordinates as Position[][]).map((ring) => simplifyRing(ring))
        }
      : {
          type: 'MultiPolygon',
          coordinates: (feature.geometry.coordinates as Position[][][]).map((polygon) =>
            polygon.map((ring) => simplifyRing(ring))
          )
        };

    return { type: 'Feature', properties: feature.properties, geometry };
  })
});

const encodeDataUrl = (collection: GeoJsonFeatureCollection) => {
  const bytes = new TextEncoder().encode(JSON.stringify(collection));
  let binary = '';
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }

  return `data:application/geo+json;base64,${btoa(binary)}`;
};

const decodeDataUrl = (url: string) => {
  const commaIndex = url.indexOf(',');
  if (commaIndex < 0) throw new Error('El mapa guardado no tiene un formato válido.');

  const metadata = url.slice(0, commaIndex);
  const payload = url.slice(commaIndex + 1);
  const binary = metadata.includes(';base64') ? atob(payload) : decodeURIComponent(payload);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
};

const saveLocalMap = (id: string, collection: GeoJsonFeatureCollection) => {
  try {
    localStorage.setItem(`${LOCAL_PREFIX}${id}`, JSON.stringify(collection));
  } catch (error) {
    console.warn('No se pudo guardar el mapa territorial en el navegador:', error);
  }
};

const readLocalMap = (id: string) => {
  try {
    const value = localStorage.getItem(`${LOCAL_PREFIX}${id}`);
    return value ? normalizeFeatureCollection(JSON.parse(value)) : null;
  } catch {
    return null;
  }
};

export const readStoredTerritorialMaps = () => ({
  cantones: readLocalMap(TERRITORIAL_IDS.cantones),
  parroquias: readLocalMap(TERRITORIAL_IDS.parroquias)
});

const delay = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const fetchRemoteJson = async (url: string, version = '') => {
  const separator = url.includes('?') ? '&' : '?';
  const requestUrl = version && !url.startsWith('data:')
    ? `${url}${separator}v=${encodeURIComponent(version)}`
    : url;

  let lastError: unknown = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(requestUrl, {
        cache: 'no-store',
        headers: { Accept: 'application/json, application/geo+json' }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 2) await delay(300 * (attempt + 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('No se pudo descargar el mapa publicado.');
};

const isMissingBucketError = (error: any) => {
  const message = String(error?.message || error || '').toLowerCase();
  return message.includes('bucket not found') || (message.includes('bucket') && message.includes('not found'));
};

const isMissingTableError = (error: any) => {
  const message = String(error?.message || error || '').toLowerCase();
  return (
    message.includes('could not find the table') ||
    message.includes('schema cache') ||
    message.includes('mapas_recursos') && message.includes('not found')
  );
};

export const publishTerritorialMaps = async (
  cantones: GeoJsonFeatureCollection,
  parroquias: GeoJsonFeatureCollection
) => {
  const optimizedCantones = optimizeCollectionForPublishing(cantones);
  const optimizedParroquias = optimizeCollectionForPublishing(parroquias);

  saveLocalMap(TERRITORIAL_IDS.cantones, optimizedCantones);
  saveLocalMap(TERRITORIAL_IDS.parroquias, optimizedParroquias);
  publicMapCache.set(TERRITORIAL_IDS.cantones, optimizedCantones);
  publicMapCache.set(TERRITORIAL_IDS.parroquias, optimizedParroquias);
  window.dispatchEvent(new Event('territorialMapsUpdated'));

  if (!isSupabaseConfigured) {
    return {
      folder: 'local-browser',
      storageMode: 'local' as TerritorialStorageMode,
      warning: 'Supabase no está configurado. Los mapas quedaron guardados en este navegador.'
    };
  }

  const folder = `territorial/${Date.now()}`;
  let allStoredInline = true;

  const payloads = [
    {
      id: TERRITORIAL_IDS.cantones,
      title: 'Cantones de Tungurahua',
      description: 'Ubicación provincial con Baños de Agua Santa destacado.',
      filename: 'cantones.geojson',
      collection: optimizedCantones
    },
    {
      id: TERRITORIAL_IDS.parroquias,
      title: 'Parroquias de Baños de Agua Santa',
      description: 'Territorio cantonal dividido por parroquias.',
      filename: 'parroquias.geojson',
      collection: optimizedParroquias
    }
  ];

  for (const item of payloads) {
    const path = `${folder}/${item.filename}`;
    const json = JSON.stringify(item.collection);
    const blob = new Blob([json], { type: 'application/geo+json' });
    const inlineUrl = encodeDataUrl(item.collection);
    let backupUrl = '';
    let storageFolder = 'database-inline';

    // Storage queda como respaldo. La copia principal se guarda dentro de la
    // fila de mapas_recursos para evitar fallos de CORS, caché o enlaces públicos.
    try {
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
        upsert: true,
        contentType: 'application/geo+json'
      });

      if (!uploadError) {
        const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        backupUrl = publicData.publicUrl;
        storageFolder = folder;
      } else if (!isMissingBucketError(uploadError)) {
        console.warn('Storage no pudo guardar el respaldo territorial:', uploadError.message || uploadError);
      }
    } catch (uploadError) {
      console.warn('Storage no pudo guardar el respaldo territorial:', uploadError);
    }

    const baseRecord = {
      id: item.id,
      titulo: item.title,
      descripcion: item.description,
      tif_url: backupUrl || null,
      storage_folder: storageFolder,
      updated_at: new Date().toISOString()
    };

    // Método principal: GeoJSON optimizado embebido en la base de datos.
    let { error: dbError } = await supabase.from('mapas_recursos').upsert({
      ...baseRecord,
      preview_url: inlineUrl
    });

    // Si el proveedor rechaza un payload grande, conserva como respaldo la URL
    // pública de Storage en vez de dejarlo únicamente en el navegador.
    if (dbError && backupUrl) {
      allStoredInline = false;
      const retry = await supabase.from('mapas_recursos').upsert({
        ...baseRecord,
        preview_url: backupUrl
      });
      dbError = retry.error;
    }

    if (dbError) {
      const details = isMissingTableError(dbError)
        ? 'La tabla mapas_recursos todavía no está disponible para la API de este proyecto.'
        : dbError.message;

      return {
        folder: 'local-browser',
        storageMode: 'local' as TerritorialStorageMode,
        warning: `Los mapas quedaron guardados en este navegador. ${details}`
      };
    }
  }

  return {
    folder,
    storageMode: (allStoredInline ? 'database' : 'bucket') as TerritorialStorageMode,
    warning: ''
  };
};

export const fetchTerritorialMap = async (id: string, forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = publicMapCache.get(id);
    if (cached) return cached;
  } else {
    publicMapCache.delete(id);
  }

  if (isSupabaseConfigured) {
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const { data, error } = await supabase
          .from('mapas_recursos')
          .select('preview_url,tif_url,updated_at')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        const candidates = [data?.preview_url, data?.tif_url]
          .filter((value): value is string => Boolean(value));

        for (const candidate of candidates) {
          try {
            const raw = candidate.startsWith('data:')
              ? decodeDataUrl(candidate)
              : await fetchRemoteJson(candidate, String(data?.updated_at || ''));

            const collection = normalizeFeatureCollection(raw);
            publicMapCache.set(id, collection);
            saveLocalMap(id, collection);
            return collection;
          } catch (candidateError) {
            lastError = candidateError;
          }
        }

        if (!candidates.length) {
          lastError = new Error('El registro territorial existe, pero no contiene datos publicados.');
        }
      } catch (error) {
        lastError = error;
      }

      if (attempt < 2) await delay(350 * (attempt + 1));
    }

    if (lastError) console.warn('No se pudo consultar el mapa territorial remoto:', lastError);
  }

  const local = readLocalMap(id);
  if (local) publicMapCache.set(id, local);
  return local;
};
