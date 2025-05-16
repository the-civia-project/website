// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [solidJs()],
  env: {
    schema: {
      STRIPE_PAYMENT_LINK: envField.string({
        context: "server",
        access: "public",
        optional: false,
        url: true
      })
    }
  }
});
