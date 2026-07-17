"use client";

import { useMemo, useState } from "react";
import BookCover from "@/components/book-cover";

export type LibraryBook = {
  id: string; // user_books.id
  title: string;
  author: string | null;
  isbn: string | null;
  coverUrl: string | null;
  status: "want_to_read" | "currently_reading" | "read" | "dnf";
  rating: number | null; // stored 1–10 (= 0.5–5.0 stars)
  finishedAt: string | null;
  currentPage: number | null;
  pageCount: number | null;
};

type StatusFilter = "all" | LibraryBook["status"];

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "currently_reading", label: "Reading" },
  { key: "read", label: "Read" },
  { key: "want_to_read", label: "Want" },
  { key: "dnf", label: "DNF" },
];

/** Read-only star display. Gold layer clipped to rating/10 over a grey base. */
function StarsReadonly({ rating }: { rating: number | null }) {
  if (!rating) {
    return (
      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted">
        Unrated
      </span>
    );
  }
  const pct = (rating / 10) * 100;
  const value = (rating / 2).toFixed(1).replace(/\.0$/, "");
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-block text-sm leading-none" aria-hidden>
        <span className="text-star-empty">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden whitespace-nowrap text-star-gold"
          style={{ width: `${pct}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="font-serif text-sm text-accent-ink">{value}</span>
    </span>
  );
}

export default function LibraryView({ books }: { books: LibraryBook[] }) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const nowReading = useMemo(
    () => books.filter((b) => b.status === "currently_reading"),
    [books],
  );

  const filtered = useMemo(
    () => (filter === "all" ? books : books.filter((b) => b.status === filter)),
    [books, filter],
  );

  return (
    <div>
      {/* Now Reading hero — only shown when something is in progress */}
      {nowReading.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-label">
            Now Reading
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {nowReading.map((b) => {
              // Progress bar renders only when BOTH page fields exist (decision #2).
              const hasProgress =
                b.currentPage != null && b.pageCount != null && b.pageCount > 0;
              const pct = hasProgress
                ? Math.min(100, Math.round((b.currentPage! / b.pageCount!) * 100))
                : 0;
              return (
                <article
                  key={b.id}
                  className="flex gap-4 rounded-lg border border-line bg-raised p-4"
                >
                  <div className="w-20 shrink-0">
                    <BookCover
                      title={b.title}
                      author={b.author}
                      isbn={b.isbn}
                      coverUrl={b.coverUrl}
                      size="L"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col justify-center">
                    <h3 className="font-serif text-lg leading-tight text-ink">
                      {b.title}
                    </h3>
                    {b.author && (
                      <p className="mt-0.5 text-sm text-ink-soft">{b.author}</p>
                    )}
                    {hasProgress ? (
                      <div className="mt-3">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-chip">
                          <div
                            className="h-full rounded-full bg-accent-ink"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                          p.{b.currentPage} · {pct}%
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                        In progress
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Controls: status filter chips + grid/list toggle */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={
                  active
                    ? "rounded-full bg-accent px-3 py-1 text-sm font-medium text-paper"
                    : "rounded-full border border-border px-3 py-1 text-sm text-ink-soft transition-colors hover:text-ink"
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex rounded-full border border-border p-0.5">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={
                view === v
                  ? "rounded-full bg-raised px-3 py-1 text-sm font-medium text-ink shadow-sm"
                  : "rounded-full px-3 py-1 text-sm text-ink-soft transition-colors hover:text-ink"
              }
            >
              {v === "grid" ? "Grid" : "List"}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 font-mono text-xs uppercase tracking-wider text-muted">
        {filtered.length} book{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <p className="text-ink-soft">No books in this view.</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
          {filtered.map((b) => (
            <div key={b.id}>
              <BookCover
                title={b.title}
                author={b.author}
                isbn={b.isbn}
                coverUrl={b.coverUrl}
                size="M"
              />
              <div className="mt-1.5">
                <StarsReadonly rating={b.rating} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {filtered.map((b) => (
            <li key={b.id} className="flex items-center gap-4 py-3">
              <div className="w-10 shrink-0">
                <BookCover
                  title={b.title}
                  author={b.author}
                  isbn={b.isbn}
                  coverUrl={b.coverUrl}
                  size="M"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-base text-ink">{b.title}</p>
                {b.author && (
                  <p className="truncate text-sm text-ink-soft">{b.author}</p>
                )}
              </div>
              {b.finishedAt && (
                <span className="hidden font-mono text-[0.65rem] uppercase tracking-wider text-muted sm:inline">
                  {b.finishedAt}
                </span>
              )}
              <div className="shrink-0">
                <StarsReadonly rating={b.rating} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
