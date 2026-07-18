"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Award, Check, Clock, GraduationCap, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchProgress } from "./watch-progress";
import { KIND_LABEL, KindIcon, type WatchKind } from "./watch-meta";

/* The course-content rail is rendered by the [courseId] layout so it persists
   across lesson navigations — only the lesson content (left column) suspends.
   The active row comes from useParams, so the highlight moves instantly. */

export type RailItem = {
  itemID: number;
  title: string;
  kind: WatchKind;
  meta: string;
};

export type RailModule = {
  moduleID: number;
  title: string;
  items: RailItem[];
};

export type RailTopic = {
  topicID: number;
  title: string;
  modules: RailModule[];
};

/** Course capstone shown at the bottom of the rail; status is the viewer's. */
export type RailCapstone = {
  title: string;
  status: "NONE" | "PENDING" | "PASSED" | "FAILED";
};

const CAPSTONE_CHIP: Record<
  RailCapstone["status"],
  {
    label: string;
    className: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }> | null;
  }
> = {
  NONE: { label: "Project", className: "bg-[#c2871e]/15 text-[#8a5f25]", icon: null },
  PENDING: { label: "In review", className: "bg-[#c2871e]/15 text-[#8a5f25]", icon: Clock },
  PASSED: { label: "Passed", className: "bg-[#16a34a]/12 text-[#16a34a]", icon: Check },
  FAILED: { label: "Feedback ready", className: "bg-red-500/10 text-red-600", icon: X },
};

function CapstoneRailRow({
  courseID,
  capstone,
}: {
  courseID: number;
  capstone: RailCapstone;
}) {
  const chip = CAPSTONE_CHIP[capstone.status];
  const ChipIcon = chip.icon;
  return (
    <div className="border-t border-[var(--color-ink-200)]/60 p-3.5 pt-3">
      <Link
        href={`/learn/${courseID}/capstone`}
        className="group flex items-center gap-2.5 rounded-lg bg-[#c2871e]/[0.07] py-2.5 pl-3 pr-2.5 transition-colors hover:bg-[#c2871e]/[0.14]"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#c2871e] text-white">
          <GraduationCap className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a5f25]">
            Capstone project
          </span>
          <span className="block truncate text-[12.5px] font-medium leading-snug text-[var(--color-ink-800)]">
            {capstone.title}
          </span>
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
            chip.className
          )}
        >
          {ChipIcon ? <ChipIcon className="h-3 w-3" strokeWidth={3} /> : null}
          {chip.label}
        </span>
      </Link>
    </div>
  );
}

function RailItemRow({
  courseID,
  item,
  index,
  isCurrent,
  isDone,
}: {
  courseID: number;
  item: RailItem;
  index: number;
  isCurrent: boolean;
  isDone: boolean;
}) {
  return (
    <Link
      href={`/learn/${courseID}/${item.itemID}`}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg py-2 pl-3.5 pr-2.5 transition-colors",
        isCurrent
          ? "bg-[var(--color-forest-900)] shadow-[0_2px_10px_rgba(6,29,21,0.25)]"
          : "hover:bg-[var(--color-cream-100)]"
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums transition-colors",
          isDone
            ? "bg-[#16a34a] text-white"
            : isCurrent
            ? "bg-white/15 text-white ring-1 ring-white/30"
            : "bg-[var(--color-ink-100)] text-[var(--color-ink-500)] group-hover:bg-[var(--color-ink-200)]"
        )}
      >
        {isDone ? <Check className="h-3 w-3" strokeWidth={3.5} /> : index}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-[12.5px] leading-snug",
            isCurrent
              ? "font-semibold text-white"
              : isDone
              ? "text-[var(--color-ink-500)]"
              : "text-[var(--color-ink-700)]"
          )}
        >
          {item.title}
        </span>
        <span
          className={cn(
            "flex items-center gap-1 text-[10.5px]",
            isCurrent ? "text-white/60" : "text-[var(--color-ink-400)]"
          )}
        >
          <KindIcon
            kind={item.kind}
            className={cn("h-3 w-3", isCurrent && "text-white/60")}
          />
          {KIND_LABEL[item.kind]} · {item.meta}
        </span>
      </span>
      {isCurrent ? (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#16a34a] shadow-[0_0_8px_#16a34a]" />
      ) : null}
    </Link>
  );
}

