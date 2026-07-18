"use client";

import { useState } from "react";
import { Check, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PracticeQuestion,
  McqQuestion,
  MatchQuestion,
} from "@/app/learn/_data/learning-content";

type Status = "answering" | "checked";

export function isMcq(q: PracticeQuestion): q is McqQuestion {
  return q.kind === "mcq";
}

export function isMatch(q: PracticeQuestion): q is MatchQuestion {
  return q.kind === "match";
}

type Props = {
  question: PracticeQuestion;
  onAdvance: (wasCorrect: boolean) => void;
  showFeedback: boolean;
};

export function QuestionCard({ question, onAdvance, showFeedback }: Props) {
  if (isMcq(question)) return <McqCard question={question} onAdvance={onAdvance} showFeedback={showFeedback} />;
  return <MatchCard question={question} onAdvance={onAdvance} showFeedback={showFeedback} />;
}

function McqCard({ question, onAdvance, showFeedback }: Props & { question: McqQuestion }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("answering");

  const correct = selected === question.correctIndex;
  const canCheck = selected !== null && status === "answering";

  function handleCheck() {
    if (!canCheck) return;
    setStatus("checked");
    if (showFeedback) onAdvance(correct);
    else onAdvance(correct);
  }

  function handleSkip() {
    setStatus("checked");
    onAdvance(false);
  }

  function handleNext() {
    onAdvance(correct);
  }

  if (status === "checked" && showFeedback) {
    return (
      <div className="space-y-4">
        <div
          className={cn(
            "rounded-xl border p-4",
            correct
              ? "border-[var(--color-mint-500)]/30 bg-[var(--color-tint-green)]/40"
              : "border-[var(--color-tint-tan)] bg-[var(--color-tint-tan)]/30"
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                correct ? "bg-[var(--color-mint-500)] text-white" : "bg-[var(--color-ink-200)] text-[var(--color-ink-700)]"
              )}
            >
              {correct ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Lightbulb className="h-3.5 w-3.5" />}
            </span>
            <div>
              <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                {correct ? "Nice." : "Not quite."}
              </div>
              <div className="mt-1 text-[13px] text-[var(--color-ink-700)]">
                {question.explanation}
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
        >
          Next question
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setSelected(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left text-[14px] transition-all cursor-pointer",
                isSelected
                  ? "border-[var(--color-mint-500)] bg-[var(--color-tint-green)]/30 ring-2 ring-[var(--color-mint-500)]/30 font-semibold text-[var(--color-ink-900)]"
                  : "border-[var(--color-ink-200)] text-[var(--color-ink-700)] hover:border-[var(--color-ink-300)] hover:bg-[var(--color-cream-50)]"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  isSelected ? "border-[var(--color-mint-500)] bg-[var(--color-mint-500)] text-white" : "border-[var(--color-ink-300)]"
                )}
              >
                {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        {!showFeedback && (
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 inline-flex items-center justify-center rounded-xl border border-[var(--color-ink-200)] bg-white px-4 py-3 text-[14px] font-medium text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer"
          >
            Skip
          </button>
        )}
        <button
          type="button"
          onClick={handleCheck}
          disabled={!canCheck}
          className="flex-1 inline-flex items-center justify-center rounded-xl bg-[var(--color-forest-900)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Check
        </button>
      </div>
    </div>
  );
}

function MatchCard({ question, onAdvance, showFeedback }: Props & { question: MatchQuestion }) {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("answering");

  const allMatched = question.left.every((l) => picks[l]);

  function handleLeftClick(item: string) {
    if (status === "checked") return;
    setActiveLeft((prev) => (prev === item ? null : item));
  }

  function handleRightClick(item: string) {
    if (status === "checked") return;
    if (!activeLeft) return;
    setPicks((prev) => {
      const next = { ...prev };
      // remove any existing left→this right pairing
      for (const k of Object.keys(next)) {
        if (next[k] === item) delete next[k];
      }
      next[activeLeft] = item;
      return next;
    });
    setActiveLeft(null);
  }

  function isMatchCorrect(left: string): boolean {
    return picks[left] === question.correct[left];
  }

  function score(): { correct: number; total: number } {
    let correct = 0;
    for (const l of question.left) {
      if (isMatchCorrect(l)) correct += 1;
    }
    return { correct, total: question.left.length };
  }

  function handleCheck() {
    if (!allMatched) return;
    const { correct } = score();
    setStatus("checked");
    onAdvance(correct === question.left.length);
  }

  function handleSkip() {
    setStatus("checked");
    onAdvance(false);
  }

  function handleNext() {
    const { correct } = score();
    onAdvance(correct === question.left.length);
  }

  if (status === "checked" && showFeedback) {
    const { correct, total } = score();
    const allRight = correct === total;
    return (
      <div className="space-y-4">
        <div
          className={cn(
            "rounded-xl border p-4",
            allRight
              ? "border-[var(--color-mint-500)]/30 bg-[var(--color-tint-green)]/40"
              : "border-[var(--color-tint-tan)] bg-[var(--color-tint-tan)]/30"
          )}
        >
          <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
            {correct} of {total} matched correctly.
          </div>
          <div className="mt-2 space-y-1">
            {question.left.map((l) => (
              <div key={l} className="flex items-center gap-2 text-[13px]">
                <span className="text-[var(--color-ink-700)]">{l}</span>
                <span className="text-[var(--color-ink-400)]">→</span>
                <span className={isMatchCorrect(l) ? "font-semibold text-[var(--color-mint-600)]" : "text-[var(--color-ink-500)] line-through"}>
                  {picks[l] ?? "—"}
                </span>
                {!isMatchCorrect(l) && (
                  <span className="text-[var(--color-mint-600)]">({question.correct[l]})</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
        >
          Next question
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-[12px] text-[var(--color-ink-500)]">Click a left item, then a right item to pair them.</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {question.left.map((l) => {
            const isActive = activeLeft === l;
            const matched = picks[l];
            return (
              <button
                key={l}
                type="button"
                onClick={() => handleLeftClick(l)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-[14px] font-medium transition-all cursor-pointer",
                  isActive
                    ? "border-[var(--color-mint-500)] bg-[var(--color-tint-green)]/30 ring-2 ring-[var(--color-mint-500)]/30"
                    : matched
                    ? "border-[var(--color-ink-200)] bg-[var(--color-cream-50)] text-[var(--color-ink-700)]"
                    : "border-[var(--color-ink-200)] text-[var(--color-ink-700)] hover:border-[var(--color-ink-300)]"
                )}
              >
                <span>{l}</span>
                {matched && <span className="text-[12px] text-[var(--color-mint-600)]">→ {matched}</span>}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {question.right.map((r) => {
            const usedBy = Object.entries(picks).find(([, v]) => v === r)?.[0];
            return (
              <button
                key={r}
                type="button"
                disabled={!activeLeft}
                onClick={() => handleRightClick(r)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-[14px] transition-all",
                  usedBy
                    ? "border-[var(--color-ink-200)] bg-[var(--color-cream-50)] text-[var(--color-ink-400)] line-through cursor-default"
                    : activeLeft
                    ? "border-[var(--color-mint-500)]/40 bg-white text-[var(--color-ink-700)] hover:border-[var(--color-mint-500)] hover:bg-[var(--color-tint-green)]/20 cursor-pointer"
                    : "border-[var(--color-ink-200)] bg-white text-[var(--color-ink-400)] cursor-not-allowed"
                )}
              >
                <span>{r}</span>
                {usedBy && <span className="text-[12px]">↩</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        {!showFeedback && (
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 inline-flex items-center justify-center rounded-xl border border-[var(--color-ink-200)] bg-white px-4 py-3 text-[14px] font-medium text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer"
          >
            Skip
          </button>
        )}
        <button
          type="button"
          onClick={handleCheck}
          disabled={!allMatched}
          className="flex-1 inline-flex items-center justify-center rounded-xl bg-[var(--color-forest-900)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Check
        </button>
      </div>
    </div>
  );
}
