"use client";

import { useMemo, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  Paperclip,
  ExternalLink,
  Loader2,
  CircleCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  KIND_LABEL,
  KindIcon,
  formatDuration,
  type WatchKind,
} from "../../_components/watch-meta";
import { formatBytes } from "@/lib/cloudinary-upload";
import { MarkdownViewer } from "@/app/(dashboard)/_components/markdown-viewer";
import { markItemDone } from "@/app/(dashboard)/learn/actions";
import { useWatchProgress } from "../../_components/watch-progress";
import { WatchVideoPlayer } from "./watch-video-player";
import { ExamRunner } from "./exam-runner";
import { LectureDiscussion, type LectureComment } from "./lecture-discussion";

/* Brand accents for the watch experience:
   success/progress = #16a34a, ore amber (XP, certificate) = #c2871e. */
const XP_PER_LESSON = 50;

export type WatchCheck = {
  checkID: number;
  timeSec: number;
  question: string;
  options: string[];
  correctIndices: number[];
  /** Already answered correctly by this student, on a previous visit. */
  done: boolean;
};

export type WatchResource = {
  kind: "VIDEO" | "LECTURE" | "FILE";
  title: string;
  url: string;
  publicID: string;
  format: string | null;
  bytes: number | null;
  duration: number | null;
  checks: WatchCheck[];
};

// No correctIndex here — answers are graded server-side by submitExam.
export type WatchQuestion = {
  questionID: number;
  question: string;
  options: string[];
  imageURL: string | null;
};

export type WatchExam = {
  examID: number;
  questions: WatchQuestion[];
};

export type WatchItem = {
  itemID: number;
  title: string;
  resource: WatchResource | null; // null → exam item
  exam: WatchExam | null;
};

export type WatchModule = {
  moduleID: number;
  title: string;
  items: WatchItem[];
};

export type WatchTopic = {
  topicID: number;
  title: string;
  modules: WatchModule[];
};

type Props = {
  course: { courseID: number; title: string; pathway: string | null };
  topics: WatchTopic[];
  moduleTitle: string;
  item: WatchItem;
  prevItemID: number | null;
  nextItemID: number | null;
  lectureComments: LectureComment[];
  teacherID: number;
  currentUserID: number;
};

function watchKind(item: WatchItem): WatchKind {
  return item.resource ? item.resource.kind : "EXAM";
}

function itemMeta(item: WatchItem) {
  if (!item.resource) {
    const n = item.exam?.questions.length ?? 0;
    return `${n} Q${n === 1 ? "" : "s"}`;
  }
  if (item.resource.kind === "VIDEO" && item.resource.duration)
    return formatDuration(item.resource.duration);
  if (item.resource.kind === "LECTURE") return "read";
  return item.resource.format?.toUpperCase() ?? "file";
}

/* --------------------------------- shell ---------------------------------- */

