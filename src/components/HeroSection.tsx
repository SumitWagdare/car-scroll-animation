"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// FIX P6: register once at module scope is fine; guard against double-register
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
const HEADLINE_WORDS = ["W E L C O M E", "I T Z F I Z Z"];

const STATS = [
  { value: "58%",  label: "Increase in pick-up point use" },
  { value: "23%",  label: "Decrease in customer phone calls" },
  { value: "27%",  label: "Increase in on-time deliveries" },
  { value: "40%",  label: "Decrease in failed first attempts" },
];

const NAV_LINKS = ["Features", "Showcase", "Docs"];

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function HeroSection() {
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const navRef        = useRef<HTMLElement>(null);
  const headlineRef   = useRef<HTMLDivElement>(null);
  const statsRef      = useRef<HTMLDivElement>(null);
  const carWrapRef    = useRef<HTMLDivElement>(null);
  const trailRef      = useRef<HTMLDivElement>(null);
  const roadRef       = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // FIX P5: useLayoutEffect so GSAP can measure layout before first paint
  useLayoutEffect(() => {
    // FIX P12a: guard SSR
    if (typeof window === "undefined") return;

    // FIX P2: single ctx wrapping everything — ctx.revert() cleans all triggers
    const ctx = gsap.context(() => {

      /* ── Reduced-motion: skip all animation, show final state ─────────────── */
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Elements are visible by default in CSS via @media rule — nothing to do
        return;
      }

      /* ════════════════════════════════════════════════════════════════════════
         1.  INTRO TIMELINE
         ════════════════════════════════════════════════════════════════════════ */
      const introTL = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Navbar slide down
      introTL.from(navRef.current, {
        yPercent: -110, opacity: 0, duration: 0.7,
      }, 0);

      // Headline: each word's chars stagger up from clip (y offset inside .char-wrap)
      const chars = headlineRef.current?.querySelectorAll<HTMLElement>(".hero-headline-char") ?? [];
      gsap.set(chars, { willChange: "transform, opacity" });

      introTL.from(chars, {
        y: "100%",
        opacity: 0,
        filter: "blur(4px)",
        duration: 0.65,
        stagger: 0.04,
        ease: "power3.out",
        clearProps: "filter",   // remove filter after animation (cheaper paint)
        onComplete: () => {
          // FIX P10: remove will-change after intro so GPU layer is freed
          gsap.set(chars, { willChange: "auto" });
        },
      }, 0.25);

      // Stats stagger up
      const statItems = statsRef.current?.querySelectorAll<HTMLElement>(".stat-item") ?? [];
      gsap.set(statItems, { willChange: "transform, opacity" });

      introTL.from(statItems, {
        y: 20,
        opacity: 0,
        duration: 0.55,
        stagger: 0.15,
        ease: "power3.out",
        onComplete: () => gsap.set(statItems, { willChange: "auto" }),
      }, 0.55);

      // Car fades + slides in last
      gsap.set(carWrapRef.current, { willChange: "transform, opacity" });
      introTL.from(carWrapRef.current, {
        opacity: 0,
        xPercent: -8,
        duration: 0.9,
        ease: "power3.out",
      }, 0.4);

      // Road + trail fade in
      introTL.from(roadRef.current, {
        opacity: 0, duration: 0.6, ease: "power2.out",
      }, 0.35);

      // Scroll hint
      introTL.from(scrollHintRef.current, {
        opacity: 0, duration: 0.5,
      }, 1.4);

      /* ════════════════════════════════════════════════════════════════════════
         2.  SCROLL-DRIVEN ANIMATION
         FIX P2: single ScrollTrigger owns the pin + scrub (not two separate ones)
         ════════════════════════════════════════════════════════════════════════ */

      // FIX P11: wrapper uses CSS overflow:clip; pin still works correctly
      const scrollTL = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "+=220%",          // 220vh scroll travel
          pin: true,              // FIX P2: pin owned by scrub TL, not separate create()
          anticipatePin: 1,
          pinSpacing: true,
          scrub: 1,               // 1s lag — smooth but responsive
          invalidateOnRefresh: true,
        },
      });

      /* ── matchMedia: shorter travel on mobile ─────────────────────────────── */
      const mm = gsap.matchMedia();

      mm.add("(max-width: 767px)", () => {
        // Mobile: car travels less, headline fades faster
        scrollTL.to(headlineRef.current, {
          yPercent: -25, opacity: 0, duration: 0.6, ease: "none",
        }, 0);
        scrollTL.to(statsRef.current, {
          yPercent: -15, opacity: 0, duration: 0.6, ease: "none",
        }, 0.05);
        scrollTL.to(carWrapRef.current, {
          xPercent: 100,       // exit right
          duration: 1.0, ease: "none",
        }, 0.1);
        // FIX P3: scaleX instead of width
        scrollTL.to(trailRef.current, {
          scaleX: 1, duration: 1.0, ease: "none",
        }, 0.1);
      });

      mm.add("(min-width: 768px)", () => {
        // Desktop: headline + stats parallax out
        scrollTL.to(headlineRef.current, {
          yPercent: -30, opacity: 0, duration: 0.8, ease: "none",
        }, 0);
        scrollTL.to(statsRef.current, {
          yPercent: -18, opacity: 0, duration: 0.8, ease: "none",
        }, 0.06);

        // Car: start off-screen left → cross → off-screen right
        // Initial x set here so refresh restores it correctly
        gsap.set(carWrapRef.current, { xPercent: -110 });

        scrollTL.to(carWrapRef.current, {
          xPercent: 120,    // full off-screen right travel
          duration: 2.0,
          ease: "none",     // linear so scroll maps cleanly
        }, 0);

        // FIX P3: scaleX (GPU-composited) with transform-origin: left (set in CSS)
        // Initial scaleX=0 set so refresh restores trail correctly
        gsap.set(trailRef.current, { scaleX: 0 });
        scrollTL.to(trailRef.current, {
          scaleX: 1, duration: 2.0, ease: "none",
        }, 0);

        // Scroll hint fades as soon as user starts scrolling
        scrollTL.to(scrollHintRef.current, {
          opacity: 0, duration: 0.2, ease: "none",
        }, 0);
      });

      // FIX P8: after scroll completes, clean up will-change on car
      ScrollTrigger.addEventListener("scrollEnd", () => {
        gsap.set(carWrapRef.current, { willChange: "auto" });
        gsap.set(trailRef.current,   { willChange: "auto" });
      });

      /* ── Refresh after car image loads so pin heights are correct ─────────── */
      const carImg = carWrapRef.current?.querySelector("img");
      if (carImg && !carImg.complete) {
        carImg.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
      } else {
        // already cached — small defer so layout is settled
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }

    }, wrapperRef); // FIX P2: scope = wrapperRef, all triggers cleaned on revert

    return () => ctx.revert(); // cleans intro TL + all ScrollTriggers
  }, []);

  /* ─── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className="navbar"
        id="navbar"
        aria-label="Main navigation"
      >
        <a href="/" className="flex items-center gap-2.5 no-underline" aria-label="ITZFIZZ home">
          {/* Simple dot accent — no pulsing glow DOM node */}
          <span
            aria-hidden="true"
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--color-accent)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span
            className="font-display font-semibold text-base tracking-tight"
            style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}
          >
            ITZ<span style={{ color: "var(--color-accent)" }}>FIZZ</span>
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-7" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* Nav CTA removed — kept minimal per scope requirement */}
        <a
          href="https://github.com/SumitWagdare/car-scroll-animation"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium tracking-wide transition-colors duration-200"
          style={{ color: "var(--color-text-secondary)" }}
          aria-label="View source on GitHub"
        >
          GitHub ↗
        </a>
      </nav>

      {/* ── Pin wrapper ─────────────────────────────────────────────────────── */}
      {/* FIX P11: overflow:clip via class (not hidden) so pin works */}
      <div ref={wrapperRef} className="hero-wrapper">

        {/* ── Hero main ───────────────────────────────────────────────────── */}
        <main
          id="hero"
          className="relative w-full h-screen flex flex-col"
          style={{ background: "var(--color-bg)" }}
          aria-label="Hero section"
        >

          {/* Subtle radial vignette behind car area — CSS only, no DOM node cost */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 80% 55% at 50% 65%, rgba(61,220,132,0.055) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />

          {/* ── Headline ──────────────────────────────────────────────────── */}
          <div
            ref={headlineRef}
            className="relative z-10 flex flex-col items-center"
            style={{
              paddingTop: "clamp(5.5rem, 12vh, 9rem)",
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
            }}
          >
            <h1
              id="hero-headline"
              aria-label="Welcome ITZFIZZ"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 5.8vw, 5.5rem)",
                fontWeight: 500,          // medium weight — restrained
                letterSpacing: "0.42em",  // wide letter-spacing per spec
                lineHeight: 1.05,
                color: "var(--color-text-primary)",
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              {HEADLINE_WORDS.map((word, wi) => (
                <span key={wi} style={{ display: "block" }}>
                  {word.split("").map((char, ci) =>
                    char === " " ? (
                      // space: non-breaking, preserves letter-spacing rhythm
                      <span
                        key={`${wi}-${ci}`}
                        aria-hidden="true"
                        style={{ display: "inline-block", width: "0.42em" }}
                      />
                    ) : (
                      // FIX P9: no <style jsx> — class set in globals.css
                      <span key={`${wi}-${ci}`} className="char-wrap">
                        <span className="hero-headline-char" aria-hidden={wi > 0 || ci > 0}>
                          {char}
                        </span>
                      </span>
                    )
                  )}
                </span>
              ))}
            </h1>
          </div>

          {/* ── Road + Car (centre of screen) ─────────────────────────────── */}
          <div
            ref={roadRef}
            className="road-lane relative flex-1 flex items-end"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(18,18,22,0.8) 50%, #121218 100%)",
            }}
          >
            {/* Road surface */}
            <div
              style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                height: "35%",
                background:
                  "linear-gradient(180deg, transparent 0%, #141418 40%, #111114 100%)",
              }}
            />

            {/* Centre lane dashes */}
            <div
              style={{
                position: "absolute",
                bottom: "26%", left: 0, right: 0,
                height: "1px",
                background:
                  "repeating-linear-gradient(90deg, transparent 0, transparent 28px, rgba(255,255,255,0.07) 28px, rgba(255,255,255,0.07) 56px)",
              }}
            />

            {/* Trail bar — FIX P3: scaleX not width */}
            <div
              ref={trailRef}
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: "25%",
                left: 0,
                right: 0,
                height: "2px",
                transformOrigin: "left center",   /* expand from left */
                background:
                  "linear-gradient(90deg, transparent 0%, var(--color-accent) 60%, rgba(61,220,132,0.4) 100%)",
                willChange: "transform",
              }}
            />

            {/* ── Car wrap ──────────────────────────────────────────────── */}
            <div
              ref={carWrapRef}
              className="hero-car-wrap"
              style={{
                position: "absolute",
                bottom: "18%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "clamp(240px, 42vw, 620px)",
                willChange: "transform, opacity",
              }}
            >
              {/* Ground shadow — pure CSS, no GSAP */}
              <div className="car-shadow" aria-hidden="true" />

              <Image
                src="/car-cutout.jpg"
                alt="Silver McLaren supercar driving across the road"
                width={620}
                height={280}
                priority
                sizes="(max-width: 640px) 60vw, (max-width: 1024px) 45vw, 620px"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                  /* mix-blend-mode screen makes black bg transparent on dark bg */
                  mixBlendMode: "screen",
                }}
              />
            </div>

            {/* Road top edge line */}
            <div
              style={{
                position: "absolute",
                bottom: "35%", left: 0, right: 0,
                height: "1px",
                background: "var(--color-border)",
              }}
            />
          </div>

          {/* ── Stats row ─────────────────────────────────────────────────── */}
          <div
            ref={statsRef}
            id="hero-stats"
            className="relative z-10"
            style={{
              borderTop: "1px solid var(--color-border)",
              background: "var(--color-bg)",
            }}
          >
            <div
              className="stats-row max-w-5xl mx-auto"
              role="list"
              aria-label="Impact metrics"
            >
              {STATS.map((stat, i) => (
                <div
                  key={i}
                  className="stat-item"
                  role="listitem"
                  aria-label={`${stat.value} ${stat.label}`}
                >
                  <div className="stat-value tabular-nums">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Scroll hint (minimal arrow) ───────────────────────────────── */}
          <div
            ref={scrollHintRef}
            id="scroll-hint"
            className="scroll-hint absolute"
            style={{
              bottom: "calc(clamp(3.5rem,8vh,6rem) + 4px)",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.375rem",
              pointerEvents: "none",
              zIndex: 20,
            }}
            aria-hidden="true"
          >
            <span
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Scroll
            </span>
            <svg
              className="scroll-hint-arrow"
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 1v12M2 8l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--color-text-muted)" }}
              />
            </svg>
          </div>

        </main>
      </div>

      {/* ── Below-hero section — visually quiet ─────────────────────────────── */}
      <section
        id="features"
        className="below-hero"
        aria-labelledby="features-heading"
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            padding: "5rem 1.5rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: "1.5rem",
              fontFamily: "var(--font-body)",
            }}
          >
            Built with
          </p>

          <h2
            id="features-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: "var(--color-text-primary)",
              marginBottom: "1.25rem",
            }}
          >
            GSAP ScrollTrigger.<br />
            <span style={{ color: "var(--color-accent)" }}>Scroll-scrubbed.</span>
          </h2>

          <p
            style={{
              fontSize: "0.9rem",
              lineHeight: 1.7,
              color: "var(--color-text-secondary)",
              marginBottom: "2.5rem",
              maxWidth: "480px",
              margin: "0 auto 2.5rem",
            }}
          >
            Animation progress is tied directly to scroll position via{" "}
            <code
              style={{
                fontFamily: "monospace",
                fontSize: "0.8rem",
                color: "var(--color-accent)",
                background: "var(--color-accent-dim)",
                padding: "0.1em 0.4em",
                borderRadius: "4px",
              }}
            >
              scrub: 1
            </code>
            . No autoplay, no timers during scroll. Only{" "}
            <code style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--color-text-primary)" }}>
              transform
            </code>{" "}
            and{" "}
            <code style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--color-text-primary)" }}>
              opacity
            </code>{" "}
            animated — zero layout reflows.
          </p>

          {/* Minimal tech pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            {["Next.js 16", "TypeScript", "GSAP 3", "ScrollTrigger", "Tailwind CSS 4"].map((t) => (
              <span
                key={t}
                style={{
                  padding: "0.3rem 0.85rem",
                  borderRadius: "99px",
                  border: "1px solid var(--color-border-2)",
                  fontSize: "0.72rem",
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.03em",
                  color: "var(--color-text-secondary)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        aria-label="Footer"
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          background: "var(--color-bg)",
        }}
      >
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          ITZFIZZ Frontend Assignment ·{" "}
          <a
            href="https://paraschaturvedi.github.io/car-scroll-animation"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-text-secondary)", textDecoration: "underline", textUnderlineOffset: "3px" }}
          >
            Reference
          </a>
          {" "}·{" "}
          <a
            href="https://github.com/SumitWagdare/car-scroll-animation"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-text-secondary)", textDecoration: "underline", textUnderlineOffset: "3px" }}
          >
            GitHub
          </a>
        </p>
      </footer>
    </>
  );
}
