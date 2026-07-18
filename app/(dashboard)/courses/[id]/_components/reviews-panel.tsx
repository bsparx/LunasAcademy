"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitCourseReview, deleteCourseReview } from "../../actions";

/* Ratings use the ore-amber brand accent (#c2871e). */

export type ReviewDTO = {
  reviewID: number;
  name: string;
  rating: number;
  comment: string | null;
  createdAt: string; // ISO
  isYou: boolean;
};

type Props = {
  courseID: number;
  avg: number;
  count: number;
  distribution: number[]; // index 0 = 1 star … index 4 = 5 stars
  reviews: ReviewDTO[];
  canReview: boolean;
  myReview: { rating: number; comment: string | null } | null;
};

export function Stars({
  value,
  className,
  starClass = "h-4 w-4",
}: {
  value: number;
  className?: string;
  starClass?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            starClass,
            n <= Math.round(value)
              ? "fill-[#c2871e] text-[#c2871e]"
              : "fill-[var(--color-ink-200)]/60 text-[var(--color-ink-200)]"
          )}
        />
      ))}
    </span>
  );
}

function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled: boolean;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="cursor-pointer p-0.5 transition-transform hover:scale-110 disabled:cursor-default"
        >
          <Star
            className={cn(
              "h-7 w-7 transition-colors",
              n <= shown
                ? "fill-[#c2871e] text-[#c2871e]"
                : "fill-transparent text-[var(--color-ink-300)]"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({
  courseID,
  myReview,
}: {
  courseID: number;
  myReview: Props["myReview"];
}) {
  const router = useRouter();
  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [comment, setComment] = useState(myReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (rating === 0) {
      setError("Pick a rating from 1 to 5 stars.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await submitCourseReview(courseID, rating, comment);
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const res = await deleteCourseReview(courseID);
      if (res.ok) {
        setRating(0);
        setComment("");
        setSaved(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <div className="text-[14.5px] font-semibold text-[var(--color-ink-900)]">
        {myReview ? "Your review" : "Rate this course"}
      </div>
      <p className="mt-0.5 text-[12px] text-[var(--color-ink-500)]">
        {myReview
          ? "Update your rating any time — other students see it with your name."
          : "How is the course so far? Your rating helps other students."}
      </p>
      <div className="mt-3">
        <StarPicker value={rating} onChange={(n) => { setRating(n); setSaved(false); }} disabled={pending} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => { setComment(e.target.value); setSaved(false); }}
        disabled={pending}
        rows={3}
        maxLength={2000}
        placeholder="What did you like? What could be better? (optional)"
        className="mt-3 w-full resize-y rounded-lg border border-[var(--color-ink-200)] bg-[var(--cream-50)]/50 px-3 py-2.5 text-[13.5px] text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-400)] focus:border-[var(--color-forest-800)] focus:outline-none"
      />
      {error ? (
        <p className="mt-2 text-[12.5px] font-medium text-red-600">{error}</p>
      ) : null}
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending || rating === 0}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--color-forest-900)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-forest-800)] disabled:cursor-default disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saved ? "Saved!" : myReview ? "Update review" : "Submit review"}
        </button>
        {myReview ? (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ReviewsPanel({
  courseID,
  avg,
  count,
  distribution,
  reviews,
  canReview,
  myReview,
}: Props) {
  const maxBucket = Math.max(1, ...distribution);
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-6 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6 shadow-[0_1px_2px_rgba(15,40,30,0.03)] sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center gap-1 sm:pr-6 sm:border-r sm:border-[var(--color-ink-200)]/50">
          <div className="text-[44px] font-semibold leading-none tracking-[-0.02em] text-[var(--color-ink-900)] tabular-nums">
            {count > 0 ? avg.toFixed(1) : "—"}
          </div>
          <Stars value={avg} starClass="h-4.5 w-4.5" />
          <div className="text-[12px] text-[var(--color-ink-500)]">
            {count} rating{count === 1 ? "" : "s"}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-1.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const n = distribution[stars - 1] ?? 0;
            return (
              <div key={stars} className="flex items-center gap-2.5">
                <span className="w-10 shrink-0 text-right text-[12px] font-semibold tabular-nums text-[var(--color-ink-500)]">
                  {stars} ★
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-ink-100)]">
                  <div
                    className="h-full rounded-full bg-[#c2871e]"
                    style={{ width: `${(n / maxBucket) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-[11.5px] tabular-nums text-[var(--color-ink-400)]">
                  {n}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {canReview ? <ReviewForm courseID={courseID} myReview={myReview} /> : null}

      {/* List */}
      {reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--color-ink-200)] bg-white/50 p-8 text-center text-[13px] text-[var(--color-ink-500)]">
          No reviews yet{canReview ? " — be the first to rate this course." : "."}
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.reviewID}
              className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-forest-900)] text-[13px] font-bold text-white">
                  {r.name[0]?.toUpperCase() ?? "S"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13.5px] font-semibold text-[var(--color-ink-900)]">
                      {r.name}
                    </span>
                    {r.isYou ? (
                      <span className="shrink-0 rounded-full bg-[var(--color-mint-500)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-mint-600)]">
                        You
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Stars value={r.rating} starClass="h-3.5 w-3.5" />
                    <span className="text-[11.5px] text-[var(--color-ink-400)]">
                      {new Date(r.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              {r.comment ? (
                <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--color-ink-700)]">
                  {r.comment}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
