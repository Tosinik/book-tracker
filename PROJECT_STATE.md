# PROJECT_STATE.md — Session Memory

> Claude Code: read this at the start of every session, update it at the end of every session.

## Current phase
Phase 0 — Foundation ✅ COMPLETE (2026-07-09). Goodreads import done (673 books seeded).
Phase 1 — Core logging: IN PROGRESS. Slice 1 (Library view + design system foundation) SHIPPED &
deployed 2026-07-09. Next: Slice 2 — Book detail page (enrichment + interactive stars + status +
review). Open questions resolved (see decisions log).

## Deploy
- Live URL: https://book-tracker-mu-five.vercel.app (Vercel, auto-deploys from GitHub main)
- GitHub: https://github.com/Tosinik/book-tracker (public as of 2026-07-09)
- Vercel env vars set: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- Both home + /login verified rendering in production with no errors.
- TODO later: set Supabase Auth "Site URL" to the Vercel domain (needed for
  email/password-reset redirect flows; not required for basic password login).

## Design (Phase 1 visual direction) — locked 2026-07-09
- Direction: "The Mix: Stacks × Journal" — editorial/magazine, warm paper, serif masthead
  (Newsreader), cover-gallery grid + grid/list toggle, Now Reading hero, dark mode. Mobile-web first.
- Specs committed to repo: [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md) (color tokens light+dark,
  type, cover + fallback rules, component specs) and [DESIGN_HANDOFF.md](DESIGN_HANDOFF.md)
  (Phase 1 build order + data notes).
- Interactive design (all screens, live star rating + theme toggle) lives in the Claude Design
  project as `Library Directions.dc.html`. Shareable link:
  https://claude.ai/design/p/d17d1900-ed3e-4ed8-ad16-573f2fed8183?file=Library+Directions.dc.html&via=share
- Phase 1 build order (front-loads the payoff): 1) Library view + lazy cover fetching,
  2) Book detail (cover/metadata/description, 0.5-step star rating, status, review), 3) custom
  shelves, 4) Open Library search + add, 5) reading dates. Discovery ("beyond your bubble") is
  Phase 3 (designed early, do NOT build in Phase 1).
- Covers: Open Library `covers.openlibrary.org/b/isbn/{ISBN}-{M|L}.jpg`, 2:3 frame + object-fit
  cover, mandatory typographic fallback tile for missing art. Keep OL calls in `lib/books/`.

## Last session summary
2026-07-09 (Slice 1): Shipped Phase 1 Slice 1 — the Library view + the "Stacks × Journal" design
system foundation. Color tokens (light+dark) + Newsreader/Archivo/JetBrains Mono fonts; data-theme
dark mode with a manual toggle (localStorage) + inline anti-flash script. Library view: Now Reading
hero, cover grid + list toggle, status filter chips, read-only star ratings; covers lazy-loaded
from Open Library by ISBN with a typographic fallback tile (lib/books/covers.ts). Added nullable
`user_books.current_page` (migration applied + recorded). Restyled home + login to the paper
palette; added a web app manifest + generated icons (a "B" on terracotta via next/og) so the site
is installable from mobile Chrome — no service worker yet. Verified via `next build` + live preview
(both themes). Repo also made public earlier same day. Committed + deployed.

2026-07-09 (Phase 0): COMPLETED PHASE 0 end to end. Scaffolded Next.js 16.2 (App Router, TS, Tailwind);
created + connected the Supabase project; built email/password auth (login/signup/logout +
proxy.ts session refresh); applied schema_v1 (books, user_books, shelves, shelf_books) with RLS;
built the app shell (Nav + protected /library). Pushed to GitHub (private) and deployed to Vercel.
Verified login on the LIVE site.

Auth note: the "Confirm email" toggle isn't present in this dashboard version, so the owner
account was created directly via SQL with email pre-confirmed.

