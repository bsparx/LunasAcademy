import { Sk } from "../../../_components/loading-skeletons";

export default function CourseResourcesLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <Sk className="h-3.5 w-36" />

      <div className="mt-6">
        <Sk className="h-3 w-32" />
        <Sk className="mt-3 h-8 w-3/5" />
        <Sk className="mt-2.5 h-3.5 w-full max-w-lg" />
      </div>

      <div className="mt-8 space-y-6">
        {Array.from({ length: 2 }).map((_, mi) => (
          <div
            key={mi}
            className="overflow-hidden rounded-2xl border border-[var(--color-ink-200)]/60 bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-ink-200)]/50 bg-[var(--cream-50)]/60 px-5 py-3.5">
              <Sk className="h-3.5 w-40" />
              <Sk className="h-3 w-14" />
            </div>
            <div className="divide-y divide-[var(--color-ink-200)]/40">
              {Array.from({ length: mi === 0 ? 3 : 2 }).map((__, ii) => (
                <div key={ii} className="flex items-center gap-3 px-5 py-3">
                  <Sk className="h-9 w-9 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Sk className="h-3.5 w-2/5" />
                    <Sk className="h-2.5 w-1/4" />
                  </div>
                  <Sk className="h-7 w-[68px] shrink-0 rounded-lg" />
                  <Sk className="h-7 w-14 shrink-0 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
