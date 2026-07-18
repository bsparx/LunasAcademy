"use client";

import Link from "next/link";
import {
  ArrowUp,
  MessageSquare,
  Check,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Sidebar } from "@/app/dashboard/_components/sidebar";
import { cn } from "@/lib/utils";
import {
  type GlobalCommunity,
  courseAccent,
  getAllCourseCommunities,
} from "@/app/learn/_data/community-content";

type Props = {
  data: GlobalCommunity;
};

const SPARK_BG: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-[var(--color-cream-100)]",
  1: "bg-[#cdebd9]",
  2: "bg-[#9bdcb6]",
  3: "bg-[var(--color-mint-500)]",
  4: "bg-[var(--color-forest-800)]",
};

const ROLE_PILL: Record<string, string> = {
  Learner: "bg-[var(--color-cream-100)] text-[var(--color-ink-700)]",
  Helper: "bg-[var(--color-tint-blue)] text-[#2a4a86]",
  Mentor: "bg-[var(--color-tint-green)] text-[var(--color-mint-600)]",
  Moderator: "bg-[var(--color-tint-purple)] text-[#5a3aa0]",
};

export function CommunityHub({ data }: Props) {
  const totalCourses = data.topCourses.length;
  const allCommunities = getAllCourseCommunities();
  const totalUnanswered = countUnanswered(allCommunities);
  const highestRole = pickHighestRole(data.topCourses);

  return (
    <div className="flex min-h-screen bg-[var(--cream-50)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="mx-auto max-w-3xl px-10 py-10 space-y-10">
          {/* HEADER / THESIS */}
          <header>
            <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
              Community
            </div>
            <p className="mt-2 text-[13px] text-[var(--color-ink-500)]">
              {data.user.name} · across {totalCourses} {totalCourses === 1 ? "course" : "courses"}
            </p>
          </header>

          {/* KARMA HERO */}
          <section className="relative overflow-hidden rounded-2xl bg-[var(--color-forest-900)] p-8 text-white shadow-[0_8px_28px_rgba(10,31,26,0.25)]">
            <div className="absolute inset-0 bg-dots-dark opacity-30 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-mint-500)]/15 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[var(--color-mint-400)] uppercase ring-1 ring-[var(--color-mint-500)]/25">
                  <Sparkles className="h-3 w-3" />
                  {data.user.rank}
                </span>
                <span className="text-[12px] text-white/60">
                  highest role across your courses
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-[64px] md:text-[72px] font-semibold leading-none tracking-[-0.025em] tabular-nums text-white">
                  {data.user.karma.toLocaleString()}
                </span>
                <span className="text-[14px] font-medium text-white/55 uppercase tracking-wider">
                  Karma
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-white/70">
                <span>
                  <span className="font-semibold tabular-nums text-[var(--color-mint-400)]">
                    +{data.user.weeklyKarma}
                  </span>{" "}
                  this week
                </span>
                <span className="text-white/30">·</span>
                <span>
                  <span className="font-semibold tabular-nums text-white">
                    {totalUnanswered}
                  </span>{" "}
                  question{totalUnanswered === 1 ? "" : "s"} waiting
                </span>
                <span className="text-white/30">·</span>
                <span>
                  <span className="font-semibold text-white">{highestRole}</span> across courses
                </span>
              </div>

              {/* 7-day sparkline — reuses the GitHub-cell vocabulary from /progress */}
              <div className="mt-6 flex items-end gap-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                  Last 7 days
                </div>
                <div className="flex gap-[3px]">
                  {data.sparkline.cells.map((c) => {
                    const isToday = c.level === "today";
                    return (
                      <div
                        key={c.day}
                        className={cn(
                          "h-[18px] w-[18px] rounded-[3px]",
                          isToday
                            ? "bg-[#b88a2a] shadow-[0_0_0_1px_white,0_0_0_2.5px_var(--color-ink-900)]"
                            : SPARK_BG[c.level as 0 | 1 | 2 | 3 | 4]
                        )}
                        aria-hidden
                      />
                    );
                  })}
                </div>
                <div className="text-[10px] text-white/45">today</div>
              </div>
            </div>
          </section>

          {/* YOUR COURSES */}
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold text-[var(--color-ink-900)]">
                Your courses
              </h2>
              <span className="text-[12px] text-[var(--color-ink-500)]">
                Ranked by rep
              </span>
            </div>
            <ul className="space-y-3">
              {data.topCourses.map((c) => {
                const accent = courseAccent(c.courseId);
                return (
                  <li key={c.courseId}>
                    <Link
                      href={`/community/${c.courseId}`}
                      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-4 pl-6 shadow-[0_1px_2px_rgba(15,40,30,0.03)] transition-all hover:shadow-[0_6px_18px_rgba(15,40,30,0.07)] hover:-translate-y-0.5"
                    >
                      <span
                        className={cn("absolute inset-y-0 left-0 w-1.5", accent.strip)}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-semibold text-[var(--color-ink-900)] truncate">
                          {c.courseTitle}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[12px] text-[var(--color-ink-500)]">
                          <span className="font-semibold tabular-nums text-[var(--color-ink-900)]">
                            {c.rep.toLocaleString()}
                          </span>
                          <span>rep</span>
                          <span className="text-[var(--color-ink-300)]">·</span>
                          <span className="font-semibold tabular-nums text-[var(--color-mint-600)]">
                            +{c.weeklyRep}
                          </span>
                          <span>this week</span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                          ROLE_PILL[c.role] ?? "bg-[var(--color-ink-100)] text-[var(--color-ink-700)]"
                        )}
                      >
                        {c.role}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[var(--color-ink-400)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-ink-700)]" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* UNANSWERED IN YOUR COMMUNITIES */}
          {data.unanswered.length > 0 && (
            <section>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-[15px] font-semibold text-[var(--color-ink-900)]">
                  Unanswered in your communities
                </h2>
                <span className="text-[12px] text-[var(--color-ink-500)]">
                  Quick wins
                </span>
              </div>
              <ul className="space-y-2">
                {data.unanswered.map((u) => {
                  const accent = courseAccent(u.courseId);
                  return (
                    <li key={u.threadId}>
                      <Link
                        href={`/forum/${u.courseId}`}
                        className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-[var(--color-ink-200)]/60 bg-white px-4 py-3 pl-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)] transition-all hover:shadow-[0_4px_12px_rgba(15,40,30,0.06)] hover:-translate-y-0.5"
                      >
                        <span
                          className={cn("absolute inset-y-0 left-0 w-1", accent.strip)}
                          aria-hidden
                        />
                        <div className="flex w-10 shrink-0 flex-col items-center pt-0.5 text-[var(--color-ink-500)]">
                          <ArrowUp className="h-3 w-3" />
                          <span className="text-[13px] font-semibold tabular-nums text-[var(--color-ink-900)]">
                            {u.upvotes}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-semibold text-[var(--color-ink-900)]">
                            {u.title}
                          </div>
                          <div className="mt-0.5 text-[11px] text-[var(--color-ink-500)]">
                            {u.courseId === "rock-cycle" && "The Rock Cycle"}
                            {u.courseId === "geophysics-intro" && "Geophysics"}
                            {u.courseId === "materials" && "Metallurgy"}
                            <span className="mx-1 text-[var(--color-ink-300)]">·</span>
                            asked {u.askedAgo}
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-mint-500)] px-3 py-1.5 text-[12px] font-semibold text-white group-hover:bg-[var(--color-mint-400)] transition-colors">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Answer
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* RECENT ACTIVITY (across courses) */}
          {data.recentActivity.length > 0 && (
            <section>
              <div className="mb-4">
                <h2 className="text-[15px] font-semibold text-[var(--color-ink-900)]">
                  Recent activity
                </h2>
              </div>
              <ul className="space-y-2">
                {data.recentActivity.map((a, i) => {
                  const accent = courseAccent(a.courseId);
                  return (
                    <li
                      key={i}
                      className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-[var(--color-ink-200)]/60 bg-white px-4 py-3 pl-5"
                    >
                      <span
                        className={cn("absolute inset-y-0 left-0 w-1", accent.strip)}
                        aria-hidden
                      />
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-tint-green)] text-[var(--color-mint-600)]">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] text-[var(--color-ink-700)]">{a.text}</div>
                        <div className="mt-0.5 text-[11px] text-[var(--color-ink-500)]">
                          {a.courseTitle}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[var(--color-ink-500)]">
                        <span className="font-semibold tabular-nums text-[var(--color-mint-600)]">
                          +{a.rep}
                        </span>
                        <span>{a.ago}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* FOOTER NOTE */}
          <div className="rounded-xl bg-[var(--color-cream-100)]/60 px-5 py-4 text-[13px] leading-relaxed text-[var(--color-ink-500)]">
            Rep is per-course — your standing in each community is tracked
            separately. Top contributors in any community unlock moderator
            status. The global Karma is the sum.
          </div>
        </div>
      </div>
    </div>
  );
}

function countUnanswered(
  communities: ReturnType<typeof getAllCourseCommunities>
): number {
  // We don't load forum threads here to keep the hub lean; pull the count from
  // the static data via a simple heuristic. For MVP we return the sum of the
  // "waiting" hints encoded in ways[].meta.
  let n = 0;
  for (const c of communities) {
    for (const w of c.ways) {
      if (w.meta) {
        const match = w.meta.match(/^(\d+)\s+waiting/);
        if (match) n += parseInt(match[1], 10);
      }
    }
  }
  return n;
}

function pickHighestRole(
  courses: { role: string }[]
): string {
  const order = ["Learner", "Helper", "Mentor", "Moderator"];
  let best = "Learner";
  let bestIdx = 0;
  for (const c of courses) {
    const idx = order.indexOf(c.role);
    if (idx > bestIdx) {
      bestIdx = idx;
      best = c.role;
    }
  }
  return best;
}
