import { getAccessToken } from '@/api/auth';
import type { CharacterData, Expansion } from '@/types/warcraftlogs';

const GQL_ENDPOINT = '/api/v2/client';

async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  const token = await getAccessToken(signal);

  const res = await fetch(GQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`WarcraftLogs API error ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { data: T; errors?: { message: string }[] };

  if (json.errors?.length) {
    throw new Error(`GraphQL error: ${json.errors.map((e) => e.message).join(', ')}`);
  }

  return json.data;
}

// ---------------------------------------------------------------------------
// Zone auto-detection (single cached fetch)
// ---------------------------------------------------------------------------

const ZONES_QUERY = /* GraphQL */ `
  query GetExpansionZones {
    worldData {
      expansions {
        id
        name
        zones {
          id
          name
          frozen
        }
      }
    }
  }
`;

// In-memory cache so both zone ID and zone name share one API call
let zonesCache: { expansions: Expansion[] } | null = null;

async function getExpansions(signal?: AbortSignal): Promise<Expansion[]> {
  if (zonesCache) return zonesCache.expansions;
  const data = await gql<{ worldData: { expansions: Expansion[] } }>(ZONES_QUERY, undefined, signal);
  zonesCache = { expansions: data.worldData.expansions };
  return zonesCache.expansions;
}

/** For testing purposes only — resets the in-memory zones cache. */
export function clearZonesCache(): void {
  zonesCache = null;
}

/**
 * Returns { zoneId, zoneName } for the most recent non-frozen raid in the
 * latest expansion. M+ Season zones are excluded. Results are cached.
 */
export async function getLatestZone(signal?: AbortSignal): Promise<{ zoneId: number; zoneName: string }> {
  const expansions = await getExpansions(signal);

  if (!expansions.length) {
    throw new Error('No expansions found from WarcraftLogs API.');
  }

  const sorted = [...expansions].sort((a, b) => b.id - a.id);

  for (const exp of sorted) {
    const raidZones = exp.zones.filter(
      (z) => !z.frozen && !/season/i.test(z.name)
    );
    if (raidZones.length > 0) {
      const best = raidZones.reduce((max, z) => (z.id > max.id ? z : max), raidZones[0]);
      return { zoneId: best.id, zoneName: best.name };
    }
  }

  throw new Error('No active raid zones found from WarcraftLogs API.');
}

export async function getZoneName(zoneId: number, signal?: AbortSignal): Promise<string> {
  const expansions = await getExpansions(signal);
  for (const exp of expansions) {
    const zone = exp.zones.find((z) => z.id === zoneId);
    if (zone) return zone.name;
  }
  return `Zone ${zoneId}`;
}

// ---------------------------------------------------------------------------
// Character zone rankings
// ---------------------------------------------------------------------------

const ZONE_RANKINGS_QUERY = /* GraphQL */ `
  query GetCharacterZoneRankings(
    $name: String!
    $serverSlug: String!
    $serverRegion: String!
    $zoneID: Int!
    $difficulty: Int
    $metric: CharacterPageRankingMetricType
  ) {
    characterData {
      character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
        name
        classID
        zoneRankings(zoneID: $zoneID, difficulty: $difficulty, metric: $metric)
      }
    }
  }
`;

export interface FetchRankingsOptions {
  name: string;
  serverSlug: string;
  serverRegion: string;
  zoneID: number;
  difficulty: number;
  metric: string;
}

export async function fetchCharacterZoneRankings(
  opts: FetchRankingsOptions,
  signal?: AbortSignal,
): Promise<CharacterData> {
  const data = await gql<{ characterData: { character: CharacterData } }>(
    ZONE_RANKINGS_QUERY,
    {
      name: opts.name,
      serverSlug: opts.serverSlug,
      serverRegion: opts.serverRegion,
      zoneID: opts.zoneID,
      difficulty: opts.difficulty,
      metric: opts.metric,
    },
    signal,
  );

  const char = data.characterData?.character;
  if (!char) {
    throw new Error(
      `Character "${opts.name}" not found on ${opts.serverSlug}-${opts.serverRegion}.`
    );
  }

  return char;
}
