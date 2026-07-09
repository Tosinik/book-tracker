import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signout } from "./login/actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="w-full max-w-md text-center">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Book Tracker
        </h1>

        {user ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-zinc-600 dark:text-zinc-400">
              Signed in as{" "}
              <span className="font-medium text-black dark:text-zinc-50">
                {user.email}
              </span>
            </p>
            <p className="text-sm text-zinc-500">
              Your library will live here. (Coming next.)
            </p>
            <form action={signout}>
              <button className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900">
                Log out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-zinc-600 dark:text-zinc-400">
              You&apos;re not signed in.
            </p>
            <Link
              href="/login"
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Log in or sign up
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
