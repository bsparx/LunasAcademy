"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/app/(dashboard)/_components/confirm-delete-dialog";
import { deletePost, deleteComment } from "../../discussion-actions";

/** Trash button for the author or (on course posts) the course instructor. */
export function DeleteButton({
  kind,
  id,
  redirectTo,
}: {
  kind: "post" | "comment";
  id: number;
  /** Where to go after deleting (used for posts → back to the board). */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setConfirming(false);
    startTransition(async () => {
      const action = kind === "post" ? deletePost : deleteComment;
      const res = await action(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={pending}
        aria-label={`Delete ${kind}`}
        title={`Delete ${kind}`}
        className="cursor-pointer text-[var(--color-ink-300)] transition-colors hover:text-red-600 disabled:opacity-40"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </button>
      {error ? (
        <span className="text-[11px] font-medium text-red-600">{error}</span>
      ) : null}
      <ConfirmDeleteDialog
        confirm={
          confirming
            ? {
                title: kind === "post" ? "Delete this post?" : "Delete this comment?",
                description:
                  kind === "post"
                    ? "The post and its whole comment thread will be permanently removed."
                    : "The comment will be permanently removed.",
                confirmLabel: "Delete",
              }
            : null
        }
        onCancel={() => setConfirming(false)}
        onConfirm={run}
      />
    </>
  );
}
