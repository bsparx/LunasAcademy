"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Play,
  BookOpen,
  PencilLine,
  Trophy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Highlighter,
  Download,
  MessageCircle,
  Star,
  Users,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonPlayer } from "./lesson-player";
import { PracticeRunner } from "./practice-runner";
import { MasteryCheck } from "./mastery-check";
import type { CourseDetail } from "@/app/(dashboard)/learn/_data/demo-course-detail";
import {
  getKnowledgeCheck,
  getPracticeLesson,
  getMasteryCheck,
  getCapstone,
  type PracticeLesson as PracticeLessonData,
  type MasteryCheck as MasteryCheckData,
} from "@/app/(dashboard)/learn/_data/learning-content";

type Props = {
  course: CourseDetail;
  lesson: CourseDetail["modules"][number]["lessons"][number];
  module: CourseDetail["modules"][number];
  completedLessonIds: Set<string>;
  nextLesson: {
    id: string;
    module: CourseDetail["modules"][number];
  } | null;
  prevLesson: {
    id: string;
    module: CourseDetail["modules"][number];
  } | null;
};

type TabKey = "notes" | "resources" | "qa" | "ask";

function LessonRowIcon({
  type,
}: {
  type: CourseDetail["modules"][number]["lessons"][number]["type"];
}) {
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

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TranscriptLine({
  time,
  text,
  active,
  onSeek,
}: {
  time: number;
  text: string;
  active: boolean;
  onSeek: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSeek}
      className={cn(
        "group flex w-full gap-4 rounded-lg px-3 py-2.5 text-left transition-colors text-left",
        active ? "bg-[var(--color-tint-green)]/50" : "hover:bg-[var(--color-cream-50)]"
      )}
    >
      <span
        className={cn(
          "shrink-0 font-mono text-[12px] tabular-nums mt-0.5",
          active ? "text-[var(--color-mint-600)] font-semibold" : "text-[var(--color-ink-400)]"
        )}
      >
        {formatTime(time)}
      </span>
      <span
        className={cn(
          "flex-1 text-[14px] leading-relaxed",
          active ? "text-[var(--color-ink-900)]" : "text-[var(--color-ink-700)]"
        )}
      >
        {text}
      </span>
      <Highlighter
        className={cn(
          "h-4 w-4 mt-0.5 opacity-0 transition-opacity",
          "group-hover:opacity-100",
          active && "opacity-100 text-[var(--color-mint-600)]"
        )}
      />
    </button>
  );
}

function RightRailLessonRow({
  courseId,
  lesson,
  isCurrent,
  isDone,
}: {
  courseId: string;
  lesson: CourseDetail["modules"][number]["lessons"][number];
  isCurrent: boolean;
  isDone: boolean;
}) {
  return (
    <Link
      href={`/learn/${courseId}/${lesson.id}`}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
        isCurrent
          ? "bg-[var(--color-tint-green)]/40 ring-1 ring-[var(--color-mint-500)]/30"
          : "hover:bg-[var(--color-cream-100)]"
      )}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {isDone ? (
          <Check className="h-3.5 w-3.5 text-[var(--color-mint-600)]" strokeWidth={3} />
        ) : (
          <LessonRowIcon type={lesson.type} />
        )}
      </span>
      <span
        className={cn(
          "flex-1 text-[12px] leading-snug truncate",
          isDone
            ? "text-[var(--color-ink-500)] line-through"
            : isCurrent
            ? "text-[var(--color-ink-900)] font-semibold"
            : "text-[var(--color-ink-700)]"
        )}
      >
        {lesson.title}
      </span>
      <span className="text-[10px] tabular-nums text-[var(--color-ink-400)] shrink-0">
        {lesson.meta}
      </span>
    </Link>
  );
}

