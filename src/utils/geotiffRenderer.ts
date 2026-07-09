import { fromArrayBuffer, fromUrl } from 'geotiff';

export type SusceptibilityClass = {
  value: number;
  label: string;
  color: string;
  rgb: number[];
};

export type PaletteName = 'institucional' | 'semaforo' | 'contraste' | 'azul' | 'gris';

export type GeoReference = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  epsg: 'EPSG:32717';
  source: 'tfw' | 'geotiff';
};

export type InstitutionPoint = {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  elevation?: number;
  xRatio?: number;
  yRatio?: number;
  threatValue?: number;
  threatLabel?: string;
  insideMap?: boolean;
};

export type GeoTiffRaster = {
  values: Uint8Array;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  counts: Record<number, number>;
  geoReference?: GeoReference;
  points?: InstitutionPoint[];
};

export type PortableGeoTiffRaster = {
  format: 'susceptibility-raster-v1';
  valuesBase64: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  counts: Record<number, number>;
  geoReference?: GeoReference;
  points?: InstitutionPoint[];
  generatedAt: string;
};

export type RenderedGeoTiff = {
  dataUrl: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  counts: Record<number, number>;
};

export const susceptibilityPalettes: Record<PaletteName, SusceptibilityClass[]> = {
  institucional: [
    { value: 1, label: 'Muy baja', color: '#1f3d2b', rgb: [31, 61, 43] },
    { value: 2, label: 'Baja', color: '#6c8f3a', rgb: [108, 143, 58] },
    { value: 3, label: 'Media', color: '#e3c53b', rgb: [227, 197, 59] },
    { value: 4, label: 'Alta', color: '#e88a3a', rgb: [232, 138, 58] },
    { value: 5, label: 'Muy alta', color: '#d94b4b', rgb: [217, 75, 75] }
  ],
  semaforo: [
    { value: 1, label: 'Muy baja', color: '#0f766e', rgb: [15, 118, 110] },
    { value: 2, label: 'Baja', color: '#22c55e', rgb: [34, 197, 94] },
    { value: 3, label: 'Media', color: '#facc15', rgb: [250, 204, 21] },
    { value: 4, label: 'Alta', color: '#f97316', rgb: [249, 115, 22] },
    { value: 5, label: 'Muy alta', color: '#ef4444', rgb: [239, 68, 68] }
  ],
  contraste: [
    { value: 1, label: 'Muy baja', color: '#102a43', rgb: [16, 42, 67] },
    { value: 2, label: 'Baja', color: '#2f80ed', rgb: [47, 128, 237] },
    { value: 3, label: 'Media', color: '#f2c94c', rgb: [242, 201, 76] },
    { value: 4, label: 'Alta', color: '#f2994a', rgb: [242, 153, 74] },
    { value: 5, label: 'Muy alta', color: '#eb5757', rgb: [235, 87, 87] }
  ],
  azul: [
    { value: 1, label: 'Muy baja', color: '#e0f2fe', rgb: [224, 242, 254] },
    { value: 2, label: 'Baja', color: '#7dd3fc', rgb: [125, 211, 252] },
    { value: 3, label: 'Media', color: '#38bdf8', rgb: [56, 189, 248] },
    { value: 4, label: 'Alta', color: '#0284c7', rgb: [2, 132, 199] },
    { value: 5, label: 'Muy alta', color: '#0f172a', rgb: [15, 23, 42] }
  ],
  gris: [
    { value: 1, label: 'Muy baja', color: '#f8fafc', rgb: [248, 250, 252] },
    { value: 2, label: 'Baja', color: '#cbd5e1', rgb: [203, 213, 225] },
    { value: 3, label: 'Media', color: '#94a3b8', rgb: [148, 163, 184] },
    { value: 4, label: 'Alta', color: '#475569', rgb: [71, 85, 105] },
    { value: 5, label: 'Muy alta', color: '#0f172a', rgb: [15, 23, 42] }
  ]
};

export const susceptibilityLegend = susceptibilityPalettes.institucional;

const getBand = (rasters: unknown): ArrayLike<number> => {
  const value = rasters as any;
  if (Array.isArray(value)) return value[0] as ArrayLike<number>;
  if (value?.[0]) return value[0] as ArrayLike<number>;
  return value as ArrayLike<number>;
};

