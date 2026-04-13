import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  clearZonesCache,
  fetchCharacterZoneRankings,
  getLatestZone,
  getZoneName,
} from './warcraftlogs';
import { mockCharacterData } from '@/test/fixtures';

// Prevent real OAuth calls — gql() gets a token before every fetch
vi.mock('@/api/auth', () => ({
  getAccessToken: vi.fn().mockResolvedValue('test-token'),
}));

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockClear();
  clearZonesCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearZonesCache();
});

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const mockExpansions = [
  {
    id: 10,
    name: 'The War Within',
    zones: [
      { id: 42, name: 'Nerub-ar Palace', frozen: false },
      { id: 40, name: 'Mythic+ Season 1', frozen: false }, // season — excluded
      { id: 38, name: 'Amirdrassil (Legacy)', frozen: true }, // frozen — excluded
    ],
  },
  {
    id: 9,
    name: 'Dragonflight',
    zones: [
      { id: 35, name: 'Amirdrassil', frozen: false },
    ],
  },
];

function makeGqlResponse(data: unknown): Response {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// getLatestZone
// ---------------------------------------------------------------------------

describe('getLatestZone', () => {
  it('returns the highest non-frozen, non-season zone from the latest expansion', async () => {
    mockFetch.mockResolvedValueOnce(
      makeGqlResponse({ worldData: { expansions: mockExpansions } }),
    );
    const result = await getLatestZone();
    expect(result).toEqual({ zoneId: 42, zoneName: 'Nerub-ar Palace' });
  });

  it('falls back to an older expansion when the latest has no active zones', async () => {
    const expansions = [
      { id: 10, name: 'TWW', zones: [{ id: 40, name: 'Mythic+ Season 1', frozen: false }] },
      { id: 9, name: 'Dragonflight', zones: [{ id: 35, name: 'Amirdrassil', frozen: false }] },
    ];
    mockFetch.mockResolvedValueOnce(makeGqlResponse({ worldData: { expansions } }));
    const result = await getLatestZone();
    expect(result.zoneName).toBe('Amirdrassil');
  });

  it('excludes frozen zones', async () => {
    const expansions = [
      { id: 10, name: 'TWW', zones: [{ id: 38, name: 'Old Raid', frozen: true }] },
      { id: 9, name: 'Dragonflight', zones: [{ id: 35, name: 'Amirdrassil', frozen: false }] },
    ];
    mockFetch.mockResolvedValueOnce(makeGqlResponse({ worldData: { expansions } }));
    const result = await getLatestZone();
    expect(result.zoneName).toBe('Amirdrassil');
  });

  it('throws when no expansions are returned', async () => {
    mockFetch.mockResolvedValueOnce(makeGqlResponse({ worldData: { expansions: [] } }));
    await expect(getLatestZone()).rejects.toThrow('No expansions found');
  });

  it('throws when no active raid zones exist in any expansion', async () => {
    const expansions = [
      { id: 10, name: 'TWW', zones: [{ id: 40, name: 'Mythic+ Season 1', frozen: false }] },
    ];
    mockFetch.mockResolvedValueOnce(makeGqlResponse({ worldData: { expansions } }));
    await expect(getLatestZone()).rejects.toThrow('No active raid zones');
  });

  it('throws on a non-OK HTTP response', async () => {
    mockFetch.mockResolvedValueOnce(new Response('Server Error', { status: 503 }));
    await expect(getLatestZone()).rejects.toThrow('WarcraftLogs API error 503');
  });

  it('throws on GraphQL errors in the response body', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ data: null, errors: [{ message: 'Rate limited' }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    await expect(getLatestZone()).rejects.toThrow('GraphQL error: Rate limited');
  });
});

// ---------------------------------------------------------------------------
// getZoneName
// ---------------------------------------------------------------------------

describe('getZoneName', () => {
  it('returns the zone name for a known zone ID', async () => {
    mockFetch.mockResolvedValueOnce(
      makeGqlResponse({ worldData: { expansions: mockExpansions } }),
    );
    expect(await getZoneName(42)).toBe('Nerub-ar Palace');
  });

  it('returns a "Zone N" fallback string for an unknown zone ID', async () => {
    mockFetch.mockResolvedValueOnce(
      makeGqlResponse({ worldData: { expansions: mockExpansions } }),
    );
    expect(await getZoneName(9999)).toBe('Zone 9999');
  });

  it('uses the zones cache on repeated calls — only one fetch', async () => {
    mockFetch.mockResolvedValueOnce(
      makeGqlResponse({ worldData: { expansions: mockExpansions } }),
    );
    await getZoneName(42);
    await getZoneName(35); // second call — should hit cache
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// fetchCharacterZoneRankings
// ---------------------------------------------------------------------------

describe('fetchCharacterZoneRankings', () => {
  const opts = {
    name: 'Azurethane',
    serverSlug: 'area-52',
    serverRegion: 'US',
    zoneID: 42,
    difficulty: 5,
    metric: 'dps',
  };

  it('returns character data on a successful response', async () => {
    mockFetch.mockResolvedValueOnce(
      makeGqlResponse({ characterData: { character: mockCharacterData() } }),
    );
    const result = await fetchCharacterZoneRankings(opts);
    expect(result.name).toBe('Azurethane');
    expect(result.classID).toBe(13);
  });

  it('throws when the character is not found (null returned)', async () => {
    mockFetch.mockResolvedValueOnce(
      makeGqlResponse({ characterData: { character: null } }),
    );
    await expect(fetchCharacterZoneRankings(opts)).rejects.toThrow('Azurethane');
  });

  it('throws on a non-OK HTTP status', async () => {
    mockFetch.mockResolvedValueOnce(new Response('Forbidden', { status: 403 }));
    await expect(fetchCharacterZoneRankings(opts)).rejects.toThrow(
      'WarcraftLogs API error 403',
    );
  });

  it('throws on GraphQL errors in the response body', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ data: null, errors: [{ message: 'Character not found' }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    await expect(fetchCharacterZoneRankings(opts)).rejects.toThrow(
      'GraphQL error: Character not found',
    );
  });
});

// ---------------------------------------------------------------------------
// clearZonesCache
// ---------------------------------------------------------------------------

describe('clearZonesCache', () => {
  it('forces a new fetch after the cache has been cleared', async () => {
    // Use mockImplementation so a fresh Response (unconsumed body) is created
    // for every fetch call — a single Response object can only be .json()d once.
    mockFetch.mockImplementation(() =>
      Promise.resolve(makeGqlResponse({ worldData: { expansions: mockExpansions } })),
    );
    await getZoneName(42);
    clearZonesCache();
    await getZoneName(42);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
