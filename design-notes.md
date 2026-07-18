# Design notes

Per-surface log of palette / type / layout decisions, so new pages stay coherent
without copying the last page's look out of habit.

## Landing page (`app/page.tsx` + `app/components/landing/*`) — July 2026

- **Concept**: "The climb" — Luna the markhor guides students from basecamp
  (Core Pathway) to summit (certificate). Mountain/night-sky motif throughout.
- **Palette**: existing brand tokens only — forest 950–700 (dark greens),
  mint 400–600 (accent/CTA), cream 50–200 (light bg), ink ramp (text),
  pastel tints for track icons. New formalized tokens: `--color-amber-400`
  (#f5d35a) and `--color-amber-300` (#f9e08a) for sparkles/bolt.
- **Type**: Bricolage Grotesque (`--font-display`, `font-display` utility,
  bold, tracking −0.02/−0.03em) for h1/h2/stat numbers/wordmark; Inter
  (`--font-sans`) for everything else. Geist was removed — it collided with
  the `--font-sans` theme variable and made the body font nondeterministic.
  `--font-heading` (used by `components/ui/card.tsx`) now maps to the display font.
- **Signature element**: the illustrated hero — one full-bleed SVG night scene
  (stars, crescent moon, three parallax mountain ridges, mint crystal
  clusters) with Luna the markhor floating on the front-ridge plateau.
- **Mascot**: `app/components/mascot.tsx` — Luna is a markhor (spiral ridged
  horns, chin beard, open eyes, hooves), not a deer. `MarkhorLogo` is the
  head-only mark for header/footer/certificate seal.
- **Motion**: CSS-only. Keyframes in `globals.css` gated behind
  `prefers-reduced-motion: no-preference` (float, twinkle, pulse-soft,
  hero-rise/pop, ridge-drift). Scroll parallax is progressive enhancement via
  `@supports (animation-timeline: scroll())`. Scroll reveals use the single
  client component `app/components/landing/scroll-reveal.tsx`
  (IntersectionObserver + `.reveal`/`.is-revealed` classes).
- **Layout archetypes**: hero = full-bleed cinematic scene; tracks =
  featured dark "basecamp" card + 4-up summit grid; features = bento
  (2-wide video cell, full-width communities strip); journey = ascending
  4-camp route with dashed SVG trail (vertical timeline on mobile);
  certificate = split with tilted cream certificate mock; footer = 4-column
  with mountain-silhouette divider.
- **Copy voice**: mountain/climb metaphor ("basecamp", "summits",
  "the route", "proof of the climb"), plain verbs, Pakistan-specific.
