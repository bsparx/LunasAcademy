import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Mascot } from "../mascot";
import { ScrollReveal } from "./scroll-reveal";

export function FinalCta() {
  return (
    <section className="relative bg-[var(--color-forest-900)] text-white bg-dots-dark overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-forest-950)] via-transparent to-transparent pointer-events-none" />

      {/* Mini ridge under Luna */}
      <svg
        className="absolute bottom-0 inset-x-0 w-full h-32"
        viewBox="0 0 1440 128"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 128 L 0 90 L 240 60 L 480 96 L 720 40 L 960 88 L 1200 56 L 1440 84 L 1440 128 Z"
          fill="var(--color-forest-950)"
          opacity="0.6"
        />
      </svg>

      <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-24 text-center">
        <ScrollReveal>
          <div className="flex justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                <div className="w-[220px] h-[220px] rounded-full bg-[var(--color-mint-500)]/20 blur-2xl" />
              </div>
              <div className="relative animate-float">
                <Mascot size={150} className="drop-shadow-2xl" />
              </div>
            </div>
          </div>
          <h2 className="mt-6 font-display text-[32px] md:text-[40px] leading-[1.1] font-bold tracking-[-0.02em] text-balance">
            The summit is waiting.
            <br />
            Luna knows the way.
          </h2>
          <p className="mt-4 text-[15px] text-white/70 max-w-md mx-auto">
            Free for every learner in Pakistan · 10,000 year-1 seats · No
            credit card.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <SignUpButton mode="modal">
              <button
                type="button"
                className="group inline-flex items-center gap-2 rounded-md bg-[var(--color-mint-500)] px-6 py-3.5 text-[15px] font-medium text-white shadow-lg shadow-[var(--color-mint-500)]/25 hover:bg-[var(--color-mint-600)] hover:shadow-xl hover:shadow-[var(--color-mint-500)]/35 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                Create free account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </SignUpButton>
            <a
              href="#how"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-white/80 hover:text-white px-4 py-3 transition-colors"
            >
              See how it works
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
