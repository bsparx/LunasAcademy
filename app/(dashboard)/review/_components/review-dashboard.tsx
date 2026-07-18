"use client";

import { useMemo, useState } from "react";
import { Flame, Sparkles, Calendar, RotateCcw, Play, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysUntilDue, statusOf, type CardStatus } from "./sm2";
import type { ReviewRating, StatefulCard } from "./types";

type Props = {
  cards: StatefulCard[];
  sessionStats: { cardId: string; rating: ReviewRating; quality: number; reviewedAt: string }[];
  onStart: (queue: StatefulCard[]) => void;
  onReset: () => void;
};

const COURSE_FILTER_ALL = "__all__";

export function ReviewDashboard({ cards, sessionStats, onStart, onReset }: Props) {
  const [courseFilter, setCourseFilter] = useState<string>(COURSE_FILTER_ALL);

  const grouped = useMemo(() => {
    const now = new Date();
    const filtered =
      courseFilter === COURSE_FILTER_ALL
        ? cards
        : cards.filter((c) => c.courseId === courseFilter);

    const newCards = filtered.filter((c) => statusOf(c.state, now) === "new");
    const dueCards = filtered.filter((c) => statusOf(c.state, now) === "due");
    const scheduled = filtered
      .filter((c) => statusOf(c.state, now) === "scheduled")
      .sort((a, b) => new Date(a.state.due).getTime() - new Date(b.state.due).getTime());

    return { newCards, dueCards, scheduled, filtered, all: cards };
  }, [cards, courseFilter]);

  const dueCount = grouped.newCards.length + grouped.dueCards.length;
  const totalCards = grouped.filtered.length;
  const reviewedToday = countReviewedToday(sessionStats);
  const retention = computeRetention(sessionStats);

  const courses = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of cards) {
      if (!seen.has(c.courseId)) seen.set(c.courseId, c.courseTitle);
    }
    return Array.from(seen, ([id, title]) => ({ id, title }));
  }, [cards]);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
            Spaced repetition · SuperMemo-2
          </div>
          <h1 className="mt-2 text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
            Review
          </h1>
          <p className="mt-2 text-[14px] text-[var(--color-ink-500)]">
            Each rating reschedules the card with the SM-2 algorithm. Hard cards come
            back tomorrow, easy cards stretch out.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-ink-200)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset all progress
        </button>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Due now"
          value={dueCount}
          tone={dueCount > 0 ? "green" : "default"}
          hint={dueCount > 0 ? "Ready to review" : "All caught up"}
        />
        <StatTile
          label="Reviewed today"
          value={reviewedToday}
          tone="default"
          hint="This session"
        />
        <StatTile
          label="Retention"
          value={retention == null ? "—" : `${Math.round(retention * 100)}%`}
          tone={retention != null && retention >= 0.8 ? "green" : "default"}
          hint="Hard + OK / total"
        />
        <StatTile
          label="Total cards"
          value={totalCards}
          tone="default"
          hint={courseFilter === COURSE_FILTER_ALL ? "All courses" : "Filtered"}
        />
      </div>

      {/* START CTA */}
      <div
        className={cn(
          "rounded-2xl border p-6 shadow-[0_2px_8px_rgba(15,40,30,0.04)]",
          dueCount > 0
            ? "border-[var(--color-mint-500)]/30 bg-gradient-to-br from-[var(--color-tint-green)]/40 to-white"
            : "border-[var(--color-ink-200)]/60 bg-white"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                dueCount > 0
                  ? "bg-[var(--color-mint-500)] text-white"
                  : "bg-[var(--color-cream-100)] text-[var(--color-ink-500)]"
              )}
            >
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[16px] font-semibold text-[var(--color-ink-900)]">
                {dueCount > 0
                  ? `${dueCount} card${dueCount === 1 ? "" : "s"} ready`
                  : "Nothing due — nice work."}
              </div>
              <div className="text-[13px] text-[var(--color-ink-500)]">
                {dueCount > 0
                  ? "Tap Start to begin. You'll see each card once per session."
                  : "Come back later, or reset progress to start over."}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStart([...grouped.newCards, ...grouped.dueCards])}
            disabled={dueCount === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(10,31,26,0.18)] hover:bg-[var(--color-forest-800)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            Start review
          </button>
        </div>
      </div>

      {/* COURSE FILTER */}
      {courses.length > 1 && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--color-ink-400)]" />
          <span className="text-[12px] font-medium text-[var(--color-ink-500)]">Filter:</span>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={courseFilter === COURSE_FILTER_ALL}
              onClick={() => setCourseFilter(COURSE_FILTER_ALL)}
            >
              All courses
            </FilterChip>
            {courses.map((c) => (
              <FilterChip
                key={c.id}
                active={courseFilter === c.id}
                onClick={() => setCourseFilter(c.id)}
              >
                {c.title}
              </FilterChip>
            ))}
          </div>
        </div>
      )}

      {/* CARD LISTS */}
      <div className="space-y-8">
        <CardSection
          title="New"
          subtitle="Never reviewed. Will count toward today's session."
          icon={<Sparkles className="h-4 w-4 text-[var(--color-mint-600)]" />}
          cards={grouped.newCards}
          status="new"
        />
        <CardSection
          title="Due today"
          subtitle="Scheduled before today and overdue."
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          cards={grouped.dueCards}
          status="due"
        />
        <CardSection
          title="Scheduled"
          subtitle="Next review date in the future."
          icon={<Calendar className="h-4 w-4 text-[var(--color-ink-400)]" />}
          cards={grouped.scheduled}
          status="scheduled"
        />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number | string;
  hint: string;
  tone: "default" | "green";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-[0_2px_8px_rgba(15,40,30,0.04)]",
        tone === "green" ? "border-[var(--color-mint-500)]/30" : "border-[var(--color-ink-200)]/60"
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 text-[28px] font-semibold tracking-[-0.02em] tabular-nums leading-none",
          tone === "green" ? "text-[var(--color-mint-600)]" : "text-[var(--color-ink-900)]"
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[12px] text-[var(--color-ink-500)]">{hint}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium transition-colors cursor-pointer",
        active
          ? "bg-[var(--color-forest-900)] text-white"
          : "border border-[var(--color-ink-200)] bg-white text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)]"
      )}
    >
      {children}
    </button>
  );
}

