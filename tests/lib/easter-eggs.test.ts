import { describe, expect, it } from 'vitest';
import { KONAMI_SEQUENCE, matchKonami, matchTyped } from '~/lib/easter-eggs/sequences';

describe('matchTyped', () => {
  it('matches when buffer ends with target', () => {
    expect(matchTyped('xxflathead', 'flathead')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(matchTyped('FLATHEAD', 'flathead')).toBe(true);
    expect(matchTyped('flathead', 'FLATHEAD')).toBe(true);
  });

  it('does not match when target absent', () => {
    expect(matchTyped('hello', 'flathead')).toBe(false);
  });

  it('matches even if buffer has extra prefix', () => {
    expect(matchTyped('aaaaaaaaaaflathead', 'flathead')).toBe(true);
  });
});

describe('matchKonami', () => {
  it('matches the canonical sequence', () => {
    expect(matchKonami([...KONAMI_SEQUENCE])).toBe(true);
  });

  it('matches when sequence is at the end of a longer buffer', () => {
    expect(matchKonami(['Tab', 'Tab', ...KONAMI_SEQUENCE])).toBe(true);
  });

  it('does not match an incomplete sequence', () => {
    expect(matchKonami(KONAMI_SEQUENCE.slice(0, 5))).toBe(false);
  });

  it('does not match a wrong sequence of equal length', () => {
    const wrong = KONAMI_SEQUENCE.map(() => 'KeyZ');
    expect(matchKonami(wrong)).toBe(false);
  });
});
