# PROJECT_STATE.md — Session Memory

> Claude Code: read this at the start of every session, update it at the end of every session.

## Current phase
Phase 0 — Foundation ✅ COMPLETE (2026-07-09). Goodreads import done (673 books seeded).
Next: Phase 1 — Core logging.

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
1. Phase 1 — Core logging (Open Library search, book detail, add-to-library, ratings, reviews,
   shelves, filtered library view). PROPOSE APPROACH BEFORE BUILDING. Real data now exists to
   build against (673 imported books); fetch + cache book covers/descriptions lazily from Open
   Library as books are displayed (they were imported without them).

## Optional (helps Phase 1)
- Generate TypeScript types from the schema for typed Supabase queries.

## Goodreads import — agreed plan (2026-07-09, confirmed with Claude Chat)
- One-off seed SCRIPT (not a reusable feature yet). Raw Goodreads fields only.
- No Open Library enrichment now; fetch covers/descriptions lazily in Phase 1.
- Dedupe by ISBN13; fall back to title+author when ISBN13 is missing (Goodreads ISBNs often blank).
- Strip Goodreads' ="..." wrapping from ISBN/ISBN13 (keep only digits and X).
- DRY-RUN count first (totals, statuses, ratings, shelves), then insert after review.
- Mapping: Exclusive Shelf -> status (read/currently-reading/to-read ->
  read/currently_reading/want_to_read); My Rating 1-5 x2 -> rating 1-10, 0 -> null (unrated);
  My Review -> review; Date Read -> finished_at; Date Added -> created_at; custom Bookshelves
  (excluding the exclusive-shelf names) -> shelves + shelf_books.
- CSV stays in Downloads; generated seed data goes to the scratchpad, NEVER the repo.
- Inserts ran via a throwaway supabase-js script authenticated AS the user (RLS-respecting; no
  service key or admin SQL needed for the inserts).
- RESULT (2026-07-09): imported 673 books, 673 user_books (492 read / 177 want_to_read /
  4 currently_reading; 483 rated; 470 with finish dates), 13 shelves, 166 shelf placements.
  Verified in DB and in the app (/library shows "673 books"). Books have NO covers/descriptions
  yet — enrich lazily from Open Library in Phase 1.

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
