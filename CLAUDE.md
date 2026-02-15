# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Next.js dev server at http://localhost:3000/libraries
- `npm run build` - Production build
- `npm run lint` - ESLint (next/core-web-vitals)
- `npm run format` - Prettier (auto-sorts imports and Tailwind classes)
- `npm run format:check` - Check formatting
- `npm run test` - Run Vitest tests (single run)
- `npm run test:watch` - Vitest in watch mode

## Setup

1. `cp .env.example .env.local` and add your Mapbox access token
2. `npm install` then `npm run dev`

## Architecture

Berlin library finder app — Next.js 14+ App Router, fully client-rendered. Interactive Mapbox map + searchable list with real-time open/closed status.

### Component Hierarchy

```
page.tsx → LibraryExplorer (orchestrator, owns all shared state)
              ├── LibraryMap (Mapbox GL, dynamically imported with ssr: false)
              ├── LibraryList (searchable list view)
              └── LibraryDetail (detail view with PhotoCarousel)
```

`LibraryExplorer` lifts state for cross-component sync: `selectedLibraryId`, `libraryCoordinates`, `favorites` (localStorage-persisted), and a `statusTick` that increments every 60s to refresh open/closed status.

### Critical: basePath

**`next.config.js` sets `basePath: '/libraries'`**. The app is served at `/libraries`, not root. All static asset references must include this prefix (e.g., `/libraries/favicon.png`, `/libraries/logotype.svg`).

### Coordinate Order Gotcha

- Library data and Mapbox: **[longitude, latitude]**
- `useUserLocation` hook: returns **[longitude, latitude]**
- `calculateDistance(lat1, lon1, lat2, lon2)`: takes **(latitude, longitude)** parameter order
- Always verify which format a function expects before passing coordinates.

### Library Status System

Real-time status via `getLibraryStatus()` in `src/lib/library-utils.ts` using `date-fns`. Four states: Open, Closed, Opens Soon (within 1hr), Closes Soon (within 1hr). Refreshed every 60s via interval in LibraryExplorer.

### Map Markers

Markers are created once and updated via refs (`markersRef`, `prevSelectedIdRef`) — not recreated on selection change. Callbacks stored in refs to prevent marker recreation on parent re-render. This is performance-critical.

### Library Colors

Each library has a unique color from a 6-color palette, manually mapped in `LIBRARY_COLORS` in `library-utils.ts`. `getLibraryColorLight()` creates a tinted version (80% white blend).

### Photos

Stored in `/public/photos/{libraryId}_{photoNum}.jpg`. Availability tracked in `src/data/photo-index.ts`. PhotoCarousel uses Motion (Framer Motion v12) for draggable stack animations.

## Key Technical Details

- **Fonts**: Inter (sans) + JetBrains Mono (mono), loaded via Next.js font optimization
- **Light theme only**: warm beige palette via HSL CSS variables, no dark mode toggle
- **Animation**: Uses `motion` package (v12.33.0), not `framer-motion`
- **Prettier**: No semicolons, double quotes, auto-sorts imports (React → Next → third-party → local)
- **Path alias**: `@/*` maps to `./src/*`
- **Env validation**: `src/env.mjs` uses T3 Env but only validates `NEXT_PUBLIC_APP_URL`. `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is accessed directly via `process.env` without schema validation
- **User location**: Falls back to Berlin center (`BERLIN_CENTER`) if user is >30km away or geolocation unavailable

## Testing

Vitest with globals enabled (no imports needed for `describe`, `it`, `expect`). Tests use `vi.useFakeTimers()` / `vi.setSystemTime()` for time-dependent logic. Only utility functions have tests — no component tests.
