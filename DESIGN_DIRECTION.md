# Book Tracker — Visual Design Direction ("The Mix: Stacks × Journal")

*Paste the relevant parts into the repo's `CLAUDE.md` so Phase 1 screens are built to a
consistent spec. Design source of truth: `Library Directions.dc.html` (option 2a + turn 3).*

## Overall feel
Editorial / magazine: elegant, typographic, generous whitespace, warm paper. Personal and
diaristic (a reading journal), but data-legible for a serious reader. Mobile-web first.

## Color tokens
| Token | Hex | Use |
|---|---|---|
| `paper` | `#f5efe3` | app background |
| `paper-raised` | `#fbf7ee` | cards, review box, callouts |
| `ink` | `#2a2622` | primary text |
| `ink-soft` | `#6a655d` | secondary text |
| `muted` | `#8a8171` | tertiary / captions |
| `line` | `rgba(42,38,34,.12)` | hairline dividers |
| `border` | `#e2d9c6` / `#ddd3c0` | input & chip borders |
| `accent` (terracotta) | `#b5502f` | primary action, active chip, rating pips |
| `accent-ink` (journal blue) | `#345074` | progress bars, review meta, rating number |
| `star-gold` | `#d98324` | filled stars |
| `star-empty` | `#ddd2bf` | empty stars |
| `label-mono` | `#a39a88` / `#b09a72` | mono section labels |

### Dark mode (warm, not flat black)
| Token | Light | Dark |
|---|---|---|
| `paper` | `#f5efe3` | `#17140f` |
| `raised` | `#fbf7ee` | `#211d16` |
| `ink` | `#2a2622` | `#efe7d7` |
| `ink-soft` | `#6a655d` | `#b3a996` |
| `muted` | `#8a8171` | `#8f8574` |
| `label` | `#a39a88` | `#9a8f7b` |
| `line` | `rgba(42,38,34,.12)` | `rgba(255,255,255,.10)` |
| `border` / `chip` | `#ddd3c0` / `#eae2d1` | `#3a342a` / `#2a251d` |
| `accent` | `#b5502f` | `#d47a4f` |
| `accent-ink` | `#345074` | `#8aa6cd` |
| `star-gold` / `empty` | `#d98324` / `#ddd2bf` | `#e0972f` / `#453f31` |

Covers and fallback grounds are **theme-independent** (unchanged between modes). Default to the
system preference (`prefers-color-scheme`) with a manual override toggle.

Cover fallback grounds (for books with no art): muted editorial tones —
`#23485a #2c2b31 #7c2f2a #22314a #24503f #30343c #2f4a3c #5c2b3a #3a4a63 #6b2230 #1e2740 #4a3560 #2c4a44`
plus warm `#a9752a` / `#bb8a2a` (use dark ink `#241c10` on those two). Cover text ink: `#f3ead8`.

## Type
- **Display / titles:** Newsreader (serif), 400–500, occasional italic for emphasis.
- **UI / body:** Archivo (sans), 400–600.
- **Labels / metadata:** JetBrains Mono, 600, uppercase, letter-spacing ~.2em for section
  eyebrows and ~.1em for inline meta.
- Google Fonts. (Instrument Serif was only for the alt "Journal" direction 1b — not used in 2a.)

## Covers (the core visual)
- Source: Open Library — `https://covers.openlibrary.org/b/isbn/{ISBN}-{S|M|L}.jpg`
  (`M` for grids/lists, `L` for hero + detail).
- Render in a **fixed-ratio frame (2:3)** with `object-fit: cover` so mismatched aspect
  ratios never look ragged. Small radius (2–4px), soft shadow.
- **Fallback is mandatory** (many of the 673 ISBNs return no art): a typographic tile on a
  fallback ground — uppercase mono author top-left, serif title bottom-left, faint inset
  border. Detect a real miss by ISBN absence *or* image `onerror`. See Locke Lamora,
  Dungeon Crawler Carl, The Will of the Many in the design.

## Components
- **Star rating:** 5 stars, **0.5 steps**, interactive (hover previews, click sets). Implement
  as gold layer clipped to `rating/5*100%` over a gray base, with 10 invisible half-width hit
  zones. Show the numeric value beside it. (Storage stays int 1–10 per CLAUDE.md.)
- **Status:** pills — Want to read / Reading / Read / DNF. Active = solid `ink` fill.
- **Filter chips:** rounded; active = solid `accent`, inactive = `ink-soft` text + `border`.
- **Grid / list toggle:** small segmented control, active tab = white chip with soft shadow.
- **Now Reading hero:** cover + title/author + `accent-ink` progress bar + "p.X · Y%" mono.
- **Library list rows:** cover thumb, serif title, sans author, mono finished-date, rating
  (serif number + mono pips). Grid rating shown *below* the cover, not over the art.

## Screens designed
1. **Library** (2a) — Now Reading hero + cover grid / list toggle + filter chips.
2. **Search & add** (3a) — search field, Open Library results with `＋ Shelf`, manual-add fallback.
3. **Book detail** (3b) — big cover, interactive stars, status pills, review card, shelves,
   reading dates, "Readers also loved".
4. **Beyond your bubble** (3c) — recommendations grounded in the user's actual ratings, each with
   a reason + a "why this is outside your usual" tag. (Roadmap Phase 3, teased now.)

## Principles
- Fast and pleasant; the reading log is the hero, social/analytics are later layers.
- Never a broken-looking shelf — the fallback tile is a first-class state, not an error.
