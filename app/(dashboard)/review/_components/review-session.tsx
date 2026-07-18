"use client";

import { useState } from "react";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewRating, StatefulCard } from "./types";
import { sm2Step, ratingToQuality } from "./sm2";

type Props = {
  queue: StatefulCard[];
  onRate: (cardId: string, rating: ReviewRating) => void;
  onExit: () => void;
};

type Phase = "answering" | "revealed";

export function ReviewSession({ queue, onRate, onExit }: Props) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [ratings, setRatings] = useState<ReviewRating[]>([]);

  const card = queue[index];
  const total = queue.length;
  const isLast = index >= total;
  const allDone = isLast;

  if (allDone) {
    return <CompletionCard ratings={ratings} total={total} onExit={onExit} />;
  }

  function handleRate(rating: ReviewRating) {
    if (!card) return;
    onRate(card.id, rating);
    setRatings((prev) => [...prev, rating]);
    setPhase("answering");
    setIndex((i) => i + 1);
  }

  return (
    <div className="space-y-6">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          End session
        </button>
        <div className="text-[12px] text-[var(--color-ink-500)] tabular-nums">
          {index + 1} / {total}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < index
                ? "bg-[var(--color-mint-500)]"
                : i === index
                ? "bg-[var(--color-mint-500)]/40"
                : "bg-[var(--color-ink-100)]"
            )}
          />
        ))}
      </div>

      {/* CARD */}
      {card && (
        <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-8 shadow-[0_2px_8px_rgba(15,40,30,0.04)]">
          <div className="text-[12px] font-medium text-[var(--color-ink-500)]">
            From: <span className="text-[var(--color-ink-700)]">{card.courseTitle}</span>
          </div>

          <div className="mt-4 min-h-[140px] flex items-center justify-center text-center">
            <div className="text-[22px] font-semibold leading-snug tracking-tight text-[var(--color-ink-900)]">
              {card.front}
            </div>
          </div>

          {phase === "answering" ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setPhase("revealed")}
                className="inline-flex items-center justify-center rounded-xl border border-[var(--color-ink-200)] bg-white px-5 py-2.5 text-[13px] font-semibold text-[var(--color-mint-600)] hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer"
              >
                Tap to reveal answer
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-[var(--color-mint-500)]/30 bg-[var(--color-tint-green)]/30 p-5 text-center">
                <div className="text-[15px] leading-relaxed text-[var(--color-ink-900)]">
                  {card.back}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <RateButton
                  label="Hard"
                  subtitle={previewLabel(card, "hard")}
                  tone="red"
                  onClick={() => handleRate("hard")}
                />
                <RateButton
                  label="Okay"
                  subtitle={previewLabel(card, "okay")}
                  tone="amber"
                  onClick={() => handleRate("okay")}
                />
                <RateButton
                  label="Easy"
                  subtitle={previewLabel(card, "easy")}
                  tone="green"
                  onClick={() => handleRate("easy")}
                />
              </div>
              <p className="text-center text-[11px] text-[var(--color-ink-400)]">
                Each rating runs the SM-2 step. Labels show the new interval.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RateButton({
  label,
  subtitle,
  tone,
  onClick,
}: {
  label: string;
  subtitle: string;
  tone: "red" | "amber" | "green";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-1 rounded-xl border-2 bg-white px-4 py-3 text-[14px] font-semibold transition-all cursor-pointer",
        tone === "red" && "border-red-300 text-red-600 hover:bg-red-50",
        tone === "amber" && "border-amber-300 text-amber-700 hover:bg-amber-50",
        tone === "green" && "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
      )}
    >
      <span>{label}</span>
      <span className="text-[11px] font-medium text-[var(--color-ink-500)] tabular-nums group-hover:text-current opacity-70">
        {subtitle}
      </span>
    </button>
  );
}

/** Preview the new interval if the user picks this rating right now. */
function previewLabel(card: StatefulCard, rating: ReviewRating): string {
  const next = sm2Step(card.state, ratingToQuality(rating), new Date());
  if (next.intervalDays < 1) return "<1d";
  if (next.intervalDays === 1) return "1d";
  if (next.intervalDays < 30) return `${next.intervalDays}d`;
  if (next.intervalDays < 365) return `${Math.round(next.intervalDays / 30)}mo`;
  return `${(next.intervalDays / 365).toFixed(1)}y`;
}

function CompletionCard({
  ratings,
  total,
  onExit,
}: {
  ratings: ReviewRating[];
  total: number;
  onExit: () => void;
}) {
  const easy = ratings.filter((r) => r === "easy").length;
  const okay = ratings.filter((r) => r === "okay").length;
  const hard = ratings.filter((r) => r === "hard").length;

  return (
    <div className="rounded-2xl border border-[var(--color-mint-500)]/30 bg-[var(--color-tint-green)]/20 p-8 text-center shadow-[0_8px_24px_rgba(15,40,30,0.06)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-mint-500)] text-white">
        <Check className="h-6 w-6" strokeWidth={3} />
      </div>
      <h3 className="mt-4 text-[22px] font-semibold tracking-tight text-[var(--color-ink-900)]">
        Session complete
      </h3>
      <p className="mt-2 text-[14px] text-[var(--color-ink-700)]">
        Reviewed {total} card{total === 1 ? "" : "s"} · {easy} easy, {okay} okay, {hard} hard.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
