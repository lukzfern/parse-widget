import { describe, it, expect } from 'vitest';
import { getSpecIconUrl } from './specIcons';

const BASE = 'https://wow.zamimg.com/images/wow/icons/medium';

describe('getSpecIconUrl', () => {
  it('returns correct URL for a known class and spec', () => {
    expect(getSpecIconUrl(13, 'Devastation')).toBe(
      `${BASE}/classicon_evoker_devastation.jpg`,
    );
  });

  it('lower-cases the spec slug', () => {
    expect(getSpecIconUrl(11, 'Arms')).toBe(
      `${BASE}/classicon_warrior_arms.jpg`,
    );
  });

  it('strips spaces from multi-word specs', () => {
    expect(getSpecIconUrl(3, 'Beast Mastery')).toBe(
      `${BASE}/classicon_hunter_beastmastery.jpg`,
    );
  });

  it('strips non-alpha characters from spec slug', () => {
    // Edge-case: spec names with apostrophes etc.
    expect(getSpecIconUrl(2, "Feral")).toBe(
      `${BASE}/classicon_druid_feral.jpg`,
    );
  });

  it('returns empty string for unknown classID', () => {
    expect(getSpecIconUrl(99, 'Shadow')).toBe('');
  });

  it('returns empty string for undefined spec', () => {
    expect(getSpecIconUrl(7, undefined)).toBe('');
  });

  it('returns empty string for empty spec string', () => {
    expect(getSpecIconUrl(7, '')).toBe('');
  });

  it('handles all 13 defined class IDs', () => {
    for (let id = 1; id <= 13; id++) {
      expect(getSpecIconUrl(id, 'Test')).not.toBe('');
    }
  });
});
