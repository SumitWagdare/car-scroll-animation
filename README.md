# 🚗 ITZFIZZ — Scroll-Driven Hero Animation

> A premium, scroll-driven hero section animation built with **Next.js 16**, **GSAP ScrollTrigger**, **TypeScript**, and **Tailwind CSS 4**.

**Live Demo:** *(Deploy to Vercel / GitHub Pages)*  
**GitHub Repo:** https://github.com/SumitWagdare/car-scroll-animation

---

## ✨ Features

- **`W E L C O M E   I T Z F I Z Z`** — letter-spaced headline with per-character stagger reveal
- **3-Phase GSAP scroll animation** tied to scroll progress (not timers)
- **Luxury car** drives across a road with a glowing green trail
- **250vh pinned hero section** — immersive scroll travel
- **Staggered stat cards** — 99.9% Speed Boost · 85+ Components · 100% Responsive
- **Cursor glow**, noise texture, animated marquee banner
- **Zero layout reflows** — only `transform` + `opacity` animated (GPU-only)

## 🛠 Tech Stack

| Technology | Version |
|------------|---------|
| Next.js (App Router) | 16.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| GSAP + ScrollTrigger | 3.12 |
| Google Fonts | Outfit, Inter, Space Grotesk |

## ⚡ Animation System

### Intro Reveal (on mount)
```
Navbar      → yPercent: -100 → 0   (power3.out)
Badge       → scale: 0.6 → 1       (back.out spring)
Headline    → yPercent: 120 → 0    (stagger: 0.028 per char)
Stat Cards  → y: 40 → 0, opacity   (stagger: 0.15)
Car         → scale: 0.88 → 1, x   (power3.out)
```

### Scroll-Driven (ScrollTrigger scrub: 1.2)
```
Phase 1 (0–45%):   Headline fades out · Car moves +30vw · Trail fills
Phase 2 (45–75%):  Car continues +70vw · Road scales · Parallax
Phase 3 (75–100%): Car bursts off-screen +130vw · Green overlay
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev        # → http://localhost:3000

# Production build
npm run build
```

## 📦 Deployment

**Vercel (Recommended):**
```bash
npx vercel --prod
```

**GitHub Pages:**
```bash
# Add to next.config.ts: output: 'export'
npm run build
npx gh-pages -d out
```

---

*Inspired by [paraschaturvedi/car-scroll-animation](https://paraschaturvedi.github.io/car-scroll-animation)*  
*Built as part of the ITZFIZZ Frontend Assignment*
