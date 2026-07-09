# PROJECT_STATE.md — Session Memory

> Claude Code: read this at the start of every session, update it at the end of every session.

## Current phase
Phase 0 — Foundation (in progress)

## Last session summary
2026-07-08/09: (1) Scaffolded Next.js (App Router, TS, Tailwind, Next 16.2). (2) Created Supabase
project `book-tracker` (ref fektvgvwwezbznbzwfnq, eu-central-1, free) and connected via `.env.local`;
client helpers in src/lib/supabase/. (3) Built email/password auth: login/signup page + server
actions (src/app/login), home shows signed-in state, proxy.ts refreshes sessions. Error paths
verified live; HAPPY PATH still unverified (see open questions). (4) Applied `schema_v1` migration:
tables books, user_books, shelves, shelf_books, all with RLS enabled and owner-only policies
(books is shared read/insert by design). SQL recorded in supabase/migrations/schema_v1.sql.

## Next steps — ONLY the Vercel deploy remains in Phase 0
1. First Vercel deploy — ASK FIRST. Needs: push repo to GitHub (also ask),
   connect to Vercel, set the two NEXT_PUBLIC_SUPABASE_* env vars in Vercel.
   That closes Phase 0.

Auth is DONE and verified end-to-end (login/library/logout all work). The
"Confirm email" toggle isn't available in this dashboard version, so the account
was created directly via SQL — see the supabase-project memory for the auth
quirk and the method. Test account: niklasstark1@gmail.com.

## Parked for after Phase 0 (confirm with Chat first)
- Goodreads import (ICEBOX, pulled forward on request). CSV is at
  C:\Users\Niklas\Downloads\goodreads_library_export.csv. Do not start until
  Phase 0 is done and the user confirms.

## Optional (helps Phase 1)
- Generate TypeScript types from the schema for typed Supabase queries.

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
