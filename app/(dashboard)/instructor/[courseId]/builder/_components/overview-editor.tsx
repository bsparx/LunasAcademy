"use client";

import { useState, useTransition } from "react";
import { CircleCheck, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveOverview } from "../actions";

/* Long-form markdown shown on the course page's Overview tab — what the
   course covers, who teaches it, who it's for. */
export function OverviewCard({
  courseID,
  initialOverview,
}: {
  courseID: number;
  initialOverview: string | null;
}) {
  const [text, setText] = useState(initialOverview ?? "");
  const [savedText, setSavedText] = useState(initialOverview ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = text.trim() !== savedText.trim();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await saveOverview(courseID, text);
      if (res.ok) setSavedText(text);
      else setError(res.error);
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-mint-500)]/15 text-[var(--color-mint-600)]">
          <Info className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] font-semibold text-[var(--color-ink-900)]">
            Course overview
          </div>
          <p className="text-[12px] text-[var(--color-ink-500)]">
            Markdown shown on the course page&apos;s Overview tab — what
            you&apos;ll teach, who it&apos;s for, prerequisites.
          </p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={pending}
        rows={8}
        placeholder={"## What you'll learn\n\n- Identify common rock-forming minerals\n- ...\n\n## Who this course is for\n\nStudents starting the exploration pathway…"}
        className="mt-3 w-full resize-y rounded-lg border border-[var(--color-ink-200)] bg-[var(--cream-50)]/50 px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-400)] focus:border-[var(--color-forest-800)] focus:outline-none"
      />
      {error ? (
        <p className="mt-2 text-[12.5px] font-medium text-red-600">{error}</p>
      ) : null}
      <div className="mt-3 flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={pending || !dirty}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Save overview
        </Button>
        {!dirty && savedText.trim() ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#16a34a]">
            <CircleCheck className="h-3.5 w-3.5" />
            Saved
          </span>
        ) : null}
      </div>
    </div>
  );
}
