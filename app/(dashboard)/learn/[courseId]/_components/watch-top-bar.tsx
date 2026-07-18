"use client";

import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { useWatchProgress } from "./watch-progress";

const XP_PER_LESSON = 50;

type Props = {
  course: { courseID: number; title: string; pathway: string | null };
};

/** Deep-forest course bar. Rendered by the [courseId] layout, so it persists
    (no remount, no skeleton flash) while navigating between lessons. */
export function WatchTopBar({ course }: Props) {
  const { done, totalItems } = useWatchProgress();
  const pct = totalItems === 0 ? 0 : Math.round((done.size / totalItems) * 100);

  return (
    <div className="sticky top-0 z-30 bg-[var(--color-forest-900)] text-white shadow-[0_2px_12px_rgba(6,29,21,0.25)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6 md:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/courses/${course.courseID}`}
            aria-label="Back to course"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            {course.pathway ? (
              <div className="truncate text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[var(--color-mint-400)]">
                {course.pathway}
              </div>
            ) : null}
            <div className="truncate text-[14px] font-semibold leading-tight">
              {course.title}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 md:gap-5">
          {/* XP chip — ore amber */}
          <span
            className="hidden items-center gap-1.5 rounded-full bg-[#c2871e]/20 px-3 py-1 text-[12px] font-bold tabular-nums text-[#f0c469] ring-1 ring-[#c2871e]/40 sm:inline-flex"
            title={`${XP_PER_LESSON} XP per completed lesson`}
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            {done.size * XP_PER_LESSON} XP
          </span>

          {/* Course progress */}
          <div className="hidden items-center gap-2.5 md:flex">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#16a34a] transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[12px] font-semibold tabular-nums text-white/80">
              {pct}%
            </span>
          </div>
          <span className="text-[11.5px] tabular-nums text-white/60 md:hidden">
            {done.size}/{totalItems}
          </span>
        </div>
      </div>
      {/* Slim mobile progress bar */}
      <div className="h-[3px] w-full bg-white/10 md:hidden">
        <div
          className="h-full bg-[#16a34a] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
