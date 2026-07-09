export type MapResourceId = 'inundaciones' | 'volcanico' | 'deslizamientos';

export type MapResource = {
  id: MapResourceId;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  storagePrefix: string;
  fileKeywords: string[];
  accent: string;
};

export const MAP_RESOURCES: MapResource[] = [
  {
    id: 'inundaciones',
    title: 'Mapa de amenaza por inundaciones',
    shortTitle: 'Inundaciones',
    subtitle: 'Agua + zonas seguras',
    description: 'Mapa temático de susceptibilidad por inundaciones. Permite identificar niveles de amenaza, cambiar simbología, activar instituciones y revisar zonas vulnerables.',
    storagePrefix: 'inundaciones',
    fileKeywords: ['inundaciones', 'inundacion'],
    accent: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'volcanico',
    title: 'Mapa de amenaza volcánica',
    shortTitle: 'Amenaza volcánica',
    subtitle: 'Volcán + ceniza',
    description: 'Mapa temático de amenaza volcánica. Permite revisar zonas expuestas, cambiar simbología y cruzar la información con instituciones educativas.',
    storagePrefix: 'volcanico',
    fileKeywords: ['peligro_volcanico', 'peligro-volcanico', 'volcanico', 'volcan'],
    accent: 'from-orange-500 to-red-600'
  },
  {
    id: 'deslizamientos',
    title: 'Mapa de amenaza por deslizamientos',
    shortTitle: 'Deslizamientos',
    subtitle: 'Laderas + movimiento',
    description: 'Mapa temático de amenaza por deslizamientos. Ayuda a comprender zonas de ladera y sectores donde puede existir mayor susceptibilidad.',
    storagePrefix: 'deslizamientos',
    fileKeywords: ['deslizamientos', 'deslizamiento'],
    accent: 'from-emerald-500 to-lime-600'
  }
];

export const DEFAULT_MAP_RESOURCE_ID: MapResourceId = 'inundaciones';

export const getMapResource = (id: string | null | undefined): MapResource => {
  return MAP_RESOURCES.find((resource) => resource.id === id) || MAP_RESOURCES[0];
};

export const normalizeFileName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '_');

export const findResourceFile = (files: File[], resource: MapResource, extensionRegex: RegExp) => {
  const byKeyword = files.find((file) => {
    const normalized = normalizeFileName(file.name);
    return extensionRegex.test(file.name) && resource.fileKeywords.some((keyword) => normalized.includes(normalizeFileName(keyword)));
  });

  return byKeyword || files.find((file) => extensionRegex.test(file.name));
};
