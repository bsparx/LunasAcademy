"use client";

import Link from "next/link";
import { Flame, Zap, Award, BarChart3, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AchievementBadge } from "../_lib/badges";

export type ActivityGrid = {
  weeks: number;
  daysPerWeek: number;
  today: { weekIndex: number; dayIndex: number };
  cells: { week: number; day: number; count: number }[];
};

type Props = {
  name: string;
  summary: {
    streakDays: number;
    longestStreak: number;
    xp: number;
    badgesEarned: number;
  };
  activity: ActivityGrid;
  badges: AchievementBadge[];
  latestCertificateCourseID: number | null;
};

// Mineral-themed level ladder from real XP (50 XP per lecture).
const LEVELS: [number, string][] = [
  [0, "Explorer"],
  [500, "Apprentice"],
  [1500, "Prospector"],
  [3000, "Surveyor"],
  [6000, "Geologist"],
];

function levelName(xp: number): string {
  let name = LEVELS[0][1];
  for (const [min, label] of LEVELS) if (xp >= min) name = label;
  return name;
}

function levelFor(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

const DAY_LABELS: Record<number, string> = { 0: "Mon", 2: "Wed", 4: "Fri" };

// Refined 5-step green scale. Level 0 sits on the background; level 4 reaches
// the brand forest. The ramp is continuous, not a step.
const CELL_BG: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-[var(--color-cream-100)]",
  1: "bg-[#cdebd9]",
  2: "bg-[#9bdcb6]",
  3: "bg-[var(--color-mint-500)]",
  4: "bg-[var(--color-forest-800)]",
};

