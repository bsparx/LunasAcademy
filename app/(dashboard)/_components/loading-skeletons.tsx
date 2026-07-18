import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/* Brand-tinted skeleton primitives shared by the (dashboard) loading states.
   Server components — zero client JS, just CSS pulse. */

/** Skeleton on light (cream/white) surfaces. */
export function Sk({ className }: { className?: string }) {
  return <Skeleton className={cn("bg-[var(--color-ink-100)]", className)} />;
}

/** Skeleton on the deep-forest brand bands. */
export function SkDark({ className }: { className?: string }) {
  return <Skeleton className={cn("bg-white/10", className)} />;
}

/** Standard white content card with a few text lines. */
export function CardSk({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)]",
        className
      )}
    >
      <Sk className="h-4 w-2/5" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Sk key={i} className={cn("h-3", i === lines - 1 ? "w-1/2" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

/** List row: icon circle + two text lines + trailing chip. */
export function RowSk({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 px-2 py-2.5", className)}>
      <Sk className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Sk className="h-3 w-3/5" />
        <Sk className="h-2.5 w-2/5" />
      </div>
      <Sk className="h-5 w-12 shrink-0 rounded-full" />
    </div>
  );
}

/** Page heading block: eyebrow + title + subtitle. */
export function HeadingSk({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Sk className="h-3 w-24" />
      <Sk className="mt-3 h-8 w-72 max-w-full" />
      <Sk className="mt-3 h-3.5 w-96 max-w-full" />
    </div>
  );
}

/** Deep-forest page band (hero/top bar shell) with skeleton content inside. */
export function ForestBandSk({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-[var(--color-forest-900)] shadow-[0_2px_12px_rgba(6,29,21,0.25)]",
        className
      )}
    >
      {children}
    </div>
  );
}
