import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the logged-in user's Supabase session on every request and passes
 * the updated auth cookies along. Without this, a user's login could silently
 * expire between page loads.
 *
 * This runs from proxy.ts (Next.js 16's replacement for middleware.ts).
 * Adapted from Supabase's official @supabase/ssr guide.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() must be called right after creating the client, with
  // nothing in between. It revalidates the auth token and refreshes the cookies.
  await supabase.auth.getUser();

  return supabaseResponse;
}
