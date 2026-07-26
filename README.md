# 🪐 ExoHabitabilityLab · UI

> Space-themed interactive frontend for exploring exoplanet habitability.

A single-page **Angular 19** application that consumes the
[ExoHabitabilityLab API](https://github.com/facundozambuto/ExoHabitabilityLab)
to let you explore real exoplanets from the NASA Exoplanet Archive and see how
habitable they might be.

**Live:** https://exohabitability-ui.vercel.app

## ✨ Features

- **Animated starfield** background with twinkling stars and shooting stars.
- **Generative ambient soundscape** — a subtle, cinematic drone synthesised with
  the Web Audio API (no copyrighted music), pausable from the navbar.
- **Home** — hero, plain-language explanation and featured worlds.
- **Top 10** — habitability leaderboard powered by the API ranking endpoint.
- **Explore** — search and filter the full catalogue by name, star type and size.
- **Planet detail** — full physical/orbital/stellar data, the 13-factor
  habitability breakdown, and **AI image generation** (Flux via Pollinations).
- **Compare** — put up to three worlds side by side with best-value highlighting.
- **Methodology** — the science behind the scoring, references and limitations.

## 🛠 Stack

- Angular 19 (standalone components, signals, lazy-loaded routes)
- Pure CSS space theme (no UI framework)
- Canvas starfield + Web Audio API
- Deployed on Vercel

## 🚀 Development

```bash
npm install
npm start        # ng serve → http://localhost:4200
npm run build    # production build to dist/exohabitability-ui/browser
```

The API base URL is configured in `src/app/core/config.ts`.

## ⚠️ Disclaimer

Habitability scores are **probabilistic indicators** based on current data — not a
detection of life. This is an educational and exploratory tool.
