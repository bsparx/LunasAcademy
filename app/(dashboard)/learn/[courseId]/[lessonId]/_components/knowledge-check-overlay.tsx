"use client";

import { useState } from "react";
import { Check, Lightbulb, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KnowledgeCheck } from "@/app/learn/_data/learning-content";

type Phase = "answering" | "correct" | "wrong";

type Props = {
  check: KnowledgeCheck;
  onResume: () => void;
  onClose: () => void;
};

export function KnowledgeCheckOverlay({ check, onResume, onClose }: Props) {
  return (
    <OverlayBody
      key={check.question}
      check={check}
      onResume={onResume}
      onClose={onClose}
    />
  );
}

function OverlayBody({ check, onResume, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("answering");
  const [selected, setSelected] = useState<number | null>(null);
  const [hintIndex, setHintIndex] = useState(0);

  const correct = selected === check.correctIndex;

  function handleCheck() {
    if (selected === null) return;
    setPhase(correct ? "correct" : "wrong");
  }

  function handleNextHint() {
    setHintIndex((i) => Math.min(i + 1, check.hints.length - 1));
  }

  function handleKeepWatching() {
    onResume();
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[var(--color-forest-900)]/85 p-6 backdrop-blur-sm"
      role="dialog"
      aria-label="Knowledge check"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_18px_48px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-tint-tan)]/60 px-3 py-1 text-[12px] font-semibold text-[var(--color-ink-700)]">
            <span aria-hidden>⚡</span>
            {check.prompt}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)] transition-colors cursor-pointer"
            aria-label="Skip check"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mt-4 text-[19px] font-semibold leading-snug text-[var(--color-ink-900)]">
          {check.question}
        </h3>

        {phase === "answering" && (
          <>
            <div className="mt-5 space-y-2">
              {check.options.map((opt, i) => {
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
                        isSelected
                          ? "border-[var(--color-mint-500)] bg-[var(--color-mint-500)] text-white"
                          : "border-[var(--color-ink-300)]"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleCheck}
              disabled={selected === null}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(10,31,26,0.18)] hover:bg-[var(--color-forest-800)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Check
            </button>
          </>
        )}

        {phase === "correct" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-[var(--color-mint-500)]/30 bg-[var(--color-tint-green)]/40 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-mint-500)] text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <div>
                  <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                    {check.explanation}
                  </div>
                  <a
                    href="#"
                    className="mt-1 inline-block text-[13px] font-medium text-[var(--color-mint-600)] underline-offset-2 hover:underline"
                  >
                    Why?
                  </a>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleKeepWatching}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(10,31,26,0.18)] hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
            >
              Keep watching
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {phase === "wrong" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-[var(--color-tint-tan)] bg-[var(--color-tint-tan)]/30 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink-200)] text-[var(--color-ink-700)]">
                  <Lightbulb className="h-3.5 w-3.5" />
                </span>
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
                    Hint
                  </div>
                  <div className="mt-1 text-[14px] text-[var(--color-ink-700)]">
                    {check.hints[hintIndex]}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {hintIndex < check.hints.length - 1 && (
                <button
                  type="button"
                  onClick={handleNextHint}
                  className="flex-1 inline-flex items-center justify-center rounded-xl border border-[var(--color-ink-200)] bg-white px-4 py-3 text-[14px] font-medium text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer"
                >
                  Next hint
                </button>
              )}
              <button
                type="button"
                onClick={handleKeepWatching}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-forest-900)] px-4 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(10,31,26,0.18)] hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
              >
                Replay clip
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
