import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect the page: only signed-in users can see their library.
  if (!user) {
    redirect("/login");
  }

  // Read this user's logged books. Thanks to Row Level Security, this only
  // ever returns rows that belong to them — no filtering needed in code.
  const { data: userBooks } = await supabase
    .from("user_books")
    .select("id")
    .order("created_at", { ascending: false });

  const isEmpty = !userBooks || userBooks.length === 0;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Your Library</h1>

      {isEmpty ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-lg font-medium">Your library is empty.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Once you start adding books, they&apos;ll show up here. (Adding books
            comes next, in Phase 1.)
          </p>
        </div>
      ) : (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          {userBooks.length} book{userBooks.length === 1 ? "" : "s"} in your
          library.
        </p>
      )}
    </main>
  );
}
