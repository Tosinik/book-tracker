import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signout } from "@/app/login/actions";
import ThemeToggle from "@/components/theme-toggle";

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
    <header className="sticky top-0 z-10 border-b border-line bg-paper/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          Book Tracker
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/library"
                className="text-ink-soft transition-colors hover:text-ink"
              >
                Library
              </Link>
              <form action={signout}>
                <button className="rounded-full border border-border px-3 py-1 font-medium text-ink transition-colors hover:bg-chip">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-accent px-3 py-1 font-medium text-paper transition-colors hover:opacity-90"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
