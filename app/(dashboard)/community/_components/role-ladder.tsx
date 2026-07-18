"use client";

import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type CommunityRole,
  ladderProgress,
} from "@/app/(dashboard)/learn/_data/community-content";

type Props = {
  roles: CommunityRole[];
  reputation: number;
};

export function RoleLadder({ roles, reputation }: Props) {
  const progress = ladderProgress(roles, reputation);
  return (
    <div className="flex items-start justify-between gap-2">
      {roles.map((role, i) => {
        const isCurrent = role.state === "current";
        const isLocked = role.state === "locked";
        return (
          <div key={role.id} className="flex flex-1 items-start">
            <div className="flex flex-col items-center">
              <Node state={role.state} />
              <div
                className={cn(
                  "mt-3 text-[12px] font-semibold text-center whitespace-nowrap",
                  isCurrent
                    ? "text-[var(--color-ink-900)]"
                    : isLocked
                    ? "text-[var(--color-ink-400)]"
                    : "text-[var(--color-ink-700)]"
                )}
              >
                {role.name}
              </div>
              <div className="mt-0.5 text-[10px] tabular-nums text-[var(--color-ink-400)]">
                {role.minRep.toLocaleString()}+ rep
              </div>
            </div>
            {i < roles.length - 1 && (
              <div className="mt-[22px] flex-1 px-2" aria-hidden>
                <div className="relative h-1 overflow-hidden rounded-full bg-[var(--color-cream-100)]">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out",
                      progress[i].pct > 0
                        ? "bg-gradient-to-r from-[var(--color-mint-500)] to-[var(--color-mint-400)]"
                        : "bg-transparent"
                    )}
                    style={{ width: `${progress[i].pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Node({ state }: { state: CommunityRole["state"] }) {
  if (state === "done") {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-mint-500)] text-white shadow-[0_3px_8px_rgba(52,194,119,0.35)]">
        <Check className="h-5 w-5" strokeWidth={3} />
      </div>
    );
  }
  if (state === "current") {
    return (
      <div className="relative shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-forest-900)] text-white ring-4 ring-[var(--color-mint-500)]/30">
          <span aria-hidden className="text-lg">🦌</span>
        </div>
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--color-mint-500)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
          You
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-cream-100)] text-[var(--color-ink-400)] ring-1 ring-[var(--color-ink-200)]">
      <Lock className="h-4 w-4" />
    </div>
  );
}
