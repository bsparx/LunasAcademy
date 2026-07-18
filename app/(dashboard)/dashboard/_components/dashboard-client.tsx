"use client";

import { useEffect, useState } from "react";
import { Flame, Zap, ChevronRight, Play, Check, Sparkles, Clock, Trophy, ArrowUp } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mascot } from "@/app/components/mascot";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  email?: string;
  avatarUrl: string | null;
  streak: number;
  xp: number;
  weeklyGoalDone: number;
  weeklyGoalTotal: number;
  dueCards: number;
  karma: number;
  weeklyKarma: number;
  karmaRank: string;
  unansweredCount: number;
  currentCourse: {
    pathway: string;
    courseIndex: number;
    courseTotal: number;
    title: string;
    progress: number;
    lesson: { current: number; total: number; title: string; minutes: number };
  };
  pathwayNodes: {
    id: string;
    label: string;
    state: "done" | "current" | "locked";
  }[];
  hasMorePathway: boolean;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function StreakPill({ value }: { value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-tint-tan)] bg-[var(--color-tint-tan)]/70 px-4 py-2 text-[14px] font-semibold text-[var(--color-ink-900)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <Flame className="h-4 w-4 text-orange-500" />
      <span className="tabular-nums">{value} day streak</span>
    </div>
  );
}

function XpPill({ value }: { value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-tint-green)] bg-[var(--color-tint-green)]/70 px-4 py-2 text-[14px] font-semibold text-[var(--color-mint-600)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <Zap className="h-4 w-4 fill-[var(--color-mint-500)]" />
      <span className="tabular-nums">{value.toLocaleString()} XP</span>
    </div>
  );
}

function VideoThumb() {
  return (
    <div className="relative flex h-32 w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-tint-green)]">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(52,194,119,0.3) 0 3px, transparent 3px 18px)",
        }}
      />
      <div className="absolute bottom-2 right-2 rounded-md bg-[var(--color-forest-900)]/85 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
        9 min
      </div>
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition-transform group-hover/btn:scale-105">
        <Play className="h-5 w-5 fill-[var(--color-forest-900)] text-[var(--color-forest-900)] translate-x-0.5" />
      </div>
    </div>
  );
}

function PathwayNode({
  state,
  label,
}: {
  state: "done" | "current" | "locked";
  label: string;
}) {
  return (
    <div className="flex w-[68px] shrink-0 flex-col items-center gap-2.5">
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full transition-all",
          state === "done" &&
            "bg-[var(--color-mint-500)] text-white shadow-[0_3px_8px_rgba(52,194,119,0.35)]",
          state === "current" &&
            "bg-[var(--color-forest-900)] text-white ring-4 ring-[var(--color-mint-500)]/25",
          state === "locked" && "bg-[var(--color-ink-100)] text-[var(--color-ink-400)]"
        )}
      >
        {state === "done" ? (
          <Check className="h-5 w-5" strokeWidth={3} />
        ) : state === "current" ? (
          <Play className="h-4 w-4 fill-current translate-x-0.5" />
        ) : (
          <span className="block h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </div>
      <div
        className={cn(
          "text-[12px] text-center whitespace-nowrap",
          state === "current"
            ? "font-semibold text-[var(--color-ink-900)]"
            : state === "done"
            ? "font-medium text-[var(--color-ink-700)]"
            : "text-[var(--color-ink-400)]"
        )}
      >
        {label}
      </div>
    </div>
  );
}

