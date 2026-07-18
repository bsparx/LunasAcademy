import { HeadingSk, Sk } from "../_components/loading-skeletons";

export default function LearnLoading() {
  return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <HeadingSk />

      {/* Enrolled-course progress cards */}
      <div className="mt-8 space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6 shadow-[0_1px_2px_rgba(15,40,30,0.03)]"
          >
            <Sk className="h-16 w-16 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <Sk className="h-3 w-20" />
              <Sk className="mt-2.5 h-5 w-2/5" />
              {/* Progress bar */}
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-ink-100)]">
                <div
                  className="h-full animate-pulse rounded-full bg-[#16a34a]/30"
                  style={{ width: `${65 - i * 20}%` }}
                />
              </div>
              <Sk className="mt-2 h-2.5 w-32" />
            </div>
            <Sk className="h-10 w-36 shrink-0 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
