import { renderBookIcon } from "@/lib/app-icon";

// Served at /icon-512.png — referenced by the web app manifest (also maskable).
export function GET() {
  return renderBookIcon(512);
}
