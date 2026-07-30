import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EMAIL_ICON_RASTER,
  EMAIL_LOGO_RASTER,
  SOCIAL_ICON_KEYS,
} from '../lib/email.ts';
import { rasterizeImage } from '../lib/rasterize.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, '..');
const srcDir = join(packageRoot, 'src');
const outDir = join(
  packageRoot,
  '..',
  '..',
  'apps',
  'website',
  'public',
  'email',
);

async function main() {
  await mkdir(join(outDir, 'social'), { recursive: true });

  const logoPng = await rasterizeImage(
    join(srcDir, 'logo.svg'),
    EMAIL_LOGO_RASTER,
  );
  await writeFile(join(outDir, 'logo.png'), logoPng);

  await Promise.all(
    SOCIAL_ICON_KEYS.map(async (key) => {
      const png = await rasterizeImage(
        join(srcDir, 'social', `${key}.svg`),
        EMAIL_ICON_RASTER,
      );
      await writeFile(join(outDir, 'social', `${key}.png`), png);
    }),
  );

  console.log(`Wrote email PNGs to ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
