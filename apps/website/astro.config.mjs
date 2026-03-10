import sitemap from '@astrojs/sitemap';
import solidJs from '@astrojs/solid-js';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../../.env', quiet: true });
}

const hidden = ['/404/', '/unsubscribe/'];

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      API_URL: envField.string({
        context: 'client',
        access: 'public',
        optional: false,
      }),
    },
  },
  site: 'https://theciviaproject.org',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    solidJs(),
    sitemap({
      serialize(item) {
        return !hidden.find((h) => item.url.endsWith(h));
      },
    }),
  ],
});
