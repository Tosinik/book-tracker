-- Book Tracker — schema v1
-- Applied to the Supabase project (ref: fektvgvwwezbznbzwfnq) on 2026-07-09
-- via the Supabase MCP (migration name: schema_v1).
--
-- This file is kept in version control as a record of the applied schema.
-- We are not using the Supabase CLI locally yet, so it is documentation only.

create table public.books (
  id uuid primary key default gen_random_uuid(),
  open_library_id text unique,
  title text not null,
  authors text[] default '{}',
  cover_url text,
  description text,
  published_year int,
  page_count int,
  isbn text,
  created_at timestamptz not null default now()
);

create table public.user_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  status text not null default 'want_to_read'
    check (status in ('want_to_read','currently_reading','read','dnf')),
  rating int check (rating between 1 and 10),
  review text,
  started_at date,
  finished_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, book_id)
);
create index user_books_user_id_idx on public.user_books(user_id);

create table public.shelves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.shelf_books (
  shelf_id uuid not null references public.shelves(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (shelf_id, book_id)
);
create index shelf_books_book_id_idx on public.shelf_books(book_id);

-- Row Level Security
alter table public.books       enable row level security;
alter table public.user_books  enable row level security;
alter table public.shelves     enable row level security;
alter table public.shelf_books enable row level security;

create policy "books readable by authenticated" on public.books
  for select to authenticated using (true);
create policy "authenticated can add books" on public.books
  for insert to authenticated with check (true);

create policy "read own user_books" on public.user_books
  for select to authenticated using (auth.uid() = user_id);
create policy "insert own user_books" on public.user_books
  for insert to authenticated with check (auth.uid() = user_id);
create policy "update own user_books" on public.user_books
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own user_books" on public.user_books
  for delete to authenticated using (auth.uid() = user_id);

create policy "read own shelves" on public.shelves
  for select to authenticated using (auth.uid() = user_id);
create policy "insert own shelves" on public.shelves
  for insert to authenticated with check (auth.uid() = user_id);
create policy "update own shelves" on public.shelves
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own shelves" on public.shelves
  for delete to authenticated using (auth.uid() = user_id);

create policy "read own shelf_books" on public.shelf_books
  for select to authenticated
  using (exists (select 1 from public.shelves s where s.id = shelf_id and s.user_id = auth.uid()));
create policy "insert own shelf_books" on public.shelf_books
  for insert to authenticated
  with check (exists (select 1 from public.shelves s where s.id = shelf_id and s.user_id = auth.uid()));
create policy "delete own shelf_books" on public.shelf_books
  for delete to authenticated
  using (exists (select 1 from public.shelves s where s.id = shelf_id and s.user_id = auth.uid()));
