import {
  ForestBandSk,
  RowSk,
  Sk,
  SkDark,
} from "../../../_components/loading-skeletons";

export default function BuilderLoading() {
  return (
    <>
      {/* Forest top bar */}
      <ForestBandSk className="sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-10">
          <div className="flex items-center gap-3">
            <SkDark className="h-8 w-8 rounded-md" />
            <SkDark className="h-4 w-56" />
            <SkDark className="h-5 w-16 rounded-full" />
          </div>
          <SkDark className="h-9 w-32 rounded-md bg-white/20" />
        </div>
      </ForestBandSk>

      {/* Three columns */}
      <div className="mx-auto max-w-7xl px-10 py-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[290px_minmax(0,1fr)_360px]">
          {/* Library */}
          <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-4">
            <Sk className="h-4 w-28" />
            <Sk className="mt-3 h-20 w-full rounded-xl" />
            <div className="mt-3 space-y-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <RowSk key={i} />
              ))}
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white"
              >
                <div className="flex items-center gap-3 px-6 py-5">
                  <Sk className="h-5 w-5" />
                  <Sk className="h-5 w-2/5" />
                  <span className="flex-1" />
                  <Sk className="h-4 w-14" />
                </div>
                <div className="space-y-2 border-t border-[var(--color-ink-200)]/60 px-4 pb-4 pt-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-3 rounded-lg border border-[var(--color-ink-200)]/60 px-4 py-3.5"
                    >
                      <Sk className="h-10 w-10 rounded-md" />
                      <div className="flex-1 space-y-1.5">
                        <Sk className="h-3.5 w-1/2" />
                        <Sk className="h-2.5 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* Capstone slot */}
            <Sk className="h-32 w-full rounded-2xl bg-[#c2871e]/10" />
          </div>

          {/* Inspector */}
          <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6">
            <Sk className="mx-auto h-6 w-6 rounded" />
            <Sk className="mx-auto mt-3 h-4 w-32" />
            <Sk className="mx-auto mt-2 h-3 w-48" />
          </div>
        </div>
      </div>
    </>
  );
}
