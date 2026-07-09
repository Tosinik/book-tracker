import type { Metadata, Viewport } from "next";
import { Newsreader, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";

// Newsreader = serif display/titles, Archivo = UI/body, JetBrains Mono = labels.
// next/font self-hosts these Google fonts (no layout shift, no external request).
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Book Tracker",
  description: "Track your reading — a faster, friendlier reading log.",
  appleWebApp: { capable: true, title: "Book Tracker", statusBarStyle: "default" },
};

// Sets the mobile browser chrome / toolbar color to the terracotta accent.
export const viewport: Viewport = {
  themeColor: "#b5502f",
};

// Runs before the page paints: reads the saved theme (or the OS preference) and
// sets data-theme immediately, so there's no white flash before dark mode applies.
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t !== 'light' && t !== 'dark') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${archivo.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <Nav />
        {children}
      </body>
    </html>
  );
}
