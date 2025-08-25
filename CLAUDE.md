# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server
- **Build**: `npm run build` - Creates production build
- **Start production**: `npm run start` - Starts production server
- **Lint**: `npm run lint` - Runs ESLint on the codebase
- **Format code**: `npm run format` - Formats code using Prettier
- **Check formatting**: `npm run format:check` - Checks if code is properly formatted

## Architecture Overview

This is a Next.js 14+ application with App Router showcasing a library finder for Berlin. The application combines interactive maps with location-based library data and real-time status tracking.

### Key Architecture Patterns

- **Next.js App Router**: Uses the modern `/app` directory structure
- **Client-side mapping**: Map component is dynamically imported with SSR disabled
- **Real-time status**: Libraries show open/closed status based on current time
- **Responsive design**: Mobile-first approach with desktop adaptations
- **Theme system**: Dark/light mode toggle using next-themes

### Core Components Structure

- **Layout**: `src/app/layout.tsx` - Root layout with theme provider and font setup
- **Home page**: `src/app/page.tsx` - Main page coordinating map and list components
- **LibraryMap**: Interactive Mapbox GL JS map with custom markers and 3D buildings
- **LibraryList**: Filterable accordion list with distance calculations
- **Theme components**: Mode toggle and theme provider for dark/light switching

### Data Flow

1. User location is obtained via `useUserLocation` hook
2. Library data is loaded from static JSON file (`src/data/libraries.json`)
3. Map and list components share state for selected libraries
4. Real-time status calculation using date-fns for working hours

### Key Technologies

- **Mapbox GL JS**: Interactive maps with custom markers and 3D building layers
- **shadcn/ui**: Component system built on Radix UI and Tailwind CSS
- **date-fns**: Date manipulation for library hours and status
- **Zod + T3 Env**: Type-safe environment variable validation
- **TypeScript**: Full type safety throughout the application

### File Organization

- `src/app/`: Next.js App Router pages and layouts
- `src/components/`: Reusable UI components (shadcn/ui based)
- `src/data/`: Static data files (library information)
- `src/hooks/`: Custom React hooks
- `src/lib/`: Utility functions
- `src/types/`: TypeScript type definitions
- `src/config/`: Application configuration

### Environment Variables

Required environment variables (defined in `src/env.mjs`):
- `NEXT_PUBLIC_APP_URL`: Base URL for the application
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox access token for maps

### Styling Approach

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: Theme-aware color system using HSL values
- **shadcn/ui**: Consistent component design system
- **Space Grotesk**: Custom font loaded via Next.js font optimization