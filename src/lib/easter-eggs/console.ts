/**
 * Window-level console commands that toggle easter-egg state.
 * Lives apart from sequences.ts because it imports state.svelte.ts —
 * Vitest doesn't compile Svelte runes by default, so unit tests stay
 * focused on the pure sequence matchers.
 */
import { easterEggs } from '../state.svelte';
import { SECRETS } from './sequences';

/**
 * Hook console commands onto `window`. Idempotent.
 */
export function registerConsoleCommands(): void {
  if (typeof window === 'undefined') return;

  const w = window as unknown as Record<string, unknown>;

  w.help = () => {
    /* eslint-disable no-console */
    console.log(
      '%cflathead.dev — секретные команды:\n' +
        '  hire()       — нанять разработчика\n' +
        '  coffee()     — добавить кофе\n' +
        '  konami()     — читкод\n' +
        '  matrix()     — войти в матрицу\n' +
        '  flathead()   — секрет\n' +
        '  source()     — исходники',
      'color:#39ff14;font-family:monospace;line-height:1.5;',
    );
    return '— see above —';
  };

  w.konami = () => {
    easterEggs.konamiOpen = true;
    return '+99 to PHP';
  };

  w.matrix = () => {
    easterEggs.matrixActive = !easterEggs.matrixActive;
    return easterEggs.matrixActive ? 'enter the matrix' : 'leaving';
  };

  w.flathead = () => {
    easterEggs.secretMsg = SECRETS.flathead;
    return SECRETS.flathead;
  };

  w.hire = () => {
    easterEggs.secretMsg = SECRETS.hire;
    return SECRETS.hire;
  };

  w.coffee = () => {
    easterEggs.secretMsg = SECRETS.coffee;
    return SECRETS.coffee;
  };

  w.source = () => {
    easterEggs.secretMsg = SECRETS.source;
    return SECRETS.source;
  };
}
