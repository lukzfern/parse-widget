import { config } from '@/config';

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cache: TokenCache | null = null;

/**
 * Returns a valid WarcraftLogs OAuth2 client-credentials token.
 * Tokens are cached in memory and proactively refreshed 60 s before expiry.
 * Requests go through the Vite dev-server proxy (/oauth → warcraftlogs.com)
 * to avoid CORS restrictions in the OBS Browser Source.
 */
export async function getAccessToken(signal?: AbortSignal): Promise<string> {
  const now = Date.now();

  if (cache !== null && cache.expiresAt > now) {
    return cache.token;
  }

  const { clientId, clientSecret } = config.wcl;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing VITE_WCL_CLIENT_ID or VITE_WCL_CLIENT_SECRET in your .env file.'
    );
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch('/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal,
  });

  if (!res.ok) {
    throw new Error(`OAuth error ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };

  cache = {
    token: data.access_token,
    // 60 s buffer so we refresh before actual expiry
    expiresAt: now + (data.expires_in - 60) * 1000,
  };

  return cache.token;
}

/**
 * Resets the in-memory token cache.
 * Intended for testing; may also be useful if credentials change at runtime.
 */
export function clearTokenCache(): void {
  cache = null;
}
