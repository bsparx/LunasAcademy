import { Sk } from "../../../_components/loading-skeletons";

export default function CourseDiscussionLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <Sk className="h-3.5 w-32" />

      <div className="mt-6">
        <Sk className="h-3 w-32" />
        <Sk className="mt-3 h-8 w-3/5" />
      </div>

      {/* Search bar */}
      <Sk className="mt-6 h-11 w-full rounded-full" />

      {/* Category tabs + sort */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {["w-20", "w-32", "w-24", "w-20"].map((w, i) => (
            <Sk key={i} className={`h-7 ${w} rounded-full`} />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Sk className="h-6 w-12 rounded-full" />
          <Sk className="h-6 w-12 rounded-full" />
        </div>
      </div>

      {/* New post prompt */}
      <Sk className="mt-5 h-[52px] w-full rounded-2xl" />

      {/* Posts */}
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-3.5 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-4 shadow-[0_1px_2px_rgba(15,40,30,0.03)]"
          >
            <div className="flex shrink-0 flex-col items-center gap-1 rounded-full bg-[var(--color-ink-100)]/50 px-1 py-1.5">
              <Sk className="h-4.5 w-4.5 rounded-full" />
              <Sk className="h-3 w-3 rounded" />
              <Sk className="h-4.5 w-4.5 rounded-full" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Sk className="h-4.5 w-20 rounded-full" />
                <Sk className="h-3 w-24" />
              </div>
              <Sk className="h-4 w-4/5" />
              <Sk className="h-3 w-full" />
              <Sk className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
