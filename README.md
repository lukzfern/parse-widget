# parse-widget

An OBS Browser Source widget for Mythic raiders that shows WarcraftLogs parse percentages in real-time — directly on your stream.

## Features

- Displays your best parse %, All Stars rank, and spec icon per boss
- Color-coded tiers matching WarcraftLogs exactly (gray → green → blue → purple → orange → pink → gold)
- Auto-detects the current Mythic raid tier, or pin a specific zone
- Animated count-up numbers, slide-in boss rows, glow pulse on 99/100
- Auto-refreshes every 5 minutes (configurable)
- Graceful error handling — shows last known data on API failure

## Requirements

- [Node.js](https://nodejs.org/) 20+
- A [WarcraftLogs API client](https://www.warcraftlogs.com/api/clients/) (free to create)
- [OBS Studio](https://obsproject.com/)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/parse-widget.git
cd parse-widget
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your details:

```env
VITE_WCL_CLIENT_ID=your_client_id
VITE_WCL_CLIENT_SECRET=your_client_secret
VITE_CHARACTER_NAME=YourCharName
VITE_SERVER_SLUG=area-52
VITE_SERVER_REGION=US
```

### 3. Start the dev server

```bash
npm run dev
```

The widget is now available at `http://localhost:5173`.

### 4. Add to OBS

1. Add a **Browser Source** to your scene
2. Set the URL to `http://localhost:5173`
3. Width: `400` — Height: adjust to fit your boss count (~45 px per boss + ~80 px header/footer)
4. Enable **"Shutdown source when not visible"** and **"Refresh browser when scene becomes active"**

> Keep `npm run dev` running in the background while streaming.

## Configuration

All variables are read from `.env`. Only the first four are required.

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_WCL_CLIENT_ID` | ✅ | — | WarcraftLogs OAuth client ID |
| `VITE_WCL_CLIENT_SECRET` | ✅ | — | WarcraftLogs OAuth client secret |
| `VITE_CHARACTER_NAME` | ✅ | — | Your character name |
| `VITE_SERVER_SLUG` | ✅ | — | Realm slug, e.g. `area-52` |
| `VITE_SERVER_REGION` | | `US` | `US` `EU` `KR` `TW` |
| `VITE_ZONE_ID` | | auto | Pin to a specific zone ID (recommended once confirmed) |
| `VITE_METRIC` | | `dps` | `dps` `hps` `bossdps` `tankhps` |
| `VITE_DIFFICULTY` | | `5` | `3`=Normal `4`=Heroic `5`=Mythic |
| `VITE_REFRESH_INTERVAL` | | `300000` | Auto-refresh interval in ms |

> **Tip:** After the widget picks the correct zone automatically, copy the zone ID from the footer and set `VITE_ZONE_ID` to skip the detection API call on every session start.

## Development

```bash
npm run dev           # Start dev server with HMR
npm run test          # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint          # ESLint
npm run typecheck     # TypeScript type check
npm run build         # Production build
```

## Tech Stack

| Layer | Choice |
|---|---|
| Build | Vite + React 19 + TypeScript (strict) |
| Styling | CSS Modules + clsx |
| Testing | Vitest + Testing Library + jsdom |
| API | WarcraftLogs GraphQL v2 (OAuth2 client credentials) |

## Security

Your WarcraftLogs credentials are stored in `.env` (gitignored) and are only exchanged with WarcraftLogs' OAuth endpoint via Vite's local proxy. They are never committed or sent to any third party. Do not share your `.env` file.

## License

MIT


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
