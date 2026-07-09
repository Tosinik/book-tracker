# PROJECT_STATE.md — Session Memory

> Claude Code: read this at the start of every session, update it at the end of every session.

## Current phase
Phase 0 — Foundation ✅ COMPLETE (2026-07-09). Next: Phase 1 — Core logging
(but discuss the Goodreads import with Claude Chat first — see HANDOFF.md).

## Deploy
- Live URL: https://book-tracker-mu-five.vercel.app (Vercel, auto-deploys from GitHub main)
- GitHub: https://github.com/Tosinik/book-tracker (private)
- Vercel env vars set: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- Both home + /login verified rendering in production with no errors.
- TODO later: set Supabase Auth "Site URL" to the Vercel domain (needed for
  email/password-reset redirect flows; not required for basic password login).

## Last session summary
2026-07-09: COMPLETED PHASE 0 end to end. Scaffolded Next.js 16.2 (App Router, TS, Tailwind);
created + connected the Supabase project; built email/password auth (login/signup/logout +
proxy.ts session refresh); applied schema_v1 (books, user_books, shelves, shelf_books) with RLS;
built the app shell (Nav + protected /library). Pushed to GitHub (private) and deployed to Vercel.
Verified login on the LIVE site.

Auth note: the "Confirm email" toggle isn't present in this dashboard version, so the user's
account (niklasstark1@gmail.com) was created directly via SQL, email pre-confirmed. See the
supabase-project memory for the method.

## Next steps
1. Discuss the Goodreads import with Claude Chat — see HANDOFF.md (parked, do not start until
   the user confirms after that discussion). CSV is at
   C:\Users\Niklas\Downloads\goodreads_library_export.csv (read from there; never copy into repo).
2. Phase 1 — Core logging (Open Library search, book detail, add-to-library, ratings, reviews,
   shelves, filtered library view). PROPOSE APPROACH BEFORE BUILDING.

## Optional (helps Phase 1)
- Generate TypeScript types from the schema for typed Supabase queries.

## Decisions log
- 2026-07-08: Web app first, mobile later. Stack: Next.js + TypeScript + Tailwind + Supabase + Vercel.
- 2026-07-08: Book data from Open Library API (free, keyless); Google Books as fallback for upcoming releases.
- 2026-07-08: Ratings stored as integers 1–10 (= 0.5–5.0 stars).
- 2026-07-08: All data private by default; social features are opt-in in Phase 4.
- 2026-07-09: GitHub repo is private. Email confirmation left ON (couldn't disable in dashboard);
  users created/confirmed via SQL when needed.
- 2026-07-09: Goodreads import (Icebox) may be pulled forward for real test data, pending a
  discussion with Claude Chat. Not started.

## Known bugs / open questions
- Set Supabase Auth "Site URL" to the Vercel domain before building password-reset/email flows.
- Goodreads import approach is undecided (one-off SQL seed vs. a real import feature; whether to
  enrich with Open Library covers) — to be resolved with Claude Chat. See HANDOFF.md.

## Environment notes
- Supabase project URL / keys live in `.env.local` (never committed)
- Node.js v24 is installed and on the machine PATH, so `node`/`npm` work in a normal terminal.
- Claude Code's tool shells run with a stripped-down PATH that omits Node, so `.claude/launch.json`
  invokes the dev server via node.exe by full path. To run the app yourself: open a terminal in this
  folder and run `npm run dev`, then visit http://localhost:3000.
