import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

export type RasterizeOptions = {
  width: number;
  height: number;
};

export async function rasterizeImage(
  absolutePath: string,
  { width, height }: RasterizeOptions,
): Promise<Buffer> {
  const input = await readFile(absolutePath);

  return sharp(input, { density: 300 })
    .resize(width, height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}
