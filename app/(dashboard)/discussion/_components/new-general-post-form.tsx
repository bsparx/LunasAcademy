"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PenSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPost } from "@/app/(dashboard)/discussion-actions";

export function NewGeneralPostForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const res = await createPost(null, { category: "GENERAL", title, body });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/discussion/${res.data!.postID}`);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white px-5 py-3.5 text-left shadow-[0_1px_2px_rgba(15,40,30,0.03)] transition-all hover:border-[#8b6fd1]/50 hover:shadow-[0_4px_14px_rgba(15,40,30,0.06)]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8b6fd1]/12">
          <PenSquare className="h-4 w-4 text-[#8b6fd1]" />
        </span>
        <span className="text-[13.5px] text-[var(--color-ink-400)]">
          Share something…
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[#8b6fd1]/40 bg-white p-5 shadow-[0_4px_18px_rgba(15,40,30,0.07)]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[13px] font-bold text-[var(--color-ink-900)]">
          New post
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close the post form"
          className="cursor-pointer text-[var(--color-ink-400)] transition-colors hover:text-[var(--color-ink-700)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        placeholder="Title"
        className="mt-3 w-full rounded-xl border border-[var(--color-ink-200)] bg-white px-3.5 py-2.5 text-[14px] font-medium text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-400)] focus:border-[#8b6fd1] focus:outline-none focus:ring-2 focus:ring-[#8b6fd1]/20"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Memes, wins, random thoughts — anything goes."
        className="mt-2 w-full rounded-xl border border-[var(--color-ink-200)] bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-400)] focus:border-[#8b6fd1] focus:outline-none focus:ring-2 focus:ring-[#8b6fd1]/20"
      />

      {error ? (
        <p className="mt-2 text-[12px] font-medium text-red-600">{error}</p>
      ) : null}

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={submit}
          disabled={pending || !title.trim() || !body.trim()}
          className="bg-[var(--color-forest-900)] text-white hover:bg-[var(--color-forest-800)]"
        >
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Send data-icon="inline-start" />
          )}
          Post
        </Button>
      </div>
    </div>
  );
}
