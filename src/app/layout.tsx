import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Konstrundan 2026 – Östra Skåne",
  description:
    "Interaktiv karta över 85 konstnärer i Östra Skånes Konstgrupp. Besök ateljéer 3–12 april 2026.",
  openGraph: {
    title: "Konstrundan 2026 – Östra Skåne",
    description:
      "85 konstnärer öppnar sina ateljéer 3–12 april. Upptäck konst på Österlen!",
    locale: "sv_SE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