function CardSection({
  title,
  subtitle,
  icon,
  cards,
  status,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  cards: StatefulCard[];
  status: CardStatus;
}) {
  if (cards.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-[15px] font-semibold text-[var(--color-ink-900)]">{title}</h2>
          <span className="text-[12px] text-[var(--color-ink-400)]">0</span>
        </div>
        <p className="mt-1 text-[12px] text-[var(--color-ink-500)]">{subtitle}</p>
        <div className="mt-3 rounded-xl border border-dashed border-[var(--color-ink-200)] bg-white px-5 py-6 text-center text-[13px] text-[var(--color-ink-400)]">
          Nothing here.
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-[15px] font-semibold text-[var(--color-ink-900)]">{title}</h2>
          <span className="text-[12px] text-[var(--color-ink-400)] tabular-nums">{cards.length}</span>
        </div>
        <p className="text-[12px] text-[var(--color-ink-500)]">{subtitle}</p>
      </div>
      <ul className="mt-3 divide-y divide-[var(--color-ink-200)]/60 overflow-hidden rounded-2xl border border-[var(--color-ink-200)]/60 bg-white shadow-[0_2px_8px_rgba(15,40,30,0.04)]">
        {cards.map((c) => (
          <CardRow key={c.id} card={c} status={status} />
        ))}
      </ul>
    </section>
  );
}

function CardRow({ card, status }: { card: StatefulCard; status: CardStatus }) {
  const { state } = card;
  const days = daysUntilDue(state);
  const dueLabel = formatDue(days, status);
  const easeLabel = state.easeFactor.toFixed(2);

  return (
    <li className="flex items-center gap-4 px-5 py-3.5">
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          status === "new" && "bg-[var(--color-tint-green)] text-[var(--color-mint-600)]",
          status === "due" && "bg-[var(--color-tint-tan)] text-[#8a5f25]",
          status === "scheduled" && "bg-[var(--color-cream-100)] text-[var(--color-ink-500)]"
        )}
      >
        {status === "new" ? (
          <Sparkles className="h-4 w-4" />
        ) : status === "due" ? (
          <Flame className="h-4 w-4" />
        ) : (
          <Calendar className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-[var(--color-ink-900)]">
          {card.front}
        </div>
        <div className="mt-0.5 truncate text-[12px] text-[var(--color-ink-500)]">
          {card.courseTitle}
          {state.repetitions > 0 && (
            <>
              {" · "}
              <span className="tabular-nums">{state.repetitions} review{state.repetitions === 1 ? "" : "s"}</span>
              {" · "}
              <span className="tabular-nums">EF {easeLabel}</span>
            </>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div
          className={cn(
            "text-[12px] font-semibold tabular-nums",
            status === "due" && "text-[#8a5f25]",
            status === "new" && "text-[var(--color-mint-600)]",
            status === "scheduled" && "text-[var(--color-ink-500)]"
          )}
        >
          {dueLabel}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-ink-400)]">
          {state.repetitions === 0 ? "new" : `${state.intervalDays}d`}
        </div>
      </div>
    </li>
  );
}

function formatDue(days: number, status: CardStatus): string {
  if (status === "new") return "Now";
  if (status === "due") {
    if (days === 0) return "Today";
    if (days < 0) return `${-days}d overdue`;
    return "Today";
  }
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `in ${days}d`;
  if (days < 30) return `in ${Math.round(days / 7)}w`;
  return `in ${Math.round(days / 30)}mo`;
}

function countReviewedToday(stats: { reviewedAt: string }[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return stats.filter((s) => new Date(s.reviewedAt).getTime() >= today.getTime()).length;
}

function computeRetention(stats: { rating: string }[]): number | null {
  if (stats.length === 0) return null;
  const ok = stats.filter((s) => s.rating !== "hard").length;
  return ok / stats.length;
}