function CourseRail({
  courseID,
  topics,
  capstone,
  currentItemID,
}: {
  courseID: number;
  topics: RailTopic[];
  capstone: RailCapstone | null;
  currentItemID: number;
}) {
  const { done } = useWatchProgress();
  const flat = topics.flatMap((t) => t.modules.flatMap((m) => m.items));
  const totalItems = flat.length;
  const pct = totalItems === 0 ? 0 : Math.round((done.size / totalItems) * 100);
  const courseComplete = totalItems > 0 && done.size === totalItems;

  return (
    <aside className="space-y-3 lg:sticky lg:top-[4.5rem]">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-ink-200)]/60 bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
        {/* Rail header with progress */}
        <div className="bg-[var(--color-forest-900)] px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[13px] font-semibold">Course content</div>
            <span className="text-[11.5px] font-medium tabular-nums text-white/70">
              {done.size}/{totalItems} done
            </span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#16a34a] transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="max-h-[calc(100vh-16rem)] space-y-6 overflow-y-auto p-3.5">
          {topics.map((topic) => {
            const topicItems = topic.modules.flatMap((m) => m.items);
            const topicDone = topicItems.filter((i) => done.has(i.itemID)).length;
            return (
              <div key={topic.topicID}>
                <div className="flex items-center justify-between gap-2 px-2 pb-2">
                  <span className="text-[11.5px] font-bold text-[var(--color-ink-900)]">
                    {topic.title}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold tabular-nums",
                      topicDone === topicItems.length && topicItems.length > 0
                        ? "text-[#16a34a]"
                        : "text-[var(--color-ink-400)]"
                    )}
                  >
                    {topicDone}/{topicItems.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {topic.modules.map((mod) => {
                    const modDone = mod.items.filter((i) => done.has(i.itemID)).length;
                    return (
                      <div key={mod.moduleID}>
                        <div className="flex items-center justify-between gap-2 px-2 pb-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-500)]">
                            {mod.title}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-bold tabular-nums",
                              modDone === mod.items.length && mod.items.length > 0
                                ? "text-[#16a34a]"
                                : "text-[var(--color-ink-400)]"
                            )}
                          >
                            {modDone}/{mod.items.length}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {mod.items.map((i) => (
                            <RailItemRow
                              key={i.itemID}
                              courseID={courseID}
                              item={i}
                              index={flat.findIndex((f) => f.itemID === i.itemID) + 1}
                              isCurrent={i.itemID === currentItemID}
                              isDone={done.has(i.itemID)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {capstone ? (
          <CapstoneRailRow courseID={courseID} capstone={capstone} />
        ) : null}
      </div>

      {/* Certificate teaser — ore amber */}
      {courseComplete ? (
        <Link
          href={`/certificate/${courseID}`}
          className="flex items-center gap-3.5 rounded-2xl border border-[#c2871e]/50 bg-gradient-to-br from-[#c2871e]/15 to-[#c2871e]/5 p-4 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c2871e] text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-[12.5px] font-bold text-[#8a5f25]">
              Certificate unlocked!
            </div>
            <p className="text-[11.5px] leading-snug text-[var(--color-ink-500)]">
              View and download your certificate.
            </p>
          </div>
        </Link>
      ) : (
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#c2871e]/25 bg-[#c2871e]/[0.06] p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c2871e]/15 text-[#c2871e]">
            <Award className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-[12.5px] font-bold text-[#8a5f25]">
              Course certificate
            </div>
            <p className="text-[11.5px] leading-snug text-[var(--color-ink-500)]">
              Complete all {totalItems} lessons to earn your certificate.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

/* Wraps lesson pages in the two-column grid with the persistent rail.
   Non-lesson children under [courseId] (e.g. capstone) render untouched. */
export function WatchLessonFrame({
  courseID,
  topics,
  capstone,
  children,
}: {
  courseID: number;
  topics: RailTopic[];
  capstone: RailCapstone | null;
  children: React.ReactNode;
}) {
  const params = useParams<{ lessonId?: string }>();
  const lessonId = params?.lessonId;
  if (!lessonId || !/^\d+$/.test(String(lessonId))) return <>{children}</>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_330px]">
        <div className="min-w-0">{children}</div>
        <CourseRail
          courseID={courseID}
          topics={topics}
          capstone={capstone}
          currentItemID={Number(lessonId)}
        />
      </div>
    </div>
  );
}
