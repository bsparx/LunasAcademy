"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Star,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { InstructorCourse } from "@/app/(dashboard)/learn/_data/instructor-content";

type Props = {
  course: InstructorCourse;
};

export function InstructorAnalyticsClient({ course }: Props) {
  const completionPct = Math.round(course.analytics.completion * 100);
  const dropDelta = Math.round(course.analytics.dropWarning.deltaPct * 100);

  return (
    <div className="mx-auto max-w-4xl px-10 py-10 space-y-10">
      <Link
        href={`/instructor/${course.id}`}
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to builder
      </Link>

      {/* HEADER */}
      <header>
        <div className="text-[12px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
          Instructor analytics
        </div>
        <h1 className="mt-2 text-[36px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
          {course.title}
        </h1>
        <p className="mt-2.5 text-[15px] text-[var(--color-ink-500)]">
          The big picture for this course. Drill in for per-lesson
          detail.
        </p>
      </header>

      {/* STATS ROW */}
      <section className="grid grid-cols-3 gap-3">
        <StatTile
          icon={<Users className="h-4 w-4 text-[var(--color-ink-700)]" />}
          value={course.analytics.enrolled.toLocaleString()}
          label="enrolled"
        />
        <StatTile
          icon={<TrendingUp className="h-4 w-4 text-[var(--color-mint-600)]" />}
          value={`${completionPct}%`}
          label="completion"
          valueColor="text-[var(--color-mint-600)]"
        />
        <StatTile
          icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
          value={course.analytics.rating.toFixed(1)}
          label={`rating · ${course.analytics.ratingCount} reviews`}
          valueColor="text-amber-500"
        />
      </section>

      {/* FLEXIBLE AUTHORING — sticky note risk */}
      <StickyNote />

      {/* FUNNEL */}
      <section className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-7 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-mint-600)]">
              Funnel · by lesson
            </div>
            <div className="mt-1.5 text-[12px] text-[var(--color-ink-500)]">
              Where learners drop off · last 30 days
            </div>
          </div>
          <div className="hidden sm:block text-[11px] text-[var(--color-ink-400)]">
            {course.lessonCount} lessons
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          {course.analytics.funnel.map((p) => {
            const isDrop = course.analytics.dropWarning.lesson === p.lesson;
            const pct = Math.round(p.completion * 100);
            return (
              <div key={p.lesson} className="flex items-center gap-3">
                <div className="w-7 text-[12px] font-semibold text-[var(--color-ink-500)] tabular-nums">
                  L{p.lesson}
                </div>
                <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-[var(--color-cream-100)]">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 ease-out",
                      isDrop
                        ? "bg-gradient-to-r from-[#d8a23a] to-[#b88a2a]"
                        : "bg-gradient-to-r from-[var(--color-mint-500)] to-[var(--color-mint-400)]"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-12 text-right text-[13px] font-semibold tabular-nums text-[var(--color-ink-900)]">
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>

        {dropDelta >= 15 && (
          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-[#d8a23a]/40 bg-[#d8a23a]/10 px-4 py-4">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#d8a23a]" />
            <div className="text-[13px] leading-relaxed text-[var(--color-ink-700)]">
              <span className="font-semibold text-[#8a5f25]">
                {dropDelta}% drop at Lesson {course.analytics.dropWarning.lesson}
              </span>{" "}
              — {course.analytics.dropWarning.advice}
            </div>
          </div>
        )}
      </section>

      {/* NEEDS ATTENTION */}
      <section>
        <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
          Needs attention
        </div>
        <ul className="mt-4 space-y-3">
          {course.analytics.needsAttention.map((n) => (
            <li
              key={n.kind}
              className="group flex items-center justify-between rounded-xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)] transition-all hover:shadow-[0_4px_12px_rgba(15,40,30,0.06)] hover:-translate-y-0.5"
            >
              <div>
                <div className="text-[15px] font-semibold text-[var(--color-ink-900)]">
                  {n.label}
                </div>
                <div className="mt-0.5 text-[12px] text-[var(--color-ink-500)] capitalize">
                  {n.kind === "questions" ? "In the forum" : "In the capstone queue"}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--color-ink-200)] bg-white px-3.5 py-2 text-[13px] font-semibold text-[var(--color-ink-700)] group-hover:border-[var(--color-mint-500)]/50 group-hover:text-[var(--color-mint-600)] transition-colors">
                {n.action}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatTile({
  icon,
  value,
  label,
  valueColor = "text-[var(--color-ink-900)]",
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-7 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <div className="flex items-center gap-2 text-[var(--color-ink-500)]">{icon}</div>
      <div
        className={cn(
          "mt-4 text-[36px] font-semibold tracking-[-0.02em] tabular-nums leading-none",
          valueColor
        )}
      >
        {value}
      </div>
      <div className="mt-2 text-[13px] text-[var(--color-ink-500)]">{label}</div>
    </div>
  );
}

function StickyNote() {
  return (
    <div
      className="relative mx-auto max-w-md -rotate-1 rounded-md bg-[#fdf3c4] p-7 shadow-[0_2px_8px_rgba(140,100,30,0.18),0_1px_2px_rgba(140,100,30,0.1)] ring-1 ring-[#d8b35a]/30"
      role="note"
    >
      {/* Tape strip */}
      <div className="absolute -top-2 left-1/2 h-3 w-16 -translate-x-1/2 rotate-1 bg-[#e8d8a0]/70 shadow-[0_1px_1px_rgba(0,0,0,0.08)]" />
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a5f25]">
        Flexible authoring
      </div>
      <p className="mt-2.5 text-[14px] leading-relaxed text-[#3a2a14]">
        <span className="font-semibold">Instructors drag any block</span> —
        video, reading, practice, discussion, resource — anywhere in a
        module. A &ldquo;reading in the middle&rdquo; is just a Reading
        block dropped between videos. The same block library powers
        per-lesson resources and the course-wide library.
      </p>
    </div>
  );
}
