import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1c1917" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Konstrundan 2026 – Hela Skåne",
  description:
    "Interaktiv karta över 354 konstnärer i 5 regioner. Sök, filtrera och planera din Konstrunda 3–12 april 2026.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Konstrundan",
  },
  openGraph: {
    title: "Konstrundan 2026 – Hela Skåne",
    description:
      "354 konstnärer öppnar sina ateljéer 3–12 april. Upptäck konst i hela Skåne!",
    locale: "sv_SE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-paper text-ink antialiased dark:bg-stone-950 dark:text-stone-100">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
