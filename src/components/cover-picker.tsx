"use client";

import { useEffect, useState, useTransition } from "react";
import { coverUrlFromIsbn } from "@/lib/books/covers";
import {
  listEditionCovers,
  updateCoverOverride,
} from "@/app/library/[id]/actions";
import type { EditionCover } from "@/lib/books/editions";

type Props = {
  userBookId: string;
  title: string;
  author: string | null;
  isbn: string | null;
  coverUrl: string | null;
  currentOverride: string | null;
  workId: string | null;
  onClose: () => void;
  onChosen: (url: string | null) => void;
};

/**
 * "Change cover" modal. Lists alternate edition covers for the work (only editions
 * that actually have art) and lets the reader pick the copy they read, paste a
 * custom image URL (for the ~5% of books with no work / no editions on record), or
 * reset to the default. The choice is stored per-user as user_books.cover_url_override.
 */
export default function CoverPicker({
  userBookId,
  title,
  isbn,
  coverUrl,
  currentOverride,
  workId,
  onClose,
  onChosen,
}: Props) {
  const [editions, setEditions] = useState<EditionCover[] | null>(null);
  const [manual, setManual] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  // The current default (what the cover would be with no override).
  const defaultUrl = coverUrl || coverUrlFromIsbn(isbn, "L");

  useEffect(() => {
    let alive = true;
    if (!workId) {
      setEditions([]);
      return;
    }
    listEditionCovers(workId).then((covers) => {
      if (alive) setEditions(covers);
    });
    return () => {
      alive = false;
    };
  }, [workId]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function choose(url: string | null) {
    setError(null);
    startSaving(async () => {
      const res = await updateCoverOverride(userBookId, url);
      if (!res.ok) {
        setError(res.error ?? "Could not save.");
        return;
      }
      onChosen(url);
      onClose();
    });
  }

  function useManual() {
    const url = manual.trim();
    if (!/^https?:\/\//i.test(url)) {
      setError("Enter a full http(s) image URL.");
      return;
    }
    choose(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-border bg-paper p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-ink">Change cover</h2>
            <p className="mt-0.5 text-sm text-ink-soft">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-2.5 py-1 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Close
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">
            {error}
          </p>
        )}

        {/* Edition covers */}
        <div className="mt-5">
          {editions === null ? (
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              Loading editions…
            </p>
          ) : editions.length === 0 ? (
            <p className="text-sm text-ink-soft">
              {workId
                ? "No alternate edition covers found for this work."
                : "This book isn’t linked to an Open Library work yet, so there are no editions to list. Paste an image URL below instead."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {editions.map((e) => {
                const selected = currentOverride === e.url;
                return (
                  <button
                    key={e.coverId}
                    type="button"
                    disabled={saving}
                    onClick={() => choose(e.url)}
                    className={
                      "overflow-hidden rounded-sm ring-1 transition-transform hover:scale-[1.03] " +
                      (selected ? "ring-2 ring-accent" : "ring-black/5")
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={e.url}
                      alt="Alternate edition cover"
                      loading="lazy"
                      className="aspect-[2/3] h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Manual URL */}
        <div className="mt-6 border-t border-line pt-4">
          <label className="font-mono text-[0.65rem] uppercase tracking-wider text-label">
            Or paste an image URL
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              type="url"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="https://…"
              className="min-w-0 flex-1 rounded-md border border-border bg-raised px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={useManual}
              disabled={saving}
              className="shrink-0 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Use URL
            </button>
          </div>
        </div>

        {/* Reset to default */}
        {currentOverride && (
          <div className="mt-4 flex items-center gap-3">
            {defaultUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={defaultUrl}
                alt="Default cover"
                className="aspect-[2/3] w-10 rounded-sm object-cover ring-1 ring-black/5"
              />
            ) : null}
            <button
              type="button"
              onClick={() => choose(null)}
              disabled={saving}
              className="rounded-full border border-border px-3 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
            >
              Reset to default cover
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
