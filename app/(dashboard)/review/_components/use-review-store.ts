"use client";

import { useEffect, useState } from "react";
import { initialCardState, sm2Step, statusOf } from "./sm2";
import type { CardStore, CardState, ReviewRating, StatefulCard, SessionStat } from "./types";
import type { ReviewCard } from "@/app/learn/_data/learning-content";

const STORE_KEY = "luna.review.store.v1";
const SESSION_KEY = "luna.review.sessionStats.v1";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

/** Attach SM-2 state to a list of seed cards, hydrating from localStorage. */
export function attachStates(cards: ReviewCard[], store: CardStore): StatefulCard[] {
  return cards.map((c) => ({
    ...c,
    state: store[c.id] ?? initialCardState(),
  }));
}

/** Decide which cards should be reviewed right now. New cards are interleaved with due ones. */
export function pickSessionQueue(cards: StatefulCard[], limit = 20, now: Date = new Date()): StatefulCard[] {
  const newCards = cards.filter((c) => statusOf(c.state, now) === "new");
  const dueCards = cards.filter((c) => statusOf(c.state, now) === "due");
  // New cards first (they're "due now" by default), then previously-due cards.
  const queue = [...newCards, ...dueCards].slice(0, limit);
  return queue;
}

/**
 * Hook that owns the card store + session stats. Persists to localStorage on
 * every change. Exposes a rate() that runs the SM-2 step and records the stat.
 */
export function useReviewStore(cards: ReviewCard[]) {
  const [hydrated, setHydrated] = useState(false);
  const [store, setStore] = useState<CardStore>({});
  const [sessionStats, setSessionStats] = useState<SessionStat[]>([]);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStore(safeRead<CardStore>(STORE_KEY, {}));
    setSessionStats(safeRead<SessionStat[]>(SESSION_KEY, []));
    setHydrated(true);
  }, []);

  // Persist store.
  useEffect(() => {
    if (!hydrated) return;
    safeWrite(STORE_KEY, store);
  }, [store, hydrated]);

  // Persist session stats.
  useEffect(() => {
    if (!hydrated) return;
    safeWrite(SESSION_KEY, sessionStats);
  }, [sessionStats, hydrated]);

  function rate(cardId: string, rating: ReviewRating, now: Date = new Date()) {
    setStore((prev) => {
      const current: CardState = prev[cardId] ?? initialCardState(now);
      // Re-derive quality from rating here to keep the call site clean.
      // (sm2Step accepts a 0-5 quality; we import ratingToQuality via a local closure below.)
      const quality = ratingToQualityLocal(rating);
      const next = sm2Step(current, quality, now);
      return { ...prev, [cardId]: next };
    });
    setSessionStats((prev) => [
      ...prev,
      {
        cardId,
        rating,
        quality: ratingToQualityLocal(rating),
        reviewedAt: now.toISOString(),
      },
    ]);
  }

  function reset() {
    setStore({});
    setSessionStats([]);
  }

  const stateful: StatefulCard[] = attachStates(cards, store);

  return { hydrated, store, stateful, sessionStats, rate, reset };
}

// Local copy to avoid an import cycle in this file's exports.
function ratingToQualityLocal(rating: ReviewRating): number {
  if (rating === "hard") return 3;
  if (rating === "okay") return 4;
  return 5;
}
