import { HeadingSk, RowSk, Sk } from "../_components/loading-skeletons";

export default function ProgressLoading() {
  return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <HeadingSk />

      {/* Streak / XP stats */}
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5"
          >
            <Sk className="h-9 w-9 rounded-xl bg-[#c2871e]/15" />
            <Sk className="mt-4 h-7 w-20" />
            <Sk className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Activity + milestones */}
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6">
          <Sk className="h-4 w-36" />
          <Sk className="mt-5 h-40 w-full rounded-xl bg-[#16a34a]/10" />
        </div>
        <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-4">
          <Sk className="h-4 w-28" />
          <div className="mt-3 space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <RowSk key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
