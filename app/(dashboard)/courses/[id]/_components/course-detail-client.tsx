"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Check,
  BookOpen,
  PencilLine,
  Trophy,
  Sparkles,
  ChevronDown,
  GraduationCap,
  Star,
  Users,
  Library,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/dashboard/_components/sidebar";
import type { CourseDetail as CourseDetailType } from "../page";

type Props = {
  course: CourseDetailType;
};

const TAB_KEYS = ["curriculum", "overview", "instructor", "reviews"] as const;
type TabKey = (typeof TAB_KEYS)[number];

function LessonIcon({ type }: { type: CourseDetailType["modules"][number]["lessons"][number]["type"] }) {
  if (type === "video") {
    return <Play className="h-3.5 w-3.5 fill-current text-[var(--color-mint-600)]" />;
  }
  if (type === "reading") {
    return <BookOpen className="h-3.5 w-3.5 text-[var(--color-ink-500)]" />;
  }
  if (type === "practice") {
    return <PencilLine className="h-3.5 w-3.5 text-[var(--color-ink-500)]" />;
  }
  return <Trophy className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />;
}

function VideoThumb() {
  return (
    <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--color-tint-green)]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(52,194,119,0.25) 0 3px, transparent 3px 18px)",
        }}
      />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
        <Play className="h-6 w-6 fill-[var(--color-forest-900)] text-[var(--color-forest-900)] translate-x-0.5" />
      </div>
    </div>
  );
}

