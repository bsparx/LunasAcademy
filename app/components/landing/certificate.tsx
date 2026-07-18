import { Award, BriefcaseBusiness, FolderGit2 } from "lucide-react";
import { MarkhorLogo } from "../mascot";
import { ScrollReveal } from "./scroll-reveal";

const outcomes = [
  {
    icon: Award,
    title: "A shareable certificate",
    body: "Issued per course and on graduation — link it anywhere.",
  },
  {
    icon: FolderGit2,
    title: "A real capstone project",
    body: "Portfolio proof you can walk an employer through.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job-ready software skills",
    body: "Python, QGIS, and Leapfrog — the tools the sector actually uses.",
  },
];

export function CertificateStrip() {
  return (
    <section className="relative bg-[var(--color-forest-900)] text-white bg-dots-dark overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-forest-800)]/40 via-transparent to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-24 grid lg:grid-cols-2 gap-14 items-center">
        <ScrollReveal>
          <div>
            <div className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-400)] uppercase">
              <span className="h-px w-8 bg-[var(--color-mint-500)]" />
              Proof of the climb
            </div>
            <h2 className="mt-4 font-display text-[32px] md:text-[40px] leading-[1.1] font-bold tracking-[-0.02em] text-balance">
              Finish with more than knowledge.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-white/70 max-w-lg">
              Every summit ends with something you can show — not just
              something you know.
            </p>

            <ul className="mt-8 space-y-5">
              {outcomes.map((o) => (
                <li key={o.title} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-[var(--color-mint-500)]/15 border border-[var(--color-mint-500)]/25 flex items-center justify-center">
                    <o.icon className="h-5 w-5 text-[var(--color-mint-400)]" />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold tracking-tight">
                      {o.title}
                    </div>
                    <p className="mt-0.5 text-[13.5px] leading-[1.6] text-white/60">
                      {o.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        {/* Decorative certificate mock */}
        <ScrollReveal delay={120}>
          <div className="relative mx-auto max-w-md lg:max-w-none" aria-hidden="true">
            <div className="absolute -inset-6 rounded-full bg-[var(--color-mint-500)]/10 blur-2xl pointer-events-none" />
            <div className="relative rotate-[-2deg] rounded-2xl bg-[var(--color-cream-100)] text-[var(--color-ink-900)] p-8 md:p-10 shadow-2xl shadow-black/30 border border-[var(--color-cream-200)]">
              <div className="flex items-center justify-between">
                <MarkhorLogo size={44} />
                <div className="text-right">
                  <div className="text-[10px] font-semibold tracking-[0.22em] text-[var(--color-ink-400)] uppercase">
                    Luna&apos;s Academy
                  </div>
                  <div className="text-[10px] text-[var(--color-ink-400)] mt-0.5">
                    By NTDI
                  </div>
                </div>
              </div>
              <div className="mt-8 text-[11px] font-semibold tracking-[0.24em] text-[var(--color-mint-600)] uppercase">
                Certificate of Completion
              </div>
              <div className="mt-3 font-display text-[26px] md:text-[30px] font-bold tracking-tight">
                Mining Engineer Track
              </div>
              <div className="mt-6 space-y-2.5">
                <div className="h-2 w-3/5 rounded-full bg-[var(--color-ink-200)]/80" />
                <div className="h-2 w-2/5 rounded-full bg-[var(--color-ink-200)]/60" />
              </div>
              <div className="mt-8 flex items-end justify-between">
                <div className="space-y-2">
                  <div className="h-px w-28 bg-[var(--color-ink-300)]" />
                  <div className="text-[10px] text-[var(--color-ink-400)]">
                    Program Director
                  </div>
                </div>
                {/* Ribbon seal */}
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-[var(--color-mint-500)] flex items-center justify-center shadow-md shadow-[var(--color-mint-500)]/30">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute left-1/2 top-10 -translate-x-1/2 flex gap-1">
                    <span className="h-5 w-2 rounded-b-sm bg-[var(--color-mint-600)] rotate-[-14deg]" />
                    <span className="h-5 w-2 rounded-b-sm bg-[var(--color-mint-600)] rotate-[14deg]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
