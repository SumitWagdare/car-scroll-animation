"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── McLaren-style 5-spoke rim SVG ──────────────────────────────────────── */
function WheelRim() {
  // Pre-compute 5 spoke endpoints (72° apart, starting at -90°)
  const spokes = Array.from({ length: 5 }, (_, i) => {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    const iR = 10, oR = 34;
    return {
      x1: 50 + iR * Math.cos(a), y1: 50 + iR * Math.sin(a),
      x2: 50 + oR * Math.cos(a), y2: 50 + oR * Math.sin(a),
    };
  });
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", width: "100%", height: "100%" }}>
      {/* Tyre */}
      <circle cx="50" cy="50" r="49" fill="#111114" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="#1e1e22" strokeWidth="1.5" />
      {/* Rim dish */}
      <circle cx="50" cy="50" r="39" fill="#242428" />
      {/* 5 spokes */}
      {spokes.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke="#7a7a88" strokeWidth="7.5" strokeLinecap="round" />
      ))}
      {/* Rim highlight ring */}
      <circle cx="50" cy="50" r="39" fill="none"
        stroke="rgba(255,255,255,0.13)" strokeWidth="0.8" />
      {/* Inter-spoke shadow arcs */}
      <circle cx="50" cy="50" r="22" fill="none"
        stroke="rgba(0,0,0,0.4)" strokeWidth="4" />
      {/* Centre hub */}
      <circle cx="50" cy="50" r="10" fill="#35353c" stroke="#4a4a55" strokeWidth="0.6" />
      <circle cx="50" cy="50" r="5.5" fill="#1a1a1e" />
      <circle cx="50" cy="50" r="2.5" fill="#555560" />
    </svg>
  );
}

