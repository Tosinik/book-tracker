# CLAUDE.md — Book Tracking App ("Better Goodreads")

## Who you're working with
The project owner is a non-developer learning to code through this project. Adjust accordingly:
- After implementing anything, give a short plain-language explanation of what was built and why.
- When introducing a new concept (API route, database migration, React hook, etc.) for the first time, explain it in 2-3 sentences.
- Prefer simple, readable code over clever code. No premature abstractions.

## Hard rules — always ask before:
- Deploying anything (Vercel or elsewhere)
- Running database migrations or deleting/altering existing tables
- Installing new dependencies beyond the agreed stack
- Making any change that costs money or creates external accounts
- Deleting files or large refactors

## Tech stack (do not change without discussion)
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Backend/DB/Auth:** Supabase (Postgres, Row Level Security on all tables)
- **Book data:** Open Library API (primary, no key needed), Google Books API (fallback / upcoming releases)
- **Hosting:** Vercel (deploy only when explicitly approved)

## Workflow
1. At the start of every session, read PROJECT_STATE.md and ROADMAP.md.
2. Work on ONE task at a time from the current roadmap phase. Do not jump ahead to later phases.
3. Use plan mode / propose an approach before writing significant code.
4. Commit with a clear message after each working feature. Never leave the repo in a broken state at session end.
5. At the end of every session, update PROJECT_STATE.md: what was done, what's next, any open decisions or known bugs.

## Code conventions
- TypeScript everywhere, no `any` unless unavoidable (explain when used).
- All Supabase tables get Row Level Security policies from day one — social features come later and data must be private by default.
- Keep API calls to Open Library in a single service file (`lib/books/`) so the data source can be swapped later.
- Star ratings are stored as integers 1–10 (representing 0.5–5.0 stars) to avoid floating point issues.
- Never hardcode secrets. Environment variables only, `.env.local` is gitignored.

## Product principles
- Fast and pleasant to use — this exists because Goodreads feels slow and dated.
- The user's own reading log is the core. Social is a later layer, never a requirement.
- Analytics should feel personal and learnable (user can tag books with attributes like "slow plot", "great characterization" and the system learns preferences from those).
