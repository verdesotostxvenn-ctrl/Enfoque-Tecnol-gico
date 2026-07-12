import type { PortableGeoTiffRaster } from './geotiffRenderer';

export type LocalHazardMap = {
  id: string;
  title: string;
  description: string;
  previewDataUrl: string;
  raster: PortableGeoTiffRaster;
  updatedAt: string;
};

const DB_NAME = 'mision-prevencion-local-maps';
const STORE_NAME = 'hazard-maps';
const DB_VERSION = 1;
const MARKER_PREFIX = 'mision-prevencion-hazard-map:';

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  if (!('indexedDB' in window)) {
    reject(new Error('Este navegador no permite guardar mapas localmente.'));
    return;
  }

  const request = window.indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('No se pudo abrir el almacenamiento local de mapas.'));
});

const runTransaction = async <T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void
) => {
  const database = await openDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    operation(store, resolve, reject);

    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('No se pudo completar la operación local.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('La operación local fue cancelada.'));
    };
  });
};

export const saveLocalHazardMap = async (map: LocalHazardMap) => {
  await runTransaction<void>('readwrite', (store, resolve, reject) => {
    const request = store.put(map);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  try {
    localStorage.setItem(`${MARKER_PREFIX}${map.id}`, map.updatedAt);
  } catch {
    // IndexedDB ya contiene el mapa; el marcador solo ayuda a refrescar otras pestañas.
  }

  window.dispatchEvent(new CustomEvent('hazardMapsUpdated', { detail: { id: map.id } }));
};

export const getLocalHazardMap = async (id: string) => runTransaction<LocalHazardMap | null>(
  'readonly',
  (store, resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve((request.result as LocalHazardMap | undefined) || null);
    request.onerror = () => reject(request.error);
  }
);

export const getLocalHazardMapIds = async () => runTransaction<string[]>(
  'readonly',
  (store, resolve, reject) => {
    const request = store.getAllKeys();
    request.onsuccess = () => resolve(request.result.map(String));
    request.onerror = () => reject(request.error);
  }
);
