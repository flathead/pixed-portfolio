/**
 * Pure helpers for matching keyboard sequences. No imports from
 * Svelte-rune state — this lets the unit tests run under plain Vitest
 * without requiring a Svelte transformer.
 */
export const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
] as const;

export const SECRETS = {
  flathead: 'Потому. Просто потому. 🤷',
  hire: 'hire(): отправляйся на /contact/ и заполняй квест-форму.',
  coffee: '☕ +1 cup. Эффективность +50% на ближайший час.',
  source: 'github.com/flathead/pixed-portfolio — звездани, если нравится.',
  logoFive: 'printf("Hello, secret hunter!\\n"); // ты кликнул 5 раз. уважаю.',
} as const;

/**
 * Match a typed sequence against a target word.
 */
export function matchTyped(buffer: string, target: string): boolean {
  return buffer.toLowerCase().endsWith(target.toLowerCase());
}

/**
 * Match a key-code sequence against the Konami pattern.
 */
export function matchKonami(buffer: readonly string[]): boolean {
  if (buffer.length < KONAMI_SEQUENCE.length) return false;
  const tail = buffer.slice(-KONAMI_SEQUENCE.length);
  return tail.every((code, i) => code === KONAMI_SEQUENCE[i]);
}
