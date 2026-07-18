"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, RotateCcw, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitExam, type ExamResult } from "@/app/(dashboard)/learn/actions";
import type { WatchExam, WatchQuestion } from "./course-lesson-shell";

type Props = {
  itemID: number;
  exam: WatchExam;
  isDone: boolean;
  onPassed: () => void;
};

const EMPTY_SET: Set<number> = new Set();

export function ExamRunner({ itemID, exam, isDone, onPassed }: Props) {
  const [answers, setAnswers] = useState<Record<number, Set<number>>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const questions = exam.questions;
  const allAnswered = questions.every(
    (q) => (answers[q.questionID]?.size ?? 0) > 0
  );

  function submit() {
    if (!allAnswered || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await submitExam(
          itemID,
          questions.map((q) => ({
            questionID: q.questionID,
            optionIndices: Array.from(answers[q.questionID] ?? []),
          }))
        );
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setResult(res.data!);
        if (res.data!.passed) onPassed();
      } catch {
        setError("Couldn't submit the exam — check your connection and try again.");
      }
    });
  }

  function reset() {
    setAnswers({});
    setResult(null);
    setError(null);
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-ink-200)] bg-white/60 p-10 text-center text-[13px] text-[var(--color-ink-500)]">
        The instructor hasn&apos;t added questions to this exam yet.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* RESULT BANNER */}
      {result && (
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-2xl border p-5",
            result.passed
              ? "border-[#16a34a]/40 bg-[#16a34a]/10"
              : "border-[var(--color-tint-tan)] bg-[var(--color-tint-tan)]/30"
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                result.passed
                  ? "bg-[#16a34a] text-white"
                  : "bg-[var(--color-ink-200)] text-[var(--color-ink-700)]"
              )}
            >
              {result.passed ? (
                <Trophy className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </span>
            <div>
              <div className="text-[15px] font-semibold text-[var(--color-ink-900)]">
                {result.passed ? "You passed!" : "Not quite there yet"}
              </div>
              <div className="text-[13px] text-[var(--color-ink-700)]">
                {result.correctCount} of {result.total} correct ·{" "}
                {result.scorePct}% (pass mark 70%)
              </div>
            </div>
          </div>
          {!result.passed && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--color-forest-900)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try again
            </button>
          )}
        </div>
      )}

      {/* QUESTIONS */}
      {questions.map((q, i) => (
        <QuestionCard
          key={q.questionID}
          index={i}
          question={q}
          selected={answers[q.questionID] ?? EMPTY_SET}
          graded={result ? result.correctness[q.questionID] ?? null : null}
          optionCorrectness={result?.optionCorrectness[q.questionID] ?? null}
          locked={result !== null || pending}
          onToggle={(optionIdx) =>
            setAnswers((prev) => {
              const next = new Set(prev[q.questionID] ?? []);
              if (next.has(optionIdx)) next.delete(optionIdx);
              else next.add(optionIdx);
              return { ...prev, [q.questionID]: next };
            })
          }
        />
      ))}

      {/* SUBMIT */}
      {!result && (
        <div className="space-y-3">
          {error ? (
            <p className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-2.5 text-[13px] font-medium text-amber-800">
              {error}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5">
            <span className="text-[13px] text-[var(--color-ink-500)]">
              {Object.values(answers).filter((s) => s.size > 0).length} of{" "}
              {questions.length} answered
              {isDone ? " · you've already passed this exam" : ""}
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={!allAnswered || pending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-forest-900)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_10px_rgba(6,29,21,0.25)] hover:bg-[var(--color-forest-800)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {pending ? "Grading…" : "Submit exam"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  index,
  question,
  selected,
  graded, // null = not graded yet; boolean = server verdict for this question
  optionCorrectness, // per selected option, once graded — never reveals unselected answers
  locked,
  onToggle,
}: {
  index: number;
  question: WatchQuestion;
  selected: Set<number>;
  graded: boolean | null;
  optionCorrectness: Record<number, boolean> | null;
  locked: boolean;
  onToggle: (optionIdx: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 rounded bg-[#d8e3f4]/60 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-[#3b5bcc]">
          Q{index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-snug text-[var(--color-ink-900)]">
            {question.question}
          </h3>
          {question.imageURL ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-ink-200)]/60 bg-[var(--cream-50)]/60">
              {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, remote host not in next/image config */}
              <img
                src={question.imageURL}
                alt={`Illustration for question ${index + 1}`}
                className="max-h-72 w-full object-contain"
              />
            </div>
          ) : null}
        </div>
        {graded !== null && (
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
              graded
                ? "bg-[#16a34a] text-white"
                : "bg-red-100 text-red-600"
            )}
          >
            {graded ? (
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            ) : (
              <X className="h-3.5 w-3.5" strokeWidth={3} />
            )}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selected.has(i);
          // Once graded, each selected option is marked individually — a
          // wrong overall answer doesn't paint every pick red, and an
          // unselected correct answer is never revealed.
          const optionResult = optionCorrectness?.[i] ?? null;
          const showCorrect = optionResult === true;
          const showWrong = optionResult === false;
          return (
            <button
              key={i}
              type="button"
              onClick={() => !locked && onToggle(i)}
              disabled={locked}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left text-[14px] transition-all",
                locked ? "cursor-default" : "cursor-pointer",
                showWrong
                  ? "border-red-400 bg-red-50/60 ring-2 ring-red-400/30 font-semibold text-[var(--color-ink-900)]"
                  : showCorrect || isSelected
                  ? "border-[var(--color-mint-500)] bg-[var(--color-tint-green)]/30 ring-2 ring-[var(--color-mint-500)]/30 font-semibold text-[var(--color-ink-900)]"
                  : "border-[var(--color-ink-200)] text-[var(--color-ink-700)]",
                !locked &&
                  !isSelected &&
                  "hover:border-[var(--color-ink-300)] hover:bg-[var(--color-cream-50)]"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
                  showWrong
                    ? "border-red-400 bg-red-400 text-white"
                    : showCorrect || isSelected
                    ? "border-[var(--color-mint-500)] bg-[var(--color-mint-500)] text-white"
                    : "border-[var(--color-ink-300)]"
                )}
              >
                {isSelected &&
                  (showWrong ? (
                    <X className="h-3 w-3" strokeWidth={3} />
                  ) : (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ))}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
