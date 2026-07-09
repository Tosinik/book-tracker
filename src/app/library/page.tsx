import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LibraryView, { type LibraryBook } from "@/components/library-view";

// Shape of one row from the user_books + books join below.
type BookJoin = {
  title: string;
  authors: string[] | null;
  isbn: string | null;
  page_count: number | null;
};
type UserBookRow = {
  id: string;
  status: LibraryBook["status"];
  rating: number | null;
  finished_at: string | null;
  current_page: number | null;
  books: BookJoin | BookJoin[] | null;
};

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect the page: only signed-in users can see their library.
  if (!user) {
    redirect("/login");
  }

  // Pull each logged book together with its cached book record. Row Level
  // Security guarantees this only returns rows belonging to this user.
  const { data } = await supabase
    .from("user_books")
    .select(
      "id, status, rating, finished_at, current_page, books(title, authors, isbn, page_count)",
    )
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as UserBookRow[];

  const books: LibraryBook[] = rows.map((row) => {
    // A user_book links to exactly one book; Supabase may hand back the joined
    // record as an array, so normalize it down to a single object.
    const b = Array.isArray(row.books) ? row.books[0] : row.books;
    return {
      id: row.id,
      title: b?.title ?? "Untitled",
      author: b?.authors && b.authors.length > 0 ? b.authors.join(", ") : null,
      isbn: b?.isbn ?? null,
      status: row.status,
      rating: row.rating,
      finishedAt: row.finished_at,
      currentPage: row.current_page,
      pageCount: b?.page_count ?? null,
    };
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="font-serif text-3xl tracking-tight text-ink">Your Library</h1>

      {books.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-lg font-medium text-ink">Your library is empty.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Once you start adding books, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <LibraryView books={books} />
        </div>
      )}
    </main>
  );
}
