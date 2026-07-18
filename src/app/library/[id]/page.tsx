import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { enrichBook } from "@/lib/books/enrich";
import { workIdFromKey } from "@/lib/books/editions";
import BookDetail from "@/components/book-detail";

// One book row joined from user_books + books.
type BookJoin = {
  id: string;
  title: string;
  authors: string[] | null;
  isbn: string | null;
  cover_url: string | null;
  description: string | null;
  subjects: string[] | null;
  page_count: number | null;
  published_year: number | null;
  open_library_id: string | null;
  enrichment_source: string | null;
  details_attempted_at: string | null;
};
type UserBookRow = {
  id: string;
  status: "want_to_read" | "currently_reading" | "read" | "dnf";
  rating: number | null;
  review: string | null;
  started_at: string | null;
  finished_at: string | null;
  cover_url_override: string | null;
  books: BookJoin | BookJoin[] | null;
};

export default async function BookDetailPage({
  params,
}: {
  // Next 16 hands route params in as a Promise.
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("user_books")
    .select(
      "id, status, rating, review, started_at, finished_at, cover_url_override, " +
        "books(id, title, authors, isbn, cover_url, description, subjects, page_count, " +
        "published_year, open_library_id, enrichment_source, details_attempted_at)",
    )
    .eq("id", id)
    .maybeSingle();

  const row = data as UserBookRow | null;
  if (!row) notFound();

  // A user_book links to exactly one book; Supabase may return it as an array.
  let book = Array.isArray(row.books) ? row.books[0] : row.books;
  if (!book) notFound();

  // Lazy details backfill (runs once per book, then serves from cache). The cover
  // backfill wrote cover_url but skipped description/subjects/open_library_id; fill
  // them the first time this book's detail page is opened. Gate:
  //   - details_attempted_at IS NULL  → not yet tried
  //   - enrichment_source IS NOT NULL → it matched a work, so there's data to fetch
  // We stamp details_attempted_at on EVERY attempt (hit or miss) so a failed work
  // lookup is recorded, not retried on every future visit.
  if (book.details_attempted_at === null && book.enrichment_source !== null) {
    const result = await enrichBook({
      title: book.title,
      authors: book.authors,
      isbn: book.isbn,
    });
    const patch = {
      details_attempted_at: new Date().toISOString(),
      open_library_id: result.open_library_id ?? book.open_library_id,
      description: result.description ?? book.description,
      subjects: result.subjects ?? book.subjects,
      cover_url: book.cover_url ?? result.cover_url,
      page_count: book.page_count ?? result.page_count,
    };
    // books UPDATE policy is open to authenticated users (Phase 4 blocker, logged).
    await supabase.from("books").update(patch).eq("id", book.id);
    book = { ...book, ...patch };
  }

  const author =
    book.authors && book.authors.length > 0 ? book.authors.join(", ") : null;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <Link
        href="/library"
        className="font-mono text-xs uppercase tracking-wider text-ink-soft transition-colors hover:text-ink"
      >
        ← Library
      </Link>

      <BookDetail
        userBookId={row.id}
        title={book.title}
        author={author}
        isbn={book.isbn}
        coverUrl={book.cover_url}
        coverOverrideUrl={row.cover_url_override}
        workId={workIdFromKey(book.open_library_id)}
        description={book.description}
        subjects={book.subjects}
        pageCount={book.page_count}
        publishedYear={book.published_year}
        status={row.status}
        rating={row.rating}
        review={row.review}
        startedAt={row.started_at}
        finishedAt={row.finished_at}
      />
    </main>
  );
}
