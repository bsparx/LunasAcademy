"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";
import { QuestionCard } from "./question-card";
import type {
  PracticeQuestion,
  PracticeLesson as PracticeLessonData,
} from "@/app/learn/_data/learning-content";

type Props = {
  data: PracticeLessonData;
  onComplete?: () => void;
};

export function PracticeRunner({ data, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(0);

  const current: PracticeQuestion = data.questions[index];
  const isDone = answered >= data.questions.length;

  function advance(wasCorrect: boolean) {
    if (wasCorrect) setCorrectCount((c) => c + 1);
    setAnswered((a) => a + 1);
    setIndex((i) => i + 1);
  }

  function reset() {
    setIndex(0);
    setCorrectCount(0);
    setAnswered(0);
  }

  if (isDone) {
    return (
      <div className="rounded-2xl border border-[var(--color-mint-500)]/30 bg-white p-8 text-center shadow-[0_8px_24px_rgba(15,40,30,0.06)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-tint-green)] text-[var(--color-mint-600)]">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-[22px] font-semibold tracking-tight text-[var(--color-ink-900)]">
          Practice complete
        </h3>
        <p className="mt-2 text-[14px] text-[var(--color-ink-500)]">
          You answered {correctCount} of {data.questions.length} correctly. Want another round?
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--color-ink-200)] bg-white px-5 py-3 text-[14px] font-medium text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer"
          >
            Practice again
          </button>
          {onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
            >
              Next lesson
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProgressDots total={data.questions.length} current={index} />
      <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6 shadow-[0_2px_8px_rgba(15,40,30,0.04)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-mint-600)]">
          {data.title} · Question {index + 1} of {data.questions.length}
        </div>
        <h3 className="mt-2 text-[20px] font-semibold leading-snug tracking-tight text-[var(--color-ink-900)]">
          {current.prompt}
        </h3>
        <div className="mt-5">
          <QuestionCard
            key={current.id}
            question={current}
            onAdvance={advance}
            showFeedback
          />
        </div>
      </div>
      <p className="text-center text-[12px] text-[var(--color-ink-400)]">
        {data.subtitle}
      </p>
    </div>
  );
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            i < current
              ? "bg-[var(--color-mint-500)]"
              : i === current
              ? "bg-[var(--color-mint-500)]/40"
              : "bg-[var(--color-ink-100)]"
          )}
        />
      ))}
    </div>
  );
}
