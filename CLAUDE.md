# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Constellar** is an AI-enabled whiteboard application for engineers to generatively design solutions. It combines Excalidraw's API with Claude AI through Model Context Protocol (MCP), allowing users to chat with a sidebar interface and create shapes, diagrams, and engineering designs through natural conversation. The project features a galaxy/space theme.

## Tech Stack

- **Framework**: Next.js 15.3.5 (App Router with React Server Components)
- **React**: v19.0.0
- **TypeScript**: v5
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Animations**: Framer Motion v12
- **3D Graphics**: React Three Fiber, Three.js, three-globe, cobe
- **Database**: Drizzle ORM with libSQL client
- **Authentication**: better-auth v1.3.10
- **Forms**: react-hook-form with Zod validation
- **Icons**: Lucide React, Tabler Icons, React Icons

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

Development server runs on http://localhost:3000

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with error reporting, visual edits messenger
│   ├── page.tsx           # Landing page (Header → Hero → Features → Footer)
│   ├── global-error.tsx   # Global error boundary
│   └── globals.css        # Global styles and Tailwind directives
├── components/
│   ├── ui/                # shadcn/ui components (60+ components)
│   ├── Header.tsx         # Navigation header
│   ├── Hero.tsx           # Landing hero section with cosmic orbs
│   ├── Features.tsx       # Feature showcase grid
│   ├── Footer.tsx         # Site footer
│   └── ErrorReporter.tsx  # Client-side error reporting
├── lib/
│   ├── utils.ts           # Utility functions (cn, etc.)
│   └── hooks/             # Custom React hooks
├── hooks/                 # Additional hooks
│   └── use-mobile.ts      # Mobile detection hook
└── visual-edits/          # Visual editing utilities
    ├── VisualEditsMessenger.tsx
    └── component-tagger-loader.js  # Turbopack custom loader
```

### Path Aliases

The project uses TypeScript path aliases configured in `tsconfig.json`:
- `@/*` → `./src/*`

Additional shadcn aliases in `components.json`:
- `@/components` → components directory
- `@/lib/utils` → utility functions
- `@/ui` → UI components
- `@/hooks` → custom hooks

### Key Configuration Files

**next.config.ts**:
- Remote image patterns enabled for all HTTPS/HTTP domains
- TypeScript and ESLint build errors ignored (for rapid development)
- Custom Turbopack loader for component tagging: `component-tagger-loader.js`
- Output file tracing root configured for monorepo support

**components.json**:
- shadcn/ui style: "new-york"
- RSC enabled
- CSS variables mode with neutral base color
- Lucide icon library

### Visual Editing System

The app includes a custom visual editing system:
- `VisualEditsMessenger.tsx` component in root layout
- `component-tagger-loader.js` custom Turbopack loader for JSX/TSX files
- Route messenger script loaded from Supabase storage
- Configured to work in iframe contexts with route change messaging

### Landing Page Structure

Current landing page (`src/app/page.tsx`) composition:
1. **Header**: Navigation and branding
2. **Hero**: Main value proposition with cosmic orb background effects, featuring:
   - AI-Powered Whiteboard badge
   - Gradient headline highlighting AI assistance
   - Description of Excalidraw + Claude MCP integration
   - CTA buttons (Start Creating, View Demo)
3. **Features**: 4-column grid showcasing:
   - Conversational Design (natural language shape generation)
   - Excalidraw Integration (hand-drawn style)
   - Claude MCP (Model Context Protocol integration)
   - Generative Shapes (complex diagrams from commands)
4. **Footer**: Site footer information

### Theme & Styling

- **Color scheme**: Purple/violet gradient theme with cosmic/space aesthetic
- **Cosmic orbs**: Custom CSS classes (`cosmic-orb-1`, `cosmic-orb-2`)
- **Glass morphism**: Backdrop blur effects throughout UI
- **Animations**: Framer Motion for transitions, hover effects

## Excalidraw Integration (Planned)

The core feature will integrate Excalidraw's API for programmatic whiteboard creation:

### Key Excalidraw APIs to Use

```javascript
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

// Create elements from skeleton format
const elements = convertToExcalidrawElements([
  { type: "rectangle", x: 100, y: 100, width: 200, height: 100 },
  { type: "ellipse", x: 350, y: 100, width: 150, height: 150 },
  { type: "arrow", x: 200, y: 300 }
]);

// Update scene via excalidrawAPI ref
excalidrawAPI.updateScene({ elements });
```

### Supported Element Types
- Shapes: `rectangle`, `ellipse`, `diamond`
- Connectors: `arrow`, `line`
- Text containers and labeled arrows
- Custom styling: backgroundColor, strokeColor, strokeWidth, strokeStyle, fillStyle

### Scene Management Methods
- `updateScene()` - Update canvas with sceneData
- `getSceneElements()` - Retrieve all elements
- `resetScene()` - Clear the canvas
- `addFiles()` - Add images/files to scene

## Claude MCP Integration (Planned)

The sidebar will connect to Claude AI via Model Context Protocol:
- Parse natural language commands from chat interface
- Convert user intent to Excalidraw element skeletons
- Call Excalidraw API to render generated shapes
- Maintain conversation context for iterative design

## Build Configuration

- **Turbopack**: Enabled by default in dev mode
- **TypeScript**: Strict mode enabled, build errors ignored for rapid iteration
- **ESLint**: Configured with Next.js rules, build errors ignored
- **Image Optimization**: All remote domains allowed (configure properly for production)

## Database & Auth

- **ORM**: Drizzle with drizzle-kit for migrations
- **Auth**: better-auth for authentication flows
- **Password Hashing**: bcrypt v6

## Important Notes

- TypeScript and ESLint errors are currently ignored during builds - this is for rapid development but should be addressed before production
- Remote image patterns allow all domains - restrict this in production
- The visual editing system is integrated for development/preview workflows
- Component library is extensive (60+ UI components from shadcn/ui)
