"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Users,
  Layers,
  Clock,
  CircleCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CourseCardDTO = {
  courseID: number;
  title: string;
  description: string | null;
  pathway: string | null;
  level: string | null;
  teacherName: string;
  moduleCount: number;
  lessonCount: number;
  videoHours: number;
  enrolledCount: number;
  enrolled: boolean;
};

function formatHours(hours: number) {
  if (hours <= 0) return null;
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  return `${Math.round(hours * 10) / 10}h`;
}

function CourseThumb() {
  return (
    <div className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-tint-green)]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(52,194,119,0.25) 0 2px, transparent 2px 12px)",
        }}
      />
    </div>
  );
}

function CourseRow({ course }: { course: CourseCardDTO }) {
  const hours = formatHours(course.videoHours);
  return (
    <Link
      href={`/courses/${course.courseID}`}
      className="group flex items-center gap-5 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-4 shadow-[0_1px_2px_rgba(15,40,30,0.04)] transition-all duration-200 hover:border-[var(--color-ink-300)] hover:shadow-[0_6px_20px_rgba(15,40,30,0.06)] hover:-translate-y-0.5"
    >
      <CourseThumb />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-semibold tracking-tight text-[var(--color-ink-900)] group-hover:text-[var(--color-forest-900)] transition-colors truncate">
            {course.title}
          </h3>
          {course.enrolled && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-tint-green)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-mint-600)]">
              <CircleCheck className="h-3 w-3" />
              Enrolled
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--color-ink-500)]">
          <span className="truncate">{course.teacherName}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--color-ink-300)]" />
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {course.moduleCount} {course.moduleCount === 1 ? "module" : "modules"}
          </span>
          <span className="h-1 w-1 rounded-full bg-[var(--color-ink-300)]" />
          <span>
            {course.lessonCount} {course.lessonCount === 1 ? "lesson" : "lessons"}
          </span>
          {hours ? (
            <>
              <span className="h-1 w-1 rounded-full bg-[var(--color-ink-300)]" />
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {hours}
              </span>
            </>
          ) : null}
          <span className="h-1 w-1 rounded-full bg-[var(--color-ink-300)]" />
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.enrolledCount.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {course.pathway ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mint-600)]">
            {course.pathway}
          </span>
        ) : null}
        {course.level ? (
          <span className="text-[12px] font-medium text-[var(--color-ink-400)]">
            {course.level}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-px w-6 bg-[var(--color-mint-500)]" />
      <span className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
        {children}
      </span>
    </div>
  );
}

export function CoursesClient({ courses }: { courses: CourseCardDTO[] }) {
  const pathways = useMemo(() => {
    const set = new Set<string>();
    for (const c of courses) if (c.pathway) set.add(c.pathway);
    return [...set];
  }, [courses]);

  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (active !== "all" && c.pathway !== active) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q) ?? false) ||
        c.teacherName.toLowerCase().includes(q)
      );
    });
  }, [courses, active, query]);

  return (
    <div className="flex min-h-screen flex-1 bg-[var(--cream-50)]">
      <div className="flex-1 min-w-0">
        <div className="mx-auto max-w-6xl px-10 py-10 space-y-10">
          {/* HEADER */}
          <header>
            <h1 className="text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
              Browse Courses
            </h1>
            <p className="mt-1.5 text-[15px] text-[var(--color-ink-500)]">
              {courses.length === 1
                ? "1 published course from Luna's Academy instructors."
                : `${courses.length} published courses from Luna's Academy instructors.`}
            </p>
          </header>

          {/* SEARCH + FILTERS */}
          <section className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-400)] pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, instructors, topics…"
                className="h-12 rounded-xl border-[var(--color-ink-200)] bg-white pl-11 pr-4 text-[14px] shadow-[0_1px_2px_rgba(15,40,30,0.03)] focus-visible:border-[var(--color-forest-900)] focus-visible:ring-3 focus-visible:ring-[var(--color-forest-900)]/15"
              />
            </div>

            {pathways.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {["all", ...pathways].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActive(p)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-[14px] font-medium transition-all duration-150 cursor-pointer",
                      active === p
                        ? "border-[var(--color-forest-900)] bg-[var(--color-forest-900)] text-white shadow-[0_2px_8px_rgba(10,31,26,0.2)]"
                        : "border-[var(--color-ink-200)] bg-white text-[var(--color-ink-700)] hover:border-[var(--color-ink-300)]"
                    )}
                  >
                    {p === "all" ? "All" : p}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* COURSES */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <SectionLabel>Published courses</SectionLabel>
              <span className="text-[13px] text-[var(--color-ink-500)]">
                {visible.length} of {courses.length}
              </span>
            </div>

            {visible.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-ink-200)] bg-white/50 p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-cream-100)]">
                  <Sparkles className="h-5 w-5 text-[var(--color-ink-400)]" />
                </div>
                <div className="mt-3 text-[15px] font-medium text-[var(--color-ink-700)]">
                  {courses.length === 0
                    ? "No courses published yet"
                    : "No courses match your search"}
                </div>
                <div className="mt-1 text-[13px] text-[var(--color-ink-500)]">
                  {courses.length === 0
                    ? "Check back soon — instructors are building the first ones now."
                    : "Try a different keyword or clear the filter."}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {visible.map((c) => (
                  <CourseRow key={c.courseID} course={c} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
