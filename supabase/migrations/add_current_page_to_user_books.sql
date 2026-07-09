-- Book Tracker — add current_page to user_books
-- Applied to the Supabase project (ref: fektvgvwwezbznbzwfnq) on 2026-07-09
-- via the Supabase MCP (migration name: add_current_page_to_user_books).
--
-- Phase 1 decision (2026-07-09): Now Reading progress needs a page position.
-- Nullable so the 673 imported rows keep NULL (no backfill). Progress renders
-- only when BOTH user_books.current_page and books.page_count exist.

alter table public.user_books
  add column current_page int check (current_page >= 0);
