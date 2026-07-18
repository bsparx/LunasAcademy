"use client";

import { useRef, useState } from "react";
import MuxPlayer, {
  type MuxPlayerRefAttributes,
} from "@mux/mux-player-react";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { publicPosterUrl } from "@/lib/cloudinary";
import { markCheckDone } from "@/app/(dashboard)/learn/actions";
import type { WatchCheck, WatchResource } from "./course-lesson-shell";

const REPLAY_BACK_SECONDS = 5 * 60;
// A jump bigger than this between timeupdates is a seek, not playback —
// handled separately by handleSeeked instead of firing here.
const SEEK_JUMP_SECONDS = 2;

type Props = {
  resource: WatchResource;
  /** Once the lesson is marked complete, checks stop blocking playback. */
  isDone: boolean;
  onComplete: () => void;
};

export function WatchVideoPlayer({ resource, isDone, onComplete }: Props) {
  const playerRef = useRef<MuxPlayerRefAttributes | null>(null);
  const lastTimeRef = useRef(0);
  const [resolved, setResolved] = useState<Set<number>>(
    () => new Set(resource.checks.filter((c) => c.done).map((c) => c.checkID))
  );
  const [activeCheck, setActiveCheck] = useState<WatchCheck | null>(null);

  function handleTimeUpdate(event: Event) {
    const target = event.currentTarget as HTMLVideoElement;
    const t = target.currentTime;
    const last = lastTimeRef.current;
    lastTimeRef.current = t;
    if (isDone || activeCheck) return;
    if (t < last || t - last > SEEK_JUMP_SECONDS) return;

    const next = resource.checks.find(
      (c) => !resolved.has(c.checkID) && c.timeSec > last && c.timeSec <= t
    );
    if (next) {
      playerRef.current?.pause();
      setActiveCheck(next);
    }
  }

  // A completed lesson can be scrubbed freely. Otherwise, landing at or past
  // an unresolved check — by dragging the seek bar or jumping ahead — snaps
  // back to the earliest one the student hasn't passed yet.
  function handleSeeked(event: Event) {
    const target = event.currentTarget as HTMLVideoElement;
    const t = target.currentTime;
    if (isDone || activeCheck) {
      lastTimeRef.current = t;
      return;
    }

    const blocking = resource.checks.find(
      (c) => !resolved.has(c.checkID) && c.timeSec <= t
    );
    if (blocking) {
      const back = Math.max(0, blocking.timeSec - 0.05);
      target.currentTime = back;
      lastTimeRef.current = back;
      return;
    }
    lastTimeRef.current = t;
  }

  function resolve(check: WatchCheck) {
    setResolved((prev) => new Set(prev).add(check.checkID));
    setActiveCheck(null);
    void markCheckDone(check.checkID);
    void playerRef.current?.play();
  }

  function replay(check: WatchCheck) {
    // Leave the check unresolved so it fires again after the replay.
    setActiveCheck(null);
    const el = playerRef.current;
    if (el) {
      const back = Math.max(0, check.timeSec - REPLAY_BACK_SECONDS);
      el.currentTime = back;
      lastTimeRef.current = back;
      void el.play();
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-ink-200)]/60 bg-black shadow-[0_2px_8px_rgba(15,40,30,0.06)]">
      <MuxPlayer
        ref={playerRef}
        src={resource.url}
        poster={publicPosterUrl(resource.publicID)}
        streamType="on-demand"
        accentColor="#16a34a"
        className="aspect-video w-full"
        onTimeUpdate={handleTimeUpdate}
        onSeeked={handleSeeked}
        onEnded={onComplete}
      />
      {activeCheck && (
        <CheckOverlay
          key={activeCheck.checkID}
          check={activeCheck}
          onResolve={() => resolve(activeCheck)}
          onReplay={() => replay(activeCheck)}
        />
      )}
    </div>
  );
}

type Phase = "answering" | "correct" | "wrong";

function CheckOverlay({
  check,
  onResolve,
  onReplay,
}: {
  check: WatchCheck;
  onResolve: () => void;
  onReplay: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("answering");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function submit() {
    if (selected.size === 0) return;
    const correct = new Set(check.correctIndices);
    const isCorrect =
      selected.size === correct.size &&
      [...selected].every((i) => correct.has(i));
    setPhase(isCorrect ? "correct" : "wrong");
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--color-forest-900)]/85 p-6 backdrop-blur-sm"
      role="dialog"
      aria-label="Knowledge check"
    >
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_18px_48px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-tint-tan)]/60 px-3 py-1 text-[12px] font-semibold text-[var(--color-ink-700)]">
          <span aria-hidden>⚡</span>
          Knowledge check · answer correctly to keep watching
        </div>

        <h3 className="mt-4 text-[19px] font-semibold leading-snug text-[var(--color-ink-900)]">
          {check.question}
        </h3>

        {phase !== "correct" && (
          <>
            <div className="mt-5 space-y-2">
              {check.options.map((opt, i) => {
                const isSelected = selected.has(i);
                // Once graded wrong, mark each selected option individually
                // instead of painting every pick red — and never reveal a
                // correct answer the student didn't pick.
                const showWrong =
                  phase === "wrong" && isSelected && !check.correctIndices.includes(i);
                const showCorrect =
                  phase === "wrong" && isSelected && check.correctIndices.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      toggle(i);
                      if (phase === "wrong") setPhase("answering");
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left text-[14px] transition-all cursor-pointer",
                      showWrong
                        ? "border-red-400 bg-red-50/60 ring-2 ring-red-400/30 font-semibold text-[var(--color-ink-900)]"
                        : showCorrect || isSelected
                        ? "border-[var(--color-mint-500)] bg-[var(--color-tint-green)]/30 ring-2 ring-[var(--color-mint-500)]/30 font-semibold text-[var(--color-ink-900)]"
                        : "border-[var(--color-ink-200)] text-[var(--color-ink-700)] hover:border-[var(--color-ink-300)] hover:bg-[var(--color-cream-50)]"
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

            {phase === "wrong" && (
              <p className="mt-3 text-[13px] font-medium text-red-600">
                Not quite — pick another answer, or replay the clip.
              </p>
            )}

            <div className="mt-5 flex gap-2">
              {phase === "wrong" && (
                <button
                  type="button"
                  onClick={onReplay}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-ink-200)] bg-white px-4 py-3 text-[14px] font-medium text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  Replay clip
                </button>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={selected.size === 0 || phase === "wrong"}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(10,31,26,0.18)] hover:bg-[var(--color-forest-800)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Check
              </button>
            </div>
          </>
        )}

        {phase === "correct" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-[var(--color-mint-500)]/30 bg-[var(--color-tint-green)]/40 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-mint-500)] text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                  That&apos;s right!
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onResolve}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(10,31,26,0.18)] hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
            >
              Keep watching
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
