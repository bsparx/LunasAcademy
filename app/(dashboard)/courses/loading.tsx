import { HeadingSk, Sk } from "../_components/loading-skeletons";

export default function CoursesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <HeadingSk />

      {/* Course card grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-[var(--color-ink-200)]/60 bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)]"
          >
            {/* Cover block */}
            <Sk className="h-32 w-full rounded-none bg-[var(--color-tint-green)]/70" />
            <div className="p-5">
              <Sk className="h-3 w-16" />
              <Sk className="mt-2.5 h-4.5 w-4/5" />
              <Sk className="mt-2 h-3 w-full" />
              <Sk className="mt-1.5 h-3 w-3/5" />
              <div className="mt-4 flex items-center justify-between">
                <Sk className="h-3 w-24" />
                <Sk className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
