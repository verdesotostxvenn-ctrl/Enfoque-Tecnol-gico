import { fromArrayBuffer, fromUrl } from 'geotiff';

export type SusceptibilityClass = {
  value: number;
  label: string;
  color: string;
  rgb: number[];
};

export type PaletteName = 'institucional' | 'semaforo' | 'contraste' | 'azul' | 'gris';

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

export const renderGeoTiffSource = async (
  source: File | string,
  maxDimension = 1600,
  palette: SusceptibilityClass[] = susceptibilityLegend
): Promise<RenderedGeoTiff> => {
  const colorByValue = new Map(palette.map((item) => [item.value, item.rgb]));
  const tiff = typeof source === 'string'
    ? await fromUrl(source)
    : await fromArrayBuffer(await source.arrayBuffer());

  const image = await tiff.getImage();
  const originalWidth = image.getWidth();
  const originalHeight = image.getHeight();
  const scale = Math.min(1, maxDimension / Math.max(originalWidth, originalHeight));
  const width = Math.max(1, Math.round(originalWidth * scale));
  const height = Math.max(1, Math.round(originalHeight * scale));

  const rasters = await image.readRasters({
    samples: [0],
    width,
    height,
    resampleMethod: 'nearest'
  } as any);

  const band = getBand(rasters);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo crear el canvas para renderizar el mapa.');
  }

  const imageData = ctx.createImageData(width, height);
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (let i = 0; i < width * height; i += 1) {
    const rawValue = Number(band[i]);
    const value = Math.round(rawValue);
    const color = colorByValue.get(value);
    const offset = i * 4;

    if (color) {
      imageData.data[offset] = color[0];
      imageData.data[offset + 1] = color[1];
      imageData.data[offset + 2] = color[2];
      imageData.data[offset + 3] = 255;
      counts[value] += 1;
    } else {
      imageData.data[offset] = 0;
      imageData.data[offset + 1] = 0;
      imageData.data[offset + 2] = 0;
      imageData.data[offset + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width,
    height,
    originalWidth,
    originalHeight,
    counts
  };
};

export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};
