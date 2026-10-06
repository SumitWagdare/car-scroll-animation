import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

// ── Fonts loaded via next/font (no render-blocking @import) ──────────────────
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ITZFIZZ — Scroll-Driven Hero Animation",
  description:
    "A premium scroll-driven hero section built with Next.js, GSAP ScrollTrigger, TypeScript, and Tailwind CSS. Cinematic intro reveal + scrubbed car animation.",
  keywords: ["GSAP", "ScrollTrigger", "Next.js", "Hero Animation", "Scroll Animation", "ITZFIZZ"],
  openGraph: {
    title: "ITZFIZZ — Scroll-Driven Hero Animation",
    description: "Premium scroll-driven hero section with GSAP ScrollTrigger",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
