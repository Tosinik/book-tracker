import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signout } from "@/app/login/actions";

/**
 * Top navigation bar. It's a Server Component, so it can read the logged-in
 * user directly and show the right links. Rendered once in the root layout,
 * so it appears on every page.
 */
export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/50">
      <nav className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-semibold tracking-tight text-black dark:text-zinc-50"
        >
          Book Tracker
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link
                href="/library"
                className="text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white"
              >
                Library
              </Link>
              <span className="hidden text-zinc-500 sm:inline">
                {user.email}
              </span>
              <form action={signout}>
                <button className="rounded-full border border-zinc-300 px-3 py-1 font-medium text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-black px-3 py-1 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
