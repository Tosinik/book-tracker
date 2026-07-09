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
        <h1 className="mb-3 font-serif text-4xl tracking-tight text-ink">
          Book Tracker
        </h1>
        <p className="mb-8 text-ink-soft">
          A faster, friendlier place to log what you read.
        </p>

        <Link
          href={user ? "/library" : "/login"}
          className="inline-block rounded-full bg-accent px-5 py-2 text-sm font-medium text-paper transition-colors hover:opacity-90"
        >
          {user ? "Go to your library" : "Log in or sign up"}
        </Link>
      </div>
    </main>
  );
}
