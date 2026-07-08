# PROJECT_STATE.md — Session Memory

> Claude Code: read this at the start of every session, update it at the end of every session.

## Current phase
Phase 0 — Foundation (in progress)

## Last session summary
2026-07-08: Scaffolded the Next.js app (App Router, TypeScript, Tailwind) via create-next-app.
Verified the dev server runs and the starter page renders at localhost:3000 with no errors.
Committed as "Phase 0: scaffold Next.js app and restore project docs".

## Next steps
1. Create Supabase project and connect it via environment variables (.env.local)
2. Build email/password auth (sign up / log in / log out)
3. Database schema v1 (books, user_books, shelves, shelf_books) + Row Level Security

## Decisions log
- 2026-07-08: Web app first, mobile later. Stack: Next.js + TypeScript + Tailwind + Supabase + Vercel.
- 2026-07-08: Book data from Open Library API (free, keyless); Google Books as fallback for upcoming releases.
- 2026-07-08: Ratings stored as integers 1–10 (= 0.5–5.0 stars).
- 2026-07-08: All data private by default; social features are opt-in in Phase 4.

## Known bugs / open questions
- None yet.

## Environment notes
- Supabase project URL / keys live in `.env.local` (never committed)
- Node.js v24 is installed and on the machine PATH, so `node`/`npm` work in a normal terminal.
- Claude Code's tool shells run with a stripped-down PATH that omits Node, so `.claude/launch.json`
  invokes the dev server via node.exe by full path. To run the app yourself: open a terminal in this
  folder and run `npm run dev`, then visit http://localhost:3000.
