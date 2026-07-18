import ReactMarkdown from "react-markdown";

/* Renders a markdown string with the app's prose styling (server-safe —
   no fetching, unlike MarkdownViewer). Used for the course Overview tab. */
export function MarkdownProse({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: (p) => <h1 className="mt-5 mb-2.5 text-[22px] font-semibold tracking-[-0.01em] text-[var(--color-ink-900)] first:mt-0" {...p} />,
        h2: (p) => <h2 className="mt-5 mb-2 text-[18px] font-semibold text-[var(--color-ink-900)] first:mt-0" {...p} />,
        h3: (p) => <h3 className="mt-4 mb-1.5 text-[15.5px] font-semibold text-[var(--color-ink-900)] first:mt-0" {...p} />,
        p: (p) => <p className="mb-3 text-[14px] leading-relaxed text-[var(--color-ink-700)]" {...p} />,
        ul: (p) => <ul className="mb-3 list-disc space-y-1.5 pl-5 text-[14px] text-[var(--color-ink-700)]" {...p} />,
        ol: (p) => <ol className="mb-3 list-decimal space-y-1.5 pl-5 text-[14px] text-[var(--color-ink-700)]" {...p} />,
        a: (p) => <a className="font-medium text-[var(--color-mint-600)] underline" target="_blank" rel="noreferrer" {...p} />,
        strong: (p) => <strong className="font-semibold text-[var(--color-ink-900)]" {...p} />,
        code: (p) => <code className="rounded bg-[var(--color-ink-200)]/40 px-1 py-0.5 text-[13px]" {...p} />,
        pre: (p) => <pre className="mb-3 overflow-x-auto rounded-lg bg-[var(--color-forest-900)] p-3.5 text-[12.5px] text-white" {...p} />,
        blockquote: (p) => <blockquote className="mb-3 border-l-2 border-[var(--color-mint-500)] pl-3.5 text-[14px] italic text-[var(--color-ink-500)]" {...p} />,
        hr: () => <hr className="my-5 border-[var(--color-ink-200)]/60" />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
