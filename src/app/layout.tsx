import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ITZFIZZ — Scroll-Driven Hero Animation",
  description: "A premium scroll-driven hero section animation built with Next.js, GSAP ScrollTrigger, TypeScript, and Tailwind CSS. Featuring cinematic reveal animations and interactive car tracking.",
  keywords: ["GSAP", "ScrollTrigger", "Next.js", "Hero Animation", "Scroll Animation", "ITZFIZZ"],
  openGraph: {
    title: "ITZFIZZ — Scroll-Driven Hero Animation",
    description: "Premium scroll-driven hero section with GSAP ScrollTrigger",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
