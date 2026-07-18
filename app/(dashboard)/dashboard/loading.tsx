import { CardSk, HeadingSk, RowSk, Sk } from "../_components/loading-skeletons";

export default function DashboardHomeLoading() {
  return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <HeadingSk />

      {/* Stat cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5"
          >
            <Sk className="h-9 w-9 rounded-xl" />
            <Sk className="mt-4 h-6 w-16" />
            <Sk className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Main content split */}
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <CardSk lines={4} />
          <CardSk lines={4} />
        </div>
        <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-4">
          <Sk className="h-4 w-32" />
          <div className="mt-3 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <RowSk key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
