/* eslint-disable react-hooks/refs -- dnd-kit hook results are read in render */
"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Play,
  BookOpen,
  Paperclip,
  Loader2,
  Check,
  ClipboardList,
} from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/cloudinary-upload";
import type { ItemDTO, ItemKind, ModuleDTO, ResourceDTO } from "./types";
import { itemTitle, itemKind } from "./types";

/* ------------------------------ kind helpers ----------------------------- */

export function kindAccent(kind: ItemKind): {
  surface: string;
  text: string;
  label: string;
} {
  switch (kind) {
    case "VIDEO":
      return {
        surface: "bg-[var(--color-tint-green)]",
        text: "text-[var(--color-mint-600)]",
        label: "Video",
      };
    case "LECTURE":
      return { surface: "bg-[#e0d9f0]", text: "text-[#8b6fd1]", label: "Lecture" };
    case "FILE":
      return { surface: "bg-[var(--color-tint-tan)]", text: "text-[#8a5f25]", label: "File" };
    case "EXAM":
      return { surface: "bg-[#d8e3f4]", text: "text-[#3b5bcc]", label: "Exam" };
  }
}

export function KindIcon({
  kind,
  className,
}: {
  kind: ItemKind;
  className?: string;
}) {
  const cls = className ?? "h-4 w-4";
  if (kind === "VIDEO") return <Play className={cls} />;
  if (kind === "LECTURE") return <BookOpen className={cls} />;
  if (kind === "EXAM") return <ClipboardList className={cls} />;
  return <Paperclip className={cls} />;
}

export function resourceMeta(r: ResourceDTO): string {
  const parts: string[] = [kindAccent(r.kind).label];
  if (r.format) parts.push(r.format.toUpperCase());
  if (r.duration) parts.push(`${Math.max(1, Math.round(r.duration / 60))} min`);
  else if (r.bytes) parts.push(formatBytes(r.bytes));
  return parts.join(" · ");
}

export function itemMeta(item: ItemDTO): string {
  if (item.resource) return resourceMeta(item.resource);
  const n = item.exam?.questions.length ?? 0;
  return `Exam · ${n} ${n === 1 ? "question" : "questions"}`;
}

/* ------------------------------ module card ------------------------------ */

type ModuleCardProps = {
  module: ModuleDTO;
  collapsed: boolean;
  onToggle: () => void;
  selectedItemID: number | null;
  onSelectItem: (id: number) => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onAddExam: () => void;
  addingExam: boolean;
};

export function SortableModuleCard(props: ModuleCardProps) {
  const sortable = useSortable({ id: `mod-${props.module.moduleID}` });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={cn(sortable.isDragging && "opacity-50")}
    >
      <ModuleCard
        {...props}
        dragAttributes={sortable.attributes}
        dragListeners={sortable.listeners}
      />
    </div>
  );
}

function ModuleCard({
  module,
  collapsed,
  onToggle,
  selectedItemID,
  onSelectItem,
  onRename,
  onDelete,
  onAddExam,
  addingExam,
  dragAttributes,
  dragListeners,
}: ModuleCardProps & {
  dragAttributes?: React.HTMLAttributes<HTMLButtonElement>;
  dragListeners?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `moddrop-${module.moduleID}` });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(module.title);

  function commitRename() {
    setEditing(false);
    const clean = draft.trim();
    if (clean && clean !== module.title) onRename(clean);
    else setDraft(module.title);
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)] transition-colors",
        isOver
          ? "border-[var(--color-mint-500)] ring-2 ring-[var(--color-mint-500)]/20"
          : "border-[var(--color-ink-200)]/60"
      )}
    >
      <div className="flex items-center gap-3 px-6 py-5">
        <button
          type="button"
          aria-label="Drag module"
          {...dragAttributes}
          {...dragListeners}
          className="cursor-grab touch-none text-[var(--color-ink-300)] hover:text-[var(--color-ink-500)]"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {editing ? (
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setDraft(module.title);
                  setEditing(false);
                }
              }}
              onBlur={commitRename}
              maxLength={120}
              className="flex-1 min-w-0 rounded-md border border-[var(--color-mint-500)]/60 px-2 py-1 text-[16px] font-semibold text-[var(--color-ink-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-500)]/20"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={commitRename}
              aria-label="Save name"
              className="text-[var(--color-mint-600)] hover:text-[var(--color-mint-500)] cursor-pointer"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="flex-1 min-w-0 text-left cursor-pointer"
          >
            <div className="truncate text-[17px] font-semibold text-[var(--color-ink-900)]">
              {module.title}
            </div>
          </button>
        )}

        <span className="text-[12px] tabular-nums text-[var(--color-ink-500)]">
          {module.items.length} item{module.items.length === 1 ? "" : "s"}
        </span>
        {!editing ? (
          <>
            <button
              type="button"
              onClick={onAddExam}
              disabled={addingExam}
              aria-label="Add exam to module"
              title={addingExam ? "Creating exam…" : "Add exam"}
              className="text-[var(--color-ink-400)] hover:text-[#3b5bcc] cursor-pointer disabled:cursor-wait disabled:text-[#3b5bcc]"
            >
              {addingExam ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardList className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(module.title);
                setEditing(true);
              }}
              aria-label="Rename module"
              className="text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)] cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete module"
          className="text-[var(--color-ink-400)] hover:text-red-600 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)] cursor-pointer"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {addingExam && (
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2.5 rounded-lg border border-[#3b5bcc]/20 bg-[#d8e3f4]/40 px-3 py-2">
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#3b5bcc]" />
            <span className="shrink-0 text-[12px] font-semibold text-[#3b5bcc]">
              Creating exam…
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#3b5bcc]/15">
              <div className="progress-indeterminate h-full rounded-full bg-[#3b5bcc]" />
            </div>
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="space-y-2 border-t border-[var(--color-ink-200)]/60 px-4 pb-4 pt-4">
          {module.items.length === 0 ? (
            <DropZonePlaceholder
              isOver={isOver}
              message="Drag a resource from the library to start this module"
            />
          ) : (
            <SortableContext
              items={module.items.map((i) => `item-${i.itemID}`)}
              strategy={verticalListSortingStrategy}
            >
              {module.items.map((i) => (
                <SortableItemRow
                  key={i.itemID}
                  item={i}
                  selected={selectedItemID === i.itemID}
                  onSelect={() => onSelectItem(i.itemID)}
                />
              ))}
            </SortableContext>
          )}
          {module.items.length > 0 && (
            <DropZonePlaceholder isOver={isOver} message="Drop another resource here" />
          )}
        </div>
      )}
    </div>
  );
}

