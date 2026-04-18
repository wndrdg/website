# Wonder Dog

Helping dogs live longer, healthier lives.

## Stack

| Layer          | Technology                                                   |
| -------------- | ------------------------------------------------------------ |
| Framework      | [Next.js 16](https://nextjs.org) (App Router, RSC)          |
| Language       | TypeScript                                                   |
| Styling        | [Tailwind CSS v4](https://tailwindcss.com)                   |
| Components     | [shadcn/ui](https://ui.shadcn.com) (New York style, Lucide icons) |
| Animation      | [Framer Motion](https://www.framer.com/motion/)              |
| Font           | Sohne (300 – 700 weights, self-hosted)                        |
| Email          | [Resend](https://resend.com)                                 |

## Design System

### Philosophy

Swiss-inspired. Minimal. Modern. Every page should feel quiet and confident — generous whitespace, clean type, deliberate color, nothing decorative for its own sake.

### Color

| Role          | Value               | Notes                                                  |
| ------------- | ------------------- | ------------------------------------------------------ |
| **Primary**   | `#005352`           | Deep teal-green. Use for key actions, links, accents.  |
| Background    | Near-black (`oklch(0.145 0 0)`) | Dark by default; all surfaces sit on this.    |
| Foreground    | Near-white (`oklch(0.985 0 0)`) | Primary text color.                           |
| Muted         | `oklch(0.708 0 0)`  | Secondary/caption text.                                |
| Border        | `oklch(1 0 0 / 15%)`| Subtle white borders.                                  |

Keep the palette restrained. When in doubt, use neutrals and let `#005352` be the only pop of color.

### Typography

- **Font family:** Sohne — a clean, geometric sans-serif with subtle humanist warmth.
- **Weights in use:** Light (300), Book (400), Krafig (500), Halbfett (600), Dreiviertelfett (700).
- Favor **400 for body**, **600 for headings**, **300 for large display text** where lightness adds elegance.
- Use tight tracking on headings (`tracking-[-0.02em]`).
- Keep type sizes modest and readable. No shouting.

### Layout

- Generous whitespace. Let content breathe.
- Center-aligned hero layouts, left-aligned content sections.
- Max-width containers to keep line lengths comfortable.
- Mobile-first responsive design — every page should feel right on a phone.

### Animation (Framer Motion)

Use motion for **light, purposeful touches** — not spectacle.

- **Entrances:** Subtle fade + translate (`opacity: 0, y: 12` → `opacity: 1, y: 0`).
- **Easing:** Smooth deceleration curves like `[0.16, 1, 0.3, 1]`.
- **Duration:** 0.4–0.8s for entrances, 0.2–0.3s for exits.
- **Stagger:** Use incremental `delay` (0.1–0.2s steps) to reveal content in sequence.
- **Background motion:** Very slow, ambient movement (Ken Burns-style zoom over 30s) is fine for hero imagery.
- Never animate for the sake of animating. If removing the animation doesn't hurt the experience, remove it.

### Components

Use **shadcn/ui exclusively** for all UI primitives (buttons, inputs, cards, dialogs, etc.).

- Style overrides via Tailwind classes, not custom CSS.
- Prefer composition over customization — combine shadcn components rather than building from scratch.
- Keep component APIs simple. Don't over-abstract.

### The Vibe, Summarized

> Clean, calm, premium. Think Aesop packaging meets a Swiss type specimen. Every element earns its place. If it doesn't serve the user, it doesn't ship.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.
