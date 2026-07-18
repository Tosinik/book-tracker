// Open Library edition-cover lookup for the "change cover" picker. All Open
// Library access lives under lib/books/ so the data source stays swappable
// (per CLAUDE.md). Framework-free: fetch + normalize only, no Next/Supabase.

const OL_BASE = "https://openlibrary.org";
const OL_COVERS = "https://covers.openlibrary.org";
const USER_AGENT = "book-tracker/0.1 (+https://github.com/Tosinik/book-tracker)";

export type EditionCover = {
  coverId: number;
  /** Medium cover for the picker grid. */
  url: string;
};

/**
 * A work key from Open Library can arrive as "/works/OL123W" or bare "OL123W".
 * Return just the "OL…W" id, or null if it doesn't look like one.
 */
export function workIdFromKey(key: string | null | undefined): string | null {
  if (!key) return null;
  const m = key.match(/OL\d+W/);
  return m ? m[0] : null;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function asRecord(v: unknown): Record<string, unknown> | null {
  return typeof v === "object" && v !== null && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/**
 * List distinct cover images across a work's editions, newest-ish first as Open
 * Library returns them. Only editions that actually carry cover art are kept
 * (Open Library uses cover ids <= 0 as "no cover"), and duplicate cover ids are
 * collapsed so the picker doesn't show the same image twice.
 */
export async function fetchEditionCovers(
  workKey: string,
  limit = 24,
): Promise<EditionCover[]> {
  const workId = workIdFromKey(workKey);
  if (!workId) return [];

  let data: Record<string, unknown> | null = null;
  try {
    const res = await fetch(
      `${OL_BASE}/works/${workId}/editions.json?limit=200`,
      { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } },
    );
    if (!res.ok) return [];
    data = asRecord(await res.json());
  } catch {
    return [];
  }
  if (!data) return [];

  const seen = new Set<number>();
  const out: EditionCover[] = [];
  for (const raw of asArray(data["entries"])) {
    const entry = asRecord(raw);
    if (!entry) continue;
    for (const c of asArray(entry["covers"])) {
      if (typeof c !== "number" || c <= 0 || seen.has(c)) continue;
      seen.add(c);
      out.push({ coverId: c, url: `${OL_COVERS}/b/id/${c}-M.jpg` });
      if (out.length >= limit) return out;
    }
  }
  return out;
}
