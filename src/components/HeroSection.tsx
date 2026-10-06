"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Data ──────────────────────────────────────────────────────────────────────
const HEADLINE = "W E L C O M E   I T Z F I Z Z";

const STATS = [
  { value: "99.9%", label: "Speed Boost", desc: "Lightning-fast performance", icon: "⚡" },
  { value: "85+",   label: "Components",  desc: "Interactive UI elements",  icon: "🧩" },
  { value: "100%",  label: "Responsive",  desc: "Every screen, flawlessly", icon: "📐" },
];

const NAV_LINKS = ["Features", "Showcase", "Pricing", "Docs"];

// ── Marquee items ─────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "SCROLL DRIVEN", "GSAP POWERED", "ZERO REFLOW", "GPU ACCELERATED",
  "ULTRA SMOOTH", "NEXT.JS 15", "TYPESCRIPT", "TAILWIND CSS",
  "SCROLL DRIVEN", "GSAP POWERED", "ZERO REFLOW", "GPU ACCELERATED",
  "ULTRA SMOOTH", "NEXT.JS 15", "TYPESCRIPT", "TAILWIND CSS",
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function HeroSection() {
  // Refs
  const wrapperRef      = useRef<HTMLDivElement>(null);
  const heroRef         = useRef<HTMLElement>(null);
  const headlineRef     = useRef<HTMLHeadingElement>(null);
  const statsRef        = useRef<HTMLDivElement>(null);
  const badgeRef        = useRef<HTMLDivElement>(null);
  const ctaRef          = useRef<HTMLDivElement>(null);
  const carRef          = useRef<HTMLDivElement>(null);
  const roadRef         = useRef<HTMLDivElement>(null);
  const trailRef        = useRef<HTMLDivElement>(null);
  const roadSectionRef  = useRef<HTMLDivElement>(null);
  const scrollTextRef   = useRef<HTMLDivElement>(null);
  const overlayRef      = useRef<HTMLDivElement>(null);
  const cursorRef       = useRef<HTMLDivElement>(null);
  const navRef          = useRef<HTMLElement>(null);

  // ── Cursor glow ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const move = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.6, ease: "power2.out" });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // ── Main animations ──────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── 1. INTRO REVEAL ─────────────────────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Navbar slide in
      tl.from(navRef.current, {
        yPercent: -100, opacity: 0, duration: 0.8,
      }, 0);

      // Badge pop
      tl.from(badgeRef.current, {
        scale: 0.6, opacity: 0, duration: 0.6, ease: "back.out(1.7)",
      }, 0.3);

      // Headline: split each char and stagger them up
      const chars = headlineRef.current?.querySelectorAll(".hero-headline-char") ?? [];
      tl.from(chars, {
        yPercent: 120,
        opacity: 0,
        duration: 0.7,
        stagger: 0.028,
        ease: "power3.out",
      }, 0.45);

      // Stats stagger up
      const cards = statsRef.current?.querySelectorAll(".stat-card") ?? [];
      tl.from(cards, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
      }, 0.85);

      // CTA buttons
      tl.from(ctaRef.current, {
        y: 24, opacity: 0, duration: 0.6, ease: "power3.out",
      }, 1.1);

      // Scroll hint
      tl.from(scrollTextRef.current, {
        opacity: 0, duration: 0.6,
      }, 1.4);

      // Car initial scale-up
      tl.from(carRef.current, {
        scale: 0.88, opacity: 0, x: -80, duration: 1.0, ease: "power3.out",
      }, 0.6);

      // Road slide in from below
      tl.from(roadSectionRef.current, {
        y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
      }, 0.55);

      // ── 2. SCROLL-DRIVEN ANIMATIONS ─────────────────────────────────────────
      // Pin the wrapper for a long scroll zone
      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        end: "+=250%",
        pin: true,
        anticipatePin: 1,
        pinSpacing: true,
      });

      // Master scroll timeline tied to scrub
      const scrollTL = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "+=250%",
          scrub: 1.2,
        },
      });

      // Phase 1 (0–30%): headline + stats fade out while car accelerates right
      scrollTL.to(headlineRef.current, {
        yPercent: -30, opacity: 0, duration: 1,
      }, 0);

      scrollTL.to(statsRef.current, {
        yPercent: -20, opacity: 0, duration: 1,
      }, 0.05);

      scrollTL.to(ctaRef.current, {
        yPercent: -15, opacity: 0, duration: 0.8,
      }, 0.08);

      scrollTL.to(badgeRef.current, {
        yPercent: -20, opacity: 0, duration: 0.7,
      }, 0);

      // Phase 1: car drives from left to center stage
      scrollTL.to(carRef.current, {
        x: "30vw", scale: 1.15, duration: 1.5, ease: "none",
      }, 0);

      // Trail fills up as car moves
      scrollTL.to(trailRef.current, {
        width: "100%", duration: 1.5, ease: "none",
      }, 0);

      // Road dashes shift slightly
      scrollTL.to(roadRef.current, {
        x: "-5%", duration: 1.5, ease: "none",
      }, 0);

      // Phase 2 (30–65%): car continues right, road zooms up
      scrollTL.to(carRef.current, {
        x: "70vw", scale: 1.25, duration: 1.8, ease: "none",
      }, 1.5);

      scrollTL.to(roadSectionRef.current, {
        scaleY: 1.3, opacity: 0.6, duration: 1.8, ease: "none",
      }, 1.5);

      // Phase 3 (65–100%): car bursts off-screen right, overlay fades in
      scrollTL.to(carRef.current, {
        x: "130vw", scale: 1.1, opacity: 0, duration: 1.5, ease: "none",
      }, 3.3);

      scrollTL.to(overlayRef.current, {
        opacity: 1, duration: 1.5, ease: "none",
      }, 3.0);

      scrollTL.to(trailRef.current, {
        opacity: 0, duration: 0.8, ease: "none",
      }, 3.5);

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Cursor Glow */}
      <div ref={cursorRef} className="cursor-glow" aria-hidden="true" />

      {/* Navbar */}
      <nav ref={navRef} className="navbar" id="navbar" aria-label="Main navigation">
        <div className="flex items-center gap-3">
          <div className="glow-dot" />
          <span className="font-display text-white font-bold text-lg tracking-tight">
            ITZ<span className="text-accent">FIZZ</span>
          </span>
        </div>

        <ul className="hidden md:flex items-center gap-8" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        <button className="cta-btn text-sm" id="nav-cta-btn" aria-label="Get started">
          Get Started →
        </button>
      </nav>

      {/* ── Scroll Pin Wrapper ─────────────────────────────────────────────── */}
      <div ref={wrapperRef} style={{ height: "100vh", overflow: "hidden" }}>

        {/* ── Hero Section ──────────────────────────────────────────────────── */}
        <main
          ref={heroRef}
          id="hero"
          className="relative w-full h-screen flex flex-col justify-between"
          style={{ background: "var(--color-bg)" }}
          aria-label="Hero section"
        >
          {/* Radial bg glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(69,219,125,0.07) 0%, transparent 65%)",
            }}
          />

          {/* ── Top Content ─────────────────────────────────────────────────── */}
          <div className="relative z-10 flex flex-col items-center pt-28 px-6 text-center">

            {/* Badge */}
            <div
              ref={badgeRef}
              id="hero-badge"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-medium mb-6"
              style={{
                background: "var(--color-accent-dim)",
                borderColor: "rgba(69,219,125,0.25)",
                color: "var(--color-accent)",
              }}
            >
              <span className="glow-dot" style={{ width: 5, height: 5, animation: "none", boxShadow: "0 0 6px #45db7d" }} />
              SCROLL-DRIVEN ANIMATION SHOWCASE
            </div>

            {/* Headline */}
            <div className="overflow-hidden">
              <h1
                ref={headlineRef}
                id="hero-headline"
                className="font-display font-black tracking-widest uppercase leading-none"
                style={{
                  fontSize: "clamp(1.6rem, 5.5vw, 5rem)",
                  color: "var(--color-text-primary)",
                }}
              >
                {HEADLINE.split("").map((char, i) =>
                  char === " " ? (
                    <span key={i} style={{ display: "inline-block", width: "0.35em" }} />
                  ) : (
                    <span key={i} className="hero-headline-char" style={{ display: "inline-block" }}>
                      {char}
                    </span>
                  )
                )}
              </h1>
            </div>

            {/* Sub-tagline */}
            <p
              className="mt-4 text-base md:text-lg max-w-xl font-light"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Premium scroll interactions crafted with{" "}
              <span className="text-accent font-medium">GSAP ScrollTrigger</span> &amp;{" "}
              <span className="text-white font-medium">Next.js</span>
            </p>
          </div>

          {/* ── Road + Car Section ───────────────────────────────────────────── */}
          <div
            ref={roadSectionRef}
            id="road-section"
            className="relative w-full"
            style={{
              height: "200px",
              background: "linear-gradient(180deg, transparent 0%, #1a1a1a 30%, #141414 70%, #0c0c0c 100%)",
              transformOrigin: "bottom center",
            }}
            aria-label="Car track animation"
          >
            {/* Top fade */}
            <div
              className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
              style={{
                background: "linear-gradient(180deg, var(--color-bg) 0%, transparent 100%)",
              }}
              aria-hidden="true"
            />

            {/* Road surface */}
            <div
              ref={roadRef}
              className="absolute inset-0"
              aria-hidden="true"
              style={{ background: "#1a1a1a", overflow: "hidden" }}
            >
              {/* Trail */}
              <div
                ref={trailRef}
                className="trail-bar"
                aria-hidden="true"
                style={{ opacity: 0.7 }}
              />
              {/* Dashes */}
              <div className="road-dashes" aria-hidden="true" />
            </div>

            {/* ── Car ───────────────────────────────────────────────────────── */}
            <div
              ref={carRef}
              id="hero-car"
              className="absolute"
              style={{
                bottom: "0px",
                left: "-5%",
                zIndex: 20,
                willChange: "transform, opacity",
              }}
              aria-label="Animated sports car"
            >
              {/* Speed lines behind car */}
              <div
                className="absolute right-full top-1/2 -translate-y-1/2 flex flex-col gap-2 pr-4 pointer-events-none"
                aria-hidden="true"
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: `${60 - i * 10}px`,
                      height: "2px",
                      background: `rgba(69,219,125,${0.6 - i * 0.12})`,
                      borderRadius: "99px",
                      marginLeft: `${i * 8}px`,
                    }}
                  />
                ))}
              </div>

              {/* Glow under car */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  width: "80%",
                  height: "30px",
                  background: "radial-gradient(ellipse, rgba(69,219,125,0.3) 0%, transparent 70%)",
                  filter: "blur(6px)",
                }}
                aria-hidden="true"
              />

              <Image
                src="/car.jpg"
                alt="Luxury sports car driving across the hero section"
                width={560}
                height={200}
                priority
                style={{
                  objectFit: "contain",
                  objectPosition: "bottom",
                  maxHeight: "190px",
                  width: "auto",
                  display: "block",
                }}
              />
            </div>
          </div>

          {/* ── Stats Row ──────────────────────────────────────────────────────── */}
          <div
            ref={statsRef}
            id="hero-stats"
            className="relative z-10 w-full px-6 pb-8"
          >
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STATS.map((stat, i) => (
                <article key={i} className="stat-card" aria-label={`${stat.value} ${stat.label}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl" aria-hidden="true">{stat.icon}</span>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-md"
                      style={{
                        background: "var(--color-accent-dim)",
                        color: "var(--color-accent)",
                        border: "1px solid rgba(69,219,125,0.2)",
                      }}
                    >
                      LIVE
                    </span>
                  </div>
                  <div className="stat-number">{stat.value}</div>
                  <div
                    className="font-display font-semibold text-base mt-1"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {stat.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {stat.desc}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* ── CTA Buttons ───────────────────────────────────────────────────── */}
          <div
            ref={ctaRef}
            id="hero-cta"
            className="relative z-10 flex items-center justify-center gap-4 pb-4 px-6"
          >
            <button id="hero-cta-primary" className="cta-btn" aria-label="Start scrolling to explore">
              <span>Explore Demo</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button id="hero-cta-secondary" className="cta-btn-outline" aria-label="View source code on GitHub">
              View on GitHub
            </button>
          </div>

          {/* ── Scroll Hint ───────────────────────────────────────────────────── */}
          <div
            ref={scrollTextRef}
            id="scroll-hint"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none z-20"
            aria-label="Scroll down hint"
          >
            <span className="text-xs tracking-widest uppercase" style={{ color: "var(--color-text-muted)" }}>
              Scroll to drive
            </span>
            <svg
              width="16" height="20" viewBox="0 0 16 20" fill="none"
              style={{ color: "var(--color-text-muted)", animation: "bounce 2s infinite" }}
              aria-hidden="true"
            >
              <rect x="1" y="1" width="14" height="18" rx="7" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="8" cy="6" r="2" fill="currentColor" style={{ animation: "scrollDot 2s infinite" }} />
            </svg>
          </div>

          {/* ── Overlay for exit transition ───────────────────────────────────── */}
          <div
            ref={overlayRef}
            className="absolute inset-0 pointer-events-none z-30"
            aria-hidden="true"
            style={{
              opacity: 0,
              background:
                "radial-gradient(ellipse 80% 60% at 80% 50%, rgba(69,219,125,0.12) 0%, rgba(9,9,11,0.95) 60%)",
            }}
          />
        </main>
      </div>

      {/* ── Marquee Banner ─────────────────────────────────────────────────────── */}
      <section
        aria-label="Technology marquee"
        style={{
          background: "var(--color-bg-secondary)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1rem 0",
          overflow: "hidden",
        }}
      >
        <div className="marquee-track" aria-hidden="true">
          {MARQUEE_ITEMS.map((item, i) => (
            <span
              key={i}
              className="font-mono font-medium whitespace-nowrap px-8 text-sm"
              style={{ color: i % 4 === 0 ? "var(--color-accent)" : "var(--color-text-muted)" }}
            >
              {item} <span style={{ color: "var(--color-border)", margin: "0 8px" }}>✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ── Section Below Hero ─────────────────────────────────────────────────── */}
      <section
        id="features"
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32 text-center"
        style={{ background: "var(--color-bg)" }}
        aria-labelledby="features-heading"
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-medium mb-8"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            BUILT WITH GSAP SCROLLTRIGGER
          </div>

          <h2
            id="features-heading"
            className="font-display font-black leading-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", color: "var(--color-text-primary)" }}
          >
            Scroll-driven{" "}
            <span className="gradient-text">interactions</span>
            <br />
            that feel cinematic.
          </h2>

          <p className="text-lg max-w-2xl mx-auto mb-12" style={{ color: "var(--color-text-secondary)" }}>
            This hero section uses <strong style={{ color: "white" }}>GSAP ScrollTrigger</strong> with{" "}
            <code
              className="px-2 py-0.5 rounded text-sm font-mono"
              style={{ background: "var(--color-surface-2)", color: "var(--color-accent)" }}
            >
              scrub: 1.2
            </code>{" "}
            to interpolate animation progress directly from scroll offset — zero time-based autoplay,
            zero layout reflows.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: "🎯",
                title: "Scroll-Scrubbed",
                desc: "Animation progress is 1:1 tied to scroll position via GSAP scrub, not timers.",
              },
              {
                icon: "⚡",
                title: "GPU Accelerated",
                desc: "Every transform uses translate3d, scale & opacity — zero layout reflows.",
              },
              {
                icon: "🎬",
                title: "Staggered Reveals",
                desc: "Headline chars, stat cards, and CTAs all animate in with GSAP stagger timelines.",
              },
              {
                icon: "📌",
                title: "Pinned Section",
                desc: "The hero is pinned while scrolling 250vh, creating an immersive camera effect.",
              },
              {
                icon: "🚗",
                title: "Car Tracking",
                desc: "The car image translates across the X axis in sync with scroll progress + trail fill.",
              },
              {
                icon: "✨",
                title: "Premium Polish",
                desc: "Cursor glow, noise texture, animated particles, and a marquee banner complete the look.",
              },
            ].map((card, i) => (
              <article
                key={i}
                className="stat-card text-left"
                style={{ borderRadius: "20px" }}
                aria-label={card.title}
              >
                <span className="text-3xl block mb-3" aria-hidden="true">{card.icon}</span>
                <h3
                  className="font-display font-bold text-base mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {card.desc}
                </p>
              </article>
            ))}
          </div>

          {/* Tech stack pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-16">
            {["GSAP 3.12", "ScrollTrigger", "Next.js 15", "React 19", "TypeScript 5", "Tailwind CSS 4"].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-full text-xs font-mono font-medium"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────────── */}
      <footer
        className="relative border-t py-12 text-center"
        style={{
          background: "var(--color-bg-secondary)",
          borderColor: "var(--color-border)",
        }}
        aria-label="Footer"
      >
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Built for the{" "}
          <span className="text-accent font-medium">ITZFIZZ</span> frontend assignment ·{" "}
          <span style={{ color: "var(--color-text-secondary)" }}>
            Next.js + GSAP ScrollTrigger + Tailwind CSS
          </span>
        </p>
        <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
          Inspired by{" "}
          <a
            href="https://paraschaturvedi.github.io/car-scroll-animation"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-accent transition-colors"
          >
            paraschaturvedi.github.io/car-scroll-animation
          </a>
        </p>
      </footer>

      {/* Inline CSS for scroll-mouse animation */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        @keyframes scrollDot {
          0%, 100% { cy: 6; }
          50% { cy: 12; }
        }
        .text-accent { color: var(--color-accent); }
        .gradient-text {
          background: linear-gradient(135deg, #f4f4f5 0%, #45db7d 60%, #3d8bcd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-card {
          position: relative;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 1.5rem 2rem;
          overflow: hidden;
          will-change: transform, opacity;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .stat-card:hover { border-color: rgba(69,219,125,0.25); transform: translateY(-3px); }
        .stat-number {
          font-family: var(--font-display);
          font-size: clamp(2rem,4vw,3rem);
          font-weight: 700;
          line-height: 1;
          background: linear-gradient(135deg,#ffffff,#45db7d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </>
  );
}
