import { CardSk, HeadingSk, RowSk, Sk } from "../_components/loading-skeletons";

export default function CommunityLoading() {
  return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <HeadingSk />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSk key={i} lines={2} />
          ))}
        </div>
        <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-4">
          <Sk className="h-4 w-28" />
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
