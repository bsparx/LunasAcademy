import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./icons";
import { ScrollReveal } from "./scroll-reveal";

const camps = [
  {
    name: "Basecamp",
    title: "Master the Core",
    detail: "7 foundation courses. No background needed.",
    lgOffset: "lg:mt-36",
  },
  {
    name: "Camp two",
    title: "Pick your specialty",
    detail: "Choose one of the four summit tracks.",
    lgOffset: "lg:mt-24",
  },
  {
    name: "Camp three",
    title: "Build your capstone",
    detail: "A real project, with real industry software.",
    lgOffset: "lg:mt-12",
  },
  {
    name: "The Summit",
    title: "Graduate job-ready",
    detail: "Certificate in hand, capstone to show.",
    lgOffset: "lg:mt-0",
    summit: true,
  },
];

export function Journey() {
  return (
    <section id="how" className="bg-[var(--color-cream-50)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-24">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto">
            <SectionLabel>The route</SectionLabel>
            <h2 className="mt-4 font-display text-[32px] md:text-[40px] leading-[1.1] font-bold tracking-[-0.02em] text-[var(--color-ink-900)] text-balance">
              From basecamp to summit.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-[var(--color-ink-500)]">
              Four camps. One route. Luna walks it with you.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative mt-16">
          {/* Ascending dashed route (desktop) */}
          <svg
            className="hidden lg:block absolute inset-0 h-full w-full"
            viewBox="0 0 1200 280"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M150 190 C 320 175, 400 150, 450 142 C 620 115, 700 100, 750 94 C 920 70, 1000 55, 1050 46"
              fill="none"
              stroke="var(--color-ink-300)"
              strokeWidth="2"
              strokeDasharray="2 10"
              strokeLinecap="round"
            />
          </svg>

          <ol className="relative space-y-10 border-l-2 border-dashed border-[var(--color-ink-200)] pl-9 lg:space-y-0 lg:border-l-0 lg:pl-0 lg:grid lg:grid-cols-4 lg:gap-8">
            {camps.map((camp, i) => (
              <li
                key={camp.name}
                className={cn(
                  "relative lg:flex lg:flex-col lg:items-center lg:text-center",
                  camp.lgOffset
                )}
              >
                <ScrollReveal
                  delay={i * 90}
                  className="lg:flex lg:flex-col lg:items-center"
                >
                  <div
                    className={cn(
                      "absolute -left-[57px] top-0 lg:static flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold shadow-sm z-10",
                      camp.summit
                        ? "bg-[var(--color-mint-500)] text-white shadow-[var(--color-mint-500)]/30"
                        : "bg-white border border-[var(--color-ink-200)] text-[var(--color-ink-900)]"
                    )}
                  >
                    {camp.summit ? <Flag className="h-4 w-4" /> : i + 1}
                  </div>
                  <div className="lg:mt-5">
                    <div className="text-[11px] font-semibold tracking-[0.2em] text-[var(--color-mint-600)] uppercase">
                      {camp.name}
                    </div>
                    <div className="mt-1.5 text-[17px] font-semibold text-[var(--color-ink-900)] tracking-tight">
                      {camp.title}
                    </div>
                    <p className="mt-1.5 text-[14px] text-[var(--color-ink-500)] max-w-[230px] leading-[1.6] lg:mx-auto">
                      {camp.detail}
                    </p>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
