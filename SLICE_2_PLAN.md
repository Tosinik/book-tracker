# SLICE_2_PLAN.md — Book Detail Page + Lazy Enrichment

> Phase 1, Slice 2. Reviewed and green-lit by Chat on 2026-07-09. This is the
> biggest slice of Phase 1. Read alongside DESIGN_DIRECTION.md / DESIGN_HANDOFF.md.

## Why enrichment matters (the numbers)
Of the **673 imported books, 151 (22.4%) have no ISBN** — the Goodreads Kindle-edition
import gap (e.g. *The Stone Sky*, `isbn: null`). Covers today are built from the ISBN, so
those 151 can *never* show art. The 522 with ISBNs are the current cover ceiling, and even
some of those fall back when Open Library's ISBN endpoint 404s for that edition. Enrichment
is what breaks past the ceiling. Pre-enrichment, `cover_url` / `open_library_id` are NULL on
all 673 rows.

## Migration — DONE (`add_books_enrichment_fields`, 2026-07-09)
`cover_url`, `description`, `page_count`, `open_library_id` already existed. Added:
- `subjects jsonb` — raw OL subjects for the Phase 3 taste profile.
- `enrichment_attempted_at timestamptz` — stamped on **every** attempt, hit OR miss, so
  unresolvable books aren't re-searched on every view (cache the miss, not just the hit).
- `enrichment_source text check in ('isbn','search')` — how the cover was resolved; also
  makes the coverage gain measurable afterward.
- An UPDATE policy on `books` for authenticated users so enrichment can write back.

> **Phase 4 blocker (logged in PROJECT_STATE):** that UPDATE policy is `using(true)/check(true)`
> — any authenticated user can rewrite any book's cached data. Fine with one user; before
> social launches, enrichment writes move server-side and this open policy is removed.

## Enrichment algorithm (`lib/books/enrich.ts` — all OL access stays under `lib/books/`)
`enrichBook(book)`, run server-side. Order:
1. **Skip if `enrichment_attempted_at` is set.** Never re-work a book.
2. **ISBN path (ISBN present):** `GET openlibrary.org/isbn/{isbn}.json` for cover / page count
   / work link; fetch the work for description + subjects. `enrichment_source = 'isbn'`.
3. **Search fallback (no ISBN, OR the ISBN path found no cover):**
   - **Strip the Goodreads series suffix first:** `"The Stone Sky (The Broken Earth, #3)"` →
     `"The Stone Sky"`. Strip a trailing parenthetical containing `#` (`/\s*\([^)]*#\d+[^)]*\)\s*$/`)
     — unambiguously Goodreads series notation, so it won't eat real subtitles.
   - `GET openlibrary.org/search.json?title={clean}&author={author}&limit=5&fields=key,author_name,cover_i,number_of_pages_median,first_publish_year`.
   - **Author sanity-check before caching:** normalize (lowercase, strip diacritics/punctuation)
     both our stored author and the result's `author_name`; require a match (surname + token
     overlap). No match → cache nothing but still stamp `enrichment_attempted_at`. **A fallback
     tile beats a wrong cover.**
   - Confident match → build `cover_url` from `cover_i`, store work `key` as `open_library_id`,
     pull description/subjects from the work. `enrichment_source = 'search'`.
4. **Always** set `enrichment_attempted_at = now()` at the end, hit or miss.

### Fetcher gotcha — Open Library `description` shape
OL's work JSON is inconsistent: `description` is **sometimes a plain string, sometimes an
object `{"type": ..., "value": "..."}`**. Handle both, or ~half the descriptions import as
`[object Object]` or crash. Normalize to a string on read.

### Politeness
Descriptive `User-Agent`, throttle to ~1–2 req/s. Whole backfill of 673 ≈ 10 minutes.

## Backfill — one-off, throttled (approved)
Lazy-only enrichment would hit Open Library live on every library visit — the same render-time
API dependence that caused flaky covers. Instead: a **one-off throttled backfill** front-loads
the cost once (~10 min at 1–2 req/s), and the grid then serves purely from cache. Same
throwaway-script-with-dry-run pattern as the Goodreads import (a proven playbook):
1. **Dry-run count first** — how many books, how many via ISBN vs search, before any writes.
2. Run for real, RLS-respecting (authenticated as the user, no service key).
3. **Report coverage by `enrichment_source`** afterwards: 522 ceiling → ? (ISBN vs search hits,
   and remaining fallbacks). This after-number goes into the README:
   *"673 books, X% with cover art, auto-enriched from Open Library."*

## Consuming the covers
`BookCover` (and the library grid query) prefer the cached `cover_url`, then fall back to the
ISBN-derived URL, then the typographic tile. Enriched no-ISBN books (like *The Stone Sky*) then
show real art everywhere, not just on the detail page.

## Book detail page UI (the other half of the slice)
Big cover, metadata, description; interactive **0.5-step star rating** (store int 1–10), status
pills (Want to Read / Currently Reading / Read / DNF), review editor. **SKIP "Readers also
loved"** — that's Phase 3.

## Explicitly out of scope
"Readers also loved" / discovery (Phase 3). Custom shelves, search + add, reading dates are
later Phase 1 slices.