## Next steps
1. Slice 2 — Book detail page + lazy enrichment. Plan: [SLICE_2_PLAN.md](SLICE_2_PLAN.md).
   COVER ENRICHMENT DONE & written to DB (2026-07-09):
   - `lib/books/enrich.ts` built + hardened: ISBN-first, then a free-text `q=` title+author
     search. Author check is 3-state (yes/no/nonlatin) — handles non-Latin author names
     (Murakami/Dostoevsky), strips "Jr."/initials, tolerates transliteration. TITLE must also
     agree (titleMatches) so we never take a different book by the same author or an omnibus.
     Two-attempt (author-anchored, then stricter title-only). Verified against live OL + controls.
   - **Coverage written: 636 / 673 books (94.5%) have `cover_url`** — 416 via ISBN, 220 via
     search; 37 genuine misses (obscure/foreign/self-pub/coverless on OL). ALL 673 rows have
     `enrichment_attempted_at` set. `page_count` + `enrichment_source` written too.
   - Grid/hero/list now read cached `cover_url` first, then ISBN URL, then fallback tile
     (BookCover + library query updated).
   REMAINING for Slice 2:
   a) **descriptions + subjects NOT yet written** — the compact DB write omitted them (the full
      dataset was ~840KB, too big to stream through the Supabase MCP; descriptions have no UI yet).
      Write them when building the detail page, OR run an all-fields script. The enrich module
      already fetches them (fetchDetails:true).
   b) **open_library_id NOT written** — its UNIQUE constraint collides with genuine library
      duplicates (two "Cat's Cradle" rows). Populate per-book on the detail page.
   c) Book detail page UI: cover/metadata/description, interactive 0.5-step stars (store int
      1–10), status pills, review editor. SKIP "Readers also loved" (Phase 3).
   Then (later slices): custom shelves, search + add, reading dates.
2. Enrichment gotcha found: some CSV authors have a DOUBLE space ("Ryan  Cahill", "Brian
   McClellan", "Jim  Butcher", "Stephen  King", "Richard  Swan") but the DB import stored them
   single-spaced — so title+author matching on those failed until re-matched by title. If any
   future script matches books by author string, normalize internal whitespace.
3. Home + login restyled and manifest/icons added in the Slice-1 housekeeping bundle — no polish
   outstanding there.

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
- 2026-07-09: GitHub repo made public (scrubbed owner email from docs first; history secret-scanned
  clean — no .env/keys/CSV ever committed; data stays private via Supabase RLS). Email confirmation
  left ON (couldn't disable in dashboard); users created/confirmed via SQL when needed.
- 2026-07-09: Goodreads import (Icebox) pulled forward and DONE — 673 books seeded as real test
  data (confirmed with Claude Chat).
- 2026-07-09: Phase 1 visual direction locked with Claude Design — "The Mix: Stacks × Journal"
  (see DESIGN_DIRECTION.md / DESIGN_HANDOFF.md).
- 2026-07-09: Phase 1 green-lit by Chat (docs reviewed consistent). Open questions resolved:
  (1) NO curated `genre` column — but when lazily enriching from Open Library, also cache raw
  `subjects` (JSON) and `page_count` on the `books` row for the Phase 3 taste profile.
  (2) Add nullable `current_page` to `user_books` now (migration proposed before running). Now
  Reading progress renders ONLY when both `current_page` and `page_count` exist; degrades
  gracefully otherwise. (3) Dark mode = system default + manual toggle persisted in localStorage,
  with an inline anti-flash script in <head>. Also: SKIP "Readers also loved" on book detail
  (that's Phase 3).

## Known bugs / open questions
- Set Supabase Auth "Site URL" to the Vercel domain before building password-reset/email flows.
- (RESOLVED 2026-07-09 — see decisions log) Phase 1 design open questions: genre column,
  current_page, dark-mode persistence.
- **PHASE 4 BLOCKER (RLS on `books` cache).** The `add_books_enrichment_fields` migration added a
  permissive UPDATE policy on `books` (`using(true)/check(true)`) so enrichment can cache results.
  Fine while there's one user, but it lets ANY authenticated user rewrite ANY book's cached
  cover/description/etc. Before social launches (Phase 4): move enrichment writes server-side
  (trusted route or DB function so regular users never need UPDATE on the shared cache) and REMOVE
  this open UPDATE policy. Do not ship social features with this policy in place.

## Environment notes
- Supabase project URL / keys live in `.env.local` (never committed)
- Node.js v24 is installed and on the machine PATH, so `node`/`npm` work in a normal terminal.
- Claude Code's tool shells run with a stripped-down PATH that omits Node, so `.claude/launch.json`
  invokes the dev server via node.exe by full path. To run the app yourself: open a terminal in this
  folder and run `npm run dev`, then visit http://localhost:3000.
