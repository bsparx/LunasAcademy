import { CardSk, HeadingSk, Sk } from "../../_components/loading-skeletons";

export default function InstructorCourseLoading() {
  return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <Sk className="h-4 w-28" />
      <div className="mt-6 flex items-start justify-between gap-4">
        <HeadingSk className="flex-1" />
        <div className="flex gap-2">
          <Sk className="h-10 w-28 rounded-lg" />
          <Sk className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5"
          >
            <Sk className="h-8 w-8 rounded-lg" />
            <Sk className="mt-3 h-6 w-14" />
            <Sk className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        <CardSk lines={4} />
        <CardSk lines={4} />
      </div>
    </div>
  );
}
