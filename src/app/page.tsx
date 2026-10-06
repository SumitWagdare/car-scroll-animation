import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "ITZFIZZ — Scroll-Driven Hero Animation",
  description:
    "Premium scroll-driven hero section animation built with Next.js 15, GSAP ScrollTrigger, TypeScript, and Tailwind CSS. Features cinematic intro reveal, car scroll animation, and GPU-accelerated transitions.",
};

export default function Home() {
  return (
    <div className="relative">
      <HeroSection />
    </div>
  );
}
