// Shared types for the review feature.

import type { ReviewCard as SeedReviewCard } from "@/app/(dashboard)/learn/_data/learning-content";

export type ReviewRating = "hard" | "okay" | "easy";

export type CardState = {
  /** Easiness factor, starts at 2.5, clamped to >= 1.3. */
  easeFactor: number;
  /** Current interval in days. 0 for new cards. */
  intervalDays: number;
  /** Number of successful consecutive reviews. */
  repetitions: number;
  /** Total number of lapses (q < 3). */
  lapses: number;
  /** ISO date string for the next due date (start-of-day). */
  due: string;
  /** ISO timestamp of the last review, or null if never reviewed. */
  lastReviewedAt: string | null;
};

/** A review card enriched with SM-2 state. */
export type StatefulCard = SeedReviewCard & {
  state: CardState;
};

export type CardStore = Record<string, CardState>;

export type SessionStat = {
  cardId: string;
  rating: ReviewRating;
  quality: number;
  reviewedAt: string;
};
