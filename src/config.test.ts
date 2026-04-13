import { describe, it, expect } from 'vitest';
import { validateConfig } from './config';

const valid = {
  wcl: { clientId: 'test-id', clientSecret: 'test-secret' },
  character: { name: 'Azurethane', serverSlug: 'area-52' },
};

const empty = {
  wcl: { clientId: '', clientSecret: '' },
  character: { name: '', serverSlug: '' },
};

describe('validateConfig', () => {
  it('returns an empty array when all required fields are present', () => {
    expect(validateConfig(valid)).toHaveLength(0);
  });

  it('returns 4 errors when all required fields are missing', () => {
    expect(validateConfig(empty)).toHaveLength(4);
  });

  it('returns an error mentioning VITE_WCL_CLIENT_ID when clientId is missing', () => {
    const cfg = { ...valid, wcl: { clientId: '', clientSecret: 'secret' } };
    expect(validateConfig(cfg)).toContainEqual(
      expect.stringContaining('VITE_WCL_CLIENT_ID'),
    );
  });

  it('returns an error mentioning VITE_WCL_CLIENT_SECRET when clientSecret is missing', () => {
    const cfg = { ...valid, wcl: { clientId: 'id', clientSecret: '' } };
    expect(validateConfig(cfg)).toContainEqual(
      expect.stringContaining('VITE_WCL_CLIENT_SECRET'),
    );
  });

  it('returns an error mentioning VITE_CHARACTER_NAME when name is missing', () => {
    const cfg = { ...valid, character: { name: '', serverSlug: 'area-52' } };
    expect(validateConfig(cfg)).toContainEqual(
      expect.stringContaining('VITE_CHARACTER_NAME'),
    );
  });

  it('returns an error mentioning VITE_SERVER_SLUG when serverSlug is missing', () => {
    const cfg = { ...valid, character: { name: 'Char', serverSlug: '' } };
    expect(validateConfig(cfg)).toContainEqual(
      expect.stringContaining('VITE_SERVER_SLUG'),
    );
  });

  it('returns only the errors for the fields that are actually missing', () => {
    const cfg = { ...valid, wcl: { clientId: '', clientSecret: 'secret' } };
    const errors = validateConfig(cfg);
    expect(errors).toHaveLength(1);
  });
});
