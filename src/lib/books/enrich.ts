// Open Library enrichment. All Open Library access lives under lib/books/ so the
// data source stays swappable later (per CLAUDE.md).
//
// This module is intentionally framework-free (no Next/Supabase imports): it only
// fetches + normalizes data from Open Library and returns a plain result. The
// CALLER decides what to persist (and always stamps books.enrichment_attempted_at,
// even on a miss, so unresolvable books aren't re-searched on every view).

const OL_BASE = "https://openlibrary.org";
const OL_COVERS = "https://covers.openlibrary.org";
// Open Library asks for a descriptive User-Agent. No email here on purpose — this
// repo is public and the owner's email was deliberately kept out of it.
const USER_AGENT = "book-tracker/0.1 (+https://github.com/Tosinik/book-tracker)";

export type BookInput = {
  title: string;
  authors: string[] | null;
  isbn: string | null;
};

export type EnrichmentResult = {
  matched: boolean;
  source: "isbn" | "search" | null;
  cover_url: string | null;
  open_library_id: string | null;
  description: string | null;
  page_count: number | null;
  subjects: string[] | null;
};

const MISS: EnrichmentResult = {
  matched: false,
  source: null,
  cover_url: null,
  open_library_id: null,
  description: null,
  page_count: null,
  subjects: null,
};

