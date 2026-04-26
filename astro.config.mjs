// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// On Node versions where sharp prebuilt binaries are unavailable
// (e.g. Node 25), set ASTRO_IMAGES=passthrough to skip optimization.
// CI runs on Node 22 LTS with working sharp — leave the env unset there.
const usePassthrough = process.env.ASTRO_IMAGES === 'passthrough';

export default defineConfig({
  site: 'https://flathead.is-a.dev',
  trailingSlash: 'always',

  integrations: [svelte(), mdx({ gfm: true }), sitemap()],

  i18n: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
    fallback: { en: 'ru' },
  },

  image: usePassthrough ? { service: passthroughImageService() } : {},

  build: {
    inlineStylesheets: 'auto',
  },
});
