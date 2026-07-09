import { renderBookIcon } from "@/lib/app-icon";

// Served at /icon-192.png — referenced by the web app manifest.
export function GET() {
  return renderBookIcon(192);
}