function PathwayConnector({ filled, late }: { filled: boolean; late?: boolean }) {
  return (
    <div className="relative flex h-11 flex-1 items-center px-1">
      <div
        className={cn(
          "h-0.5 w-full transition-colors",
          filled
            ? "bg-[var(--color-mint-500)]"
            : late
            ? "bg-gradient-to-r from-[var(--color-mint-500)]/50 to-[var(--color-ink-200)]"
            : "bg-[var(--color-ink-200)]"
        )}
      />
    </div>
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

export function DashboardClient({
  name,
  avatarUrl,
  streak,
  xp,
  weeklyGoalDone,
  weeklyGoalTotal,
  dueCards,
  karma,
  weeklyKarma,
  karmaRank,
  unansweredCount,
  currentCourse,
  pathwayNodes,
  hasMorePathway,
}: Props) {
  const [todayLabel, setTodayLabel] = useState<string>("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodayLabel(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  const weeklyPct = Math.min(
    100,
    Math.round((weeklyGoalDone / weeklyGoalTotal) * 100)
  );

  return (
    <div className="flex min-h-screen flex-1 bg-[var(--cream-50)]">
      <div className="flex-1 min-w-0">
        {/* STICKY WELCOME BAR */}
        <header className="sticky top-0 z-30 border-b border-[var(--color-ink-200)]/60 bg-[var(--cream-50)]/85 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-10 py-5 flex items-center justify-between gap-8">
            <div className="min-w-0">
              <h1 className="text-[28px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
                Welcome back, {name}!
              </h1>
              <p className="mt-1 text-[14px] text-[var(--color-ink-500)]">
                {todayLabel
                  ? `${todayLabel} · Continue your learning journey`
                  : "Continue your learning journey"}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <StreakPill value={streak} />
              <XpPill value={xp} />
              <Avatar className="h-10 w-10 border-2 border-[var(--color-forest-900)]">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={name} />
                ) : null}
                <AvatarFallback className="bg-[var(--color-forest-900)] text-white text-[13px] font-semibold">
                  {initials(name) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="mx-auto max-w-6xl px-10 py-10 space-y-10">
          {/* CONTINUE LEARNING */}
          <section>
            <div className="mb-4">
              <SectionLabel>Continue learning</SectionLabel>
            </div>
            <Card className="group/btn border-[var(--color-ink-200)]/60 bg-white shadow-[0_2px_8px_rgba(15,40,30,0.04)] py-0 gap-0 overflow-hidden transition-shadow hover:shadow-[0_8px_24px_rgba(15,40,30,0.07)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <VideoThumb />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-[var(--color-tint-green)] px-2 py-0.5 text-[11px] font-semibold tracking-[0.12em] text-[var(--color-mint-600)] uppercase">
                        {currentCourse.pathway}
                      </span>
                      <span className="text-[12px] text-[var(--color-ink-500)]">
                        Course {currentCourse.courseIndex} of{" "}
                        {currentCourse.courseTotal}
                      </span>
                    </div>
                    <div className="mt-2 text-[20px] font-semibold tracking-tight text-[var(--color-ink-900)]">
                      {currentCourse.title}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress
                        value={currentCourse.progress}
                        className="h-2 flex-1 max-w-md bg-[var(--color-ink-100)]"
                      />
                      <span className="text-[12px] font-semibold text-[var(--color-ink-700)] tabular-nums">
                        {currentCourse.progress}%
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2 text-[13px] text-[var(--color-ink-500)]">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        Lesson {currentCourse.lesson.current} of{" "}
                        {currentCourse.lesson.total} ·{" "}
                        {currentCourse.lesson.title} ·{" "}
                        {currentCourse.lesson.minutes} min left
                      </span>
                    </div>
                  </div>
                  <Link
                    href="#"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "rounded-xl bg-[var(--color-forest-900)] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(10,31,26,0.15)] hover:bg-[var(--color-forest-800)] hover:text-white hover:shadow-[0_6px_18px_rgba(10,31,26,0.2)] hover:-translate-y-0.5 transition-all"
                    )}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Resume
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FOUR CARDS ROW */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Weekly goal */}
            <Card className="group border-[var(--color-ink-200)]/60 bg-white py-0 gap-0 shadow-[0_2px_8px_rgba(15,40,30,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(15,40,30,0.07)] hover:-translate-y-0.5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="text-[13px] font-medium text-[var(--color-ink-500)]">
                    Weekly goal
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--color-mint-600)] uppercase tracking-wider">
                    On track
                  </span>
                </div>
                <div className="mt-2 text-[32px] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)] tabular-nums leading-none">
                  {weeklyGoalDone}
                  <span className="text-[18px] font-medium text-[var(--color-ink-400)]">
                    {" "}
                    / {weeklyGoalTotal}
                  </span>
                </div>
                <div className="mt-1 text-[13px] text-[var(--color-ink-500)]">
                  lessons this week
                </div>
                <Progress
                  value={weeklyPct}
                  className="mt-4 h-2 bg-[var(--color-ink-100)]"
                />
              </CardContent>
            </Card>

            {/* Due to review */}
            <Card className="group border-[var(--color-ink-200)]/60 bg-white py-0 gap-0 shadow-[0_2px_8px_rgba(15,40,30,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(15,40,30,0.07)] hover:-translate-y-0.5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="text-[13px] font-medium text-[var(--color-ink-500)]">
                    Due to review
                  </div>
                  <span className="inline-flex items-center rounded-md bg-[var(--color-tint-tan)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-ink-700)] uppercase tracking-wider">
                    Today
                  </span>
                </div>
                <div className="mt-2 text-[32px] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)] tabular-nums leading-none">
                  {dueCards}{" "}
                  <span className="text-[18px] font-medium text-[var(--color-ink-400)]">
                    cards
                  </span>
                </div>
                <div className="mt-1 text-[13px] text-[var(--color-ink-500)]">
                  spaced repetition
                </div>
                <Link
                  href="/review"
                  className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--color-mint-600)] hover:text-[var(--color-mint-500)] transition-colors group-hover:gap-1.5"
                >
                  Start review <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Karma — community */}
            <Link
              href="/community"
              className="group relative overflow-hidden rounded-2xl border border-[var(--color-mint-500)]/30 bg-white p-6 shadow-[0_2px_8px_rgba(15,40,30,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(15,40,30,0.07)] hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="text-[13px] font-medium text-[var(--color-ink-500)]">
                  Karma
                </div>
                <Trophy className="h-3.5 w-3.5 text-[var(--color-mint-600)]" />
              </div>
              <div className="mt-2 text-[32px] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)] tabular-nums leading-none">
                {karma.toLocaleString()}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[12px]">
                <ArrowUp className="h-3 w-3 text-[var(--color-mint-600)]" />
                <span className="font-semibold tabular-nums text-[var(--color-mint-600)]">
                  +{weeklyKarma}
                </span>
                <span className="text-[var(--color-ink-500)]">this week</span>
              </div>
              <div className="mt-2 text-[12px] text-[var(--color-ink-500)]">
                <span className="font-semibold text-[var(--color-ink-700)]">{karmaRank}</span>
                {" · "}
                {unansweredCount > 0 ? (
                  <>
                    <span className="font-semibold tabular-nums text-[var(--color-ink-700)]">
                      {unansweredCount}
                    </span>{" "}
                    question{unansweredCount === 1 ? "" : "s"} waiting
                  </>
                ) : (
                  "no questions waiting"
                )}
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--color-mint-600)] group-hover:gap-1.5 transition-all">
                Open community <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            {/* Luna streak card */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-forest-800)] bg-[var(--color-forest-900)] p-6 text-white shadow-[0_4px_16px_rgba(10,31,26,0.15)] transition-all hover:shadow-[0_8px_24px_rgba(10,31,26,0.2)] hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-dots-dark opacity-50" />
              <div className="relative flex items-center gap-4">
                <div className="shrink-0">
                  <Mascot size={72} className="drop-shadow-md" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold leading-snug">
                    Streak alive
                    <Flame className="inline-block h-4 w-4 text-orange-400 ml-1 align-text-bottom" />
                  </div>
                  <p className="mt-0.5 text-[12px] text-white/65 leading-relaxed">
                    Luna&apos;s with you. Keep it going.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* YOUR CORE PATHWAY */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel>Your Core Pathway</SectionLabel>
              <Link
                href="#"
                className="text-[13px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors inline-flex items-center gap-1"
              >
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <Card className="border-[var(--color-ink-200)]/60 bg-white py-0 gap-0 shadow-[0_2px_8px_rgba(15,40,30,0.04)]">
              <CardContent className="p-8">
                <div className="flex items-center justify-between gap-2">
                  {pathwayNodes.map((node, i) => (
                    <div key={node.id} className="flex items-center">
                      <PathwayNode state={node.state} label={node.label} />
                      {i < pathwayNodes.length - 1 && (
                        <PathwayConnector
                          filled={
                            pathwayNodes[i].state === "done" &&
                            (pathwayNodes[i + 1].state === "done" ||
                              pathwayNodes[i + 1].state === "current")
                          }
                        />
                      )}
                    </div>
                  ))}
                  {hasMorePathway ? (
                    <>
                      <PathwayConnector filled={false} />
                      <div className="flex w-[68px] shrink-0 flex-col items-center gap-2.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-tint-tan)] text-[var(--color-ink-700)]">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="text-[12px] font-medium text-[var(--color-ink-500)]">
                          +3 more
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}