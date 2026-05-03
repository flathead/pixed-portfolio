/**
 * Barrel for easter-egg runtime. Components import from this module;
 * unit tests import from `./sequences` directly to skip the
 * state.svelte.ts dependency.
 */
export { KONAMI_SEQUENCE, SECRETS, matchKonami, matchTyped } from './sequences';

export { registerConsoleCommands } from './console';
