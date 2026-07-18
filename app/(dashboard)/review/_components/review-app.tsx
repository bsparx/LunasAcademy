"use client";

import { useState } from "react";
import { Sidebar } from "@/app/dashboard/_components/sidebar";
import { ReviewDashboard } from "./review-dashboard";
import { ReviewSession } from "./review-session";
import { useReviewStore } from "./use-review-store";
import type { ReviewCard } from "@/app/learn/_data/learning-content";
import type { StatefulCard } from "./types";

type Props = {
  cards: ReviewCard[];
};

type View = "dashboard" | "session";

export function ReviewApp({ cards }: Props) {
  const { hydrated, stateful, sessionStats, rate, reset } = useReviewStore(cards);
  const [view, setView] = useState<View>("dashboard");
  const [queue, setQueue] = useState<StatefulCard[]>([]);

  function startSession(next: StatefulCard[]) {
    if (next.length === 0) return;
    setQueue(next);
    setView("session");
  }

  function endSession() {
    setQueue([]);
    setView("dashboard");
  }

  return (
    <div className="flex min-h-screen bg-[var(--cream-50)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="mx-auto max-w-5xl px-10 py-10">
          {!hydrated ? (
            <ReviewSkeleton />
          ) : view === "dashboard" ? (
            <ReviewDashboard
              cards={stateful}
              sessionStats={sessionStats}
              onStart={startSession}
              onReset={reset}
            />
          ) : (
            <ReviewSession queue={queue} onRate={rate} onExit={endSession} />
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-3 w-40 rounded bg-[var(--color-cream-100)]" />
        <div className="h-8 w-48 rounded bg-[var(--color-cream-100)]" />
        <div className="h-4 w-96 max-w-full rounded bg-[var(--color-cream-100)]" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-[var(--color-cream-100)]" />
        ))}
      </div>
      <div className="h-24 rounded-2xl bg-[var(--color-cream-100)]" />
    </div>
  );
}
