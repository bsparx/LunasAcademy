"use client";

import { useMemo, useState } from "react";
import {
  Search,
  FileText,
  Presentation,
  Database,
  Boxes,
  Image as ImageIcon,
  Link2,
  BookOpen,
  Download,
  ExternalLink,
  Users,
} from "lucide-react";
import { Sidebar } from "@/app/dashboard/_components/sidebar";
import { cn } from "@/lib/utils";
import {
  type Resource,
  type ResourceType,
  type ResourcesForCourse,
  groupResourcesByModule,
} from "@/app/learn/_data/community-content";

type Props = {
  data: ResourcesForCourse;
};

type Filter = "all" | ResourceType;

const TYPE_FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "slides", label: "Slides" },
  { id: "pdf", label: "PDFs" },
  { id: "dataset", label: "Datasets" },
  { id: "software", label: "Software" },
];

const TIER_ORDER = ["Common", "Silver", "Gold", "Diamond"] as const;

export function ResourcesClient({ data }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.resources.filter((r) => {
      if (filter !== "all" && r.type !== filter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.uploader.toLowerCase().includes(q) ||
        r.moduleTitle.toLowerCase().includes(q) ||
        r.context?.toLowerCase().includes(q)
      );
    });
  }, [data.resources, filter, query]);

  const grouped = useMemo(() => groupResourcesByModule(filtered), [filtered]);

  return (
    <div className="flex min-h-screen bg-[var(--cream-50)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="mx-auto max-w-5xl px-10 py-10 space-y-8">
          {/* HEADER */}
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
                Resources library
              </div>
              <h1 className="mt-2 text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
                Resources · {data.courseTitle}
              </h1>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-400)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files…"
                className="w-full rounded-lg border border-[var(--color-ink-200)] bg-white py-2 pl-9 pr-3 text-[13px] text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-400)] focus:border-[var(--color-forest-900)] focus:outline-none focus:ring-3 focus:ring-[var(--color-forest-900)]/10"
              />
            </div>
          </header>

          {/* TIER LEGEND */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-[var(--color-ink-200)]/40 bg-white px-5 py-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
              Tier
            </span>
            {TIER_ORDER.map((tier) => (
              <div key={tier} className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    tierDot(tier)
                  )}
                  aria-hidden
                />
                <span className="text-[12px] font-medium text-[var(--color-ink-700)]">{tier}</span>
              </div>
            ))}
          </div>

          {/* TYPE FILTERS */}
          <div className="flex flex-wrap items-center gap-1.5">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer",
                  filter === f.id
                    ? "bg-[var(--color-forest-900)] text-white"
                    : "border border-[var(--color-ink-200)] bg-white text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* GROUPED RESOURCES */}
          {grouped.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <div className="space-y-8">
              {grouped.map((group) => (
                <section key={group.moduleId}>
                  <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-ink-500)] uppercase">
                    {group.moduleTitle}
                  </div>
                  <ul className="mt-3 space-y-2">
                    {group.items.map((r) => (
                      <ResourceRow key={r.id} resource={r} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {/* FOOTER NOTE */}
          <div className="rounded-xl border border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-50)]/40 px-5 py-4 text-[13px] leading-relaxed text-[var(--color-ink-500)]">
            Resources live in two places: a{" "}
            <span className="font-semibold text-[var(--color-ink-900)]">per-lesson</span> tab{" "}
            (right where you need it) and this{" "}
            <span className="font-semibold text-[var(--color-ink-900)]">course-wide</span> library
            for everything at once.
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceRow({ resource }: { resource: Resource }) {
  const ActionIcon = resource.type === "link" ? ExternalLink : Download;
  return (
    <li className="group relative overflow-hidden rounded-xl border border-[var(--color-ink-200)]/60 bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)] transition-shadow hover:shadow-[0_4px_12px_rgba(15,40,30,0.06)]">
      {/* Tier strip — left edge, 4px wide. The signature "specimen tag". */}
      <span
        className={cn("absolute inset-y-0 left-0 w-1", tierStrip(resource.tier))}
        aria-hidden
      />
      <div className="flex items-center gap-4 px-4 pl-6 py-3.5">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            typeSurface(resource.type)
          )}
          aria-hidden
        >
          {typeIcon(resource.type)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="truncate text-[14px] font-semibold text-[var(--color-ink-900)]">
              {resource.title}
            </span>
            <span className="text-[12px] text-[var(--color-ink-400)]">·</span>
            <span className="text-[12px] text-[var(--color-ink-500)] tabular-nums">
              {resource.size}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-[var(--color-ink-500)]">
            <span>by {resource.uploader}</span>
            {resource.context && (
              <>
                <span className="text-[var(--color-ink-300)]">·</span>
                <span>{resource.context}</span>
              </>
            )}
            {resource.sharedBy && (
              <>
                <span className="text-[var(--color-ink-300)]">·</span>
                <span className="inline-flex items-center gap-1 italic text-[var(--color-mint-600)]">
                  <Users className="h-3 w-3" />
                  shared by {resource.sharedBy}
                </span>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          aria-label={resource.type === "link" ? "Open link" : "Download"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--color-ink-400)] transition-colors hover:bg-[var(--color-cream-50)] hover:text-[var(--color-ink-900)] cursor-pointer"
        >
          <ActionIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function typeIcon(type: ResourceType) {
  const cls = "h-4 w-4";
  switch (type) {
    case "slides":
      return <Presentation className={cls} />;
    case "pdf":
      return <FileText className={cls} />;
    case "dataset":
      return <Database className={cls} />;
    case "software":
      return <Boxes className={cls} />;
    case "image":
      return <ImageIcon className={cls} />;
    case "reading":
      return <BookOpen className={cls} />;
    case "link":
      return <Link2 className={cls} />;
  }
}

function typeSurface(type: ResourceType): string {
  switch (type) {
    case "slides":
      return "bg-[var(--color-tint-tan)] text-[#8a5f25]";
    case "pdf":
      return "bg-[var(--color-tint-tan)] text-[#8a5f25]";
    case "dataset":
      return "bg-[var(--color-tint-green)] text-[var(--color-mint-600)]";
    case "software":
      return "bg-[var(--color-tint-blue)] text-[#2a4a86]";
    case "image":
      return "bg-[var(--color-tint-purple)] text-[#5a3aa0]";
    case "reading":
      return "bg-[var(--color-cream-100)] text-[var(--color-ink-700)]";
    case "link":
      return "bg-[var(--color-tint-cyan)] text-[#1f6e75]";
  }
}

function tierStrip(tier: Resource["tier"]): string {
  switch (tier) {
    case "Common":
      return "bg-[#b89a5a]";
    case "Silver":
      return "bg-[#7a8a90]";
    case "Gold":
      return "bg-[#b88a2a]";
    case "Diamond":
      return "bg-[#5a7a9a]";
  }
}

function tierDot(tier: Resource["tier"]): string {
  switch (tier) {
    case "Common":
      return "bg-[#b89a5a]";
    case "Silver":
      return "bg-[#7a8a90]";
    case "Gold":
      return "bg-[#b88a2a]";
    case "Diamond":
      return "bg-[#5a7a9a]";
  }
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-ink-200)] bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-cream-100)] text-[var(--color-ink-500)]">
        <Search className="h-4 w-4" />
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-[var(--color-ink-900)]">
        {query ? "No matches" : "Nothing here yet"}
      </h3>
      <p className="mt-1 text-[13px] text-[var(--color-ink-500)]">
        {query
          ? `No resources match "${query}". Try a different filter or clear the search.`
          : "Resources show up here as soon as an instructor or mentor adds them."}
      </p>
    </div>
  );
}