// --- small typed accessors for Open Library's loosely-typed JSON (avoids `any`) ---
function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function asNumber(v: unknown): number | null {
  return typeof v === "number" ? v : null;
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
 * Strip a trailing Goodreads series suffix like " (The Broken Earth, #3)" before
 * searching Open Library — the CSV import carries these and they wreck match
 * quality. Only strips a trailing parenthetical containing "#<number>", which is
 * unambiguously Goodreads series notation, so it won't eat real subtitles.
 */
export function stripSeriesSuffix(title: string): string {
  return title.replace(/\s*\([^)]*#\d+[^)]*\)\s*$/, "").trim();
}

/**
 * Clean a title for an Open Library SEARCH query. Drops ALL parentheticals —
 * Goodreads series notes "(The Broken Earth, #3)" AND edition noise like
 * "(Leather-bound Classics)", both of which tank search recall.
 */
export function cleanForSearch(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

/** Normalize a person's name for comparison: lowercase, strip accents + punctuation. */
export function normalizeName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // drop combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Generational suffixes / honorifics that must not be mistaken for a surname
// (e.g. "Kurt Vonnegut Jr." → surname is "vonnegut", not "jr").
const AUTHOR_SUFFIXES = new Set(["jr", "sr", "ii", "iii", "iv", "v", "phd", "md", "esq"]);

function nameTokens(name: string): string[] {
  return normalizeName(name).split(" ").filter((t) => t && !AUTHOR_SUFFIXES.has(t));
}
function surnameToken(tokens: string[]): string | null {
  // last multi-letter token (skips lone initials like "J" in "J.R.R. Tolkien")
  for (let i = tokens.length - 1; i >= 0; i--) if (tokens[i].length > 1) return tokens[i];
  return tokens[tokens.length - 1] ?? null;
}
function hasLatin(s: string): boolean {
  return /[a-z]/i.test(s);
}
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return d[m][n];
}

/**
 * Sanity-check a search candidate's author against ours before trusting its cover.
 * Returns:
 *   "yes"      — a Latin-script candidate name confirms the author (surname match,
 *                allowing for suffixes/initials and transliteration variants like
 *                Dostoevsky/Dostoyevsky).
 *   "no"       — every Latin-script candidate name is a different author (reject).
 *   "nonlatin" — the candidate is only named in a non-Latin script (e.g. 村上春樹),
 *                so we can't confirm by name; the caller decides whether the query
 *                context is trustworthy enough to accept anyway.
 * Never cache a cover for a book whose author we can't confirm — a fallback tile
 * beats a wrong cover.
 */
export function classifyAuthor(
  ours: string,
  candidates: string[],
): "yes" | "no" | "nonlatin" {
  const surname = surnameToken(nameTokens(ours));
  if (!surname) return "no";
  let sawLatin = false;
  for (const c of candidates) {
    if (!hasLatin(c)) continue; // non-Latin display name — can't compare here
    sawLatin = true;
    const theirs = nameTokens(c);
    if (theirs.includes(surname)) return "yes";
    // Tolerate transliteration variants: same initial, near-identical, long enough.
    if (
      surname.length >= 7 &&
      theirs.some(
        (t) => t.length >= 7 && t[0] === surname[0] && levenshtein(t, surname) <= 1,
      )
    )
      return "yes";
  }
  return sawLatin ? "no" : "nonlatin";
}

/**
 * Open Library work descriptions are inconsistent: sometimes a plain string,
 * sometimes an object { type, value }. Normalize both to a trimmed string.
 */
export function normalizeDescription(desc: unknown): string | null {
  if (typeof desc === "string") return desc.trim() || null;
  const rec = asRecord(desc);
  if (rec) {
    const v = asString(rec["value"]);
    return v ? v.trim() || null : null;
  }
  return null;
}

function coverUrlFromId(coverId: number, size: "M" | "L" = "L"): string {
  return `${OL_COVERS}/b/id/${coverId}-${size}.jpg`;
}

async function olFetch(url: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;
    return asRecord(await res.json());
  } catch {
    return null;
  }
}

/** Fetch a work's description + subjects (the slow part — skipped during dry runs). */
async function fetchWorkDetails(
  workKey: string,
): Promise<{ description: string | null; subjects: string[] | null }> {
  const data = await olFetch(`${OL_BASE}${workKey}.json`);
  if (!data) return { description: null, subjects: null };
  const subjects = asArray(data["subjects"])
    .map(asString)
    .filter((s): s is string => s !== null)
    .slice(0, 50);
  return {
    description: normalizeDescription(data["description"]),
    subjects: subjects.length > 0 ? subjects : null,
  };
}

/** ISBN path: deterministic, high confidence. Null if the edition has no cover. */
async function enrichByIsbn(
  isbn: string,
  fetchDetails: boolean,
): Promise<EnrichmentResult | null> {
  const clean = isbn.replace(/[^0-9Xx]/g, "");
  if (!clean) return null;
  const edition = await olFetch(`${OL_BASE}/isbn/${clean}.json`);
  if (!edition) return null;

  const coverId = asArray(edition["covers"])
    .map(asNumber)
    .find((n): n is number => n !== null && n > 0);
  if (coverId === undefined) return null; // no art on this edition → try search

  const firstWork = asRecord(asArray(edition["works"])[0]);
  const workKey = firstWork ? asString(firstWork["key"]) : null;

  let description: string | null = null;
  let subjects: string[] | null = null;
  if (fetchDetails && workKey) {
    ({ description, subjects } = await fetchWorkDetails(workKey));
  }
  return {
    matched: true,
    source: "isbn",
    cover_url: coverUrlFromId(coverId),
    open_library_id: workKey,
    description,
    page_count: asNumber(edition["number_of_pages"]),
    subjects,
  };
}

type SearchDoc = {
  title: string | null;
  authorNames: string[];
  coverId: number | null;
  workKey: string | null;
  pageCount: number | null;
};

async function olSearch(q: string): Promise<SearchDoc[]> {
  const params = new URLSearchParams({
    q,
    limit: "5",
    fields: "key,title,author_name,cover_i,number_of_pages_median",
  });
  const data = await olFetch(`${OL_BASE}/search.json?${params.toString()}`);
  if (!data) return [];
  return asArray(data["docs"]).map((raw) => {
    const doc = asRecord(raw) ?? {};
    return {
      title: asString(doc["title"]),
      authorNames: asArray(doc["author_name"])
        .map(asString)
        .filter((s): s is string => s !== null),
      coverId: asNumber(doc["cover_i"]),
      workKey: asString(doc["key"]),
      pageCount: asNumber(doc["number_of_pages_median"]),
    };
  });
}

/**
 * First cover-bearing candidate whose author checks out.
 * - `allowNonLatin` is true only for the author-anchored query (attempt 1): the
 *   author term anchors relevance, so trusting a non-Latin-named top hit is safe.
 * - In the title-only fallback (attempt 2) it's false, so a non-Latin author is
 *   accepted only when `expectedTitle` matches the candidate title exactly. That
 *   recovers exact foreign-edition matches (e.g. a Murakami title) without
 *   grabbing a same-series sibling's cover (whose title won't match).
 */
function pickCandidate(
  docs: SearchDoc[],
  author: string,
  opts: { allowNonLatin: boolean; expectedTitle?: string },
): SearchDoc | null {
  for (const d of docs) {
    if (d.coverId === null) continue;
    const cls = classifyAuthor(author, d.authorNames);
    if (cls === "yes") return d;
    if (cls === "nonlatin") {
      if (opts.allowNonLatin) return d;
      if (
        opts.expectedTitle &&
        d.title &&
        normalizeName(d.title) === normalizeName(opts.expectedTitle)
      )
        return d;
    }
  }
  return null;
}

/**
 * Search path: free-text q="<title> <author>", falling back to a stricter
 * title-only query. Also rescues ISBN books whose specific edition has no art on
 * OL. Requires an author we can confirm (see classifyAuthor) — with no usable
 * author we return a miss rather than risk a wrong cover.
 */
async function enrichBySearch(
  title: string,
  author: string | null,
  fetchDetails: boolean,
): Promise<EnrichmentResult | null> {
  if (!author) return null;
  const q = cleanForSearch(title);
  // Attempt 1: author-anchored. Attempt 2: title-only, Latin-confirmed authors
  // (or a non-Latin author whose title matches ours exactly).
  let doc = pickCandidate(await olSearch(`${q} ${author}`), author, { allowNonLatin: true });
  if (!doc) doc = pickCandidate(await olSearch(q), author, { allowNonLatin: false, expectedTitle: q });
  if (!doc || doc.coverId === null) return null;

  let description: string | null = null;
  let subjects: string[] | null = null;
  if (fetchDetails && doc.workKey) {
    ({ description, subjects } = await fetchWorkDetails(doc.workKey));
  }
  return {
    matched: true,
    source: "search",
    cover_url: coverUrlFromId(doc.coverId),
    open_library_id: doc.workKey,
    description,
    page_count: doc.pageCount,
    subjects,
  };
}

/**
 * Enrich one book from Open Library. ISBN-first (deterministic), then a
 * title+author search fallback (author sanity-checked). Returns a MISS if nothing
 * confident is found — the caller should still stamp enrichment_attempted_at.
 *
 * Pass { fetchDetails: false } to classify only (cover match + source) without the
 * extra work-JSON request — used by the dry run to project coverage cheaply.
 */
export async function enrichBook(
  book: BookInput,
  opts: { fetchDetails?: boolean } = {},
): Promise<EnrichmentResult> {
  const fetchDetails = opts.fetchDetails ?? true;
  const author = book.authors && book.authors.length > 0 ? book.authors[0] : null;

  if (book.isbn) {
    const viaIsbn = await enrichByIsbn(book.isbn, fetchDetails);
    if (viaIsbn) return viaIsbn;
  }
  const viaSearch = await enrichBySearch(book.title, author, fetchDetails);
  if (viaSearch) return viaSearch;

  return MISS;
}
