export function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        d="M13 2 L4 14 h 6 l -1 8 l 9 -12 h -6 z"
        fill="var(--color-amber-400)"
        stroke="#0d3327"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
      <span className="h-px w-8 bg-[var(--color-mint-500)]" />
      {children}
    </div>
  );
}
