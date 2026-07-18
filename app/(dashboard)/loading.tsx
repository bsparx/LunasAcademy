import { CardSk, HeadingSk } from "./_components/loading-skeletons";

/** Group-level fallback for dashboard pages without a tailored skeleton. */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <HeadingSk />
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSk key={i} />
        ))}
      </div>
    </div>
  );
}
