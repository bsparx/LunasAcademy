import { HeadingSk, Sk } from "../_components/loading-skeletons";

export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-10 py-10">
      <HeadingSk />

      {/* Podium */}
      <div className="mt-8 grid grid-cols-3 items-end gap-4">
        <Sk className="h-28 rounded-2xl" />
        <Sk className="h-36 rounded-2xl bg-[#c2871e]/15" />
        <Sk className="h-24 rounded-2xl" />
      </div>

      {/* Ranking rows */}
      <div className="mt-6 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-3 py-3">
            <Sk className="h-5 w-6" />
            <Sk className="h-9 w-9 rounded-full" />
            <Sk className="h-3.5 flex-1 max-w-48" />
            <span className="flex-1" />
            <Sk className="h-4 w-16 rounded-full bg-[#c2871e]/15" />
          </div>
        ))}
      </div>
    </div>
  );
}