export function LessonShell({
  course,
  lesson,
  module,
  completedLessonIds,
  nextLesson,
  prevLesson,
}: Props) {
  const [tab, setTab] = useState<TabKey>("notes");
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const knowledgeCheck = getKnowledgeCheck(lesson.id);
  const checkLabel = knowledgeCheck
    ? `Knowledge check at ${knowledgeCheck.triggerLabel}`
    : null;
  const practiceData: PracticeLessonData | undefined =
    lesson.type === "practice" ? getPracticeLesson(lesson.id) : undefined;
  const masteryData: MasteryCheckData | undefined =
    lesson.type === "mastery" ? getMasteryCheck(lesson.id) : undefined;
  const capstoneData = getCapstone(course.id);

  return (
    <>
      {/* TOP BAR */}
      <div className="sticky top-0 z-30 border-b border-[var(--color-ink-200)]/60 bg-[var(--cream-50)]/85 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-10 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/courses"
              aria-label="Back to courses"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-ink-500)] hover:bg-[var(--color-cream-100)] hover:text-[var(--color-ink-900)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold tracking-[0.2em] text-[var(--color-mint-600)] uppercase">
                {course.pathway}
              </div>
              <div className="text-[14px] font-semibold text-[var(--color-ink-900)] truncate">
                {course.title}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[12px] text-[var(--color-ink-500)]">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-[var(--color-ink-700)]">{course.rating}</span>
              <span>({course.ratingCount})</span>
            </span>
            <span className="h-1 w-1 rounded-full bg-[var(--color-ink-300)]" />
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[var(--color-ink-400)]" />
              {course.enrolled.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* LEFT: Player + tabs */}
          <div className="min-w-0 space-y-6">
            {/* Course title above player */}
            <div>
              <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
                {module.title}
              </div>
              <h1 className="mt-2 text-[28px] md:text-[32px] leading-[1.15] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)] text-balance">
                {lesson.title}
              </h1>
            </div>

            {lesson.type === "video" && (
              <>
                <LessonPlayer
                  lessonId={lesson.id}
                  hlsPublicId={lesson.hlsPublicId}
                  posterPublicId={lesson.posterPublicId}
                  knowledgeCheck={knowledgeCheck}
                />

                {/* Knowledge check badge — matches design */}
                {checkLabel && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-tint-tan)]/50 border border-[var(--color-tint-tan)] px-3.5 py-1.5 text-[12px] text-[var(--color-ink-700)]">
                    <span className="text-[14px]">⚡</span>
                    <span className="font-semibold">{checkLabel}</span>
                  </div>
                )}
              </>
            )}

            {lesson.type === "reading" && (
              <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-8 shadow-[0_2px_8px_rgba(15,40,30,0.04)]">
                <div className="flex items-center gap-3 text-[var(--color-ink-500)]">
                  <BookOpen className="h-5 w-5" />
                  <div className="text-[13px] font-medium">
                    {lesson.meta} read
                  </div>
                </div>
                <div className="prose prose-sm mt-5 max-w-none text-[15px] leading-relaxed text-[var(--color-ink-700)]">
                  <p>
                    This reading lesson is part of <strong className="text-[var(--color-ink-900)]">{module.title}</strong>.
                    Detailed reading material will be added in the next pass.
                  </p>
                  <p className="mt-3 text-[14px] text-[var(--color-ink-500)]">
                    For now, head to the next lesson when you&apos;re ready.
                  </p>
                </div>
              </div>
            )}

            {lesson.type === "practice" && practiceData && (
              <PracticeRunner data={practiceData} />
            )}

            {lesson.type === "mastery" && masteryData && (
              <MasteryCheck data={masteryData} />
            )}

            {/* Lesson nav: prev / next */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {prevLesson ? (
                <Link
                  href={`/learn/${course.id}/${prevLesson.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-ink-200)] bg-white px-3.5 py-2 text-[13px] font-medium text-[var(--color-ink-700)] hover:bg-[var(--color-cream-100)] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </Link>
              ) : (
                <span />
              )}
              {nextLesson ? (
                <Link
                  href={`/learn/${course.id}/${nextLesson.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-forest-900)] px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-[var(--color-forest-800)] transition-colors"
                >
                  Next lesson
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : capstoneData ? (
                <Link
                  href={`/learn/${course.id}/capstone`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-mint-500)] px-4 py-2 text-[13px] font-semibold text-[var(--color-forest-950)] shadow-sm hover:bg-[var(--color-mint-600)] transition-colors"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Start capstone
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-mint-500)] px-4 py-2 text-[13px] font-semibold text-[var(--color-forest-950)]">
                  Course complete
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              )}
            </div>

            {lesson.type === "video" && (
              <>
                {/* TABS */}
                <div className="border-b border-[var(--color-ink-200)]/60">
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: "notes", label: "Notes & transcript" },
                        { id: "resources", label: "Resources" },
                        { id: "qa", label: "Q&A (24)" },
                        { id: "ask", label: "Ask Luna" },
                      ] as { id: TabKey; label: string }[]
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={cn(
                          "relative px-4 py-3 text-[13px] font-medium transition-colors cursor-pointer",
                          tab === t.id
                            ? "text-[var(--color-forest-900)]"
                            : "text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]"
                        )}
                      >
                        {t.label}
                        {tab === t.id && (
                          <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[var(--color-mint-500)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {tab === "notes" && (
                  <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6">
                    <div className="text-[11px] font-semibold tracking-[0.2em] text-[var(--color-mint-600)] uppercase">
                      Bilingual auto-transcript
                    </div>
                    <p className="mt-2 text-[13px] text-[var(--color-ink-500)]">
                      EN · اردو. Click a timestamp to seek. Highlight to save a
                      note.
                    </p>
                    <div className="mt-4 space-y-1">
                      {lesson.transcript && lesson.transcript.length > 0 ? (
                        (showFullTranscript
                          ? lesson.transcript
                          : lesson.transcript.slice(0, 3)
                        ).map((line, i) => (
                          <TranscriptLine
                            key={i}
                            time={line.time}
                            text={line.text}
                            active={activeLine === i}
                            onSeek={() => setActiveLine(i)}
                          />
                        ))
                      ) : (
                        <div className="rounded-lg bg-[var(--color-cream-50)] p-6 text-center text-[13px] text-[var(--color-ink-500)]">
                          Transcript not available for this lesson yet.
                        </div>
                      )}
                      {lesson.transcript && lesson.transcript.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setShowFullTranscript((p) => !p)}
                          className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-mint-600)] hover:text-[var(--color-mint-500)] transition-colors cursor-pointer"
                        >
                          {showFullTranscript ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5" />
                              Show full transcript ({lesson.transcript.length} lines)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {tab === "resources" && (
                  <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6">
                    <div className="text-[13px] text-[var(--color-ink-500)]">
                      Slide decks, code notebooks, and datasets will appear
                      here.
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {["Slides (PDF)", "Field notebook (PDF)", "Sample dataset", "Reference list"].map(
                        (label) => (
                          <div
                            key={label}
                            className="flex items-center justify-between rounded-xl border border-[var(--color-ink-200)]/60 bg-[var(--color-cream-50)] px-4 py-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white ring-1 ring-[var(--color-ink-200)]">
                                <Download className="h-4 w-4 text-[var(--color-ink-500)]" />
                              </div>
                              <div className="text-[13px] font-medium text-[var(--color-ink-900)] truncate">
                                {label}
                              </div>
                            </div>
                            <span className="text-[11px] text-[var(--color-ink-400)]">soon</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {tab === "qa" && (
                  <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                        24 questions
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-forest-900)] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[var(--color-forest-800)] cursor-pointer"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Ask a question
                      </button>
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        { who: "Sara M.", when: "2d ago", body: "At 6:20, why is olivine unstable at the surface?" },
                        { who: "Bilal A.", when: "1w ago", body: "Could you recommend extra reading on the Bowen reaction series?" },
                      ].map((q) => (
                        <div
                          key={q.who}
                          className="rounded-xl border border-[var(--color-ink-200)]/60 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-[13px] font-semibold text-[var(--color-ink-900)]">
                              {q.who}
                            </div>
                            <div className="text-[11px] text-[var(--color-ink-400)]">{q.when}</div>
                          </div>
                          <p className="mt-1.5 text-[13px] text-[var(--color-ink-700)] leading-relaxed">
                            {q.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "ask" && (
                  <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-gradient-to-br from-[var(--color-tint-green)]/30 to-white p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-[var(--color-ink-200)]">
                        <Sparkles className="h-5 w-5 text-[var(--color-mint-600)]" />
                      </div>
                      <div>
                        <div className="text-[15px] font-semibold text-[var(--color-ink-900)]">
                          Ask Luna
                        </div>
                        <div className="text-[12px] text-[var(--color-ink-500)]">
                          Stuck on a topic? I&apos;ll explain in EN or اردو.
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your question…"
                        className="flex-1 rounded-lg border border-[var(--color-ink-200)] bg-white px-3.5 py-2 text-[14px] focus:border-[var(--color-forest-900)] focus:outline-none focus:ring-3 focus:ring-[var(--color-forest-900)]/15"
                      />
                      <button
                        type="button"
                        className="rounded-lg bg-[var(--color-forest-900)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-forest-800)] cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT RAIL — module/lesson list */}
          <aside className="lg:sticky lg:top-20 space-y-3">
            <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <div className="px-2 pb-2 text-[10px] font-semibold tracking-[0.22em] text-[var(--color-ink-500)] uppercase">
                {module.title}
              </div>
              <div className="space-y-0.5">
                {module.lessons.map((l) => (
                  <RightRailLessonRow
                    key={l.id}
                    courseId={course.id}
                    lesson={l}
                    isCurrent={l.id === lesson.id}
                    isDone={completedLessonIds.has(l.id)}
                  />
                ))}
              </div>

              {/* Other modules — collapsed list */}
              {course.modules.length > 1 && (
                <div className="mt-5 pt-4 border-t border-[var(--color-ink-200)]/60 space-y-4">
                  {course.modules
                    .filter((m) => m.id !== module.id)
                    .map((m) => (
                      <div key={m.id}>
                        <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.18em] text-[var(--color-ink-500)] uppercase">
                          {m.title}
                        </div>
                        <div className="space-y-0.5">
                          {m.lessons.map((l) => (
                            <RightRailLessonRow
                              key={l.id}
                              courseId={course.id}
                              lesson={l}
                              isCurrent={false}
                              isDone={completedLessonIds.has(l.id)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
