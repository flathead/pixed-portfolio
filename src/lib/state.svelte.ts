/**
 * Cross-island reactive state via Svelte 5 runes.
 *
 * Imported by every interactive island so they share one source of truth
 * without resorting to global events or the legacy `writable` store API.
 *
 * The `.svelte.ts` extension is required for `$state` outside of `.svelte`
 * components.
 */
import { DEFAULT_THEME, type ThemeKey } from './themes';

/**
 * Easter egg presentation flags. Toggled by EasterEggs.svelte and consumed
 * by KonamiOverlay/SecretMsg/MatrixRain to decide whether to render.
 */
export const easterEggs = $state({
  konamiOpen: false,
  matrixActive: false,
  secretMsg: null as string | null,
});

/**
 * Currently active theme. Synced to localStorage by ThemeTweaker.svelte.
 * The default is overwritten on mount once the persisted value is read.
 */
export const themeState = $state({
  theme: DEFAULT_THEME as ThemeKey,
});
