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
  Check,
} from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { TopicDTO } from "./types";
import { SortableModuleCard, DropZonePlaceholder } from "./module-card";

type TopicCardProps = {
  topic: TopicDTO;
  collapsed: boolean;
  onToggle: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onAddModule: () => void;
  addingModule: boolean;
  collapsedModules: Record<number, boolean>;
  onToggleModule: (moduleID: number) => void;
  selectedItemID: number | null;
  onSelectItem: (id: number) => void;
  onRenameModule: (moduleID: number, title: string) => void;
  onDeleteModule: (moduleID: number) => void;
  onAddExam: (moduleID: number) => void;
  addingExamModuleID: number | null;
};

export function SortableTopicCard(props: TopicCardProps) {
  const sortable = useSortable({ id: `topic-${props.topic.topicID}` });
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
      <TopicCard
        {...props}
        dragAttributes={sortable.attributes}
        dragListeners={sortable.listeners}
      />
    </div>
  );
}

function TopicCard({
  topic,
  collapsed,
  onToggle,
  onRename,
  onDelete,
  onAddModule,
  addingModule,
  collapsedModules,
  onToggleModule,
  selectedItemID,
  onSelectItem,
  onRenameModule,
  onDeleteModule,
  onAddExam,
  addingExamModuleID,
  dragAttributes,
  dragListeners,
}: TopicCardProps & {
  dragAttributes?: React.HTMLAttributes<HTMLButtonElement>;
  dragListeners?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `topicdrop-${topic.topicID}` });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(topic.title);

  function commitRename() {
    setEditing(false);
    const clean = draft.trim();
    if (clean && clean !== topic.title) onRename(clean);
    else setDraft(topic.title);
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl border-2 bg-[var(--cream-50)]/40 shadow-[0_1px_3px_rgba(15,40,30,0.05)] transition-colors",
        isOver
          ? "border-[var(--color-mint-500)] ring-2 ring-[var(--color-mint-500)]/20"
          : "border-[var(--color-ink-200)]"
      )}
    >
      <div className="flex items-center gap-3 px-6 py-4">
        <button
          type="button"
          aria-label="Drag topic"
          {...dragAttributes}
          {...dragListeners}
          className="cursor-grab touch-none text-[var(--color-ink-300)] hover:text-[var(--color-ink-500)]"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <span className="shrink-0 rounded-full bg-[var(--color-forest-900)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Topic
        </span>

        {editing ? (
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setDraft(topic.title);
                  setEditing(false);
                }
              }}
              onBlur={commitRename}
              maxLength={120}
              className="flex-1 min-w-0 rounded-md border border-[var(--color-mint-500)]/60 px-2 py-1 text-[17px] font-bold text-[var(--color-ink-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-500)]/20"
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
            <div className="truncate text-[18px] font-bold text-[var(--color-ink-900)]">
              {topic.title}
            </div>
          </button>
        )}

        <span className="text-[12px] tabular-nums text-[var(--color-ink-500)]">
          {topic.modules.length} module{topic.modules.length === 1 ? "" : "s"}
        </span>
        {!editing ? (
          <>
            <button
              type="button"
              onClick={onAddModule}
              disabled={addingModule}
              aria-label="Add module to topic"
              title={addingModule ? "Adding module…" : "Add module"}
              className="text-[var(--color-ink-400)] hover:text-[var(--color-mint-600)] cursor-pointer disabled:cursor-wait disabled:text-[var(--color-mint-600)]"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(topic.title);
                setEditing(true);
              }}
              aria-label="Rename topic"
              className="text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)] cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete topic"
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

      {!collapsed && (
        <div className="space-y-3 border-t border-[var(--color-ink-200)] px-4 pb-4 pt-4">
          {topic.modules.length === 0 ? (
            <DropZonePlaceholder
              isOver={isOver}
              message="Drag a module here, or add one to start this topic"
            />
          ) : (
            <SortableContext
              items={topic.modules.map((m) => `mod-${m.moduleID}`)}
              strategy={verticalListSortingStrategy}
            >
              {topic.modules.map((m) => (
                <SortableModuleCard
                  key={m.moduleID}
                  module={m}
                  collapsed={!!collapsedModules[m.moduleID]}
                  onToggle={() => onToggleModule(m.moduleID)}
                  selectedItemID={selectedItemID}
                  onSelectItem={onSelectItem}
                  onRename={(title) => onRenameModule(m.moduleID, title)}
                  onDelete={() => onDeleteModule(m.moduleID)}
                  onAddExam={() => onAddExam(m.moduleID)}
                  addingExam={addingExamModuleID === m.moduleID}
                />
              ))}
            </SortableContext>
          )}
        </div>
      )}
    </div>
  );
}

export function TopicPreview({
  title,
  moduleCount,
}: {
  title: string;
  moduleCount: number;
}) {
  return (
    <div className="rounded-2xl border-2 border-[var(--color-mint-500)] bg-[var(--cream-50)] px-6 py-4 shadow-[0_12px_28px_rgba(15,40,30,0.18)]">
      <div className="flex items-center gap-3">
        <GripVertical className="h-5 w-5 text-[var(--color-ink-300)]" />
        <span className="shrink-0 rounded-full bg-[var(--color-forest-900)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Topic
        </span>
        <div className="flex-1 truncate text-[18px] font-bold text-[var(--color-ink-900)]">
          {title}
        </div>
        <span className="text-[12px] tabular-nums text-[var(--color-ink-500)]">
          {moduleCount} module{moduleCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