export function CourseLessonShell({
  course,
  topics,
  moduleTitle,
  item,
  prevItemID,
  nextItemID,
  lectureComments,
  teacherID,
  currentUserID,
}: Props) {
  // Shared with the persistent top bar rendered by the [courseId] layout.
  const { done, markDone } = useWatchProgress();
  const [pending, startTransition] = useTransition();
  const isDone = done.has(item.itemID);

  const flat = useMemo(
    () => topics.flatMap((t) => t.modules.flatMap((m) => m.items)),
    [topics]
  );
  const totalItems = flat.length;
  const position = flat.findIndex((i) => i.itemID === item.itemID) + 1;
  const nextItem = nextItemID
    ? flat.find((i) => i.itemID === nextItemID) ?? null
    : null;
  const kind = watchKind(item);

  function complete() {
    if (done.has(item.itemID)) return;
    startTransition(async () => {
      const res = await markItemDone(item.itemID);
      if (res.ok) {
        markDone(item.itemID);
      }
    });
  }

  // Container, grid, and the course-content rail are rendered by the
  // [courseId] layout (WatchLessonFrame) so they persist across lessons.
  return (
    <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-forest-900)] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white">
                  {moduleTitle}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink-200)]/70 bg-white px-3 py-1 text-[11px] font-medium text-[var(--color-ink-500)]">
                  <KindIcon kind={kind} className="h-3.5 w-3.5" />
                  {KIND_LABEL[kind]}
                </span>
                <span className="rounded-full border border-[var(--color-ink-200)]/70 bg-white px-3 py-1 text-[11px] font-medium tabular-nums text-[var(--color-ink-500)]">
                  Lesson {position} of {totalItems}
                </span>
                {isDone ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#16a34a]/10 px-3 py-1 text-[11px] font-semibold text-[#16a34a]">
                    <CircleCheck className="h-3.5 w-3.5" />
                    Completed
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 text-balance text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--color-ink-900)] md:text-[34px]">
                {item.title}
              </h1>
            </div>

            {item.resource?.kind === "VIDEO" && (
              <WatchVideoPlayer
                key={item.itemID}
                resource={item.resource}
                isDone={isDone}
                onComplete={complete}
              />
            )}

            {item.resource?.kind === "LECTURE" && (
              <MarkdownViewer
                url={item.resource.url}
                className="max-h-none bg-white p-8"
              />
            )}

            {item.exam && (
              <ExamRunner
                key={item.itemID}
                itemID={item.itemID}
                exam={item.exam}
                isDone={isDone}
                onPassed={() =>
                  // submitExam already recorded the pass server-side.
                  markDone(item.itemID)
                }
              />
            )}

            {item.resource?.kind === "FILE" && (
              <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white px-6 py-10 text-center shadow-[0_2px_8px_rgba(15,40,30,0.04)]">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-tint-tan)]">
                  <Paperclip className="h-5 w-5 text-[#8a5f25]" />
                </span>
                <div className="mt-3 text-[14px] font-semibold text-[var(--color-ink-900)]">
                  {item.resource.format?.toUpperCase() ?? "FILE"}
                  {item.resource.bytes
                    ? ` · ${formatBytes(item.resource.bytes)}`
                    : ""}
                </div>
                <a
                  href={item.resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-forest-900)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-forest-800)]"
                >
                  Open file
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {/* Completion + prev/next */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-ink-200)]/50 pt-5">
              <div className="flex items-center gap-3">
                {prevItemID !== null ? (
                  <Link
                    href={`/learn/${course.courseID}/${prevItemID}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-ink-200)] bg-white px-3.5 py-2 text-[13px] font-medium text-[var(--color-ink-700)] transition-colors hover:bg-[var(--color-cream-100)]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Previous
                  </Link>
                ) : null}
                {isDone ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#16a34a]/10 px-3.5 py-2 text-[13px] font-semibold text-[#16a34a]">
                    <CircleCheck className="h-4 w-4" />
                    Completed · +{XP_PER_LESSON} XP
                  </span>
                ) : item.exam ? null : (
                  <button
                    type="button"
                    onClick={complete}
                    disabled={pending}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#16a34a] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_10px_rgba(22,163,74,0.35)] transition-colors hover:bg-[#15803d] disabled:opacity-60"
                  >
                    {pending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    )}
                    Mark as complete
                  </button>
                )}
              </div>
              {nextItemID !== null ? (
                <Link
                  href={`/learn/${course.courseID}/${nextItemID}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-forest-900)] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-forest-800)]"
                >
                  Next lesson
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#c2871e] px-4 py-2 text-[13px] font-semibold text-white">
                  <Award className="h-4 w-4" />
                  Final lesson
                </span>
              )}
            </div>

            {/* Up next */}
            {nextItem ? (
              <Link
                href={`/learn/${course.courseID}/${nextItem.itemID}`}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-4 shadow-[0_1px_2px_rgba(15,40,30,0.03)] transition-all hover:border-[var(--color-forest-700)]/40 hover:shadow-[0_6px_20px_rgba(6,29,21,0.08)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-forest-900)] text-white transition-transform group-hover:scale-105">
                  <KindIcon
                    kind={watchKind(nextItem)}
                    className="h-5 w-5 text-white"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-400)]">
                    Up next
                  </span>
                  <span className="block truncate text-[14.5px] font-semibold text-[var(--color-ink-900)]">
                    {nextItem.title}
                  </span>
                  <span className="block text-[11.5px] text-[var(--color-ink-500)]">
                    {KIND_LABEL[watchKind(nextItem)]} · {itemMeta(nextItem)}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-ink-300)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--color-forest-900)]" />
              </Link>
            ) : null}

            {/* Lecture discussion */}
            <LectureDiscussion
              courseID={course.courseID}
              itemID={item.itemID}
              comments={lectureComments}
              teacherID={teacherID}
              currentUserID={currentUserID}
            />
    </div>
  );
}

