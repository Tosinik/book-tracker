import { renderBookIcon } from "@/lib/app-icon";

// Apple touch icon (iOS "Add to Home Screen" uses this, not the manifest icons).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderBookIcon(180);
}
