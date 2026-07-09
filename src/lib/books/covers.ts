// Open Library cover helpers. All Open Library access lives under lib/books/ so
// the data source stays swappable later (per CLAUDE.md).

export type CoverSize = "S" | "M" | "L";

/**
 * Build a deterministic Open Library cover URL from an ISBN. Returns null when
 * there's no usable ISBN. `?default=false` makes Open Library return a 404 for
 * missing art (instead of a blank placeholder image), so the <img> onError fires
 * and we can show the typographic fallback tile.
 */
export function coverUrlFromIsbn(
  isbn: string | null | undefined,
  size: CoverSize = "M",
): string | null {
  if (!isbn) return null;
  const clean = isbn.replace(/[^0-9Xx]/g, "");
  if (!clean) return null;
  return `https://covers.openlibrary.org/b/isbn/${clean}-${size}.jpg?default=false`;
}

// Muted editorial grounds for books with no cover art (from DESIGN_DIRECTION.md).
const FALLBACK_GROUNDS = [
  "#23485a", "#2c2b31", "#7c2f2a", "#22314a", "#24503f", "#30343c",
  "#2f4a3c", "#5c2b3a", "#3a4a63", "#6b2230", "#1e2740", "#4a3560",
  "#2c4a44", "#a9752a", "#bb8a2a",
];
// The two warm ochres are light — they want dark ink on top, not the cream.
const DARK_INK_GROUNDS = new Set(["#a9752a", "#bb8a2a"]);

/**
 * Pick a stable ground + text color for a book's fallback tile. Seeded by the
 * ISBN (or title) so the same book always gets the same color.
 */
export function fallbackGround(seed: string): { bg: string; ink: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const bg = FALLBACK_GROUNDS[hash % FALLBACK_GROUNDS.length];
  const ink = DARK_INK_GROUNDS.has(bg) ? "#241c10" : "#f3ead8";
  return { bg, ink };
}
