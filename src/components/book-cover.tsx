"use client";

import { useState } from "react";
import {
  coverUrlFromIsbn,
  fallbackGround,
  type CoverSize,
} from "@/lib/books/covers";

type Props = {
  title: string;
  author: string | null;
  isbn: string | null;
  size?: CoverSize;
};

/**
 * A book cover in a fixed 2:3 frame. Tries the real Open Library image; if the
 * ISBN is missing or the image fails to load, it renders the typographic
 * fallback tile — a first-class state, not an error (many ISBNs have no art).
 */
export default function BookCover({ title, author, isbn, size = "M" }: Props) {
  const url = coverUrlFromIsbn(isbn, size);
  const [failed, setFailed] = useState(false);
  const showFallback = !url || failed;

  if (showFallback) {
    const { bg, ink } = fallbackGround(isbn || title);
    return (
      <div
        className="relative aspect-[2/3] w-full overflow-hidden rounded-sm shadow-sm ring-1 ring-black/5"
        style={{ backgroundColor: bg, color: ink }}
      >
        <div className="absolute inset-[6%] flex flex-col justify-between border border-current/20 p-[8%]">
          <span className="line-clamp-2 font-mono text-[0.6rem] uppercase tracking-widest opacity-80">
            {author ?? "Unknown"}
          </span>
          <span className="line-clamp-4 font-serif text-base leading-tight">
            {title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-sm bg-chip shadow-sm ring-1 ring-black/5">
      {/* Plain <img> (not next/image): the URL is external and deterministic, and
          we want the native onError to trigger our fallback tile. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Cover of ${title}`}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
