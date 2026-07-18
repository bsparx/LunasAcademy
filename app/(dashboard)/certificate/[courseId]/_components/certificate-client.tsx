"use client";

import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, ArrowRight, Award } from "lucide-react";
import { Mascot } from "@/app/components/mascot";
import type { Certificate } from "@/app/(dashboard)/learn/_data/progress-content";

type Props = {
  certificate: Certificate;
};

export function CertificateClient({ certificate }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-10 py-10">
      <Link
        href="/progress"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Progress
      </Link>

      {/* COMPLETION BANNER */}
      <div className="mt-5 relative overflow-hidden rounded-2xl bg-[var(--color-forest-900)] p-10 text-center text-white shadow-[0_8px_28px_rgba(10,31,26,0.25)]">
        <div className="absolute inset-0 bg-dots-dark opacity-30 pointer-events-none" />
        {/* confetti dots */}
        <div className="pointer-events-none absolute inset-0">
          <Confetti />
        </div>
        <div className="relative flex flex-col items-center">
          <Mascot size={140} className="drop-shadow-md" />
          <h1 className="mt-4 text-[32px] md:text-[40px] leading-[1.1] font-semibold tracking-[-0.02em] text-balance">
            Module complete! <span aria-hidden>🎉</span>
          </h1>
          <p className="mt-2 max-w-md text-[14px] text-white/70 italic">
            &ldquo;Luna is doing a victory lap in the mountains.&rdquo;
          </p>
        </div>
      </div>

      {/* CERTIFICATE CARD */}
      <div className="mt-8 rounded-2xl border-2 border-[#d8b35a]/40 bg-gradient-to-br from-[#faf3df] to-[#f7e9c8] p-10 shadow-[0_8px_24px_rgba(120,90,30,0.15)]">
        <div className="flex items-center justify-center gap-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#8a5a14]">
          <Award className="h-4 w-4" />
          {certificate.badge}
        </div>
        <div className="mx-auto mt-6 h-px w-32 bg-[#d8b35a]/60" />

        <div className="mt-6 text-center">
          <div className="text-[12px] font-medium uppercase tracking-wider text-[#8a5a14]/80">
            Certificate of Completion · This certifies that
          </div>
          <div className="mt-4 font-serif text-[36px] md:text-[44px] italic text-[#5a3a14] leading-tight">
            {certificate.issuedTo}
          </div>
          <div className="mt-3 text-[14px] text-[#8a5a14]/80">has completed</div>
          <div className="mt-1 text-[18px] md:text-[20px] font-semibold text-[#3a2410]">
            {certificate.courseTitle}
          </div>
        </div>

        <div className="mx-auto mt-8 h-px w-full max-w-md bg-[#d8b35a]/40" />

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 text-[12px] text-[#8a5a14]/80">
          <div>
            <div className="text-[10px] uppercase tracking-wider">Issued</div>
            <div className="mt-0.5 text-[13px] font-semibold text-[#5a3a14]">
              {certificate.issuedOn}
            </div>
          </div>
          <div className="text-center">
            <div className="font-serif italic text-[16px] text-[#3a2410]">
              {certificate.signatory.name}
            </div>
            <div className="text-[10px] uppercase tracking-wider">{certificate.signatory.role}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider">Certificate ID</div>
            <div className="mt-0.5 font-mono text-[12px] font-semibold text-[#5a3a14]">
              {certificate.id}
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-ink-200)] bg-white px-5 py-3 text-[14px] font-semibold text-[var(--color-ink-900)] hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer"
        >
          <ExternalLink className="h-4 w-4" />
          Add to LinkedIn
        </button>
      </div>

      {/* NEXT-UP */}
      {certificate.nextCourse ? (
        <Link
          href={`/courses/${certificate.nextCourse.courseId}`}
          className="group mt-6 flex items-center justify-between rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_2px_8px_rgba(15,40,30,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(15,40,30,0.07)] hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-[var(--color-tint-green)]">
              <Award className="h-5 w-5 text-[var(--color-mint-600)]" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
                What&apos;s next?
              </div>
              <div className="mt-0.5 text-[15px] font-semibold text-[var(--color-ink-900)]">
                Up next: <span className="text-[var(--color-mint-600)]">{certificate.nextCourse.title}</span>
              </div>
            </div>
          </div>
          <span className="text-[12px] font-semibold text-[var(--color-mint-600)] group-hover:text-[var(--color-mint-500)] inline-flex items-center gap-1">
            Start <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ) : (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-[var(--color-mint-500)]/40 bg-[var(--color-tint-green)]/30 p-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-mint-600)]">
              Well earned
            </div>
            <div className="mt-0.5 text-[15px] font-semibold text-[var(--color-ink-900)]">
              You&apos;ve completed every lesson in this course.
            </div>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-forest-900)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors"
          >
            Browse courses <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function Confetti() {
  // Simple static confetti dots
  const dots = [
    { left: "8%", top: "12%", color: "#f5d35a", size: 8 },
    { left: "20%", top: "20%", color: "#f4a8a0", size: 6 },
    { left: "82%", top: "16%", color: "#56cf91", size: 7 },
    { left: "92%", top: "32%", color: "#f5d35a", size: 5 },
    { left: "12%", top: "70%", color: "#56cf91", size: 6 },
    { left: "88%", top: "72%", color: "#d8e3f4", size: 8 },
    { left: "30%", top: "84%", color: "#f4a8a0", size: 5 },
    { left: "70%", top: "86%", color: "#f5d35a", size: 6 },
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
            opacity: 0.6,
          }}
        />
      ))}
    </>
  );
}
