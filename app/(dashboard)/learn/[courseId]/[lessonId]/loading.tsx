import { Sk } from "../../../_components/loading-skeletons";

/* Left column only — the top bar, container grid, and course-content rail
   are rendered by the [courseId] layout and persist across lesson
   navigations, so they must not flash a skeleton here. */
export default function LessonLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Sk className="h-6 w-28 rounded-full" />
        <Sk className="h-6 w-24 rounded-full" />
        <Sk className="h-6 w-24 rounded-full" />
      </div>
      <Sk className="h-9 w-3/4" />
      {/* Player */}
      <Sk className="aspect-video w-full rounded-2xl bg-[var(--color-ink-900)]/10" />
      <div className="flex items-center justify-between border-t border-[var(--color-ink-200)]/50 pt-5">
        <Sk className="h-9 w-32 rounded-lg" />
        <Sk className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}
