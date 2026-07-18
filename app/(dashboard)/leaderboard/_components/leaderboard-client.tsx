"use client";

import Link from "next/link";
import { ArrowLeft, Trophy, BarChart3, Sparkles, ArrowRight, Info } from "lucide-react";
import { Sidebar } from "@/app/dashboard/_components/sidebar";
import { cn } from "@/lib/utils";
import type { LeaderboardRow } from "@/app/learn/_data/progress-content";

type Props = {
  scope: string;
  rows: LeaderboardRow[];
  youRank: number | null;
};

export function LeaderboardClient({ scope, rows, youRank }: Props) {
  const yourXp = rows.find((r) => r.isYou)?.xp ?? 0;
  const topXp = rows[0]?.xp ?? 1;
  const yourRow = rows.find((r) => r.isYou);

  return (
    <div className="flex min-h-screen bg-[var(--cream-50)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="mx-auto max-w-2xl px-10 py-10 space-y-8">
          <Link
            href="/progress"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Progress
          </Link>

          {/* HEADER */}
          <header>
            <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
              This week
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <h1 className="text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
                {scope}
              </h1>
            </div>
            <p className="mt-2 text-[14px] text-[var(--color-ink-500)]">
              Top learners by XP this week. Grouped by track so it never feels hopeless.
            </p>
          </header>

          {/* LEADERBOARD CARD */}
          <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white shadow-[0_2px_8px_rgba(15,40,30,0.04)] overflow-hidden">
            <ul className="divide-y divide-[var(--color-ink-200)]/60">
              {rows.map((row) => (
                <Row
                  key={row.handle}
                  row={row}
                  maxXp={topXp}
                  yourXp={yourXp}
                />
              ))}
            </ul>
            <div className="flex items-start gap-2 border-t border-[var(--color-ink-200)]/60 bg-[var(--color-cream-50)] px-5 py-3 text-[12px] text-[var(--color-ink-500)]">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[var(--color-ink-400)]" />
              <span>Opt-in &amp; anonymous-friendly. Grouped by track so it never feels hopeless.</span>
            </div>
          </div>

          {/* YOU-RANK SUMMARY */}
          {yourRow && youRank && (
            <div className="rounded-2xl border border-[var(--color-mint-500)]/30 bg-[var(--color-tint-green)]/30 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-mint-500)] text-white">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[var(--color-ink-900)]">
                    You&apos;re #{youRank} of {rows.length} in {scope.split(" · ")[0]}.
                  </div>
                  <div className="text-[12px] text-[var(--color-ink-500)]">
                    {topXp - yourXp} XP behind the leader. One more lesson might tip the week.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UPSELL TO LEARN */}
          <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_2px_8px_rgba(15,40,30,0.04)]">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[var(--color-mint-600)]" />
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                  Climb the board by reviewing.
                </div>
                <div className="text-[12px] text-[var(--color-ink-500)]">
                  Spaced-repetition reviews earn XP and lock in the streak.
                </div>
              </div>
              <Link
                href="/review"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-forest-900)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors"
              >
                Open review
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  row,
  maxXp,
  yourXp,
}: {
  row: LeaderboardRow;
  maxXp: number;
  yourXp: number;
}) {
  const barPct = (row.xp / maxXp) * 100;
  const isPodium = row.rank <= 3;

  return (
    <li
      className={cn(
        "grid grid-cols-[40px_1fr_auto] items-center gap-4 px-5 py-3.5",
        row.isYou && "bg-[var(--color-tint-green)]/30"
      )}
    >
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold tabular-nums",
          row.rank === 1 && "bg-amber-100 text-amber-700",
          row.rank === 2 && "bg-slate-100 text-slate-600",
          row.rank === 3 && "bg-orange-100 text-orange-700",
          row.rank > 3 && "bg-[var(--color-cream-100)] text-[var(--color-ink-500)]",
          row.isYou && row.rank > 3 && "bg-[var(--color-mint-500)]/15 text-[var(--color-mint-600)]"
        )}
      >
        {row.rank}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-[14px]",
              row.isYou ? "font-semibold text-[var(--color-ink-900)]" : "text-[var(--color-ink-700)]"
            )}
          >
            {row.name}
          </span>
          {row.isYou && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-forest-900)] text-[9px] font-bold text-white">
              SM
            </span>
          )}
          {isPodium && !row.isYou && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-cream-100)]">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              row.isYou ? "bg-[var(--color-mint-500)]" : "bg-[var(--color-ink-300)]"
            )}
            style={{ width: `${barPct}%` }}
          />
        </div>
        {!row.isYou && row.xp < yourXp && (
          <div className="mt-1 text-[10px] text-[var(--color-ink-400)]">
            {yourXp - row.xp} XP ahead
          </div>
        )}
      </div>

      <div className="text-right">
        <div className="text-[15px] font-semibold tabular-nums text-[var(--color-ink-900)]">
          {row.xp.toLocaleString()}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-ink-400)]">XP</div>
      </div>
    </li>
  );
}
