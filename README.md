# Book Tracker

A faster, friendlier reading log — a personal alternative to Goodreads, built for readers who
want their library to load fast and feel good to use. Track what you've read, rate it (half-star
precision), keep reviews and custom shelves, and see what you're reading now.

**Live site:** https://book-tracker-mu-five.vercel.app

## Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Backend / Auth / DB:** Supabase (Postgres with Row Level Security on every table)
- **Book data:** Open Library API (covers, metadata), Google Books as a fallback
- **Hosting:** Vercel (auto-deploys from `main`)

All personal reading data is private by default, enforced at the database level by Row Level
Security — a public repo does not expose anyone's library.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. You'll need a `.env.local` with your own Supabase project keys
(see `.env.example` for the variable names). `.env.local` is gitignored — never commit real keys.

## Status

Early stage. Phase 0 (auth, schema, deploy) is complete; Phase 1 (core logging — library view,
book detail, ratings, shelves, search) is in progress.

---

Built with [Claude Code](https://claude.com/claude-code) + Claude Design.
