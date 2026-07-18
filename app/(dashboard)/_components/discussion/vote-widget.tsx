"use client";

import { useRef, useState, useTransition } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { votePost, voteComment } from "../../discussion-actions";

type Props = {
  kind: "post" | "comment";
  id: number;
  score: number;
  myVote: -1 | 0 | 1;
  /** Vertical reddit-style column (post rows) vs compact horizontal pill. */
  vertical?: boolean;
};

export function VoteWidget({ kind, id, score, myVote, vertical = false }: Props) {
  const [state, setState] = useState({ score, myVote });
  const [, startTransition] = useTransition();

  // Adopt fresh server values after a revalidation (derived-state sync).
  const last = useRef({ score, myVote });
  if (last.current.score !== score || last.current.myVote !== myVote) {
    last.current = { score, myVote };
    setState({ score, myVote });
  }

  function cast(direction: 1 | -1) {
    const next = state.myVote === direction ? 0 : direction;
    const prev = state;
    // Optimistic: apply locally, revert if the server rejects it.
    setState({ score: state.score + next - state.myVote, myVote: next });
    startTransition(async () => {
      const action = kind === "post" ? votePost : voteComment;
      const res = await action(id, next);
      if (!res.ok) setState(prev);
    });
  }

  return (
    <div
      className={cn(
        "flex items-center rounded-full bg-[var(--color-ink-100)]/50",
        vertical ? "flex-col gap-0.5 px-1 py-1.5" : "gap-0.5 px-1.5 py-0.5"
      )}
    >
      <button
        type="button"
        onClick={() => cast(1)}
        aria-label="Upvote"
        aria-pressed={state.myVote === 1}
        className={cn(
          "flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-colors",
          state.myVote === 1
            ? "text-[var(--color-mint-600)]"
            : "text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)]"
        )}
      >
        <ArrowBigUp
          className="h-4.5 w-4.5"
          fill={state.myVote === 1 ? "currentColor" : "none"}
        />
      </button>
      <span
        className={cn(
          "min-w-4 text-center text-[12px] font-bold tabular-nums",
          state.myVote === 1
            ? "text-[var(--color-mint-600)]"
            : state.myVote === -1
            ? "text-red-500"
            : "text-[var(--color-ink-700)]"
        )}
      >
        {state.score}
      </span>
      <button
        type="button"
        onClick={() => cast(-1)}
        aria-label="Downvote"
        aria-pressed={state.myVote === -1}
        className={cn(
          "flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-colors",
          state.myVote === -1
            ? "text-red-500"
            : "text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)]"
        )}
      >
        <ArrowBigDown
          className="h-4.5 w-4.5"
          fill={state.myVote === -1 ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}
