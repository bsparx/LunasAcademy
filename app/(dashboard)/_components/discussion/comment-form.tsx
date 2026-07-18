"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createComment } from "../../discussion-actions";

export function CommentForm({ postID }: { postID: number }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (pending || !body.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createComment(postID, body);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-start gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="Add a comment…"
          className="min-h-0 flex-1 rounded-xl border border-[var(--color-ink-200)] bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-400)] focus:border-[var(--color-mint-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-500)]/20"
        />
        <Button
          onClick={submit}
          disabled={pending || !body.trim()}
          aria-label="Post comment"
          className="bg-[var(--color-forest-900)] text-white hover:bg-[var(--color-forest-800)]"
        >
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Send data-icon="inline-start" />
          )}
          Comment
        </Button>
      </div>
      {error ? (
        <p className="mt-1.5 text-[12px] font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
