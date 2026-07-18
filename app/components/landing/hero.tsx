import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Mascot } from "../mascot";
import { HeroScene } from "./hero-scene";
import { BoltIcon } from "./icons";

const stats = [
  { value: "10,000", label: "Year-1 seats" },
  { value: "4", label: "specialist tracks" },
  { value: "24", label: "expert-led courses" },
  { value: "5", label: "capstone projects" },
];

export function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-[var(--color-forest-950)] to-[var(--color-forest-900)] text-white overflow-hidden">
      {/* Illustrated night-mountain scene */}
      <div className="relative min-h-[620px] md:min-h-[680px] flex flex-col">
        <HeroScene />

        <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8 pt-16 md:pt-24 pb-56 md:pb-40 flex-1">
          <div className="max-w-3xl">
            <div className="hero-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-1.5 text-[13px] text-white/90 shadow-sm">
              <BoltIcon />
              <span>National Talent Development Initiative · Free</span>
            </div>

            <h1
              className="hero-rise mt-8 font-display text-[38px] md:text-[48px] lg:text-[56px] leading-[1.06] font-bold tracking-[-0.03em]"
              style={{ animationDelay: "80ms" }}
            >
              Your <span className="text-[var(--color-mint-400)]">climb</span>{" "}
              starts here.
              <br />
              Pakistan&apos;s minerals are waiting.
            </h1>

            <p
              className="hero-rise mt-6 max-w-lg text-[16px] leading-[1.7] text-white/70"
              style={{ animationDelay: "160ms" }}
            >
              Free, self-paced courses that take you from zero background to
              job-ready professional in Pakistan&apos;s mineral sector — guided
              by Luna, every step of the way.
            </p>

            <div
              className="hero-rise mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "240ms" }}
            >
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="group inline-flex items-center gap-2 rounded-md bg-[var(--color-mint-500)] px-5 py-3 text-[15px] font-medium text-white shadow-lg shadow-[var(--color-mint-500)]/25 hover:bg-[var(--color-mint-600)] hover:shadow-xl hover:shadow-[var(--color-mint-500)]/35 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  Start learning free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </SignUpButton>
              <a
                href="#tracks"
                className="inline-flex items-center rounded-md border border-white/20 bg-white/5 px-5 py-3 text-[15px] font-medium text-white hover:bg-white/10 hover:border-white/30 transition-all"
              >
                Explore tracks
              </a>
            </div>
          </div>
        </div>

        {/* Luna on her ridge */}
        <div className="hero-pop absolute bottom-[10%] right-[4%] sm:right-[6%] lg:right-[9%] w-[140px] sm:w-[190px] lg:w-[230px] pointer-events-none" style={{ animationDelay: "300ms" }}>
          <div className="animate-float">
            <Mascot
              size={230}
              className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="relative border-t border-white/10 bg-[var(--color-forest-900)]/60 backdrop-blur-[2px]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`px-2 md:px-6 ${
                  i > 0 ? "md:border-l md:border-white/10" : ""
                }`}
              >
                <div className="font-display text-[40px] md:text-[44px] font-bold tracking-[-0.02em] text-[var(--color-mint-400)] leading-none">
                  {s.value}
                </div>
                <div className="mt-2.5 text-[12px] text-white/60 uppercase tracking-[0.12em] font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
