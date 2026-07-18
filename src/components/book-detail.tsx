"use client";

import { useState, useTransition } from "react";
import BookCover from "@/components/book-cover";
import CoverPicker from "@/components/cover-picker";
import {
  updateRating,
  updateStatus,
  updateReview,
  updateDates,
} from "@/app/library/[id]/actions";

type Status = "want_to_read" | "currently_reading" | "read" | "dnf";

type Props = {
  userBookId: string;
  title: string;
  author: string | null;
  isbn: string | null;
  coverUrl: string | null;
  coverOverrideUrl: string | null;
  workId: string | null;
  description: string | null;
  subjects: string[] | null;
  pageCount: number | null;
  publishedYear: number | null;
  status: Status;
  rating: number | null;
  review: string | null;
  startedAt: string | null;
  finishedAt: string | null;
};

const STATUS_LABELS: { key: Status; label: string }[] = [
  { key: "want_to_read", label: "Want to read" },
  { key: "currently_reading", label: "Reading" },
  { key: "read", label: "Read" },
  { key: "dnf", label: "DNF" },
];

/**
 * Interactive 0.5-step star rating. Stored as an int 1–10 (= 0.5–5.0 stars).
 * Ten invisible half-width hit zones sit over a gold layer clipped to
 * rating/10; hovering previews, clicking sets, clicking the current value clears.
 */
function StarRating({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;
  const pct = (shown / 10) * 100;
  const label = value ? (value / 2).toFixed(1).replace(/\.0$/, "") : null;

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative inline-block text-2xl leading-none"
        onMouseLeave={() => setHover(null)}
      >
        <span className="text-star-empty" aria-hidden>
          ★★★★★
        </span>
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-nowrap text-star-gold"
          style={{ width: `${pct}%` }}
          aria-hidden
        >
          ★★★★★
        </span>
        {/* 10 half-star hit zones */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }, (_, i) => {
            const v = i + 1;
            return (
              <button
                key={v}
                type="button"
                className="h-full w-[10%] cursor-pointer"
                onMouseEnter={() => setHover(v)}
                onClick={() => onChange(value === v ? null : v)}
                aria-label={`${(v / 2).toFixed(1)} stars`}
              />
            );
          })}
        </div>
      </div>
      <span className="min-w-[3ch] font-serif text-lg text-accent-ink">
        {label ?? (
          <span className="font-mono text-xs uppercase tracking-wider text-muted">
            Unrated
          </span>
        )}
      </span>
    </div>
  );
}

export default function BookDetail(props: Props) {
  const {
    userBookId,
    title,
    author,
    isbn,
    coverUrl,
    workId,
    description,
    subjects,
    pageCount,
    publishedYear,
  } = props;

  const [, startTransition] = useTransition();

  // Optimistic local state — updated instantly, persisted via server actions.
  const [status, setStatus] = useState<Status>(props.status);
  const [rating, setRating] = useState<number | null>(props.rating);
  const [review, setReview] = useState(props.review ?? "");
  const [savedReview, setSavedReview] = useState(props.review ?? "");
  const [startedAt, setStartedAt] = useState(props.startedAt ?? "");
  const [finishedAt, setFinishedAt] = useState(props.finishedAt ?? "");
  const [coverOverride, setCoverOverride] = useState(props.coverOverrideUrl);
  const [pickerOpen, setPickerOpen] = useState(false);

  const metaBits = [
    pageCount ? `${pageCount} pp` : null,
    publishedYear ? String(publishedYear) : null,
  ].filter(Boolean);

  function handleRating(v: number | null) {
    setRating(v);
    startTransition(async () => {
      await updateRating(userBookId, v);
    });
  }
  function handleStatus(s: Status) {
    setStatus(s);
    startTransition(async () => {
      await updateStatus(userBookId, s);
    });
  }
  function handleReviewSave() {
    setSavedReview(review);
    startTransition(async () => {
      await updateReview(userBookId, review);
    });
  }
  function handleDates(next: { started?: string; finished?: string }) {
    const s = next.started ?? startedAt;
    const f = next.finished ?? finishedAt;
    if (next.started !== undefined) setStartedAt(next.started);
    if (next.finished !== undefined) setFinishedAt(next.finished);
    startTransition(async () => {
      await updateDates(userBookId, s || null, f || null);
    });
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-8 sm:flex-row">
        {/* Cover + change-cover control */}
        <div className="w-40 shrink-0 sm:w-52">
          <BookCover
            title={title}
            author={author}
            isbn={isbn}
            coverUrl={coverUrl}
            coverOverrideUrl={coverOverride}
            size="L"
          />
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-3 w-full rounded-full border border-border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-ink-soft transition-colors hover:text-ink"
          >
            Change cover
          </button>
        </div>

        {/* Metadata + controls */}
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-3xl leading-tight tracking-tight text-ink">
            {title}
          </h1>
          {author && <p className="mt-1 text-lg text-ink-soft">{author}</p>}
          {metaBits.length > 0 && (
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted">
              {metaBits.join(" · ")}
            </p>
          )}

          {/* Status pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {STATUS_LABELS.map((s) => {
              const active = status === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleStatus(s.key)}
                  className={
                    active
                      ? "rounded-full bg-ink px-3 py-1 text-sm font-medium text-paper"
                      : "rounded-full border border-border px-3 py-1 text-sm text-ink-soft transition-colors hover:text-ink"
                  }
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Star rating */}
          <div className="mt-5">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-label">
              Your rating
            </p>
            <StarRating value={rating} onChange={handleRating} />
          </div>

          {/* Reading dates */}
          <div className="mt-5 flex flex-wrap gap-4">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-label">
                Started
              </span>
              <input
                type="date"
                value={startedAt}
                onChange={(e) => handleDates({ started: e.target.value })}
                className="rounded-md border border-border bg-raised px-2 py-1 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-label">
                Finished
              </span>
              <input
                type="date"
                value={finishedAt}
                onChange={(e) => handleDates({ finished: e.target.value })}
                className="rounded-md border border-border bg-raised px-2 py-1 text-sm text-ink"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <section className="mt-8">
          <h2 className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-label">
            About
          </h2>
          <p className="whitespace-pre-line font-serif text-[1.05rem] leading-relaxed text-ink">
            {description}
          </p>
        </section>
      )}

      {/* Subjects */}
      {subjects && subjects.length > 0 && (
        <section className="mt-6">
          <div className="flex flex-wrap gap-1.5">
            {subjects.slice(0, 12).map((s) => (
              <span
                key={s}
                className="rounded-full bg-chip px-2.5 py-0.5 text-xs text-ink-soft"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Review */}
      <section className="mt-8">
        <h2 className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-label">
          Your review
        </h2>
        <div className="rounded-lg border border-line bg-raised p-4">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={5}
            placeholder="What did you think?"
            className="w-full resize-y bg-transparent font-serif text-[1.05rem] leading-relaxed text-ink placeholder:text-muted focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-end gap-3">
            {review !== savedReview ? (
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                Unsaved
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleReviewSave}
              disabled={review === savedReview}
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Save review
            </button>
          </div>
        </div>
      </section>

      {pickerOpen && (
        <CoverPicker
          userBookId={userBookId}
          title={title}
          author={author}
          isbn={isbn}
          coverUrl={coverUrl}
          currentOverride={coverOverride}
          workId={workId}
          onClose={() => setPickerOpen(false)}
          onChosen={(url) => setCoverOverride(url)}
        />
      )}
    </div>
  );
}
