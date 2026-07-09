"use client";

import { useEffect, useState } from "react";

/**
 * Client Component (needs the browser): flips <html data-theme> between light and
 * dark and remembers the choice in localStorage. The inline script in layout.tsx
 * applies that saved choice on the next load before anything is painted.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  // On mount, read whatever the inline script already put on <html>.
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage can be unavailable (private mode) — the toggle still works
      // for this session, it just won't be remembered.
    }
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-ink transition-colors hover:bg-chip"
    >
      <span className="text-sm">{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}
