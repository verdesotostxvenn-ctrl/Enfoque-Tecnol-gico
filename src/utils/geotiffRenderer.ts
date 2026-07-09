import { fromArrayBuffer, fromUrl } from 'geotiff';

export type RenderedGeoTiff = {
  dataUrl: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  counts: Record<number, number>;
};

export const susceptibilityLegend = [
  { value: 1, label: 'Muy baja', color: '#1f3d2b', rgb: [31, 61, 43] },
  { value: 2, label: 'Baja', color: '#6c8f3a', rgb: [108, 143, 58] },
  { value: 3, label: 'Media', color: '#e3c53b', rgb: [227, 197, 59] },
  { value: 4, label: 'Alta', color: '#e88a3a', rgb: [232, 138, 58] },
  { value: 5, label: 'Muy alta', color: '#d94b4b', rgb: [217, 75, 75] }
];

const colorByValue = new Map(susceptibilityLegend.map((item) => [item.value, item.rgb]));

const getBand = (rasters: unknown): ArrayLike<number> => {
  const value = rasters as any;
  if (Array.isArray(value)) return value[0] as ArrayLike<number>;
  if (value?.[0]) return value[0] as ArrayLike<number>;
  return value as ArrayLike<number>;
};

export const renderGeoTiffSource = async (
  source: File | string,
  maxDimension = 1600
): Promise<RenderedGeoTiff> => {
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
