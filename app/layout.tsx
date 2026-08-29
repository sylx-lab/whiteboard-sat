import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "./components/AppShell";
import { AppStoreProvider } from "./services/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0D918A" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1020" },
  ],
};

export const metadata: Metadata = {
  title: "White Board SAT | Digital SAT Prep & Practice",
  description: "Master the Digital SAT with adaptive practice questions, realistic mock tests, structured courses, and advanced progress analytics.",
};

/**
 * Applies the saved mode before the first paint. The store also sets this class,
 * but it does so in an effect — which runs after the browser has already painted
 * a white page. Without this, choosing dark mode means a white flash on every
 * single load. It is inline and synchronous for exactly that reason.
 *
 * Reads the same `wbsat_theme` key the store writes, and falls back to the
 * operating system's preference for a first-time visitor.
 */
const applyThemeBeforePaint = `
(function () {
  try {
    var saved = JSON.parse(localStorage.getItem('wbsat_theme'));
    if (saved !== 'white' && saved !== 'warm' && saved !== 'dark') {
      saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'white';
      // Persisted here so the store reads the same answer when it initialises a
      // moment later, instead of resetting a dark-preferring visitor to white.
      localStorage.setItem('wbsat_theme', JSON.stringify(saved));
    }
    document.documentElement.classList.add('mode-' + saved);
    if (document.body) {
      document.body.classList.add('mode-' + saved);
    }
  } catch (e) {
    document.documentElement.classList.add('mode-white');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="theme-preload"
          dangerouslySetInnerHTML={{ __html: applyThemeBeforePaint }}
          suppressHydrationWarning
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppStoreProvider>
          <AppShell>{children}</AppShell>
        </AppStoreProvider>
      </body>
    </html>
  );
}
