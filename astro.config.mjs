// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

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

  build: {
    inlineStylesheets: 'auto',
  },
});
