/**
 * Font asset manifest.
 *
 * `PRELOAD_FONTS` is the critical subset that should be `<link rel="preload">`'d
 * in the document head — keep this list minimal (one face) to avoid blocking
 * other resources. Everything else loads lazily via `font-display: swap`.
 */
export const PRELOAD_FONTS = ['/fonts/tektur-v6-cyrillic_latin-regular.woff2'] as const;

export const ALL_FONT_FILES = [
  '/fonts/press-start-2p-v16-latin-regular.woff2',
  '/fonts/tektur-v6-cyrillic_latin-regular.woff2',
  '/fonts/tektur-v6-cyrillic_latin-700.woff2',
  '/fonts/ibm-plex-mono-v20-cyrillic_latin-regular.woff2',
  '/fonts/ibm-plex-mono-v20-cyrillic_latin-italic.woff2',
] as const;
