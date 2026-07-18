import { Sk } from "../../../../_components/loading-skeletons";

export default function PostDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <Sk className="h-3.5 w-32" />

      {/* Post */}
      <div className="mt-6 flex gap-4 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
        <div className="flex shrink-0 flex-col items-center gap-1 rounded-full bg-[var(--color-ink-100)]/50 px-1 py-1.5">
          <Sk className="h-4.5 w-4.5 rounded-full" />
          <Sk className="h-3 w-3 rounded" />
          <Sk className="h-4.5 w-4.5 rounded-full" />
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <Sk className="h-4.5 w-24 rounded-full" />
            <Sk className="h-3 w-28" />
          </div>
          <Sk className="h-6 w-4/5" />
          <Sk className="h-3.5 w-full" />
          <Sk className="h-3.5 w-2/3" />
        </div>
      </div>

      {/* Comment form */}
      <Sk className="mt-6 h-[68px] w-full rounded-xl" />

      {/* Comments */}
      <div className="mt-6">
        <Sk className="h-3 w-24" />
        <div className="mt-3 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl border border-[var(--color-ink-200)]/50 bg-white px-4 py-3"
            >
              <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--color-ink-100)]/50 px-1.5 py-0.5">
                <Sk className="h-4.5 w-4.5 rounded-full" />
                <Sk className="h-3 w-3 rounded" />
                <Sk className="h-4.5 w-4.5 rounded-full" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sk className="h-3 w-20" />
                  <Sk className="h-2.5 w-14" />
                </div>
                <Sk className="h-3 w-full" />
                <Sk className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
