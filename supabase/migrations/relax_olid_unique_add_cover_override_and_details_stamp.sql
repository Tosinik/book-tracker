-- Book Tracker — Slice 2 (book detail page): relax open_library_id UNIQUE,
-- add per-user cover override, add a lazy-details miss-cache stamp.
-- Applied to the Supabase project (ref: fektvgvwwezbznbzwfnq) on 2026-07-18
-- via the Supabase MCP (migration name:
-- relax_olid_unique_add_cover_override_and_details_stamp).
--
-- This file is kept in version control as a record of the applied schema.

-- 1) Drop the UNIQUE on books.open_library_id. Multiple imported library rows
--    legitimately resolve to the same Open Library work (e.g. two "Storm Front"
--    rows). Verified constraint name against pg_constraint = books_open_library_id_key.
alter table public.books
  drop constraint if exists books_open_library_id_key;

-- 2) Per-user cover choice. Lives on user_books, NEVER on the shared books row —
--    overriding books.cover_url would change the cover for every user and trips the
--    Phase 4 RLS blocker. Read order everywhere: override -> cover_url -> ISBN -> tile.
alter table public.user_books
  add column if not exists cover_url_override text;

-- 3) Lazy details backfill stamp (mirrors enrichment_attempted_at). The detail page
--    fills description/subjects/open_library_id on first view. Stamp EVERY attempt
--    (hit OR miss) so a failed work lookup is recorded and never retried on later
--    visits — same cache-the-miss lesson as the cover enrichment. Gate for the
--    lazy fill: details_attempted_at IS NULL AND enrichment_source IS NOT NULL.
alter table public.books
  add column if not exists details_attempted_at timestamptz;
