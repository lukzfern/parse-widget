/**
 * Single source of truth for all runtime configuration.
 * All import.meta.env access lives here — components and hooks import
 * from this module instead of reading env vars directly.
 */

type Difficulty = 3 | 4 | 5;
type DifficultyLabel = 'Normal' | 'Heroic' | 'Mythic';

function parseDifficulty(raw: string | undefined): Difficulty {
  if (raw === '3') return 3;
  if (raw === '4') return 4;
  return 5;
}

function parseDifficultyLabel(raw: string | undefined): DifficultyLabel {
  if (raw === '3') return 'Normal';
  if (raw === '4') return 'Heroic';
  return 'Mythic';
}

export const config = {
  wcl: {
    clientId:     import.meta.env.VITE_WCL_CLIENT_ID     ?? '',
    clientSecret: import.meta.env.VITE_WCL_CLIENT_SECRET ?? '',
  },

  character: {
    name:       import.meta.env.VITE_CHARACTER_NAME ?? '',
    serverSlug: import.meta.env.VITE_SERVER_SLUG    ?? '',
    region:     import.meta.env.VITE_SERVER_REGION  ?? 'US',
  },

  zone: {
    /** Explicit zone ID override. Null = auto-detect latest raid tier. */
    id:         import.meta.env.VITE_ZONE_ID ? Number(import.meta.env.VITE_ZONE_ID) : null,
    metric:     import.meta.env.VITE_METRIC ?? 'dps',
    difficulty: parseDifficulty(import.meta.env.VITE_DIFFICULTY),
  },

  ui: {
    difficultyLabel:  parseDifficultyLabel(import.meta.env.VITE_DIFFICULTY),
    refreshInterval:  import.meta.env.VITE_REFRESH_INTERVAL
                        ? Number(import.meta.env.VITE_REFRESH_INTERVAL)
                        : 300_000,
  },
} as const;

/**
 * Minimal subset of config required by validateConfig.
 * Using a narrow interface allows the function to be called with
 * a test fixture instead of the real module-level config object.
 */
interface ValidatableConfig {
  readonly wcl: { readonly clientId: string; readonly clientSecret: string };
  readonly character: { readonly name: string; readonly serverSlug: string };
}

/**
 * Validates that all required environment variables are present.
 * Returns a list of human-readable error messages, or an empty array if valid.
 * Call this at startup before mounting the React tree.
 * Accepts an optional config override for isolated unit testing.
 */
export function validateConfig(cfg: ValidatableConfig = config): string[] {
  const errors: string[] = [];

  if (!cfg.wcl.clientId)
    errors.push('VITE_WCL_CLIENT_ID is required (WarcraftLogs OAuth client ID).');
  if (!cfg.wcl.clientSecret)
    errors.push('VITE_WCL_CLIENT_SECRET is required (WarcraftLogs OAuth client secret).');
  if (!cfg.character.name)
    errors.push('VITE_CHARACTER_NAME is required (your character name).');
  if (!cfg.character.serverSlug)
    errors.push('VITE_SERVER_SLUG is required (e.g. "area-52").');

  return errors;
}
