# Handoff — Book Tracker (for the Claude Chat discussion)

*Written by Claude Code, 2026-07-09. Purpose: give Claude Chat the context to help
decide how/whether to do the Goodreads import. Paste this into the Chat project.*

---

## 1. Where the project is: Phase 0 is DONE ✅

A working, deployed foundation exists. All 7 Phase 0 tasks are complete and verified.

- **Live app:** https://book-tracker-mu-five.vercel.app
- **Code:** https://github.com/Tosinik/book-tracker (private)
- **Stack:** Next.js 16.2 (App Router) + TypeScript + Tailwind, Supabase (Postgres + Auth),
  deployed on Vercel (auto-deploys from `main`).

**What works right now:**
- Email/password auth: sign up, log in, log out (verified on the live site).
- A protected `/library` page that shows an empty state (no book-browsing UI yet — that's Phase 1).
- Database tables, all with Row Level Security so each user only sees their own data:
  - `books` — shared cache of book info (title, authors, cover_url, description, isbn, page_count, published_year, open_library_id).
  - `user_books` — a person's log per book: `status` (want_to_read / currently_reading / read / dnf), `rating` (int 1–10 = 0.5–5 stars), `review`, `started_at`, `finished_at`.
  - `shelves` — custom named shelves.
  - `shelf_books` — which books are on which shelf.

**Note:** there is **no book-adding UI yet.** Adding/searching books is Phase 1. So importing
Goodreads data would fill the *database*, but you won't see a nice shelf until we build that UI.

---

## 2. The question on the table: the Goodreads import

Niklas wants to import his Goodreads library to fill his account with **real data for testing**.
This is currently an **Icebox** item in `ROADMAP.md` ("ideas, not commitments") — i.e. ahead of
the planned roadmap. That's a fine call for the project owner to make; this doc is to decide *how*.

### The data lines up well
A Goodreads CSV export has columns that map cleanly onto our schema:

| Goodreads column | → Our field | Notes |
|---|---|---|
| Title | `books.title` | |
| Author (+ Additional Authors) | `books.authors[]` | |
| ISBN / ISBN13 | `books.isbn` | also usable to look up Open Library data |
| Number of Pages | `books.page_count` | |
| Original Publication Year | `books.published_year` | |
| Exclusive Shelf | `user_books.status` | read→read, currently-reading→currently_reading, to-read→want_to_read |
| My Rating (0–5) | `user_books.rating` | ×2 → our 1–10; 0 = unrated (null) |
| My Review | `user_books.review` | |
| Date Read | `user_books.finished_at` | |
| Bookshelves | `shelves` + `shelf_books` | custom shelves beyond the exclusive ones |

Goodreads has **no "DNF"** status natively (some people use a custom shelf for it).

### How it would be done (mechanically)
Because Claude Code has admin database access, the import can be a **one-off script**: parse the
CSV and insert rows into `books` / `user_books` / `shelves` / `shelf_books` for Niklas's account
(user_id `3b0e03f3-...`). No new app UI is required to load the data.

### ⚠️ Open questions for Chat to weigh in on
1. **Timing — now or after Phase 1?** Importing now gives us *real data to build the Phase 1 UI
   against* (much better than fake data). Downside: until the Phase 1 library view exists, Niklas
   won't really *see* the imported books. Worth it, or wait?
2. **Enrichment — raw vs. Open Library lookups?** Goodreads gives title/author/ISBN but **no cover
   images or descriptions.** We could enrich each book via the Open Library API during import
   (nicer data) — but that's hundreds of API calls and more complexity. Alternative: import raw now,
   and fetch+cache covers/descriptions lazily in Phase 1 when a book is first viewed. (Code's lean:
   import raw now, enrich lazily later.)
3. **One-off seed vs. real feature?** Do this as a throwaway seed script for Niklas's account, or
   build it as the proper reusable "Import from Goodreads" feature (the actual Icebox item, more
   work, reusable for future users)? (Code's lean: one-off seed now; proper feature much later.)
4. **De-duplication / re-imports.** If we run it twice, or add books later, how do we avoid
   duplicate `books` rows? (Suggestion: dedupe by ISBN13 where present; `user_books` already has a
   unique (user, book) constraint.)
5. **Data volume & privacy.** How big is the library? The CSV contains personal reviews/notes — it
   stays in `Downloads`, is read directly from there, and is **never** copied into the git repo.

### Claude Code's recommendation (for Chat to react to)
Do a **one-off SQL/script seed now**, importing the **raw** Goodreads fields (title, authors, isbn,
pages, year, status, rating×2, review, dates, shelves). Skip Open Library enrichment for now and
fetch covers/descriptions lazily during Phase 1. This gets real data in fast, with low risk, and
gives us realistic material to build the Phase 1 UI against — without a big upfront API crawl or
building the full import feature prematurely.

---

## 3. Other small open items (not blocking)
- Set Supabase Auth **"Site URL"** to the Vercel domain before building password-reset/email flows.
- Optionally generate TypeScript types from the DB schema for typed Supabase queries (helps Phase 1).

## 4. Suggested next roadmap step (once Goodreads is decided)
**Phase 1 — Core logging:** Open Library search, book detail page, add-to-library with status,
interactive star rating, reviews, custom shelves, and a filterable library view.
