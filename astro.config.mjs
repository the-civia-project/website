// @ts-check
import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    site: "https://theciviaproject.org",
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [solidJs(), sitemap()],
});