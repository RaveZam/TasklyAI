# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # ESLint (eslint config enforces max 200 lines/function, complexity ≤ 20, no-explicit-any)
```

No test suite is configured.

## Architecture

**TasklyAI** is a Next.js 16 (App Router) + Supabase kanban board with AI task generation.

### Key patterns

- **Services layer**: All Supabase queries go through `app/features/*/` service files (e.g. `task-service.ts`, `project-service.ts`). Pages call services, not Supabase directly.
- **Auth guard**: Client-side `useRequireAuth` hook in `core/auth/` handles redirects. Every `features/` page relies on this.
- **ProjectsProvider**: `app/providers.tsx` wraps the app in a React Context that holds the active project list. Use `useProjects()` to access.
- **Path alias**: `@/` maps to the repo root (e.g. `@/components/ui/button`).

### Directory layout

```
app/
  auth/             # Login, register, OAuth callback
  api/ai/           # Gemini API route (server-side only)
  features/         # Protected pages: kanban, inbox, settings
    layout.tsx      # Shared layout: Sidebar + Header + auth check
    kanban/         # Main workspace
    projects/       # Project hooks & services
    tasks/          # Task services & hooks
    ai_task_suggestions/  # AI generation logic
    invite_member/  # Team invite flow
core/
  supabase/client.ts   # Singleton Supabase browser client
  auth/                # Auth hooks (use-supabase-user, use-require-auth)
components/ui/         # shadcn/ui-style components (Radix + Tailwind)
types/kanban.ts        # Task, Status, Priority types
```

### Database (Supabase)

Tables: `projects`, `tasks`, `project_members`, `project_invites`

Task status values: `"todo"` | `"inProgress"` | `"done"`
Task priority values: `"low"` | `"medium"` | `"high"`

### AI integration

`POST /api/ai/generate-tasks` — server route that calls Gemini 2.5 Flash Lite. Client calls it via `ai-task-service.ts`. `GEMINI_API_KEY` must be set in `.env.local`.

### Styling

- TailwindCSS v4 with CSS variables defined in `app/globals.css`
- Dark theme surfaces: `#282b30` (base), `#36393e` (raised)
- Fonts: Plus Jakarta Sans (sans), Space Grotesk (mono)
- Component style: shadcn `new-york` with `zinc` base color

### Drag and drop

Kanban board uses `@hello-pangea/dnd`. Column IDs match task status strings exactly.
