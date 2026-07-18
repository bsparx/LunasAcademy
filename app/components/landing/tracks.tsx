import {
  Box,
  Compass,
  FlaskConical,
  HardHat,
  Map,
  Mountain,
  Terminal,
  Waves,
} from "lucide-react";
import { SectionLabel } from "./icons";
import { ScrollReveal } from "./scroll-reveal";

const summits = [
  {
    name: "Geologist",
    tagline: "Read the story written in rock.",
    detail: "5 courses",
    icon: Mountain,
    iconBg: "var(--color-tint-blue)",
    iconColor: "#5b7bd6",
  },
  {
    name: "Geophysicist",
    tagline: "See what lies beneath the surface.",
    detail: "5 courses",
    icon: Waves,
    iconBg: "var(--color-tint-purple)",
    iconColor: "#8b6fd1",
  },
  {
    name: "Metallurgist",
    tagline: "Turn raw ore into value.",
    detail: "5 courses",
    icon: FlaskConical,
    iconBg: "var(--color-tint-tan)",
    iconColor: "#c9a063",
  },
  {
    name: "Mining Engineer",
    tagline: "Design the mines of tomorrow.",
    detail: "5 courses",
    icon: HardHat,
    iconBg: "var(--color-tint-cyan)",
    iconColor: "#3fb0bd",
  },
];

const software = [
  { name: "Python", icon: Terminal },
  { name: "QGIS", icon: Map },
  { name: "Leapfrog", icon: Box },
];

export function Tracks() {
  return (
    <section id="tracks" className="bg-[var(--color-cream-50)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-24">
        <ScrollReveal>
          <div className="max-w-2xl">
            <SectionLabel>Choose your path</SectionLabel>
            <h2 className="mt-4 font-display text-[32px] md:text-[40px] leading-[1.1] font-bold tracking-[-0.02em] text-[var(--color-ink-900)] text-balance">
              One basecamp. Four summits.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-[var(--color-ink-500)] max-w-xl">
              Every learner starts at the same basecamp, then picks the summit
              that matches their goals.
            </p>
          </div>
        </ScrollReveal>

        {/* Basecamp — the Core Pathway */}
        <ScrollReveal delay={80}>
          <div className="mt-12 relative overflow-hidden rounded-2xl bg-[var(--color-forest-900)] text-white p-7 md:p-9 bg-dots-dark">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--color-forest-800)]/60 pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
              <div className="h-14 w-14 shrink-0 rounded-xl bg-[var(--color-mint-500)]/15 border border-[var(--color-mint-500)]/30 flex items-center justify-center">
                <Compass className="h-7 w-7 text-[var(--color-mint-400)]" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-400)] uppercase">
                  Basecamp · 7 foundation courses
                </div>
                <div className="mt-2 font-display text-[24px] md:text-[28px] font-bold tracking-tight">
                  The Core Pathway
                </div>
                <p className="mt-2 text-[14px] leading-[1.7] text-white/70 max-w-2xl">
                  Geology, minerals, and how the industry works — built for
                  learners starting from zero. Finish the Core, and every
                  summit is open to you.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Connector */}
        <div className="flex justify-center" aria-hidden="true">
          <div className="h-10 w-px bg-gradient-to-b from-[var(--color-forest-900)]/40 to-[var(--color-ink-300)]" />
        </div>

        {/* The four summits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summits.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 60}>
              <div className="group relative h-full rounded-xl bg-white p-6 border border-[var(--color-ink-200)]/70 shadow-[0_1px_2px_rgba(15,40,30,0.04)] hover:shadow-lg hover:shadow-[var(--color-forest-900)]/5 hover:border-[var(--color-ink-300)] hover:-translate-y-1 transition-all duration-200">
                <div
                  className="h-11 w-11 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: t.iconBg }}
                >
                  <t.icon className="h-5 w-5" style={{ color: t.iconColor }} />
                </div>
                <div className="mt-5 text-[17px] font-semibold text-[var(--color-ink-900)] tracking-tight">
                  {t.name}
                </div>
                <p className="mt-1.5 text-[13px] leading-[1.6] text-[var(--color-ink-500)]">
                  {t.tagline}
                </p>
                <div className="mt-4 inline-flex items-center rounded-full bg-[var(--color-cream-100)] border border-[var(--color-ink-200)]/60 px-2.5 py-1 text-[11px] font-medium text-[var(--color-ink-500)]">
                  {t.detail}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Software strip */}
        <ScrollReveal delay={120}>
          <div className="mt-6 rounded-xl border border-dashed border-[var(--color-ink-300)] bg-white/50 px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center">
            <span className="text-[14px] font-medium text-[var(--color-ink-700)]">
              Real software, built into every track
            </span>
            <div className="flex items-center gap-5">
              {software.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-ink-500)]"
                >
                  <s.icon className="h-4 w-4 text-[var(--color-mint-600)]" />
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
