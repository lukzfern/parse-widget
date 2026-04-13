import { describe, it, expect } from 'vitest';
import {
  PARSE_COLORS,
  formatParse,
  getParseColor,
  getParseTier,
} from './parseColors';

describe('getParseTier', () => {
  it.each([
    [0,   'gray'],
    [1,   'gray'],
    [24,  'gray'],
    [25,  'green'],
    [49,  'green'],
    [50,  'blue'],
    [74,  'blue'],
    [75,  'purple'],
    [94,  'purple'],
    [95,  'orange'],
    [98,  'orange'],
    [99,  'pink'],
    [99.9,'pink'],
    [100, 'gold'],
  ] as const)('returns %s for %d', (percent, expected) => {
    expect(getParseTier(percent)).toBe(expected);
  });
});

describe('getParseColor', () => {
  it('returns the gray color for 0', () => {
    expect(getParseColor(0)).toBe(PARSE_COLORS.gray);
  });

  it('returns the gold color for 100', () => {
    expect(getParseColor(100)).toBe(PARSE_COLORS.gold);
  });

  it('returns the pink color for 99', () => {
    expect(getParseColor(99)).toBe(PARSE_COLORS.pink);
  });

  it('returns the orange color for 95', () => {
    expect(getParseColor(95)).toBe(PARSE_COLORS.orange);
  });

  it('returns the purple color for 75', () => {
    expect(getParseColor(75)).toBe(PARSE_COLORS.purple);
  });

  it('returns the blue color for 50', () => {
    expect(getParseColor(50)).toBe(PARSE_COLORS.blue);
  });

  it('returns the green color for 25', () => {
    expect(getParseColor(25)).toBe(PARSE_COLORS.green);
  });

  it('color matches the corresponding tier color', () => {
    expect(getParseColor(80)).toBe(PARSE_COLORS[getParseTier(80)]);
  });
});

describe('formatParse', () => {
  it('returns -- for 0', () => {
    expect(formatParse(0)).toBe('--');
  });

  it('returns integer without decimal for whole numbers', () => {
    expect(formatParse(95)).toBe('95');
    expect(formatParse(100)).toBe('100');
  });

  it('returns one decimal for non-integer values', () => {
    expect(formatParse(95.4)).toBe('95.4');
    expect(formatParse(99.9)).toBe('99.9');
  });
});