export function ProgressClient({
  name,
  summary,
  activity,
  badges,
  latestCertificateCourseID,
}: Props) {
  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);
  const cellMap = cellsToMap(activity);
  const count = activity.cells.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="mx-auto max-w-6xl px-10 py-10 space-y-10">
      {/* HEADER */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
            Progress & motivation
          </div>
          <h1 className="mt-2 text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
            Hey {name} — keep stacking.
          </h1>
          <p className="mt-2 text-[14px] text-[var(--color-ink-500)]">
            Streaks, milestone badges, and a certificate when you finish a course.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ink-200)] bg-white px-3 py-1.5 text-[12px] text-[var(--color-ink-700)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--color-mint-600)]" />
          <span className="font-semibold">Level</span>
          <span className="text-[var(--color-ink-500)]">·</span>
          <span>{levelName(summary.xp)}</span>
        </div>
      </header>

      {/* STATS ROW */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          value={summary.streakDays}
          label={
            summary.longestStreak > 1
              ? `day streak · best ${summary.longestStreak}`
              : "day streak"
          }
          tone="amber"
        />
        <StatTile
          icon={<Zap className="h-5 w-5 fill-[var(--color-mint-500)] text-[var(--color-mint-500)]" />}
          value={summary.xp.toLocaleString()}
          label="total XP"
          tone="cream"
        />
        <StatTile
          icon={<Award className="h-5 w-5 text-[var(--color-ink-700)]" />}
          value={summary.badgesEarned}
          label="badges"
          tone="blue"
        />
      </section>

      {/* ACTIVITY GRID */}
      <section>
        <SectionHeading icon={<BarChart3 className="h-4 w-4 text-[var(--color-mint-600)]" />} title="Activity" />
        <div className="mt-3 rounded-xl border border-[var(--color-ink-200)]/40 bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.04)]">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div className="text-[12px] text-[var(--color-ink-500)]">
              <span className="font-semibold tabular-nums text-[var(--color-ink-900)]">{count}</span>{" "}
              lecture{count === 1 ? "" : "s"} completed in the last {activity.weeks} weeks
              <span className="mx-1.5 text-[var(--color-ink-300)]">·</span>
              <span className="font-semibold tabular-nums text-[var(--color-ink-900)]">{summary.streakDays}</span>{" "}day streak
            </div>
            <Legend />
          </div>

          <div className="mt-4 flex">
            <div className="flex flex-col gap-[3px] pr-2 text-[10px] font-medium uppercase tracking-wider text-[var(--color-ink-400)]">
              {Array.from({ length: activity.daysPerWeek }).map((_, day) => (
                <div key={day} className="flex h-[13px] items-center">
                  {DAY_LABELS[day] ?? ""}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-[3px]">
              {Array.from({ length: activity.daysPerWeek }).map((_, day) => (
                <div key={day} className="flex gap-[3px]">
                  {Array.from({ length: activity.weeks }).map((__, week) => {
                    const cellCount = cellMap.get(`${week}-${day}`) ?? 0;
                    const daysAgo =
                      (activity.today.weekIndex - week) * 7 +
                      (activity.today.dayIndex - day);
                    const isToday =
                      week === activity.today.weekIndex &&
                      day === activity.today.dayIndex;
                    return (
                      <Cell
                        key={week}
                        count={cellCount}
                        daysAgo={daysAgo}
                        isToday={isToday}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BADGES */}
      <section>
        <SectionHeading icon={<Award className="h-4 w-4 text-[var(--color-mint-600)]" />} title="Badges" hint="Earned from real streaks and lecture counts" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {earned.map((b) => (
            <BadgeCard key={b.id} badge={b} />
          ))}
          {locked.map((b) => (
            <BadgeCard key={b.id} badge={b} />
          ))}
        </div>
      </section>

      {/* FOOTER LINKS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/leaderboard"
          className="group flex items-center justify-between rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_2px_8px_rgba(15,40,30,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(15,40,30,0.07)] hover:-translate-y-0.5"
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
              Track
            </div>
            <div className="mt-1 text-[15px] font-semibold text-[var(--color-ink-900)]">
              See this week&apos;s leaderboard
            </div>
            <div className="mt-0.5 text-[12px] text-[var(--color-ink-500)]">
              Opt-in, anonymous-friendly, grouped by track.
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[var(--color-ink-400)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-ink-700)]" />
        </Link>
        <Link
          href={
            latestCertificateCourseID
              ? `/certificate/${latestCertificateCourseID}`
              : "/courses"
          }
          className="group flex items-center justify-between rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_2px_8px_rgba(15,40,30,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(15,40,30,0.07)] hover:-translate-y-0.5"
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
              Certificate
            </div>
            <div className="mt-1 text-[15px] font-semibold text-[var(--color-ink-900)]">
              {latestCertificateCourseID ? "Your latest certificate" : "No certificate yet"}
            </div>
            <div className="mt-0.5 text-[12px] text-[var(--color-ink-500)]">
              {latestCertificateCourseID
                ? "Download, share, or add to LinkedIn."
                : "Finish a course to earn one."}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[var(--color-ink-400)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-ink-700)]" />
        </Link>
        <Link
          href="/graduate"
          className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-[var(--color-forest-800)] bg-[var(--color-forest-900)] p-5 text-white shadow-[0_4px_16px_rgba(10,31,26,0.15)] transition-all hover:shadow-[0_8px_24px_rgba(10,31,26,0.2)] hover:-translate-y-0.5"
        >
          <div className="absolute inset-0 bg-dots-dark opacity-40 pointer-events-none" />
          <div className="relative">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-mint-400)]">
              Milestone
            </div>
            <div className="mt-1 text-[15px] font-semibold">
              Preview graduation moment
            </div>
            <div className="mt-0.5 text-[12px] text-white/65">
              What Luna shows when you finish the Core Pathway.
            </div>
          </div>
          <ArrowRight className="relative h-4 w-4 text-white/70 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>
    </div>
  );
}

function StatTile({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  tone: "amber" | "cream" | "blue";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 shadow-[0_2px_8px_rgba(15,40,30,0.04)] ring-1 ring-inset",
        tone === "amber" && "bg-[#f7e9c8] ring-[#d8b35a]/30",
        tone === "cream" && "bg-[var(--color-tint-green)] ring-[var(--color-mint-500)]/25",
        tone === "blue" && "bg-[var(--color-tint-blue)] ring-[#9eb6e0]/30"
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            tone === "amber" && "bg-white/70",
            tone === "cream" && "bg-white/70",
            tone === "blue" && "bg-white/70"
          )}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-[36px] font-semibold tracking-[-0.02em] tabular-nums leading-none",
            tone === "amber" && "text-[#8a5a14]",
            tone === "cream" && "text-[var(--color-mint-600)]",
            tone === "blue" && "text-[#2a4a86]"
          )}
        >
          {value}
        </span>
      </div>
      <div
        className={cn(
          "mt-1.5 text-[13px] font-medium",
          tone === "amber" && "text-[#8a5a14]/80",
          tone === "cream" && "text-[var(--color-mint-600)]/80",
          tone === "blue" && "text-[#2a4a86]/80"
        )}
      >
        {label}
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-[15px] font-semibold text-[var(--color-ink-900)]">{title}</h2>
      </div>
      {hint && <p className="text-[12px] text-[var(--color-ink-500)]">{hint}</p>}
    </div>
  );
}

function Cell({
  count,
  daysAgo,
  isToday,
}: {
  count: number;
  daysAgo: number;
  isToday: boolean;
}) {
  const isFuture = daysAgo < 0;
  const dateLabel = formatRelativeDate(daysAgo);
  const activityLabel = describeCount(count);
  const ariaLabel = isFuture
    ? `${dateLabel} (future)`
    : `${dateLabel}: ${activityLabel}`;

  const bg = isFuture ? "bg-transparent" : CELL_BG[levelFor(count)];

  return (
    <div className="group/cell relative">
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={isFuture}
        className={cn(
          "block h-[13px] w-[13px] rounded-[3px] outline-none",
          "transition-transform duration-100 ease-out",
          "motion-reduce:transition-none",
          isFuture
            ? "cursor-default"
            : "group-hover/cell:scale-[1.45] group-focus/cell:scale-[1.45] motion-reduce:scale-100",
          bg,
          isToday &&
            !isFuture &&
            "shadow-[0_0_0_1px_white,0_0_0_2px_var(--color-ink-900)]"
        )}
      />
      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2",
          "whitespace-nowrap rounded-md bg-[var(--color-forest-900)] px-2.5 py-1.5",
          "text-[11px] leading-tight text-white shadow-[0_4px_12px_rgba(0,0,0,0.25)]",
          "opacity-0 transition-opacity duration-100",
          "group-hover/cell:opacity-100 group-focus/cell:opacity-100 motion-reduce:transition-none"
        )}
      >
        <div className="font-semibold tabular-nums">{dateLabel}</div>
        <div className="text-white/70">{isFuture ? "—" : activityLabel}</div>
      </div>
    </div>
  );
}

function Legend() {
  const items: (0 | 1 | 2 | 3 | 4)[] = [0, 1, 2, 3, 4];
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-500)]">
      <span>Less</span>
      <div className="flex items-center gap-[3px]">
        {items.map((level) => (
          <div
            key={level}
            className={cn("h-[11px] w-[11px] rounded-[2.5px]", CELL_BG[level])}
          />
        ))}
      </div>
      <span>More</span>
    </div>
  );
}

function BadgeCard({ badge }: { badge: AchievementBadge }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border p-4 text-center transition-all",
        badge.earned
          ? "border-[var(--color-ink-200)]/60 bg-white shadow-[0_2px_8px_rgba(15,40,30,0.04)]"
          : "border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-50)]/50"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-[26px]",
          badge.earned ? tierSurface(badge.tier) : "bg-[var(--color-ink-100)] opacity-40 grayscale"
        )}
        aria-hidden
      >
        <span>{badge.icon}</span>
      </div>
      <div className="mt-3 text-[14px] font-semibold text-[var(--color-ink-900)]">
        {badge.name}
      </div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-500)]">
        {badge.milestone}
      </div>
      <div
        className={cn(
          "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
          tierPill(badge.tier),
          !badge.earned && "opacity-60"
        )}
      >
        {badge.tier}
      </div>
      <p className="mt-2.5 text-[12px] leading-snug text-[var(--color-ink-500)]">
        {badge.description}
      </p>
      {badge.earned && badge.earnedOn && (
        <div className="mt-2 text-[10px] uppercase tracking-wider text-[var(--color-ink-400)]">
          Earned {badge.earnedOn}
        </div>
      )}
    </div>
  );
}

function tierSurface(tier: AchievementBadge["tier"]): string {
  switch (tier) {
    case "Common":
      return "bg-[var(--color-tint-tan)]";
    case "Uncommon":
      return "bg-[var(--color-tint-green)]";
    case "Rare":
      return "bg-[var(--color-tint-blue)]";
    case "Mythic":
      return "bg-[var(--color-tint-purple)]";
  }
}

function tierPill(tier: AchievementBadge["tier"]): string {
  switch (tier) {
    case "Common":
      return "bg-[#8a5f25]/15 text-[#8a5f25]";
    case "Uncommon":
      return "bg-[var(--color-mint-500)]/15 text-[var(--color-mint-600)]";
    case "Rare":
      return "bg-[#2a4a86]/15 text-[#2a4a86]";
    case "Mythic":
      return "bg-[#5a3aa0]/15 text-[#5a3aa0]";
  }
}

function cellsToMap(grid: ActivityGrid): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of grid.cells) {
    m.set(`${c.week}-${c.day}`, c.count);
  }
  return m;
}

function describeCount(count: number): string {
  if (count === 0) return "No lectures";
  return `${count} lecture${count === 1 ? "" : "s"} completed`;
}

function formatRelativeDate(daysAgo: number): string {
  if (daysAgo < 0) return "Future";
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
