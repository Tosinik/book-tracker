-- Book Tracker — add enrichment cache fields to books + a write-back policy
-- Applied to the Supabase project (ref: fektvgvwwezbznbzwfnq) on 2026-07-09
-- via the Supabase MCP (migration name: add_books_enrichment_fields).
--
-- Slice 2 (2026-07-09): lazy Open Library enrichment. cover_url / description /
-- page_count / open_library_id already existed on books; this adds the rest.
--   subjects              — raw OL subjects, for the Phase 3 taste profile.
--   enrichment_attempted_at — stamped on EVERY attempt (hit or miss) so books we
--                             can't resolve aren't re-searched on every view.
--   enrichment_source     — 'isbn' (high confidence) vs 'search' (title+author
--                             matched); also lets us measure the coverage gain.

alter table public.books
  add column if not exists subjects jsonb,
  add column if not exists enrichment_attempted_at timestamptz,
  add column if not exists enrichment_source text
    check (enrichment_source in ('isbn', 'search'));

-- books is a shared cache. Until now authenticated users could only SELECT and
-- INSERT it; enrichment writes results back with UPDATE, so we add an UPDATE
-- policy.
--
-- WARNING (Phase 4 blocker): using(true)/check(true) lets ANY authenticated user
-- rewrite ANY book's cached data. Harmless while there is one user, but before
-- social features bring in other accounts this must move server-side (a trusted
-- route or DB function) and THIS open policy must be removed. Logged in
-- PROJECT_STATE known issues.
create policy "books_update_authenticated"
  on public.books for update to authenticated
  using (true) with check (true);
