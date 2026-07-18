"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, RotateCcw, Sparkles, Target } from "lucide-react";
import { QuestionCard } from "./question-card";
import type { MasteryCheck as MasteryCheckData } from "@/app/learn/_data/learning-content";

type Props = {
  data: MasteryCheckData;
  onComplete?: () => void;
};

type Phase = "running" | "passed" | "almost";

export function MasteryCheck({ data, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("running");
  const [attempt, setAttempt] = useState(0);

  const total = data.questions.length;
  const required = Math.ceil(total * data.passThreshold);

  function advance(wasCorrect: boolean) {
    const nextCorrect = correctCount + (wasCorrect ? 1 : 0);
    setCorrectCount(nextCorrect);

    if (index + 1 < total) {
      setIndex(index + 1);
      return;
    }

    if (nextCorrect >= required) {
      setPhase("passed");
    } else {
      setPhase("almost");
    }
  }

  function retry() {
    setIndex(0);
    setCorrectCount(0);
    setPhase("running");
    setAttempt((a) => a + 1);
  }

  if (phase === "passed") {
    return (
      <ResultCard
        badge="Mastery cleared"
        title="You passed."
        description={`${correctCount} of ${total} correct. You cleared the ${Math.round(data.passThreshold * 100)}% gate.`}
        accent="green"
        actions={
          onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          )
        }
      />
    );
  }

  if (phase === "almost") {
    return (
      <ResultCard
        badge="Almost there"
        title="So close."
        description={`You got ${correctCount} of ${total}. The gate is ${Math.round(data.passThreshold * 100)}% (${required} of ${total}). Try a targeted round on the spots you missed — every attempt is one step closer.`}
        accent="amber"
        actions={
          <>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
          </>
        }
      />
    );
  }

  const current = data.questions[index];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-mint-600)]">
            {data.title}
          </div>
          <div className="mt-1 text-[13px] text-[var(--color-ink-500)]">
            Q {index + 1} / {total} · {Math.round(data.passThreshold * 100)}% to pass
            {attempt > 0 && <span className="ml-2 text-[var(--color-ink-400)]">· attempt {attempt + 1}</span>}
          </div>
        </div>
        <PassIndicator total={total} required={required} />
      </div>
      <ProgressBars total={total} current={index} />
      <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6 shadow-[0_2px_8px_rgba(15,40,30,0.04)]">
        <h3 className="text-[20px] font-semibold leading-snug tracking-tight text-[var(--color-ink-900)]">
          {current.prompt}
        </h3>
        <div className="mt-5">
          <QuestionCard
            key={`${attempt}-${current.id}`}
            question={current}
            onAdvance={advance}
            showFeedback={false}
          />
        </div>
      </div>
      <p className="text-center text-[12px] text-[var(--color-ink-400)]">
        Pass = {Math.round(data.passThreshold * 100)}%. Don&apos;t pass? Targeted practice on weak spots, then
        retry — framed &ldquo;almost there,&rdquo; never &ldquo;failed.&rdquo;
      </p>
    </div>
  );
}

function ProgressBars({ total, current }: { total: number; current: number }) {
  // visual: cluster of small bars (matches the design's 3-bars-look). Show all.
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

function PassIndicator({ total, required }: { total: number; required: number }) {
  return (
    <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink-200)] bg-white px-3 py-1 text-[12px] text-[var(--color-ink-700)]">
      <Target className="h-3.5 w-3.5 text-[var(--color-mint-600)]" />
      <span className="tabular-nums font-semibold">{required}</span>
      <span className="text-[var(--color-ink-500)]">/ {total} to pass</span>
    </div>
  );
}

function ResultCard({
  badge,
  title,
  description,
  accent,
  actions,
}: {
  badge: string;
  title: string;
  description: string;
  accent: "green" | "amber";
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-8 text-center shadow-[0_8px_24px_rgba(15,40,30,0.06)]",
        accent === "green"
          ? "border-[var(--color-mint-500)]/30 bg-[var(--color-tint-green)]/20"
          : "border-[var(--color-tint-tan)] bg-[var(--color-tint-tan)]/20"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl",
          accent === "green" ? "bg-[var(--color-mint-500)] text-white" : "bg-[var(--color-tint-tan)] text-[var(--color-ink-700)]"
        )}
      >
        {accent === "green" ? <Sparkles className="h-6 w-6" /> : <RotateCcw className="h-6 w-6" />}
      </div>
      <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-500)]">
        {badge}
      </div>
      <h3 className="mt-2 text-[24px] font-semibold tracking-tight text-[var(--color-ink-900)]">
        {title}
      </h3>
      <p className="mt-2 max-w-md mx-auto text-[14px] text-[var(--color-ink-700)]">{description}</p>
      {actions && <div className="mt-6 flex justify-center gap-2">{actions}</div>}
    </div>
  );
}
