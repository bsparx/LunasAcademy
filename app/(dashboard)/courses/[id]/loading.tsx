import {
  ForestBandSk,
  RowSk,
  Sk,
  SkDark,
} from "../../_components/loading-skeletons";

export default function CourseDetailLoading() {
  return (
    <div className="pb-14">
      {/* Forest hero */}
      <ForestBandSk>
        <div className="mx-auto max-w-5xl px-6 pb-10 pt-8 md:px-10">
          <SkDark className="h-4 w-24" />
          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <SkDark className="h-3 w-32" />
              <SkDark className="mt-4 h-9 w-4/5" />
              <SkDark className="mt-3 h-9 w-3/5" />
              <SkDark className="mt-5 h-3.5 w-full max-w-2xl" />
              <SkDark className="mt-2 h-3.5 w-2/3" />
              <div className="mt-6 flex items-center gap-3">
                <SkDark className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <SkDark className="h-3 w-28" />
                  <SkDark className="h-2.5 w-16" />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkDark key={i} className="h-7 w-24 rounded-full" />
                ))}
              </div>
            </div>
            {/* CTA card */}
            <div className="rounded-2xl bg-white p-5 shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
              <Sk className="h-4 w-2/5" />
              <Sk className="mt-3 h-2 w-full rounded-full" />
              <Sk className="mt-3 h-3 w-3/5" />
              <Sk className="mt-4 h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </ForestBandSk>

      {/* Curriculum */}
      <div className="mx-auto mt-10 max-w-5xl px-6 md:px-10">
        <Sk className="h-3 w-28" />
        <Sk className="mt-3 h-6 w-48" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white"
            >
              <div className="flex items-center gap-3.5 border-b border-[var(--color-ink-200)]/50 px-5 py-4">
                <Sk className="h-9 w-9 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Sk className="h-4 w-2/5" />
                  <Sk className="h-2.5 w-24" />
                </div>
              </div>
              <div className="px-3 py-2">
                <RowSk />
                <RowSk />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
