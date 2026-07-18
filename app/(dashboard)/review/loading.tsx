import { HeadingSk, Sk } from "../_components/loading-skeletons";

export default function ReviewLoading() {
  return (
    <div className="mx-auto max-w-4xl px-10 py-10">
      <HeadingSk />

      {/* Review deck */}
      <div className="mt-8 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-8 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
        <div className="flex items-center justify-between">
          <Sk className="h-5 w-24 rounded-full" />
          <Sk className="h-4 w-16" />
        </div>
        <Sk className="mt-6 h-6 w-3/4" />
        <Sk className="mt-3 h-6 w-1/2" />
        <div className="mt-8 space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Sk key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
