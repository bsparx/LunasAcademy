"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { Mascot } from "@/app/components/mascot";
import type { Graduate } from "@/app/(dashboard)/learn/_data/progress-content";

type Props = {
  graduate: Graduate;
  name: string;
};

export function GraduateClient({ graduate, name }: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-forest-900)] text-white">
      {/* background dots */}
      <div className="absolute inset-0 bg-dots-dark opacity-30 pointer-events-none" />

      {/* confetti */}
      <div className="pointer-events-none absolute inset-0">
        <Confetti palette={graduate.confettiPalette} />
      </div>

      {/* top close */}
      <Link
        href="/dashboard"
        className="absolute right-5 top-5 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </Link>

      {/* content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Mascot size={260} className="drop-shadow-2xl" />

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-mint-400)]/40 bg-[var(--color-mint-500)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-mint-400)]">
          <span aria-hidden>✦</span>
          Core Pathway · complete
        </div>

        <h1 className="mt-6 text-[44px] md:text-[60px] leading-[1.05] font-semibold tracking-[-0.02em] text-balance max-w-3xl">
          {graduate.headline}
        </h1>

        <p className="mt-4 max-w-xl text-[15px] md:text-[16px] leading-relaxed text-white/75 italic">
          &ldquo;{graduate.subtitle}&rdquo;
        </p>

        <p className="mt-3 text-[13px] text-white/60">
          {name}, you finished every required course in the Core Pathway.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={graduate.primaryCta.href}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-mint-500)] px-6 py-3.5 text-[15px] font-semibold text-[var(--color-forest-950)] shadow-[0_8px_24px_rgba(52,194,119,0.35)] hover:bg-[var(--color-mint-400)] hover:shadow-[0_12px_32px_rgba(52,194,119,0.45)] transition-all"
          >
            {graduate.primaryCta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/certificate/rock-cycle"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-[14px] font-semibold text-white hover:bg-white/10 transition-colors"
          >
            View your certificates
          </Link>
        </div>

        {/* page dots — like a full-screen moment */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        </div>
      </div>
    </main>
  );
}

function Confetti({ palette }: { palette: string[] }) {
  // Static confetti, deterministic positions (no Math.random in render)
  const dots: { left: string; top: string; size: number; color: string; rotate: number }[] = [
    { left: "6%", top: "12%", size: 10, color: palette[0], rotate: 12 },
    { left: "16%", top: "20%", size: 6, color: palette[1], rotate: -8 },
    { left: "24%", top: "8%", size: 8, color: palette[2], rotate: 22 },
    { left: "78%", top: "14%", size: 7, color: palette[3], rotate: -18 },
    { left: "88%", top: "20%", size: 10, color: palette[4], rotate: 6 },
    { left: "94%", top: "8%", size: 5, color: palette[0], rotate: -24 },
    { left: "10%", top: "70%", size: 8, color: palette[1], rotate: 18 },
    { left: "20%", top: "82%", size: 6, color: palette[2], rotate: -10 },
    { left: "82%", top: "72%", size: 9, color: palette[3], rotate: 14 },
    { left: "92%", top: "84%", size: 6, color: palette[4], rotate: -6 },
    { left: "50%", top: "4%", size: 5, color: palette[0], rotate: 30 },
    { left: "60%", top: "92%", size: 7, color: palette[1], rotate: -22 },
  ];
  return (
    <>
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            background: d.color,
            opacity: 0.7,
            transform: `rotate(${d.rotate}deg)`,
          }}
        />
      ))}
    </>
  );
}
