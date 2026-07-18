import { HeadingSk, Sk } from "../_components/loading-skeletons";

export default function InstructorLoading() {
  return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <div className="flex items-start justify-between gap-4">
        <HeadingSk className="flex-1" />
        <Sk className="h-10 w-36 rounded-lg" />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6 shadow-[0_1px_2px_rgba(15,40,30,0.03)]"
          >
            <div className="flex items-center justify-between">
              <Sk className="h-5 w-16 rounded-full" />
              <Sk className="h-4 w-4 rounded" />
            </div>
            <Sk className="mt-4 h-5 w-4/5" />
            <Sk className="mt-2 h-3 w-full" />
            <Sk className="mt-1.5 h-3 w-2/3" />
            <div className="mt-5 flex gap-2">
              <Sk className="h-8 flex-1 rounded-lg" />
              <Sk className="h-8 flex-1 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
