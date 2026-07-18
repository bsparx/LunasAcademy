"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  className?: string;
};

/** Fetches a markdown file (e.g. a Cloudinary lecture) and renders it styled. */
export function MarkdownViewer({ url, className }: Props) {
  const [state, setState] = useState<
    { status: "loading" } | { status: "error" } | { status: "ready"; text: string }
  >({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then((text) => setState({ status: "ready", text }))
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setState({ status: "error" });
      });
    return () => controller.abort();
  }, [url]);

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[var(--color-ink-200)]/60 bg-[var(--cream-50)]/60 py-10">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--color-ink-400)]" />
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-4 text-[12px] leading-relaxed text-amber-800">
        Couldn&apos;t load the lecture text.{" "}
        <a href={url} target="_blank" rel="noreferrer" className="font-semibold underline">
          Open the file directly
        </a>{" "}
        instead.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-h-[420px] overflow-y-auto rounded-xl border border-[var(--color-ink-200)]/60 bg-[var(--cream-50)]/60 px-4 py-4",
        className
      )}
    >
      <ReactMarkdown
        components={{
          h1: (p) => <h1 className="mt-3 mb-2 text-[17px] font-semibold text-[var(--color-ink-900)] first:mt-0" {...p} />,
          h2: (p) => <h2 className="mt-3 mb-1.5 text-[15px] font-semibold text-[var(--color-ink-900)] first:mt-0" {...p} />,
          h3: (p) => <h3 className="mt-2.5 mb-1 text-[14px] font-semibold text-[var(--color-ink-900)] first:mt-0" {...p} />,
          p: (p) => <p className="mb-2.5 text-[13px] leading-relaxed text-[var(--color-ink-700)]" {...p} />,
          ul: (p) => <ul className="mb-2.5 list-disc space-y-1 pl-5 text-[13px] text-[var(--color-ink-700)]" {...p} />,
          ol: (p) => <ol className="mb-2.5 list-decimal space-y-1 pl-5 text-[13px] text-[var(--color-ink-700)]" {...p} />,
          a: (p) => <a className="font-medium text-[var(--color-mint-600)] underline" target="_blank" rel="noreferrer" {...p} />,
          code: (p) => <code className="rounded bg-[var(--color-ink-200)]/40 px-1 py-0.5 text-[12px]" {...p} />,
          pre: (p) => <pre className="mb-2.5 overflow-x-auto rounded-lg bg-[var(--color-forest-900)] p-3 text-[12px] text-white" {...p} />,
          blockquote: (p) => <blockquote className="mb-2.5 border-l-2 border-[var(--color-mint-500)] pl-3 text-[13px] italic text-[var(--color-ink-500)]" {...p} />,
        }}
      >
        {state.text}
      </ReactMarkdown>
    </div>
  );
}
