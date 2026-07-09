import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">
          Book Tracker
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          A faster, friendlier place to log what you read.
        </p>

        {user ? (
          <Link
            href="/library"
            className="inline-block rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            Go to your library
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-block rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            Log in or sign up
          </Link>
        )}
      </div>
    </main>
  );
}
