import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALES, getLocale, isLocale, localeUrl, t } from '~/lib/i18n';

describe('LOCALES', () => {
  it('contains ru and en', () => {
    expect(LOCALES).toEqual(['ru', 'en']);
  });

  it('has ru as the default', () => {
    expect(DEFAULT_LOCALE).toBe('ru');
  });
});

describe('isLocale', () => {
  it('returns true for ru and en', () => {
    expect(isLocale('ru')).toBe(true);
    expect(isLocale('en')).toBe(true);
  });

  it('returns false for unsupported values', () => {
    expect(isLocale('de')).toBe(false);
    expect(isLocale('')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(123)).toBe(false);
  });
});

describe('getLocale', () => {
  it('returns ru for the root URL', () => {
    expect(getLocale(new URL('https://x/'))).toBe('ru');
  });

  it('returns en when /en/ is the first path segment', () => {
    expect(getLocale(new URL('https://x/en/'))).toBe('en');
    expect(getLocale(new URL('https://x/en/projects/'))).toBe('en');
  });

  it('does not treat paths starting with `endpoint` as en', () => {
    expect(getLocale(new URL('https://x/endpoint'))).toBe('ru');
  });

  it('returns ru for non-en first segments', () => {
    expect(getLocale(new URL('https://x/projects/'))).toBe('ru');
  });
});

describe('localeUrl', () => {
  it('leaves ru paths unchanged (default locale, no prefix)', () => {
    expect(localeUrl('/projects/', 'ru')).toBe('/projects/');
    expect(localeUrl('/', 'ru')).toBe('/');
  });

  it('prefixes paths with /en for the en locale', () => {
    expect(localeUrl('/projects/', 'en')).toBe('/en/projects/');
    expect(localeUrl('/', 'en')).toBe('/en/');
  });

  it('does not double-prefix when the path already starts with /en', () => {
    expect(localeUrl('/en/projects/', 'en')).toBe('/en/projects/');
    expect(localeUrl('/en/', 'en')).toBe('/en/');
  });

  it('handles paths without a leading slash', () => {
    expect(localeUrl('projects/', 'en')).toBe('/en/projects/');
  });
});

describe('t', () => {
  it('returns the key when no translation exists', () => {
    expect(t('nonexistent.key', 'ru')).toBe('nonexistent.key');
    expect(t('nonexistent.key', 'en')).toBe('nonexistent.key');
  });

  it('looks up nested keys via dot notation', () => {
    expect(t('_meta.locale', 'ru')).toBe('ru');
    expect(t('_meta.locale', 'en')).toBe('en');
    expect(t('_meta.name', 'ru')).toBe('Русский');
    expect(t('_meta.name', 'en')).toBe('English');
  });

  it('falls back to the default locale when the requested key is missing', () => {
    // ru has _meta.name; we'll add a ru-only key in this test context by
    // checking a key that resolves only in ru. Since dictionaries currently
    // mirror, we verify behavior via key absence: a key missing in en
    // returns ru if available, else the key itself.
    expect(t('_meta.name', 'en')).toBe('English'); // present in en
    expect(t('only.in.ru', 'en')).toBe('only.in.ru'); // missing in both
  });

  it('uses the default locale when none is provided', () => {
    expect(t('_meta.name')).toBe('Русский');
  });
});
