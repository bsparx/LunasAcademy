// SuperMemo 2 (SM-2) algorithm — pure, no Date side effects.
// Reference: Wozniak, P. (1985–1990). Optimization of repetition spacing
// in the practice of learning.

import type { CardState, ReviewRating } from "./types";

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

/** A rating on the 3-button scale maps to SM-2 quality (0-5). */
export function ratingToQuality(rating: ReviewRating): number {
  switch (rating) {
    case "hard":
      return 3; // correct but with serious difficulty
    case "okay":
      return 4; // correct after hesitation
    case "easy":
      return 5; // perfect
  }
}

export function initialCardState(now: Date = new Date()): CardState {
  return {
    easeFactor: DEFAULT_EASE,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    due: startOfDay(now).toISOString(),
    lastReviewedAt: null,
  };
}

/**
 * Apply one SM-2 step and return the next state. Pure.
 * @param state current state
 * @param quality SM-2 quality 0-5
 * @param now time of the review
 */
export function sm2Step(
  state: CardState,
  quality: number,
  now: Date = new Date()
): CardState {
  const q = Math.max(0, Math.min(5, quality));

  // Update ease factor: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
  // Clamp to MIN_EASE. Runs on every review, per Wozniak's spec.
  const rawEase = state.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  const nextEase = Math.max(MIN_EASE, rawEase);

  // Lapse on q < 3: reset repetitions and force a 1-day interval.
  if (q < 3) {
    return {
      ...state,
      easeFactor: nextEase,
      repetitions: 0,
      intervalDays: 1,
      lapses: state.lapses + 1,
      due: addDays(startOfDay(now), 1).toISOString(),
      lastReviewedAt: now.toISOString(),
    };
  }

  const nextReps = state.repetitions + 1;
  let nextInterval: number;
  if (nextReps === 1) nextInterval = 1;
  else if (nextReps === 2) nextInterval = 6;
  else nextInterval = Math.round(state.intervalDays * state.easeFactor);

  return {
    ...state,
    easeFactor: nextEase,
    intervalDays: nextInterval,
    repetitions: nextReps,
    due: addDays(startOfDay(now), nextInterval).toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

/** Is this card due on or before `now`? */
export function isDue(state: CardState, now: Date = new Date()): boolean {
  return new Date(state.due).getTime() <= startOfDay(now).getTime();
}

/** Is this card brand new (never reviewed)? */
export function isNew(state: CardState): boolean {
  return state.repetitions === 0 && state.lastReviewedAt === null;
}

/** Group cards by status: "new" | "due" | "scheduled". */
export type CardStatus = "new" | "due" | "scheduled";

export function statusOf(state: CardState, now: Date = new Date()): CardStatus {
  if (isNew(state)) return "new";
  if (isDue(state, now)) return "due";
  return "scheduled";
}

/** Days from now until the card is due (negative = overdue). */
export function daysUntilDue(state: CardState, now: Date = new Date()): number {
  const due = new Date(state.due);
  const today = startOfDay(now);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// --- date helpers (no external dep) ---

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}
