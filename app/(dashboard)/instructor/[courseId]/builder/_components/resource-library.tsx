/* eslint-disable react-hooks/refs -- dnd-kit hook results are read in render */
"use client";

import { useState } from "react";
import {
  UploadCloud,
  GripVertical,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  TriangleAlert,
  X,
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { ResourceDTO } from "./types";
import { KindIcon, kindAccent, resourceMeta } from "./module-card";
import { useUploads } from "./use-uploads";

type Filter = "ALL" | "VIDEO" | "LECTURE" | "FILE";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "VIDEO", label: "Videos" },
  { id: "LECTURE", label: "Lectures" },
  { id: "FILE", label: "Files" },
];

type Props = {
  courseID: number;
  library: ResourceDTO[];
  onUploaded: (resource: ResourceDTO) => void;
  onAttach?: (resource: ResourceDTO) => void;
  onDelete: (resource: ResourceDTO) => void;
  deletingIDs: Set<number>;
};

export function ResourceLibrary({
  courseID,
  library,
  onUploaded,
  onAttach,
  onDelete,
  deletingIDs,
}: Props) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [dragOver, setDragOver] = useState(false);
  const { entries, handleFiles, dismiss } = useUploads(courseID, onUploaded);

  const visible =
    filter === "ALL" ? library : library.filter((r) => r.kind === filter);

  return (
    <aside className="lg:sticky lg:top-20 space-y-4">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-500)]">
          Resource library
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-500)]">
          Uploads live with this course only. Drag a resource onto a module to
          add it.
        </p>
      </div>

      {/* DROPZONE */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-all",
          dragOver
            ? "border-[var(--color-mint-500)] bg-[var(--color-tint-green)]/40 scale-[1.01]"
            : "border-[var(--color-ink-300)] bg-white/60 hover:border-[var(--color-mint-500)]/60 hover:bg-white"
        )}
      >
        <UploadCloud
          className={cn(
            "h-6 w-6",
            dragOver ? "text-[var(--color-mint-600)]" : "text-[var(--color-ink-400)]"
          )}
        />
        <span className="text-[13px] font-semibold text-[var(--color-ink-900)]">
          Drop files or click to upload
        </span>
        <span className="text-[11px] text-[var(--color-ink-500)]">
          Videos · Markdown lectures · PDFs &amp; docs
        </span>
        <input
          type="file"
          multiple
          className="hidden"
          accept="video/*,.md,.markdown,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {/* IN-FLIGHT UPLOADS */}
      {entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map((u) => (
            <li
              key={u.id}
              className="rounded-xl border border-[var(--color-ink-200)]/60 bg-white px-3.5 py-3"
            >
              <div className="flex items-center gap-2">
                {u.status === "error" ? (
                  <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" />
                ) : (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--color-mint-600)]" />
                )}
                <span className="flex-1 truncate text-[12px] font-medium text-[var(--color-ink-900)]">
                  {u.name}
                </span>
                {u.status === "error" ? (
                  <button
                    type="button"
                    onClick={() => dismiss(u.id)}
                    aria-label="Dismiss failed upload"
                    className="text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)] cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="text-[11px] tabular-nums text-[var(--color-ink-500)]">
                    {u.status === "saving" ? "Saving…" : `${u.pct}%`}
                  </span>
                )}
              </div>
              {u.status === "error" ? (
                <p className="mt-1.5 text-[11px] leading-snug text-amber-700">{u.error}</p>
              ) : (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-ink-200)]/50">
                  <div
                    className="h-full rounded-full bg-[var(--color-mint-500)] transition-[width] duration-200"
                    style={{ width: `${u.pct}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* FILTERS */}
      <div className="flex items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer",
              filter === f.id
                ? "bg-[var(--color-forest-900)] text-white"
                : "bg-white text-[var(--color-ink-500)] border border-[var(--color-ink-200)]/60 hover:text-[var(--color-ink-900)]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIBRARY LIST */}
      {visible.length === 0 ? (
        <p className="rounded-xl border border-[var(--color-ink-200)]/60 bg-white/60 px-4 py-5 text-center text-[12px] text-[var(--color-ink-500)]">
          {library.length === 0
            ? "Nothing uploaded yet."
            : "No resources match this filter."}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((r) => (
            <DraggableLibraryRow
              key={r.resourceID}
              resource={r}
              onAttach={onAttach}
              onDelete={() => onDelete(r)}
              deleting={deletingIDs.has(r.resourceID)}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}

function DraggableLibraryRow({
  resource,
  onAttach,
  onDelete,
  deleting,
}: {
  resource: ResourceDTO;
  onAttach?: (resource: ResourceDTO) => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const drag = useDraggable({
    id: `lib-${resource.resourceID}`,
    disabled: deleting,
  });
  const accent = kindAccent(resource.kind);

  if (deleting) {
    return (
      <li className="rounded-xl border border-red-200 bg-red-50/60 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-red-500" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-[var(--color-ink-500)] line-through decoration-red-300">
              {resource.title}
            </span>
            <span className="block text-[11px] font-semibold text-red-600">
              Deleting from storage…
            </span>
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-red-500/15">
          <div className="progress-indeterminate h-full rounded-full bg-red-500" />
        </div>
      </li>
    );
  }

  return (
    <li
      ref={drag.setNodeRef}
      className={cn(
        "group flex items-center gap-2.5 rounded-xl border border-[var(--color-ink-200)]/60 bg-white px-3 py-2.5 transition-all hover:border-[var(--color-ink-300)]",
        drag.isDragging && "opacity-40"
      )}
    >
      <button
        type="button"
        aria-label={`Drag ${resource.title} into a module`}
        {...drag.attributes}
        {...drag.listeners}
        className="cursor-grab touch-none text-[var(--color-ink-300)] hover:text-[var(--color-ink-500)]"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          accent.surface,
          accent.text
        )}
      >
        <KindIcon kind={resource.kind} className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-[var(--color-ink-900)]">
          {resource.title}
        </span>
        <span className="block text-[11px] text-[var(--color-ink-500)]">
          {resourceMeta(resource)}
        </span>
      </span>
      <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onAttach ? (
          <button
            type="button"
            onClick={() => onAttach(resource)}
            aria-label="Add to last module"
            title="Add to last module"
            className="text-[var(--color-ink-400)] hover:text-[var(--color-mint-600)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        ) : null}
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          aria-label="Open file"
          title="Open file"
          className="text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete from library"
          title="Delete from library"
          className="text-[var(--color-ink-400)] hover:text-red-600 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </span>
    </li>
  );
}

export function LibraryRowPreview({ resource }: { resource: ResourceDTO }) {
  const accent = kindAccent(resource.kind);
  return (
    <div className="flex w-[260px] items-center gap-2.5 rounded-xl border border-[var(--color-mint-500)] bg-white px-3 py-2.5 shadow-[0_12px_28px_rgba(15,40,30,0.18)]">
      <GripVertical className="h-4 w-4 text-[var(--color-ink-300)]" />
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          accent.surface,
          accent.text
        )}
      >
        <KindIcon kind={resource.kind} className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--color-ink-900)]">
        {resource.title}
      </span>
    </div>
  );
}
