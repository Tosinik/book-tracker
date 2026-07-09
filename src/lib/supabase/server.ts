import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use on the SERVER (Server Components, Route Handlers,
 * Server Actions). It reads and writes the logged-in user's session from
 * cookies so the server knows who is signed in.
 *
 * In Next.js 16 `cookies()` is async, so this function is async too — call it
 * with `await`:
 *   const supabase = await createClient();
 *   const { data } = await supabase.auth.getUser();
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` was called from a Server Component, which cannot write
            // cookies. This is safe to ignore because session refreshing will
            // be handled by proxy.ts (added in the auth task).
          }
        },
      },
    },
  );
}