const uint8ToBase64 = (values: Uint8Array) => {
  const chunkSize = 0x8000;
  let binary = '';

  for (let i = 0; i < values.length; i += chunkSize) {
    const chunk = values.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

const base64ToUint8 = (base64: string) => {
  const binary = atob(base64);
  const values = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    values[i] = binary.charCodeAt(i);
  }

  return values;
};

export const parseWorldFileContent = (content: string): GeoReference | null => {
  const values = content
    .split(/\r?\n/)
    .map((line) => Number(line.trim()))
    .filter((value) => Number.isFinite(value));

  if (values.length < 6) return null;

  return {
    a: values[0],
    d: values[1],
    b: values[2],
    e: values[3],
    c: values[4],
    f: values[5],
    epsg: 'EPSG:32717',
    source: 'tfw'
  };
};

const getGeoReferenceFromImage = (image: any): GeoReference | undefined => {
  try {
    const directory = image.getFileDirectory?.();
    const tiePoints = image.getTiePoints?.();
    const scale = directory?.ModelPixelScale;
    const tie = tiePoints?.[0];

    if (!scale || !tie) return undefined;

    return {
      a: Number(scale[0]),
      b: 0,
      c: Number(tie.x) - Number(tie.i || 0) * Number(scale[0]),
      d: 0,
      e: -Number(scale[1]),
      f: Number(tie.y) + Number(tie.j || 0) * Number(scale[1]),
      epsg: 'EPSG:32717',
      source: 'geotiff'
    };
  } catch {
    return undefined;
  }
};

export const parseKmlInstitutions = (content: string): InstitutionPoint[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'application/xml');
  const placemarks = Array.from(doc.getElementsByTagNameNS('*', 'Placemark'));

  return placemarks.flatMap((placemark, index) => {
    const name = placemark.getElementsByTagNameNS('*', 'name')[0]?.textContent?.trim() || `Institución ${index + 1}`;
    const coordinates = placemark.getElementsByTagNameNS('*', 'coordinates')[0]?.textContent?.trim();

    if (!coordinates) return [];

    const firstCoordinate = coordinates.split(/\s+/)[0];
    const [lon, lat, elevation] = firstCoordinate.split(',').map(Number);

    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return [];

    return [{
      id: `${index + 1}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name,
      longitude: lon,
      latitude: lat,
      elevation: Number.isFinite(elevation) ? elevation : undefined
    }];
  });
};

const wgs84ToUtm17South = (longitude: number, latitude: number) => {
  const a = 6378137;
  const f = 1 / 298.257223563;
  const e2 = f * (2 - f);
  const ep2 = e2 / (1 - e2);
  const k0 = 0.9996;
  const zone = 17;
  const lon0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;
  const lat = latitude * Math.PI / 180;
  const lon = longitude * Math.PI / 180;
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const tanLat = Math.tan(lat);
  const n = a / Math.sqrt(1 - e2 * sinLat * sinLat);
  const t = tanLat * tanLat;
  const c = ep2 * cosLat * cosLat;
  const aa = cosLat * (lon - lon0);
  const m = a * (
    (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * lat
    - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * lat)
    + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * lat)
    - (35 * e2 ** 3 / 3072) * Math.sin(6 * lat)
  );

  const easting = k0 * n * (
    aa + (1 - t + c) * aa ** 3 / 6 + (5 - 18 * t + t ** 2 + 72 * c - 58 * ep2) * aa ** 5 / 120
  ) + 500000;

  let northing = k0 * (
    m + n * tanLat * (aa ** 2 / 2 + (5 - t + 9 * c + 4 * c ** 2) * aa ** 4 / 24 + (61 - 58 * t + t ** 2 + 600 * c - 330 * ep2) * aa ** 6 / 720)
  );

  if (latitude < 0) northing += 10000000;

  return { easting, northing };
};

const worldToPixel = (geoReference: GeoReference, x: number, y: number) => {
  const det = geoReference.a * geoReference.e - geoReference.b * geoReference.d;

  if (Math.abs(det) < 1e-12) return null;

  const dx = x - geoReference.c;
  const dy = y - geoReference.f;
  const col = (geoReference.e * dx - geoReference.b * dy) / det;
  const row = (-geoReference.d * dx + geoReference.a * dy) / det;

  return { col, row };
};

export const positionInstitutionPoints = (
  points: InstitutionPoint[],
  raster: GeoTiffRaster
): InstitutionPoint[] => {
  if (!raster.geoReference) return points.map((point) => ({ ...point, insideMap: false }));

  return points.map((point) => {
    const utm = wgs84ToUtm17South(point.longitude, point.latitude);
    const pixel = worldToPixel(raster.geoReference!, utm.easting, utm.northing);

    if (!pixel) return { ...point, insideMap: false };

    const xRatio = pixel.col / raster.originalWidth;
    const yRatio = pixel.row / raster.originalHeight;
    const insideMap = xRatio >= 0 && xRatio <= 1 && yRatio >= 0 && yRatio <= 1;
    const px = Math.min(raster.width - 1, Math.max(0, Math.floor(xRatio * raster.width)));
    const py = Math.min(raster.height - 1, Math.max(0, Math.floor(yRatio * raster.height)));
    const threatValue = insideMap ? raster.values[py * raster.width + px] : undefined;
    const threatLabel = susceptibilityLegend.find((item) => item.value === threatValue)?.label;

    return {
      ...point,
      xRatio,
      yRatio,
      threatValue,
      threatLabel,
      insideMap
    };
  });
};

export const rasterToPortablePayload = (raster: GeoTiffRaster): PortableGeoTiffRaster => ({
  format: 'susceptibility-raster-v1',
  valuesBase64: uint8ToBase64(raster.values),
  width: raster.width,
  height: raster.height,
  originalWidth: raster.originalWidth,
  originalHeight: raster.originalHeight,
  counts: raster.counts,
  geoReference: raster.geoReference,
  points: raster.points,
  generatedAt: new Date().toISOString()
});

export const portablePayloadToRaster = (payload: PortableGeoTiffRaster): GeoTiffRaster => ({
  values: base64ToUint8(payload.valuesBase64),
  width: payload.width,
  height: payload.height,
  originalWidth: payload.originalWidth,
  originalHeight: payload.originalHeight,
  counts: payload.counts,
  geoReference: payload.geoReference,
  points: payload.points || []
});

export const fetchPortableRaster = async (url: string): Promise<GeoTiffRaster> => {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('No se pudo cargar el raster procesado.');
  }

  const payload = await response.json() as PortableGeoTiffRaster;

  if (payload.format !== 'susceptibility-raster-v1' || !payload.valuesBase64) {
    throw new Error('El raster procesado no tiene el formato correcto.');
  }

  return portablePayloadToRaster(payload);
};

export const loadGeoTiffRaster = async (
  source: File | string,
  maxDimension = 1200,
  externalGeoReference?: GeoReference | null
): Promise<GeoTiffRaster> => {
  const tiff = typeof source === 'string'
    ? await fromUrl(source)
    : await fromArrayBuffer(await source.arrayBuffer());

  const image = await tiff.getImage();
  const originalWidth = image.getWidth();
  const originalHeight = image.getHeight();
  const scale = Math.min(1, maxDimension / Math.max(originalWidth, originalHeight));
  const width = Math.max(1, Math.round(originalWidth * scale));
  const height = Math.max(1, Math.round(originalHeight * scale));
  const geoReference = externalGeoReference || getGeoReferenceFromImage(image);

  const rasters = await image.readRasters({
    samples: [0],
    width,
    height,
    resampleMethod: 'nearest'
  } as any);

  const band = getBand(rasters);
  const values = new Uint8Array(width * height);
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (let i = 0; i < width * height; i += 1) {
    const value = Math.round(Number(band[i]));
    if (value >= 1 && value <= 5) {
      values[i] = value;
      counts[value] += 1;
    }
  }

  return {
    values,
    width,
    height,
    originalWidth,
    originalHeight,
    counts,
    geoReference
  };
};

export const renderRasterToDataUrl = (
  raster: GeoTiffRaster,
  palette: SusceptibilityClass[] = susceptibilityLegend
): string => {
  const colorByValue = new Map(palette.map((item) => [item.value, item.rgb]));
  const canvas = document.createElement('canvas');
  canvas.width = raster.width;
  canvas.height = raster.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo crear el canvas para renderizar el mapa.');
  }

  const imageData = ctx.createImageData(raster.width, raster.height);

  for (let i = 0; i < raster.width * raster.height; i += 1) {
    const value = raster.values[i];
    const color = colorByValue.get(value);
    const offset = i * 4;

    if (color) {
      imageData.data[offset] = color[0];
      imageData.data[offset + 1] = color[1];
      imageData.data[offset + 2] = color[2];
      imageData.data[offset + 3] = 255;
    } else {
      imageData.data[offset] = 255;
      imageData.data[offset + 1] = 255;
      imageData.data[offset + 2] = 255;
      imageData.data[offset + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
};

export const renderGeoTiffSource = async (
  source: File | string,
  maxDimension = 1200,
  palette: SusceptibilityClass[] = susceptibilityLegend
): Promise<RenderedGeoTiff> => {
  const raster = await loadGeoTiffRaster(source, maxDimension);

  return {
    dataUrl: renderRasterToDataUrl(raster, palette),
    width: raster.width,
    height: raster.height,
    originalWidth: raster.originalWidth,
    originalHeight: raster.originalHeight,
    counts: raster.counts
  };
};

export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};
