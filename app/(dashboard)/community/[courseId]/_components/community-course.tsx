"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Library, MessageSquare, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type PerCourseCommunity,
  courseAccent,
} from "@/app/(dashboard)/learn/_data/community-content";
import { RoleLadder } from "../../_components/role-ladder";

type Props = {
  data: PerCourseCommunity;
};

export function CommunityCourseClient({ data }: Props) {
  const accent = courseAccent(data.courseId);
  const mentorIndex = data.roles.findIndex((r) => r.state === "current");
  const nextProgressPct =
    mentorIndex >= 0 && mentorIndex < data.roles.length - 1
      ? Math.min(100, Math.max(0, ((data.reputation - data.roles[mentorIndex].minRep) /
          (data.roles[mentorIndex + 1].minRep - data.roles[mentorIndex].minRep)) * 100))
      : 100;

  return (
    <div className="mx-auto max-w-3xl px-10 py-10 space-y-8">
      <Link
        href="/community"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Community
      </Link>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--color-forest-900)] p-7 text-white shadow-[0_8px_28px_rgba(10,31,26,0.25)]">
        <div className="absolute inset-0 bg-dots-dark opacity-30 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: "var(--course-strip, transparent)" }} />
        <div className="relative flex items-center gap-5">
          <AvatarBadge accent={accent} />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold tracking-[0.22em] text-white/60 uppercase">
              {data.courseTitle}
            </div>
            <h1 className="mt-1.5 text-[24px] md:text-[28px] font-semibold leading-tight tracking-[-0.01em]">
              {data.roles.find((r) => r.state === "current")?.name ?? "Learner"}{" "}
              <span className="text-[var(--color-mint-400)]">in this community</span>{" "}
              <span aria-hidden>🦌</span>
            </h1>
            <div className="mt-1.5 text-[13px] text-white/70">
              <span className="font-semibold tabular-nums text-white">
                {data.reputation.toLocaleString()}
              </span>{" "}
              rep
              <span className="mx-1.5 text-white/40">·</span>
              <span className="font-semibold tabular-nums text-[var(--color-mint-400)]">
                {data.repToNext}
              </span>{" "}
              to <span className="font-semibold text-white">{data.nextRole}</span>
            </div>
          </div>
        </div>

        <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-mint-500)] to-[var(--color-mint-400)] transition-[width] duration-500 ease-out"
            style={{ width: `${nextProgressPct}%` }}
            role="progressbar"
            aria-valuenow={Math.round(nextProgressPct)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="mt-2 text-[12px] text-white/65">
          <span className="font-semibold text-white">{data.repToNext}</span> rep to{" "}
          <span className="font-semibold text-white">{data.nextRole}</span> — unlocks{" "}
          <span className="font-medium text-white">{data.unlocks}</span>
        </div>
      </div>

      {/* ROLE LADDER */}
      <section className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-7 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
            Role ladder
          </div>
          <div className="text-[11px] text-[var(--color-ink-500)]">
            {data.roles.find((r) => r.state === "current")?.name} in {data.courseTitle.split(" — ")[0]}
          </div>
        </div>
        <div className="mt-6">
          <RoleLadder roles={data.roles} reputation={data.reputation} />
        </div>
      </section>

      {/* WAYS TO EARN */}
      <section className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)] overflow-hidden">
        <div className="px-7 pt-6 pb-3">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
            Ways to earn rep
          </div>
        </div>
        <ul className="divide-y divide-[var(--color-ink-200)]/60">
          {data.ways.map((w) => (
            <li
              key={w.id}
              className="flex items-center gap-4 px-7 py-3.5 transition-colors hover:bg-[var(--color-cream-50)]/50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-tint-green)] text-[var(--color-mint-600)]">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                  {w.label}
                </div>
                {w.meta && (
                  <div className="text-[12px] text-[var(--color-ink-500)]">{w.meta}</div>
                )}
              </div>
              <span className="text-[13px] font-semibold tabular-nums text-[var(--color-mint-600)]">
                {w.rep}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* RECENT ACTIVITY */}
      {data.recentActivity.length > 0 && (
        <section className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)] overflow-hidden">
          <div className="px-7 pt-6 pb-3">
            <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
              Recent activity
            </div>
          </div>
          <ul className="divide-y divide-[var(--color-ink-200)]/60">
            {data.recentActivity.map((a, i) => (
              <li key={i} className="flex items-center gap-3 px-7 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-tint-green)] text-[var(--color-mint-600)]">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <div className="min-w-0 flex-1 text-[13px] text-[var(--color-ink-700)]">
                  {a.text}
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[var(--color-ink-500)]">
                  <span className="font-semibold tabular-nums text-[var(--color-mint-600)]">
                    +{a.rep}
                  </span>
                  <span>{a.ago}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* QUICK LINKS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href={`/resources/${data.courseId}`}
          className="group flex items-center justify-between rounded-xl border border-[var(--color-ink-200)]/60 bg-white px-5 py-4 transition-all hover:shadow-[0_4px_12px_rgba(15,40,30,0.06)] hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-tint-tan)] text-[#8a5f25]">
              <Library className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                Resources library
              </div>
              <div className="text-[12px] text-[var(--color-ink-500)]">
                Slides, datasets, code notebooks
              </div>
            </div>
          </div>
          <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-[var(--color-ink-400)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-ink-700)]" />
        </Link>
        <Link
          href={`/forum/${data.courseId}`}
          className="group flex items-center justify-between rounded-xl border border-[var(--color-ink-200)]/60 bg-white px-5 py-4 transition-all hover:shadow-[0_4px_12px_rgba(15,40,30,0.06)] hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-tint-blue)] text-[#2a4a86]">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                Discussion forum
              </div>
              <div className="text-[12px] text-[var(--color-ink-500)]">
                Ask, answer, study together
              </div>
            </div>
          </div>
          <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-[var(--color-ink-400)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-ink-700)]" />
        </Link>
      </section>

      {/* CAPSTONE-LINK FALLBACK */}
      <div className="rounded-xl bg-[var(--color-cream-100)]/60 px-5 py-4 text-[13px] leading-relaxed text-[var(--color-ink-500)]">
        {data.instructorNote}
      </div>
    </div>
  );
}

function AvatarBadge({
  accent,
}: {
  accent: { strip: string; badge: string; ring: string };
}) {
  return (
    <div
      className={cn(
        "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-mint-500)] text-3xl ring-4",
        accent.ring
      )}
    >
      <span aria-hidden>🦌</span>
      <span className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-mint-400)] text-white ring-2 ring-[var(--color-forest-900)]">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    </div>
  );
}
