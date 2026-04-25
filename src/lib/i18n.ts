import ru from '~/i18n/ru.json';
import en from '~/i18n/en.json';

export const LOCALES = ['ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ru';

const dictionaries: Record<Locale, Record<string, unknown>> = {
  ru: ru as Record<string, unknown>,
  en: en as Record<string, unknown>,
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function getLocale(url: URL): Locale {
  const segments = url.pathname.split('/').filter(Boolean);
  const first = segments[0];
  return first === 'en' ? 'en' : 'ru';
}

export function localeUrl(path: string, locale: Locale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return normalized;
  if (normalized === `/${locale}` || normalized.startsWith(`/${locale}/`)) {
    return normalized;
  }
  return `/${locale}${normalized}`;
}

function resolveKey(dict: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc !== null && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
}

export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  const value = resolveKey(dictionaries[locale], key);
  if (typeof value === 'string') return value;
  if (locale !== DEFAULT_LOCALE) {
    const fallback = resolveKey(dictionaries[DEFAULT_LOCALE], key);
    if (typeof fallback === 'string') return fallback;
  }
  return key;
}
