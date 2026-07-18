"use client";

import Link from "next/link";
import {
  ChevronRight,
  Users,
  BarChart3,
  Star,
  ArrowRight,
} from "lucide-react";
import { Sidebar } from "@/app/dashboard/_components/sidebar";
import { cn } from "@/lib/utils";
import type { InstructorCourse } from "@/app/learn/_data/instructor-content";

type Props = {
  courses: InstructorCourse[];
};

export function InstructorHomeClient({ courses }: Props) {
  return (
    <div className="flex min-h-screen bg-[var(--cream-50)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="mx-auto max-w-6xl px-10 py-10 space-y-10">
          {/* HEADER */}
          <header>
            <div className="text-[12px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
              Instructor
            </div>
            <h1 className="mt-2 text-[36px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
              Your courses
            </h1>
            <p className="mt-2.5 text-[15px] text-[var(--color-ink-500)]">
              Build, edit, and watch how learners are doing — across {courses.length}{" "}
              {courses.length === 1 ? "course" : "courses"}.
            </p>
          </header>

          {/* COURSES */}
          <ul className="space-y-4">
            {courses.map((c) => (
              <CourseRow key={c.id} course={c} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CourseRow({ course }: { course: InstructorCourse }) {
  const isDraft = course.status === "draft";
  return (
    <li>
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)] transition-all hover:shadow-[0_6px_18px_rgba(15,40,30,0.07)]",
          isDraft
            ? "border-[var(--color-ink-200)]/60"
            : "border-[var(--color-mint-500)]/30"
        )}
      >
        <div className="flex items-stretch">
          {/* Course meta */}
          <div className="flex-1 min-w-0 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  isDraft
                    ? "bg-[var(--color-tint-tan)] text-[#8a5f25]"
                    : "bg-[var(--color-tint-green)] text-[var(--color-mint-600)]"
                )}
              >
                {course.status}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
                {course.pathway}
              </span>
            </div>
            <h2 className="mt-2.5 text-[22px] font-semibold tracking-[-0.01em] text-[var(--color-ink-900)]">
              {course.title}
            </h2>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--color-ink-500)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="font-semibold tabular-nums text-[var(--color-ink-700)]">
                  {course.lessonCount}
                </span>{" "}
                lessons
              </span>
              <span className="text-[var(--color-ink-300)]">·</span>
              <span>
                <span className="font-semibold tabular-nums text-[var(--color-ink-700)]">
                  {course.duration}
                </span>
              </span>
              <span className="text-[var(--color-ink-300)]">·</span>
              <span>
                <span className="font-semibold tabular-nums text-[var(--color-ink-700)]">
                  {course.modules.length}
                </span>{" "}
                module{course.modules.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="hidden sm:flex items-stretch border-l border-[var(--color-ink-200)]/60">
            <Stat icon={<Users className="h-3.5 w-3.5" />} value={course.analytics.enrolled.toLocaleString()} label="enrolled" />
            <Stat
              icon={<BarChart3 className="h-3.5 w-3.5" />}
              value={`${Math.round(course.analytics.completion * 100)}%`}
              label="completion"
            />
            <Stat
              icon={<Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
              value={course.analytics.rating.toFixed(1)}
              label="rating"
            />
          </div>

          {/* CTAs */}
          <div className="flex flex-col items-stretch justify-center gap-2 border-l border-[var(--color-ink-200)]/60 p-4">
            <Link
              href={`/instructor/${course.id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--color-forest-900)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors"
            >
              Open builder
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/instructor/${course.id}/analytics`}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--color-ink-200)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)] transition-colors"
            >
              Analytics
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 min-w-[96px]">
      <div className="text-[var(--color-ink-400)]">{icon}</div>
      <div className="mt-2 text-[18px] font-semibold tabular-nums text-[var(--color-ink-900)]">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wider text-[var(--color-ink-500)]">
        {label}
      </div>
    </div>
  );
}