/* ─── Web-Audio engine sound (lazy-init on first user gesture) ────────────── */
function makeDistortionCurve(amt: number) {
  const n = 256, c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    c[i] = ((Math.PI + amt) * x) / (Math.PI + amt * Math.abs(x));
  }
  return c;
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
const HEADLINE_WORDS = ["W E L C O M E", "I T Z F I Z Z"];
const STATS = [
  { value: "58%", label: "Increase in pick-up point use" },
  { value: "23%", label: "Decrease in customer phone calls" },
  { value: "27%", label: "Increase in on-time deliveries" },
  { value: "40%", label: "Decrease in failed first attempts" },
];
const NAV_LINKS = ["Features", "Showcase", "Docs"];

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function HeroSection() {
  /* existing layout refs */
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const navRef        = useRef<HTMLElement>(null);
  const headlineRef   = useRef<HTMLDivElement>(null);
  const statsRef      = useRef<HTMLDivElement>(null);
  const carWrapRef    = useRef<HTMLDivElement>(null);
  const trailRef      = useRef<HTMLDivElement>(null);
  const roadRef       = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  /* NEW: wheel refs */
  const rearWheelRef  = useRef<HTMLDivElement>(null);
  const frontWheelRef = useRef<HTMLDivElement>(null);

  /* NEW: audio refs — never stored in state to avoid re-renders */
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const oscRef        = useRef<OscillatorNode | null>(null);
  const gainRef       = useRef<GainNode | null>(null);
  const filterRef     = useRef<BiquadFilterNode | null>(null);
  const audioReadyRef = useRef(false);

  /* NEW: wheel rotation accumulator */
  const wheelRotRef   = useRef(0);
  const mouseVelXRef  = useRef(0);
  const lastMouseXRef = useRef(0);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    /* ── Audio initialiser (called on first user gesture) ─────────────────── */
    function initAudio() {
      if (audioReadyRef.current) return;
      audioReadyRef.current = true;
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AC();
        audioCtxRef.current = ctx;

        /* Osc 1 — fundamental sawtooth rumble */
        const osc1 = ctx.createOscillator();
        osc1.type = "sawtooth";
        osc1.frequency.value = 82;

        /* Osc 2 — 2nd harmonic for body */
        const osc2 = ctx.createOscillator();
        osc2.type = "square";
        osc2.frequency.value = 164;
        const osc2Gain = ctx.createGain();
        osc2Gain.gain.value = 0.28;

        /* LFO — subtle engine-idle flutter */
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 4.5;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 5;
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);

        /* Low-pass filter — engine character */
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 260;
        filter.Q.value = 2.8;

        /* Wave-shaper — harmonic richness */
        const dist = ctx.createWaveShaper();
        dist.curve = makeDistortionCurve(55);
        dist.oversample = "2x";

        /* Master gain — starts silent */
        const master = ctx.createGain();
        master.gain.value = 0;

        /* Signal chain */
        osc1.connect(filter);
        osc2.connect(osc2Gain);
        osc2Gain.connect(filter);
        filter.connect(dist);
        dist.connect(master);
        master.connect(ctx.destination);

        osc1.start(); osc2.start(); lfo.start();

        oscRef.current    = osc1;
        gainRef.current   = master;
        filterRef.current = filter;
      } catch {
        /* audio not available — silent fallback */
      }
    }

    /* ── Engine sound updater ─────────────────────────────────────────────── */
    function updateEngine(speed: number) {
      const ctx = audioCtxRef.current;
      const osc = oscRef.current;
      const gain = gainRef.current;
      const filter = filterRef.current;
      if (!ctx || !osc || !gain || !filter) return;

      const abs = Math.abs(speed);
      const t   = ctx.currentTime;
      /* frequency: idle 82Hz → full rev ~540Hz */
      osc.frequency.setTargetAtTime(Math.min(82 + abs * 14, 540), t, 0.07);
      /* filter tracks freq for warmth */
      filter.frequency.setTargetAtTime(Math.min(260 + abs * 8, 900), t, 0.1);
      /* volume: 0 at idle, max 0.16 (respectfully quiet) */
      gain.gain.setTargetAtTime(Math.min(abs * 0.022, 0.16), t, 0.1);
      /* decay to silence when stopped */
      if (abs < 0.4) {
        gain.gain.setTargetAtTime(0, t + 0.05, 0.5);
        osc.frequency.setTargetAtTime(82, t + 0.05, 0.6);
        filter.frequency.setTargetAtTime(260, t + 0.05, 0.6);
      }
    }

    /* ── GSAP context ─────────────────────────────────────────────────────── */
    const ctx = gsap.context(() => {

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) return;

      /* ── 1. INTRO TIMELINE ──────────────────────────────────────────────── */
      const introTL = gsap.timeline({ defaults: { ease: "power3.out" } });

      introTL.from(navRef.current, { yPercent: -110, opacity: 0, duration: 0.7 }, 0);

      const chars = headlineRef.current?.querySelectorAll<HTMLElement>(".hero-headline-char") ?? [];
      gsap.set(chars, { willChange: "transform, opacity" });
      introTL.from(chars, {
        y: "100%", opacity: 0, filter: "blur(4px)", duration: 0.65,
        stagger: 0.04, clearProps: "filter",
        onComplete: () => gsap.set(chars, { willChange: "auto" }),
      }, 0.25);

      const statItems = statsRef.current?.querySelectorAll<HTMLElement>(".stat-item") ?? [];
      gsap.set(statItems, { willChange: "transform, opacity" });
      introTL.from(statItems, {
        y: 20, opacity: 0, duration: 0.55, stagger: 0.15,
        onComplete: () => gsap.set(statItems, { willChange: "auto" }),
      }, 0.55);

      gsap.set(carWrapRef.current, { willChange: "transform, opacity" });
      introTL.from(carWrapRef.current, { opacity: 0, xPercent: -8, duration: 0.9 }, 0.4);
      introTL.from(roadRef.current, { opacity: 0, duration: 0.6, ease: "power2.out" }, 0.35);
      introTL.from(scrollHintRef.current, { opacity: 0, duration: 0.5 }, 1.4);

      /* ── 2. SCROLL-DRIVEN (single ST owns pin + scrub) ──────────────────── */
      const scrollTL = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "+=220%",
          pin: true,
          anticipatePin: 1,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
          /* drive engine from ST velocity */
          onUpdate(self) {
            const vel = self.getVelocity();   // px/s
            updateEngine(Math.abs(vel) * 0.006);
          },
        },
      });

      const mm = gsap.matchMedia();

      mm.add("(max-width: 767px)", () => {
        scrollTL.to(headlineRef.current, { yPercent: -25, opacity: 0, duration: 0.6, ease: "none" }, 0);
        scrollTL.to(statsRef.current,   { yPercent: -15, opacity: 0, duration: 0.6, ease: "none" }, 0.05);
        scrollTL.to(carWrapRef.current, { xPercent: 100,              duration: 1.0, ease: "none" }, 0.1);
        scrollTL.to(trailRef.current,   { scaleX: 1,                  duration: 1.0, ease: "none" }, 0.1);
      });

      mm.add("(min-width: 768px)", () => {
        scrollTL.to(headlineRef.current, { yPercent: -30, opacity: 0, duration: 0.8, ease: "none" }, 0);
        scrollTL.to(statsRef.current,   { yPercent: -18, opacity: 0, duration: 0.8, ease: "none" }, 0.06);
        gsap.set(carWrapRef.current, { xPercent: -110 });
        scrollTL.to(carWrapRef.current, { xPercent: 120, duration: 2.0, ease: "none" }, 0);
        gsap.set(trailRef.current, { scaleX: 0 });
        scrollTL.to(trailRef.current,   { scaleX: 1,    duration: 2.0, ease: "none" }, 0);
        scrollTL.to(scrollHintRef.current, { opacity: 0, duration: 0.2, ease: "none" }, 0);
      });

      ScrollTrigger.addEventListener("scrollEnd", () => {
        gsap.set(carWrapRef.current, { willChange: "auto" });
        gsap.set(trailRef.current,   { willChange: "auto" });
      });

      /* ── 3. WHEEL ROTATION via GSAP ticker ──────────────────────────────── */
      /*
       * Each tick:
       *  - compute scroll delta (px since last frame)
       *  - combine with decaying mouse-X velocity
       *  - accumulate into wheelRot (degrees)
       *  - set rotation on both wheel elements via gsap.set (no new tween)
       *
       * Circumference conversion: 1px scroll ≈ 1.1° rotation (tuned for feel)
       */
      let lastScrollY = window.scrollY;
      let wheelRot    = 0;

      function wheelTick() {
        const sy    = window.scrollY;
        const delta = sy - lastScrollY;
        lastScrollY = sy;

        const velocity = delta * 1.1 + mouseVelXRef.current * 0.6;
        mouseVelXRef.current *= 0.82;          // mouse velocity decay
        wheelRot += velocity;
        wheelRotRef.current = wheelRot;

        if (rearWheelRef.current && frontWheelRef.current) {
          gsap.set([rearWheelRef.current, frontWheelRef.current], {
            rotation: wheelRot,
            transformOrigin: "50% 50%",
          });
        }
      }

      gsap.ticker.add(wheelTick);

      /* refresh after image load */
      const carImg = carWrapRef.current?.querySelector("img");
      if (carImg && !carImg.complete) {
        carImg.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
      } else {
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }

      /* expose ticker cleanup via context return */
      return () => gsap.ticker.remove(wheelTick);

    }, wrapperRef);

    /* ── Mouse velocity tracking (plain DOM — outside gsap.context scope) ─── */
    function onMouseMove(e: MouseEvent) {
      initAudio();
      const dx = e.clientX - lastMouseXRef.current;
      lastMouseXRef.current = e.clientX;
      mouseVelXRef.current += dx * 0.35;
    }

    /* ── First-scroll audio init ─────────────────────────────────────────── */
    function onFirstScroll() { initAudio(); }

    /* ── Tab visibility: suspend/resume audio ─────────────────────────────── */
    function onVisibility() {
      const ac = audioCtxRef.current;
      if (!ac) return;
      if (document.hidden) {
        gainRef.current?.gain.setTargetAtTime(0, ac.currentTime, 0.2);
        ac.suspend();
      } else {
        ac.resume();
      }
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onFirstScroll, { once: true, passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
      audioCtxRef.current?.close();
    };
  }, []);

  /* ─── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav ref={navRef} className="navbar" id="navbar" aria-label="Main navigation">
        <a href="/" className="flex items-center gap-2.5" aria-label="ITZFIZZ home"
          style={{ textDecoration: "none" }}>
          <span aria-hidden="true" style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--color-accent)", display: "inline-block", flexShrink: 0,
          }} />
          <span style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)",
            fontWeight: 600, fontSize: "1rem", letterSpacing: "-0.01em" }}>
            ITZ<span style={{ color: "var(--color-accent)" }}>FIZZ</span>
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-7" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a href={`#${link.toLowerCase()}`}
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
                {link}
              </a>
            </li>
          ))}
        </ul>

        <a href="https://github.com/SumitWagdare/car-scroll-animation"
          target="_blank" rel="noopener noreferrer"
          className="text-xs font-medium tracking-wide transition-colors duration-200"
          style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
          GitHub ↗
        </a>
      </nav>

      {/* ── Pin wrapper ─────────────────────────────────────────────────────── */}
      <div ref={wrapperRef} className="hero-wrapper">
        <main id="hero" className="relative w-full h-screen flex flex-col"
          style={{ background: "var(--color-bg)" }} aria-label="Hero section">

          {/* Radial vignette */}
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 80% 55% at 50% 65%, rgba(61,220,132,0.05) 0%, transparent 65%)",
          }} />

          {/* ── Headline ────────────────────────────────────────────────────── */}
          <div ref={headlineRef} className="relative z-10 flex flex-col items-center"
            style={{ paddingTop: "clamp(5.5rem,12vh,9rem)", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
            <h1 id="hero-headline" aria-label="Welcome ITZFIZZ" style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 5.8vw, 5.5rem)",
              fontWeight: 500,
              letterSpacing: "0.42em",
              lineHeight: 1.05,
              color: "var(--color-text-primary)",
              textAlign: "center",
              textTransform: "uppercase",
            }}>
              {HEADLINE_WORDS.map((word, wi) => (
                <span key={wi} style={{ display: "block" }}>
                  {word.split("").map((char, ci) =>
                    char === " " ? (
                      <span key={`${wi}-${ci}`} aria-hidden="true"
                        style={{ display: "inline-block", width: "0.42em" }} />
                    ) : (
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

          {/* ── Road + Car ──────────────────────────────────────────────────── */}
          <div ref={roadRef} className="road-lane relative flex-1 flex items-end" aria-label="Car animation track"
            style={{ background: "linear-gradient(180deg, transparent 0%, rgba(18,18,22,0.8) 50%, #121218 100%)" }}>

            {/* Road surface */}
            <div aria-hidden="true" style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
              background: "linear-gradient(180deg, transparent 0%, #141418 40%, #111114 100%)",
            }} />

            {/* Lane centre dashes */}
            <div aria-hidden="true" style={{
              position: "absolute", bottom: "26%", left: 0, right: 0, height: "1px",
              background: "repeating-linear-gradient(90deg,transparent 0,transparent 28px,rgba(255,255,255,0.07) 28px,rgba(255,255,255,0.07) 56px)",
            }} />

            {/* Trail — scaleX driven by GSAP */}
            <div ref={trailRef} aria-hidden="true" style={{
              position: "absolute", bottom: "25%", left: 0, right: 0, height: "2px",
              transformOrigin: "left center",
              background: "linear-gradient(90deg,transparent 0%,var(--color-accent) 60%,rgba(61,220,132,0.4) 100%)",
              willChange: "transform",
            }} />

            {/* ── Car wrap ────────────────────────────────────────────────── */}
            <div ref={carWrapRef} className="hero-car-wrap" style={{
              position: "absolute",
              bottom: "18%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "clamp(240px, 42vw, 620px)",
              willChange: "transform, opacity",
            }}>
              {/* Ground shadow */}
              <div className="car-shadow" aria-hidden="true" />

              {/*
               * Car image container — establishes percentage coordinate space
               * for wheel overlays. aspect-ratio matches the source image (620:280).
               */}
              <div style={{ position: "relative", aspectRatio: "620 / 280" }}>

                {/* Car photo — mix-blend-mode:screen erases the black background */}
                <Image
                  src="/car-cutout.jpg"
                  alt="Silver McLaren supercar"
                  fill
                  priority
                  sizes="(max-width: 640px) 60vw, (max-width: 1024px) 45vw, 620px"
                  style={{
                    objectFit: "contain",
                    mixBlendMode: "screen",   /* black → transparent on dark bg */
                  }}
                />

                {/*
                 * REAR WHEEL OVERLAY
                 * Positioned at ~21% from left, ~83% from top of the 620×280 image.
                 * Width ~22% of container (≈137px at full size ≈ wheel outer diameter).
                 * transform: translate(-50%,-50%) centres the div on the wheel hub.
                 */}
                <div
                  ref={rearWheelRef}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "21%",
                    top: "81%",
                    width: "21%",
                    aspectRatio: "1",
                    transform: "translate(-50%, -50%)",
                    willChange: "transform",
                    /* screen blend so dark rim blends with car shadow naturally */
                    mixBlendMode: "screen",
                    opacity: 0.92,
                  }}
                >
                  <WheelRim />
                </div>

                {/*
                 * FRONT WHEEL OVERLAY
                 * Front wheel centre at ~73% from left.
                 */}
                <div
                  ref={frontWheelRef}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "73%",
                    top: "81%",
                    width: "21%",
                    aspectRatio: "1",
                    transform: "translate(-50%, -50%)",
                    willChange: "transform",
                    mixBlendMode: "screen",
                    opacity: 0.92,
                  }}
                >
                  <WheelRim />
                </div>

              </div>{/* /aspect-ratio container */}
            </div>{/* /carWrapRef */}

            {/* Road top edge */}
            <div aria-hidden="true" style={{
              position: "absolute", bottom: "35%", left: 0, right: 0,
              height: "1px", background: "var(--color-border)",
            }} />
          </div>

          {/* ── Stats row ───────────────────────────────────────────────────── */}
          <div ref={statsRef} id="hero-stats" className="relative z-10"
            style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
            <div className="stats-row max-w-5xl mx-auto" role="list" aria-label="Impact metrics">
              {STATS.map((stat, i) => (
                <div key={i} className="stat-item" role="listitem"
                  aria-label={`${stat.value} ${stat.label}`}>
                  <div className="stat-value tabular-nums">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Scroll hint ─────────────────────────────────────────────────── */}
          <div ref={scrollHintRef} id="scroll-hint" className="scroll-hint absolute"
            aria-hidden="true"
            style={{
              bottom: "calc(clamp(3.5rem,8vh,6rem) + 4px)",
              left: "50%", transform: "translateX(-50%)",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "0.375rem",
              pointerEvents: "none", zIndex: 20,
            }}>
            <span style={{
              fontSize: "0.65rem", letterSpacing: "0.15em",
              textTransform: "uppercase", color: "var(--color-text-muted)",
            }}>Scroll</span>
            <svg className="scroll-hint-arrow" width="14" height="14"
              viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v12M2 8l5 5 5-5" stroke="currentColor" strokeWidth="1.2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ color: "var(--color-text-muted)" }} />
            </svg>
          </div>

        </main>
      </div>

      {/* ── Below-hero — quiet ──────────────────────────────────────────────── */}
      <section id="features" className="below-hero" aria-labelledby="features-heading"
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--color-text-muted)", marginBottom: "1.5rem", fontFamily: "var(--font-body)" }}>
            Built with
          </p>
          <h2 id="features-heading" style={{ fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 600, lineHeight: 1.1,
            letterSpacing: "-0.01em", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
            GSAP ScrollTrigger.<br />
            <span style={{ color: "var(--color-accent)" }}>Scroll-scrubbed.</span>
          </h2>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-text-secondary)",
            maxWidth: "480px", margin: "0 auto 2.5rem" }}>
            Wheels rotate from scroll + mouse velocity via{" "}
            <code style={{ fontFamily: "monospace", fontSize: "0.8rem",
              color: "var(--color-accent)", background: "var(--color-accent-dim)",
              padding: "0.1em 0.4em", borderRadius: "4px" }}>gsap.ticker</code>.{" "}
            Engine sound from Web Audio API — frequency tracks scroll speed.
            Zero layout reflows.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
            {["Next.js 16", "TypeScript", "GSAP 3", "ScrollTrigger", "Web Audio API", "Tailwind CSS 4"].map((t) => (
              <span key={t} style={{ padding: "0.3rem 0.85rem", borderRadius: "99px",
                border: "1px solid var(--color-border-2)", fontSize: "0.72rem",
                fontFamily: "var(--font-body)", letterSpacing: "0.03em",
                color: "var(--color-text-secondary)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer aria-label="Footer" style={{ borderTop: "1px solid var(--color-border)",
        padding: "2rem 1.5rem", textAlign: "center", background: "var(--color-bg)" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          ITZFIZZ Frontend Assignment ·{" "}
          <a href="https://paraschaturvedi.github.io/car-scroll-animation"
            target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--color-text-secondary)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            Reference
          </a>{" "}·{" "}
          <a href="https://github.com/SumitWagdare/car-scroll-animation"
            target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--color-text-secondary)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            GitHub
          </a>
        </p>
      </footer>
    </>
  );
}