function CapstoneCard({ title, tag, href }: { title: string; tag: string; href: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-[var(--color-tint-tan)]/60 bg-[var(--color-tint-tan)]/40 px-5 py-4 transition-colors hover:bg-[var(--color-tint-tan)]/60"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-tint-tan)]">
          <GraduationCap className="h-4 w-4 text-[#8a5f25]" />
        </div>
        <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
          {title}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-[12px] font-medium text-[#8a5f25] uppercase tracking-wider">
          {tag}
        </div>
        <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-[#8a5f25] transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function CommunityLinks({ courseId }: { courseId: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Link
        href={`/resources/${courseId}`}
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
        href={`/forum/${courseId}`}
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
    </div>
  );
}

function ModuleCard({
  module,
  courseId,
  defaultOpen,
}: {
  module: CourseDetailType["modules"][number];
  courseId: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div
      className={cn(
        "rounded-xl border bg-white transition-colors",
        open
          ? "border-[var(--color-mint-500)]/30"
          : "border-[var(--color-ink-200)]/60 hover:border-[var(--color-ink-300)]"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-semibold",
              module.done
                ? "bg-[var(--color-mint-500)]/15 text-[var(--color-mint-600)]"
                : "bg-[var(--color-ink-100)] text-[var(--color-ink-500)]"
            )}
          >
            {module.done ? <Check className="h-3.5 w-3.5" /> : null}
          </div>
          <span className="text-[14px] font-semibold text-[var(--color-ink-900)] truncate text-left">
            {module.title}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {module.done && (
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--color-mint-600)]">
              Done
              <Check className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-[var(--color-ink-400)] transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 space-y-1 border-t border-[var(--color-ink-200)]/40 pt-3">
          {module.lessons.map((lesson) => {
            const href = `/learn/${courseId}/${lesson.id}`;
            return (
              <Link
                key={lesson.id}
                href={href}
                className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-[var(--color-cream-50)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-5 w-5 items-center justify-center">
                    <LessonIcon type={lesson.type} />
                  </span>
                  <span className="text-[13px] capitalize text-[var(--color-ink-700)]">
                    {lesson.type}
                  </span>
                  <span className="text-[13px] text-[var(--color-ink-400)]">·</span>
                  <span className="text-[13px] font-medium text-[var(--color-ink-900)] truncate group-hover:text-[var(--color-forest-900)] transition-colors">
                    {lesson.title}
                  </span>
                </div>
                <span className="text-[12px] text-[var(--color-ink-500)] tabular-nums shrink-0">
                  {lesson.meta}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TabsRow({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-[var(--color-ink-200)]/60">
      {TAB_KEYS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "relative px-4 py-3 text-[14px] font-medium capitalize transition-colors cursor-pointer",
            active === t
              ? "text-[var(--color-forest-900)]"
              : "text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]"
          )}
        >
          {t}
          {active === t && (
            <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[var(--color-mint-500)]" />
          )}
        </button>
      ))}
    </div>
  );
}

export function CourseDetailClient({ course }: Props) {
  const [tab, setTab] = useState<TabKey>("curriculum");

  return (
    <div className="flex min-h-screen bg-[var(--cream-50)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        {/* HEADER STRIP */}
        <div className="mx-auto max-w-6xl px-10 pt-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All courses
          </Link>
        </div>

        {/* HERO */}
        <div className="mx-auto max-w-6xl px-10 pt-4">
          <div className="rounded-2xl bg-[var(--color-forest-900)] text-white p-8 shadow-[0_8px_28px_rgba(10,31,26,0.18)] bg-dots-dark relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-forest-800)]/40 via-transparent to-transparent pointer-events-none" />
            <div className="relative">
              <div className="text-[10px] font-semibold tracking-[0.22em] text-[var(--color-mint-400)] uppercase">
                {course.pathway}
              </div>
              <h1 className="mt-3 text-[34px] md:text-[40px] leading-[1.1] font-semibold tracking-[-0.02em] text-balance">
                {course.title}
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/75">
                {course.subtitle}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-white">{course.rating}</span>
                  <span>({course.ratingCount})</span>
                </span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-white/50" />
                  {course.enrolled.toLocaleString()} enrolled
                </span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>{course.language}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="mx-auto max-w-6xl px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            {/* LEFT: Tabs + content */}
            <div className="min-w-0">
              <TabsRow active={tab} onChange={setTab} />

              {tab === "curriculum" && (
                <div className="mt-6 space-y-3">
                  {course.modules.map((m, i) => (
                    <ModuleCard
                      key={m.id}
                      module={m}
                      courseId={course.id}
                      defaultOpen={i === 0}
                    />
                  ))}
                  <CapstoneCard
                    title={course.capstone.title}
                    tag={course.capstone.tag}
                    href={`/learn/${course.id}/capstone`}
                  />
                  <CommunityLinks courseId={course.id} />
                </div>
              )}

              {tab === "overview" && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6">
                    <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
                      About this course
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink-700)]">
                      {course.subtitle}
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[var(--color-cream-100)] p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
                          Duration
                        </div>
                        <div className="mt-1 text-[18px] font-semibold text-[var(--color-ink-900)]">
                          {course.duration}
                        </div>
                      </div>
                      <div className="rounded-xl bg-[var(--color-cream-100)] p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
                          Level
                        </div>
                        <div className="mt-1 text-[18px] font-semibold text-[var(--color-ink-900)]">
                          {course.level}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === "instructor" && (
                <div className="mt-6 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-[var(--color-tint-tan)] flex items-center justify-center">
                      <span className="text-[18px] font-semibold text-[var(--color-ink-700)]">
                        NT
                      </span>
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold text-[var(--color-ink-900)]">
                        NTDI Faculty
                      </div>
                      <div className="text-[13px] text-[var(--color-ink-500)]">
                        National Talent Development Initiative
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-ink-500)]">
                    Instructors and teaching assistants will be assigned once
                    you enroll. Expect industry practitioners and PhD-level
                    researchers from partner universities.
                  </p>
                </div>
              )}

              {tab === "reviews" && (
                <div className="mt-6 space-y-3">
                  {[
                    { name: "Sara M.", rating: 5, body: "Crystal-clear modules and the practice questions actually made it stick." },
                    { name: "Bilal A.", rating: 5, body: "Loved the field-identification reading. Wish there were more like it." },
                    { name: "Hina K.", rating: 4, body: "Solid foundation. The capstone at the end is the real test." },
                  ].map((r) => (
                    <div
                      key={r.name}
                      className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-[var(--color-tint-purple)] flex items-center justify-center text-[12px] font-semibold text-[var(--color-ink-700)]">
                            {r.name[0]}
                          </div>
                          <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                            {r.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3.5 w-3.5",
                                i < r.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-[var(--color-ink-200)]"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-[14px] text-[var(--color-ink-700)] leading-relaxed">
                        {r.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Sticky purchase card */}
            <aside className="lg:sticky lg:top-8 space-y-3">
              <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6 shadow-[0_2px_8px_rgba(15,40,30,0.04)]">
                <VideoThumb />
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-[14px] font-medium text-[var(--color-ink-500)]">
                    Rs
                  </span>
                  <span className="text-[32px] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)] tabular-nums">
                    {course.price.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 text-[12px] text-[var(--color-ink-500)]">
                  one-time · lifetime access
                </div>
                <button
                  type="button"
                  className="mt-5 w-full inline-flex items-center justify-center rounded-xl bg-[var(--color-mint-500)] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(52,194,119,0.25)] hover:bg-[var(--color-mint-600)] hover:shadow-[0_6px_18px_rgba(52,194,119,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Enroll now
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex items-center justify-center rounded-xl border border-[var(--color-ink-200)] bg-white px-5 py-3 text-[15px] font-medium text-[var(--color-ink-900)] hover:bg-[var(--color-cream-100)] transition-colors cursor-pointer"
                >
                  Preview lesson
                </button>

                <div className="mt-5 pt-5 border-t border-[var(--color-ink-200)]/60 space-y-2.5">
                  {course.includes.map((line) => (
                    <div
                      key={line}
                      className="flex items-center gap-2 text-[13px] text-[var(--color-ink-700)]"
                    >
                      <Check className="h-3.5 w-3.5 text-[var(--color-mint-600)]" />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-tint-green)]">
                  <Sparkles className="h-4 w-4 text-[var(--color-mint-600)]" />
                </div>
                <div className="text-[13px] text-[var(--color-ink-700)]">
                  Not sure? Luna can recommend the right course for you.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
