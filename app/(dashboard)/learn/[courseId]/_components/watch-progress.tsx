"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/* Course-watch progress shared between the persistent top bar (layout) and
   the lesson pages. Lives in the [courseId] layout so it survives navigation
   between lessons — the top bar never remounts. */

type WatchProgress = {
  done: Set<number>;
  markDone: (itemID: number) => void;
  totalItems: number;
};

const Ctx = createContext<WatchProgress | null>(null);

export function WatchProgressProvider({
  initialDone,
  totalItems,
  children,
}: {
  initialDone: number[];
  totalItems: number;
  children: React.ReactNode;
}) {
  const [done, setDone] = useState<Set<number>>(() => new Set(initialDone));
  const markDone = useCallback((itemID: number) => {
    setDone((prev) => (prev.has(itemID) ? prev : new Set(prev).add(itemID)));
  }, []);
  const value = useMemo(
    () => ({ done, markDone, totalItems }),
    [done, markDone, totalItems]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWatchProgress(): WatchProgress {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useWatchProgress must be used inside WatchProgressProvider");
  }
  return ctx;
}
