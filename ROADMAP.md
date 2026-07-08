# ROADMAP.md — Book Tracking App

Phases are sequential. A phase is done when everything in it works end-to-end and is committed. Don't start the next phase early.

## Phase 0 — Foundation
- [ ] Create Next.js project (TypeScript, Tailwind, App Router)
- [ ] Set up Supabase project, connect via environment variables
- [ ] Email/password auth (sign up, log in, log out)
- [ ] Database schema v1: `books` (cached book data), `user_books` (user's log: status, rating, review, dates), `shelves`, `shelf_books`
- [ ] Row Level Security policies on all tables
- [ ] Basic app shell: navigation, empty library page
- [ ] Git repo initialized, first deploy to Vercel (with approval)

## Phase 1 — Core logging
- [ ] Book search via Open Library API (title/author/ISBN)
- [ ] Book detail page: cover, description, authors, author's other books
- [ ] Add book to library with status: Want to Read / Currently Reading / Read / DNF
- [ ] Star rating in 0.5 steps (interactive star component)
- [ ] Write/edit/delete text reviews
- [ ] Custom shelves: create, rename, delete, add/remove books
- [ ] Library view with filtering by status and shelf
- [ ] Reading dates (started / finished)

## Phase 2 — Search & discovery
- [ ] Improved search results (covers, year, edition handling)
- [ ] Upcoming releases via Google Books API
- [ ] One-click "Want to Read" from search results
- [ ] Author pages with full bibliography

## Phase 3 — Analytics & taste learning
- [ ] Stats dashboard: books/pages per month & year, average rating, genre breakdown
- [ ] Attribute tagging system: user tags books with traits (slow plot, great characterization, cozy, plot-driven, etc.)
- [ ] Suggested tags the user can confirm/reject (system learns from this)
- [ ] "Your taste profile": which genres and attributes correlate with your high ratings
- [ ] Yearly reading wrap-up view

## Phase 4 — Social
- [ ] Public profile toggle (private by default)
- [ ] Friend requests / following
- [ ] Activity feed: what friends are reading, rating, reviewing
- [ ] Compare shelves with a friend
- [ ] (Later) comments on reviews, reading challenges

## Icebox (ideas, not commitments)
- Import from Goodreads CSV export
- Mobile app / PWA
- Reading progress tracking (page/percent updates)
- Book club features
