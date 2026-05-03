/**
 * Theme palette definitions and pure helpers for applying them.
 *
 * A theme overrides 5 pairs of CSS variables (green/cyan/magenta/yellow/purple
 * and their *-dim siblings). Background, surface, and text variables stay
 * as defined in `tokens.scss` — themes only swap the accent family.
 *
 * Apply a theme by calling `applyTheme(key, document.documentElement)` in
 * the browser. The pre-hydration inline script in BaseLayout uses the same
 * data to set vars before any island mounts.
 */
export const THEME_KEYS = [
  'matrix',
  'amber',
  'cyberpunk',
  'gameboy',
  'synthwave',
  'ocean',
] as const;

export type ThemeKey = (typeof THEME_KEYS)[number];
export const DEFAULT_THEME: ThemeKey = 'matrix';

interface ThemeDef {
  label: string;
  swatches: readonly [string, string, string];
  vars: Readonly<Record<string, string>>;
}

export const THEMES: Readonly<Record<ThemeKey, ThemeDef>> = {
  matrix: {
    label: 'Matrix',
    swatches: ['#39ff14', '#00e5ff', '#ff006e'],
    vars: {
      '--green': '#39ff14',
      '--green-dim': '#0f3d1a',
      '--cyan': '#00e5ff',
      '--cyan-dim': '#003540',
      '--magenta': '#ff006e',
      '--magenta-dim': '#40001a',
      '--yellow': '#ffd700',
      '--yellow-dim': '#403600',
      '--purple': '#9b59b6',
      '--purple-dim': '#2a1540',
    },
  },
  amber: {
    label: 'Amber CRT',
    swatches: ['#ffb000', '#ff8c00', '#ff006e'],
    vars: {
      '--green': '#ffb000',
      '--green-dim': '#3d2a00',
      '--cyan': '#ff8c00',
      '--cyan-dim': '#402000',
      '--magenta': '#ff006e',
      '--magenta-dim': '#40001a',
      '--yellow': '#ffd700',
      '--yellow-dim': '#403600',
      '--purple': '#ff5f00',
      '--purple-dim': '#3d1800',
    },
  },
  cyberpunk: {
    label: 'Cyberpunk',
    swatches: ['#ff00ff', '#00e5ff', '#fff200'],
    vars: {
      '--green': '#ff00ff',
      '--green-dim': '#400040',
      '--cyan': '#00e5ff',
      '--cyan-dim': '#003540',
      '--magenta': '#ff0077',
      '--magenta-dim': '#40001f',
      '--yellow': '#fff200',
      '--yellow-dim': '#403d00',
      '--purple': '#b26bff',
      '--purple-dim': '#2a1740',
    },
  },
  gameboy: {
    label: 'Game Boy',
    swatches: ['#9bbc0f', '#8bac0f', '#306230'],
    vars: {
      '--green': '#9bbc0f',
      '--green-dim': '#1e2a0a',
      '--cyan': '#8bac0f',
      '--cyan-dim': '#2a3d08',
      '--magenta': '#306230',
      '--magenta-dim': '#0a1a0a',
      '--yellow': '#cdd6a6',
      '--yellow-dim': '#3d4033',
      '--purple': '#0f380f',
      '--purple-dim': '#05100a',
    },
  },
  synthwave: {
    label: 'Synthwave',
    swatches: ['#ff2975', '#ff8a3d', '#00e5ff'],
    vars: {
      '--green': '#ff2975',
      '--green-dim': '#40001a',
      '--cyan': '#00e5ff',
      '--cyan-dim': '#003540',
      '--magenta': '#ff8a3d',
      '--magenta-dim': '#40200f',
      '--yellow': '#fee440',
      '--yellow-dim': '#403d0f',
      '--purple': '#b347ff',
      '--purple-dim': '#2a1040',
    },
  },
  ocean: {
    label: 'Deep Sea',
    swatches: ['#4cc9f0', '#7209b7', '#f72585'],
    vars: {
      '--green': '#4cc9f0',
      '--green-dim': '#0f3340',
      '--cyan': '#7209b7',
      '--cyan-dim': '#1a0240',
      '--magenta': '#f72585',
      '--magenta-dim': '#400a1f',
      '--yellow': '#ffd166',
      '--yellow-dim': '#403520',
      '--purple': '#4361ee',
      '--purple-dim': '#10173d',
    },
  },
};

export const STORAGE_KEY = 'pdev-theme';

export function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === 'string' && (THEME_KEYS as readonly string[]).includes(value);
}

export function applyTheme(key: ThemeKey, root: HTMLElement): void {
  const theme = THEMES[key];
  for (const [k, v] of Object.entries(theme.vars)) {
    root.style.setProperty(k, v);
  }
}

export function readStoredTheme(storage: Storage): ThemeKey {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return isThemeKey(raw) ? raw : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function writeStoredTheme(storage: Storage, key: ThemeKey): void {
  try {
    storage.setItem(STORAGE_KEY, key);
  } catch {
    // localStorage may be disabled — fail silently.
  }
}
