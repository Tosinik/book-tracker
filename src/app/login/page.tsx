import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  // In Next.js 16 searchParams is async and must be awaited.
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <main className="w-full max-w-sm">
        <h1 className="mb-1 font-serif text-3xl tracking-tight text-ink">
          Book Tracker
        </h1>
        <p className="mb-6 text-sm text-ink-soft">
          Log in, or create an account to start tracking your reading.
        </p>

        <form className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink-soft">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-ink-soft">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
              {error}
            </p>
          )}

          <div className="mt-2 flex gap-3">
            <button
              formAction={login}
              className="flex-1 rounded-full bg-accent px-4 py-2 text-sm font-medium text-paper transition-colors hover:opacity-90"
            >
              Log in
            </button>
            <button
              formAction={signup}
              className="flex-1 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-chip"
            >
              Sign up
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
