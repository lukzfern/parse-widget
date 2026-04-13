/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Required — WarcraftLogs OAuth credentials
  readonly VITE_WCL_CLIENT_ID: string;
  readonly VITE_WCL_CLIENT_SECRET: string;

  // Required — character details
  readonly VITE_CHARACTER_NAME: string;
  readonly VITE_SERVER_SLUG: string;

  // Optional — defaults applied in config.ts
  readonly VITE_SERVER_REGION?: string;
  readonly VITE_ZONE_ID?: string;
  readonly VITE_METRIC?: string;
  readonly VITE_DIFFICULTY?: string;
  readonly VITE_REFRESH_INTERVAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