export function ModulePreview({
  title,
  itemCount,
}: {
  title: string;
  itemCount: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-mint-500)] bg-white px-6 py-4 shadow-[0_12px_28px_rgba(15,40,30,0.18)]">
      <div className="flex items-center gap-3">
        <GripVertical className="h-5 w-5 text-[var(--color-ink-300)]" />
        <div className="flex-1 truncate text-[17px] font-semibold text-[var(--color-ink-900)]">
          {title}
        </div>
        <span className="text-[12px] tabular-nums text-[var(--color-ink-500)]">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------- item rows ------------------------------ */

function SortableItemRow({
  item,
  selected,
  onSelect,
}: {
  item: ItemDTO;
  selected: boolean;
  onSelect: () => void;
}) {
  const sortable = useSortable({
    id: `item-${item.itemID}`,
    disabled: item.itemID < 0,
  });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={cn(sortable.isDragging && "opacity-50")}
    >
      <ItemRow
        item={item}
        selected={selected}
        onSelect={onSelect}
        dragAttributes={sortable.attributes}
        dragListeners={sortable.listeners}
      />
    </div>
  );
}

function ItemRow({
  item,
  selected,
  onSelect,
  dragAttributes,
  dragListeners,
}: {
  item: ItemDTO;
  selected: boolean;
  onSelect: () => void;
  dragAttributes?: React.HTMLAttributes<HTMLButtonElement>;
  dragListeners?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const kind = itemKind(item);
  const accent = kindAccent(kind);
  const pending = item.itemID < 0;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border bg-white px-4 py-3.5 transition-all",
        pending && "opacity-60",
        selected
          ? "border-[var(--color-mint-500)]/50 bg-[var(--color-tint-green)]/30 ring-2 ring-[var(--color-mint-500)]/20"
          : "border-[var(--color-ink-200)]/60 hover:border-[var(--color-ink-300)] hover:bg-[var(--color-cream-50)]/50"
      )}
    >
      <button
        type="button"
        aria-label="Drag item"
        {...dragAttributes}
        {...dragListeners}
        className={cn(
          "touch-none text-[var(--color-ink-300)] hover:text-[var(--color-ink-500)]",
          pending ? "cursor-wait" : "cursor-grab"
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GripVertical className="h-4 w-4" />
        )}
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 min-w-0 items-center gap-2.5 text-left cursor-pointer"
      >
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
            accent.surface,
            accent.text
          )}
        >
          <KindIcon kind={kind} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium text-[var(--color-ink-900)]">
            {itemTitle(item)}
          </span>
          <span className="block text-[12px] text-[var(--color-ink-500)]">
            {itemMeta(item)}
          </span>
        </span>
      </button>
    </div>
  );
}

export function ItemRowPreview({ item }: { item: ItemDTO }) {
  const accent = kindAccent(itemKind(item));
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--color-mint-500)] bg-white px-4 py-3.5 shadow-[0_12px_28px_rgba(15,40,30,0.18)]">
      <GripVertical className="h-4 w-4 text-[var(--color-ink-300)]" />
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
          accent.surface,
          accent.text
        )}
      >
        <KindIcon kind={itemKind(item)} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-[var(--color-ink-900)]">
          {itemTitle(item)}
        </span>
        <span className="block text-[12px] text-[var(--color-ink-500)]">
          {itemMeta(item)}
        </span>
      </span>
    </div>
  );
}

/* -------------------------------- drop zone ------------------------------ */

export function DropZonePlaceholder({
  isOver,
  message,
}: {
  isOver: boolean;
  message: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border-2 border-dashed px-4 py-4 text-center text-[13px] font-medium transition-all",
        isOver
          ? "border-[var(--color-mint-500)] bg-[var(--color-tint-green)]/40 text-[var(--color-mint-600)] scale-[1.01]"
          : "border-[var(--color-mint-500)]/40 bg-[var(--color-tint-green)]/25 text-[var(--color-mint-600)]"
      )}
    >
      <Plus className="mx-auto mb-1 h-4 w-4 opacity-70" />
      {message}
    </div>
  );
}
