"use server";

// Server Actions for the book detail page. Each one runs on the server, is called
// straight from the client component, updates the user's own user_books row (Row
// Level Security guarantees they can only touch their own), bumps updated_at, and
// revalidates the affected pages so the UI reflects the new data.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchEditionCovers, type EditionCover } from "@/lib/books/editions";

const STATUSES = ["want_to_read", "currently_reading", "read", "dnf"] as const;
type Status = (typeof STATUSES)[number];

/** Persist a change and refresh both the detail page and the library grid. */
async function patchUserBook(
  userBookId: string,
  patch: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("user_books")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userBookId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/library/${userBookId}`);
  revalidatePath("/library");
  return { ok: true };
}

/** Rating is stored int 1–10 (= 0.5–5.0 stars); null clears it (unrated). */
export async function updateRating(userBookId: string, rating: number | null) {
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 10)) {
    return { ok: false, error: "Rating must be an integer 1–10." };
  }
  return patchUserBook(userBookId, { rating });
}

export async function updateStatus(userBookId: string, status: Status) {
  if (!STATUSES.includes(status)) return { ok: false, error: "Unknown status." };
  return patchUserBook(userBookId, { status });
}

export async function updateReview(userBookId: string, review: string) {
  const trimmed = review.trim();
  return patchUserBook(userBookId, { review: trimmed === "" ? null : trimmed });
}

/** Dates are 'YYYY-MM-DD' strings (matching the DB `date` columns) or null. */
export async function updateDates(
  userBookId: string,
  startedAt: string | null,
  finishedAt: string | null,
) {
  const isDate = (s: string | null) => s === null || /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (!isDate(startedAt) || !isDate(finishedAt)) {
    return { ok: false, error: "Dates must be YYYY-MM-DD." };
  }
  return patchUserBook(userBookId, {
    started_at: startedAt || null,
    finished_at: finishedAt || null,
  });
}

/**
 * Set (or clear) the per-user cover override. Stored on user_books, never on the
 * shared books row — that would change the cover for every user (and needs the
 * Phase 4 RLS rework). null resets to the enrichment/ISBN default.
 */
export async function updateCoverOverride(userBookId: string, url: string | null) {
  const clean = url?.trim() || null;
  if (clean !== null && !/^https?:\/\//i.test(clean)) {
    return { ok: false, error: "Enter a full http(s) image URL." };
  }
  return patchUserBook(userBookId, { cover_url_override: clean });
}

/** Fetch alternate edition covers for the "change cover" picker. */
export async function listEditionCovers(
  workKey: string | null,
): Promise<EditionCover[]> {
  if (!workKey) return [];
  // Require a signed-in user before making the outbound request.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return fetchEditionCovers(workKey);
}
