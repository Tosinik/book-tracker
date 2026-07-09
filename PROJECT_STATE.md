# PROJECT_STATE.md — Session Memory

> Claude Code: read this at the start of every session, update it at the end of every session.

## Current phase
Phase 0 — Foundation (in progress)

## Last session summary
2026-07-08: (1) Scaffolded the Next.js app (App Router, TypeScript, Tailwind, Next 16.2) via
create-next-app; dev server verified at localhost:3000. (2) Created Supabase project `book-tracker`
(ref fektvgvwwezbznbzwfnq, eu-central-1, free plan) and connected it via `.env.local`
(NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY, publishable key). Added browser +
server client helpers in src/lib/supabase/. Verified live: server client OK, project reachable
HTTP 200, typecheck clean. Two commits landed.

## Next steps
1. Email/password auth (sign up / log in / log out) — needs a proxy.ts (Next 16 renamed
   middleware.ts) to refresh Supabase sessions. PROPOSE APPROACH BEFORE BUILDING.
2. Database schema v1 (books, user_books, shelves, shelf_books) + Row Level Security
   — this is a DB migration, so ASK before applying.
3. Basic app shell (nav + empty library page), then first Vercel deploy (ASK first).

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
