# PROJECT_STATE.md — Session Memory

> Claude Code: read this at the start of every session, update it at the end of every session.

## Current phase
Phase 0 — Foundation (not started)

## Last session summary
No sessions yet. Project planning complete: stack chosen, roadmap and CLAUDE.md written.

## Next steps
1. Create the Next.js project locally
2. Create Supabase project and connect it
3. Build auth (sign up / log in)

## Decisions log
- 2026-07-08: Web app first, mobile later. Stack: Next.js + TypeScript + Tailwind + Supabase + Vercel.
- 2026-07-08: Book data from Open Library API (free, keyless); Google Books as fallback for upcoming releases.
- 2026-07-08: Ratings stored as integers 1–10 (= 0.5–5.0 stars).
- 2026-07-08: All data private by default; social features are opt-in in Phase 4.

## Known bugs / open questions
- None yet.

## Environment notes
- Supabase project URL / keys live in `.env.local` (never committed)
