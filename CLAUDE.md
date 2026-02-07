# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server at http://localhost:3000
- **Build**: `npm run build` - Creates production build
- **Start production**: `npm run start` - Starts production server
- **Lint**: `npm run lint` - Runs ESLint on the codebase
- **Format code**: `npm run format` - Formats code using Prettier
- **Check formatting**: `npm run format:check` - Checks if code is properly formatted

## Initial Setup

1. Copy `.env.example` to `.env.local`
2. Add your Mapbox access token to `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
3. Run `npm install` (or `pnpm install`)
4. Start development with `npm run dev`

## Architecture Overview

This is a Next.js 14+ application with App Router showcasing a library finder for Berlin. The application combines interactive maps with location-based library data and real-time status tracking.

### Key Architecture Patterns

- **Next.js App Router**: Uses the modern `/app` directory structure with client-side rendering for interactive components
- **Client-side mapping**: `LibraryMap` is dynamically imported with `ssr: false` to prevent server-side rendering issues with Mapbox GL JS
- **Real-time status**: Libraries show open/closed status based on current time using `getLibraryStatus()` helper (duplicated in both map and list components)
- **Responsive design**: Mobile-first approach with bottom sheet on mobile, sidebar on desktop
- **Theme system**: Dark theme set as default (defaultTheme="dark"), theme switching functionality removed

### Core Components & State Management

- **Layout** (`src/app/layout.tsx`): Root layout with ThemeProvider, Space Grotesk font, and metadata configuration
- **Home page** (`src/app/page.tsx`): Orchestrates shared state between map and list:
  - `libraryCoordinates`: Coordinates of selected library for map centering
  - `selectedLibraryId`: Currently selected library (affects marker styling)
  - `openAccordionItem`: Controls which library is expanded in the accordion
  - `userLocation`: User's current location from `useUserLocation` hook
- **LibraryMap** (`src/components/LibraryMap.tsx`):
  - Mapbox GL JS map with 3D buildings layer
  - Custom circular markers colored by library status
  - Click handlers update parent state to sync with list
  - Auto-scrolls to Berlin if user is >30km away
- **LibraryList** (`src/components/LibraryList.tsx`):
  - Accordion-based list sorted by distance
  - Custom scroll behavior to show library name header when item opens
  - Distance calculated using Haversine formula
  - Renders `Indicator` component for numerical ratings (workspace, wifi, etc.)

### Important Technical Details

1. **Mapbox Token**: Must be set in environment variables. Without it, the map will fail to initialize.

2. **Library Status Logic**: Status is calculated in real-time using `date-fns`:
   - "Open": Currently within working hours
   - "Closed": Outside working hours
   - "Opens Soon": Within 1 hour before opening
   - "Closes Soon": Within 1 hour before closing
   - This logic is duplicated in both `LibraryMap.tsx` and `LibraryList.tsx`

3. **Coordinate Format**: Different components use different coordinate order:
   - `LibraryMap`: [longitude, latitude] (Mapbox format)
   - `LibraryList`: [latitude, longitude] (typical format)
   - `useUserLocation`: Returns [longitude, latitude]
   - Be careful when working with coordinates!

4. **Dynamic Import Pattern**: Map component uses Next.js dynamic import to disable SSR:
   ```typescript
   const LibraryMap = dynamic(() => import('../components/LibraryMap'), { ssr: false })
   ```

5. **State Synchronization**: Map pins and list items stay in sync through shared state:
   - Clicking a map marker opens the corresponding accordion item
   - Clicking a list item centers the map and highlights the marker
   - Custom scroll behavior ensures library name stays visible when accordion opens

### Data Flow

1. User location obtained via `useUserLocation` hook using browser Geolocation API
2. If user >30km from Berlin, defaults to Berlin center coordinates
3. Library data loaded from static JSON (`src/data/libraries.json`)
4. Libraries sorted by distance from user location (or Berlin center)
5. Map and list components share selected library state via parent component
6. Real-time status calculated on each render using current time

### Key Technologies

- **Mapbox GL JS**: Interactive maps with custom markers and 3D building layers
- **shadcn/ui**: Component system built on Radix UI and Tailwind CSS
- **date-fns**: Date manipulation for library hours and status calculation
- **Zod + T3 Env**: Type-safe environment variable validation (note: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` not currently in env.mjs schema)
- **TypeScript**: Full type safety throughout

### File Organization

- `src/app/`: Next.js App Router pages and layouts
- `src/components/`: Reusable UI components
  - `ui/`: shadcn/ui components (accordion, button, dropdown-menu, table)
  - `LibraryMap.tsx`, `LibraryList.tsx`: Main feature components
  - `Indicator.tsx`: Visual indicator bars for ratings (1-5 scale)
- `src/data/`: Static data files (library information in JSON format)
- `src/hooks/`: Custom React hooks (`useUserLocation`)
- `src/lib/`: Utility functions (`utils.ts` for cn() helper)
- `src/types/`: TypeScript type definitions (`Library` interface)
- `src/config/`: Application configuration (`site.ts` for metadata)

### Environment Variables

Required (copy from `.env.example`):
- `NEXT_PUBLIC_APP_URL`: Base URL for the application (used in metadata)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox access token (critical for maps to work)

Note: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is accessed directly via `process.env` in `LibraryMap.tsx` but is not currently defined in the `src/env.mjs` validation schema.

### Styling Approach

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: Theme-aware color system using HSL values
- **shadcn/ui**: Consistent component design system based on Radix UI
- **Space Grotesk**: Custom font loaded via Next.js font optimization
- **Dark mode only**: defaultTheme set to "dark" with enableSystem={false}