import { ImageResponse } from "next/og";

/**
 * Renders the app icon: a "B" in cream on the terracotta accent. The background
 * is full-bleed terracotta so the icon is also safe as a "maskable" icon —
 * Android can crop it to any shape without clipping the letter or showing a
 * white box. Rendered on the fly by next/og (no binary image files to manage).
 *
 * This is a deliberately simple placeholder mark; it can be swapped for a proper
 * Newsreader-serif version from Claude Design later.
 */
export function renderBookIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#b5502f",
          color: "#f5efe3",
          fontSize: Math.round(size * 0.58),
          fontWeight: 600,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        B
      </div>
    ),
    { width: size, height: size },
  );
}
