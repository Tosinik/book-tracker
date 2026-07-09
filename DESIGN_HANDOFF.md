# DESIGN_HANDOFF.md — Phase 1 kickoff (Design → Code / Chat)

*From the Design sync, 2026-07-09. Purpose: hand Code + Chat a locked visual direction and a
concrete build order so Phase 1 (Core logging) can start. Pairs with `DESIGN_DIRECTION.md`
(the token/spec sheet) — read that for exact colors, type, and component specs.*

---

## 1. What happened in the Design sync

We designed the whole Phase 1 flow, mobile-web first, in an **editorial / magazine** style, and
picked a single direction to build against.

- **Direction locked: "The Mix — Stacks × Journal."** Warm paper, serif masthead (Newsreader),
  a personal "Now Reading" hero + dated reading log, and a cover-gallery grid with a grid/list
  toggle. Feels like a reading journal but stays data-legible for a serious reader.
- **Real covers** are wired in from Open Library, with a **typographic fallback tile** for the
  many ISBNs that have no art (this is a first-class state, not an error).
- **Dark mode** designed too — a warm near-black palette (not flat grey-on-black), with a
  system-preference default + manual toggle.

The interactive design file (all screens, live toggles) lives in the **Design project**, not
this repo: `Library Directions.dc.html`. Screens designed:
1. **Library** — Now Reading hero + cover grid / list toggle + filter chips.
2. **Search & add** — search field, Open Library results, `＋ Shelf`, manual-add fallback.
3. **Book detail** — big cover, interactive 0.5-step star rating, status pills, review card,
   shelves, reading dates, "Readers also loved."
4. **Beyond your bubble** — recommendations grounded in the user's own high ratings (Phase 3
   tease, not a Phase 1 requirement).
5. **Dark mode** — Library + Detail re-themed.

---

## 2. Build order for Phase 1 (start here)

Agreed sequence — front-load the payoff so the 673 imported books become visible fast:

1. **Library view + cover fetching FIRST.** Render the user's `user_books` as the cover grid
   (grid/list toggle, status filter chips, Now Reading hero). This alone turns the imported
   library into something you can actually see — great motivation before the less glamorous parts.
2. **Book detail page** — cover, metadata, description; then the interactive **star rating**
   (0.5 steps, stored int 1–10), **status** (want/reading/read/dnf), **review** editor.
3. **Custom shelves** — create/rename/delete + add/remove; show as chips on detail + filter in library.
4. **Search (Open Library)** → add-to-library with status. One-click "Want to read" from results.
5. **Reading dates** (started/finished) on detail.

(Discovery / "beyond your bubble" is Phase 3 — designed early because the user's excited about it,
but don't build it in Phase 1.)

---

## 3. Cover fetching (the first real infra task)

- Endpoint: `https://covers.openlibrary.org/b/isbn/{ISBN}-{S|M|L}.jpg` — use **`M`** for grid/list,
  **`L`** for hero + detail.
- Store the resolved `cover_url` on the `books` cache row (schema already has `cover_url`); fetch
  **lazily** on first view and cache — do not crawl all 673 up front (matches the Goodreads-import
  "import raw, enrich lazily" decision in the old HANDOFF).
- Render every cover in a **fixed 2:3 frame with `object-fit: cover`** so mismatched aspect ratios
  never look ragged.
- **Fallback is required.** Many ISBNs return no art (Open Library serves a blank/404). When the
  ISBN is missing *or* the image errors, render the typographic fallback tile: fallback-ground
  color + uppercase mono author + serif title. See spec for the ground palette.

---

## 4. Components → data notes

- **Star rating:** interactive, 0.5 steps, hover-preview + click. Store as **int 1–10** (per
  CLAUDE.md) — 4.5 stars = 9. Reference implementation (gold layer clipped to `rating/5*100%`
  over grey base + 10 half-width hit zones) is in the design file.
- **Status:** enum `want_to_read | currently_reading | read | dnf` (already in `user_books.status`).
- **Shelves:** `shelves` + `shelf_books` already exist — the detail page shelf chips map directly.
- Keep Open Library calls in `lib/books/` (per CLAUDE.md) so the source stays swappable.

---

## 5. Open questions for Chat

- **Genre/subject data:** Open Library subjects are noisy. Do we store a curated `genre` per book,
  or derive shelves from the user? (Affects the Phase 3 "taste profile" + discovery.)
- **Now Reading progress:** progress % needs a current-page field. Add `current_page` to
  `user_books` now, or defer page-progress to the Icebox item? Design shows it; DB doesn't have it yet.
- **Dark mode:** confirm system-default + manual toggle (persist choice where? localStorage vs.
  a user setting row).
- Still open from before: set Supabase Auth **Site URL**; the Goodreads import approach (raw seed
  vs. feature).

---

## 6. Files to pull into the repo

Commit these two alongside the code (or fold the spec into `CLAUDE.md`):
- `DESIGN_DIRECTION.md` — color tokens (light + dark), type, cover + fallback rules, component specs.
- `DESIGN_HANDOFF.md` — this sheet.

The live, clickable design (with the interactive stars and theme toggle) stays in the Design
project — link it from `PROJECT_STATE.md` for reference while building.
