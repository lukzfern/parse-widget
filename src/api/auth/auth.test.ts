import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAccessToken, clearTokenCache } from './auth';

// Mock the config module so tests don't read from .env
vi.mock('@/config', () => ({
  config: {
    wcl: { clientId: 'test-client-id', clientSecret: 'test-client-secret' },
  },
}));

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockClear();
  clearTokenCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearTokenCache();
});

function makeTokenResponse(
  accessToken = 'mock-token',
  expiresIn = 3600,
): Response {
  return new Response(
    JSON.stringify({ access_token: accessToken, expires_in: expiresIn }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

describe('getAccessToken', () => {
  it('returns the token from a successful fetch', async () => {
    mockFetch.mockResolvedValueOnce(makeTokenResponse('abc-123'));
    const token = await getAccessToken();
    expect(token).toBe('abc-123');
  });

  it('caches the token and does not re-fetch', async () => {
    mockFetch.mockResolvedValueOnce(makeTokenResponse('cached-token'));
    await getAccessToken();
    const token = await getAccessToken();
    expect(token).toBe('cached-token');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('throws when credentials are missing', async () => {
    vi.doMock('@/config', () => ({
      config: { wcl: { clientId: '', clientSecret: '' } },
    }));
    // Re-import to pick up the new mock
    // @ts-expect-error: query string is a Vitest cache-busting convention
    const { getAccessToken: freshGet } = await import('./auth?t=nocred') as {
      getAccessToken: (signal?: AbortSignal) => Promise<string>;
    };
    await expect(freshGet()).rejects.toThrow(/VITE_WCL_CLIENT/);
  });

  it('throws when the fetch returns a non-OK status', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('Unauthorized', { status: 401 }),
    );
    await expect(getAccessToken()).rejects.toThrow(/OAuth error 401/);
  });

  it('propagates network errors', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Network failure'));
    await expect(getAccessToken()).rejects.toThrow('Network failure');
  });

  it('passes AbortSignal to fetch', async () => {
    mockFetch.mockResolvedValueOnce(makeTokenResponse());
    const controller = new AbortController();
    await getAccessToken(controller.signal);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});

describe('clearTokenCache', () => {
  it('forces a re-fetch after clearing the cache', async () => {
    // Use mockImplementation so each call creates a fresh Response body
    mockFetch.mockImplementation(() =>
      Promise.resolve(makeTokenResponse('fresh-token')),
    );
    await getAccessToken();
    clearTokenCache();
    await getAccessToken();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
