/* eslint-disable react-hooks/refs -- dnd-kit's useSortable/useDraggable hooks expose
   stable attributes/listeners/isDragging that are designed to be read in
   render; the rule's general guidance doesn't apply here. */
"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Send,
  ChevronDown,
  ChevronRight,
  Plus,
  GripVertical,
  Play,
  BookOpen,
  Sparkles,
  Dumbbell,
  Trophy,
  MessageCircle,
  Paperclip,
  GraduationCap,
  Type,
  BarChart3,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Sidebar } from "@/app/dashboard/_components/sidebar";
import { cn } from "@/lib/utils";
import {
  BLOCK_LIBRARY,
  blockAccent,
  type Block,
  type BlockType,
  type InstructorCourse,
} from "@/app/learn/_data/instructor-content";

type Props = {
  course: InstructorCourse;
};

const PALETTE_PREFIX = "palette-";
const MODULE_DROP_PREFIX = "module-drop-";

export function CourseBuilderClient({ course }: Props) {
  const [modules, setModules] = useState(course.modules);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [hoverPalette, setHoverPalette] = useState<BlockType | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const idCounter = useRef(1000);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const flat = useMemo(
    () => modules.flatMap((m) => m.blocks.map((b) => ({ ...b, moduleId: m.id }))),
    [modules]
  );
  const selected = flat.find((b) => b.id === selectedBlockId) ?? null;
  const selectedModule = selected ? modules.find((m) => m.id === selected.moduleId) : null;

  function addBlockToLastModule(type: BlockType) {
    insertBlockAt(modules, modules.length - 1, modules.length - 1, makeBlock(type, 1));
  }

  function addModule() {
    setModules((prev) => [
      ...prev,
      {
        id: `m-${++idCounter.current}`,
        title: `Module ${prev.length + 1}`,
        blocks: [],
      },
    ]);
  }

  function toggleCollapse(moduleId: string) {
    setCollapsed((p) => ({ ...p, [moduleId]: !p[moduleId] }));
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    // Case 1: a palette item dropped into a module or onto a block
    if (activeId.startsWith(PALETTE_PREFIX)) {
      const type = activeId.slice(PALETTE_PREFIX.length) as BlockType;
      const target = resolveDropTarget(overId, modules);
      if (!target) return;
      const newBlock = makeBlock(type, target.module.blocks.length + 1);
      setModules((prev) => insertBlockAt(prev, target.moduleIndex, prev[target.moduleIndex].blocks.length, newBlock));
      setSelectedBlockId(newBlock.id);
      return;
    }

    // Case 2: a module reordered
    const moduleIdx = modules.findIndex((m) => m.id === activeId);
    if (moduleIdx >= 0) {
      const overModuleIdx = modules.findIndex((m) => m.id === overId);
      if (overModuleIdx >= 0 && overModuleIdx !== moduleIdx) {
        setModules((prev) => arrayMove(prev, moduleIdx, overModuleIdx));
      }
      return;
    }

    // Case 3: a block moved or reordered
    const from = findBlockLocation(activeId, modules);
    if (!from) return;
    const to = resolveDropTarget(overId, modules);
    if (!to) return;

    if (from.moduleIndex === to.moduleIndex) {
      // Same module — reorder
      const mod = modules[from.moduleIndex];
      const overBlockIdx = mod.blocks.findIndex((b) => b.id === overId);
      if (overBlockIdx < 0) return;
      setModules((prev) => {
        const next = [...prev];
        const mod = { ...next[from.moduleIndex] };
        mod.blocks = arrayMove(mod.blocks, from.blockIndex, overBlockIdx);
        next[from.moduleIndex] = mod;
        return next;
      });
    } else {
      // Cross-module move
      setModules((prev) => {
        const next = [...prev];
        const block = next[from.moduleIndex].blocks[from.blockIndex];
        const fromMod = { ...next[from.moduleIndex] };
        fromMod.blocks = fromMod.blocks.filter((_, i) => i !== from.blockIndex);
        next[from.moduleIndex] = fromMod;
        const toMod = { ...next[to.moduleIndex] };
        const insertAt = to.module.blocks.length;
        toMod.blocks = [
          ...toMod.blocks.slice(0, insertAt),
          block,
          ...toMod.blocks.slice(insertAt),
        ];
        next[to.moduleIndex] = toMod;
        return next;
      });
      setSelectedBlockId(activeId);
    }
  }

  // Build the IDs that the drag overlay and sensor care about.
  const activeItem =
    !activeId
      ? null
      : activeId.startsWith(PALETTE_PREFIX)
      ? {
          kind: "palette" as const,
          type: activeId.slice(PALETTE_PREFIX.length) as BlockType,
        }
      : (() => {
          const mod = modules.find((m) => m.id === activeId);
          if (mod) return { kind: "module" as const, module: mod };
          for (const m of modules) {
            const b = m.blocks.find((x) => x.id === activeId);
            if (b) return { kind: "block" as const, block: b, module: m };
          }
          return null;
        })();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex min-h-screen bg-[var(--cream-50)]">
        <Sidebar />
        <div className="flex-1 min-w-0">
          {/* TOP BAR */}
          <div className="sticky top-0 z-30 border-b border-[var(--color-ink-200)]/60 bg-[var(--cream-50)]/85 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-10 h-16 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  href="/instructor"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-ink-500)] hover:bg-[var(--color-cream-100)] hover:text-[var(--color-ink-900)] transition-colors"
                  aria-label="Back to instructor"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[12px] text-[var(--color-ink-500)]">Courses</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--color-ink-300)]" />
                  <span className="truncate text-[15px] font-semibold text-[var(--color-ink-900)]">
                    {course.title}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      course.status === "draft"
                        ? "bg-[var(--color-tint-tan)] text-[#8a5f25]"
                        : "bg-[var(--color-tint-green)] text-[var(--color-mint-600)]"
                    )}
                  >
                    {course.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/instructor/${course.id}/analytics`}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-[var(--color-ink-200)] bg-white px-3.5 py-2 text-[13px] font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)] transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-ink-200)] bg-white px-4 py-2 text-[13px] font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-mint-500)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-mint-400)] transition-colors cursor-pointer"
                >
                  <span className="h-2 w-2 rounded-full bg-white" />
                  Publish
                </button>
              </div>
            </div>
          </div>

          {/* THREE COLUMNS */}
          <div className="mx-auto max-w-7xl px-10 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_380px] gap-10 items-start">
              {/* LEFT — BLOCK PALETTE */}
              <aside className="lg:sticky lg:top-20">
                <SectionLabel>Drag in blocks</SectionLabel>
                <div className="mt-3 space-y-1.5">
                  {BLOCK_LIBRARY.map((b) => (
                    <PaletteItemButton
                      key={b.type}
                      type={b.type}
                      label={b.label}
                      description={b.description}
                      isHovered={hoverPalette === b.type}
                      onHoverChange={setHoverPalette}
                      onClick={() => addBlockToLastModule(b.type)}
                    />
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-ink-400)]">
                  Drag a block into a module, or click to append to the last
                  module. Drag handles show where you can move things.
                </p>
              </aside>

              {/* MIDDLE — CANVAS */}
              <main>
                <SectionLabel>Canvas</SectionLabel>
                <div className="mt-3 space-y-5">
                  {modules.length === 0 ? (
                    <EmptyCanvas onAddModule={addModule} />
                  ) : (
                    <SortableContext
                      items={modules.map((m) => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {modules.map((module) => (
                        <SortableModuleCard
                          key={module.id}
                          title={module.title}
                          moduleId={module.id}
                          blocks={module.blocks}
                          collapsed={!!collapsed[module.id]}
                          onToggle={() => toggleCollapse(module.id)}
                          selectedBlockId={selectedBlockId}
                          onSelectBlock={setSelectedBlockId}
                        />
                      ))}
                    </SortableContext>
                  )}

                  {/* Add module button */}
                  <button
                    type="button"
                    onClick={addModule}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-ink-200)] bg-white/60 px-6 py-6 text-[14px] font-semibold text-[var(--color-ink-500)] transition-colors hover:border-[var(--color-mint-500)]/50 hover:bg-[var(--color-tint-green)]/30 hover:text-[var(--color-mint-600)] cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                    Add module
                  </button>
                </div>
              </main>

              {/* RIGHT — SETTINGS */}
              <aside className="lg:sticky lg:top-20">
                <SectionLabel>Block settings</SectionLabel>
                {selected ? (
                  <SettingsPanel
                    key={selected.id}
                    block={selected}
                    moduleTitle={selectedModule?.title ?? "Module"}
                  />
                ) : (
                  <EmptySettings />
                )}
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* DRAG OVERLAY — the floating preview of what's being dragged */}
      <DragOverlay dropAnimation={null}>
        {activeItem?.kind === "palette" ? (
          <PalettePreview type={activeItem.type} />
        ) : activeItem?.kind === "block" ? (
          <BlockRowPreview block={activeItem.block} />
        ) : activeItem?.kind === "module" ? (
          <ModulePreview title={activeItem.module.title} blockCount={activeItem.module.blocks.length} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/* -------------------------------------------------------------------------- */
/* PALETTE — draggable source items                                            */
/* -------------------------------------------------------------------------- */

function PaletteItemButton({
  type,
  label,
  description,
  isHovered,
  onHoverChange,
  onClick,
}: {
  type: BlockType;
  label: string;
  description: string;
  isHovered: boolean;
  onHoverChange: (t: BlockType | null) => void;
  onClick: () => void;
}) {
  const id = `${PALETTE_PREFIX}${type}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggableItem(id);

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHoverChange(type)}
      onMouseLeave={() => onHoverChange(null)}
      {...listeners}
      {...attributes}
      title={description}
      className={cn(
        "group flex w-full cursor-grab items-center gap-3 rounded-lg border bg-white px-4 py-3.5 text-left transition-all touch-none",
        "hover:shadow-[0_2px_6px_rgba(15,40,30,0.08)] hover:-translate-y-0.5",
        isHovered
          ? "border-[var(--color-mint-500)]/50 ring-2 ring-[var(--color-mint-500)]/20"
          : "border-[var(--color-ink-200)]/60",
        isDragging && "opacity-30"
      )}
    >
      <GripVertical className="h-5 w-5 text-[var(--color-ink-300)] group-hover:text-[var(--color-ink-500)]" />
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
          blockAccent(type).surface,
          blockAccent(type).text
        )}
      >
        <BlockIcon type={type} />
      </span>
      <span className="text-[14px] font-semibold text-[var(--color-ink-900)]">{label}</span>
    </button>
  );
}

function PalettePreview({ type }: { type: BlockType }) {
  const accent = blockAccent(type);
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-[var(--color-mint-500)] bg-white px-3.5 py-3 shadow-[0_12px_28px_rgba(15,40,30,0.18)]"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
          accent.surface,
          accent.text
        )}
      >
        <BlockIcon type={type} />
      </span>
      <span className="text-[14px] font-semibold text-[var(--color-ink-900)]">
        {labelFor(type)}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MODULES — sortable items + drop zones                                       */
/* -------------------------------------------------------------------------- */

function SortableModuleCard({
  moduleId,
  title,
  blocks,
  collapsed,
  onToggle,
  selectedBlockId,
  onSelectBlock,
}: {
  title: string;
  moduleId: string;
  blocks: Block[];
  collapsed: boolean;
  onToggle: () => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
}) {
  const sortable = useSortable({ id: moduleId });
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
        moduleId={moduleId}
         title={title}
         blocks={blocks}
         collapsed={collapsed}
         onToggle={onToggle}
         selectedBlockId={selectedBlockId}
         onSelectBlock={onSelectBlock}
         dragAttributes={sortable.attributes}
         dragListeners={sortable.listeners}
       />
     </div>
  );
}

function ModuleCard({
  moduleId,
  title,
  blocks,
  collapsed,
  onToggle,
  selectedBlockId,
  onSelectBlock,
  dragAttributes,
  dragListeners,
}: {
  title: string;
  moduleId: string;
  blocks: Block[];
  collapsed: boolean;
  onToggle: () => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  dragAttributes?: React.HTMLAttributes<HTMLButtonElement>;
  dragListeners?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `${MODULE_DROP_PREFIX}${moduleId}`,
  });

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
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 min-w-0 text-left cursor-pointer"
        >
          <div className="truncate text-[17px] font-semibold text-[var(--color-ink-900)]">
            {title}
          </div>
        </button>
        <span className="text-[12px] tabular-nums text-[var(--color-ink-500)]">
          {blocks.length} block{blocks.length === 1 ? "" : "s"}
        </span>
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
        <div className="space-y-2 border-t border-[var(--color-ink-200)]/60 px-4 pb-4 pt-4">
          {blocks.length === 0 ? (
            <DropZonePlaceholder
              isOver={isOver}
              message="Drop a block here to start this module"
            />
          ) : (
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((b) => (
                <SortableBlockRow
                  key={b.id}
                  block={b}
                  selected={selectedBlockId === b.id}
                  onSelect={() => onSelectBlock(b.id)}
                />
              ))}
            </SortableContext>
          )}
          {blocks.length > 0 && (
            <DropZonePlaceholder
              isOver={isOver}
              message={`Drop another block — ${nextBlockHint(blocks[blocks.length - 1])}`}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ModulePreview({
  title,
  blockCount,
}: {
  title: string;
  blockCount: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-mint-500)] bg-white px-6 py-4 shadow-[0_12px_28px_rgba(15,40,30,0.18)]">
      <div className="flex items-center gap-3">
        <GripVertical className="h-5 w-5 text-[var(--color-ink-300)]" />
        <div className="flex-1 truncate text-[17px] font-semibold text-[var(--color-ink-900)]">
          {title}
        </div>
        <span className="text-[12px] tabular-nums text-[var(--color-ink-500)]">
          {blockCount} block{blockCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* BLOCKS — sortable inside their module                                       */
/* -------------------------------------------------------------------------- */

function SortableBlockRow({
  block,
  selected,
  onSelect,
}: {
  block: Block;
  selected: boolean;
  onSelect: () => void;
}) {
  const sortable = useSortable({ id: block.id });
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
      <BlockRow
        block={block}
        selected={selected}
        onSelect={onSelect}
        dragAttributes={sortable.attributes}
        dragListeners={sortable.listeners}
      />
    </div>
  );
}

function BlockRow({
  block,
  selected,
  onSelect,
  dragAttributes,
  dragListeners,
}: {
  block: Block;
  selected: boolean;
  onSelect: () => void;
  dragAttributes?: React.HTMLAttributes<HTMLButtonElement>;
  dragListeners?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const accent = blockAccent(block.type);
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border bg-white px-4 py-3.5 transition-all",
        selected
          ? "border-[var(--color-mint-500)]/50 bg-[var(--color-tint-green)]/30 ring-2 ring-[var(--color-mint-500)]/20"
          : "border-[var(--color-ink-200)]/60 hover:border-[var(--color-ink-300)] hover:bg-[var(--color-cream-50)]/50"
      )}
    >
      <button
        type="button"
        aria-label="Drag block"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        {...dragAttributes}
        {...dragListeners}
        className="cursor-grab touch-none text-[var(--color-ink-300)] hover:text-[var(--color-ink-500)]"
      >
        <GripVertical className="h-4 w-4" />
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
          <BlockIcon type={block.type} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium text-[var(--color-ink-900)]">
            {block.title}
          </span>
          <span className="block text-[12px] text-[var(--color-ink-500)]">
            {labelFor(block.type)}
            {block.durationMin ? ` · ${block.durationMin}m` : ""}
            {block.questionCount ? ` · ${block.questionCount}Q` : ""}
            {block.required ? " · required" : ""}
          </span>
        </span>
      </button>
    </div>
  );
}

function BlockRowPreview({ block }: { block: Block }) {
  const accent = blockAccent(block.type);
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
        <BlockIcon type={block.type} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-[var(--color-ink-900)]">
          {block.title}
        </span>
        <span className="block text-[12px] text-[var(--color-ink-500)]">
          {labelFor(block.type)}
        </span>
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DROP ZONES                                                                 */
/* -------------------------------------------------------------------------- */

function DropZonePlaceholder({
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

/* -------------------------------------------------------------------------- */
/* SETTINGS PANEL                                                             */
/* -------------------------------------------------------------------------- */

function SettingsPanel({
  block,
  moduleTitle,
}: {
  block: Block & { moduleId: string };
  moduleTitle: string;
}) {
  const accent = blockAccent(block.type);
  return (
    <div className="mt-3 space-y-4">
      <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-7 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md",
              accent.surface,
              accent.text
            )}
          >
            <BlockIcon type={block.type} />
          </span>
          <span className="text-[13px] font-semibold uppercase tracking-wider text-[var(--color-mint-600)]">
            {labelFor(block.type)} block
          </span>
        </div>
        <p className="mt-1.5 text-[13px] text-[var(--color-ink-500)]">
          in {moduleTitle}
        </p>

        <div className="mt-6 space-y-4">
          <Field label="Title">
            <input
              type="text"
              defaultValue={block.title}
                className="w-full rounded-md border border-[var(--color-ink-200)] bg-white px-3.5 py-2.5 text-[15px] text-[var(--color-ink-900)] focus:border-[var(--color-forest-900)] focus:outline-none focus:ring-3 focus:ring-[var(--color-forest-900)]/10"
            />
          </Field>

          {block.type === "video" && (
            <>
              <Field label="Video">
                <div className="rounded-md border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-50)]/40 px-3 py-8 text-center">
                  <div className="text-[14px] font-semibold text-[var(--color-ink-700)]">
                    Drag video file here
                  </div>
                  <div className="mt-1 text-[12px] text-[var(--color-ink-500)]">
                    MP4 up to 4GB · or paste a link
                  </div>
                </div>
              </Field>

              <ToggleRow
                label="Required to advance"
                description="Learners must complete this block before moving on."
                defaultOn={!!block.required}
              />
              <ToggleRow
                label="Add knowledge check"
                description="Insert an inline question at the end of this video."
              />
            </>
          )}

          {block.type === "reading" && (
            <Field label="Body">
              <textarea
                rows={4}
                placeholder="Markdown supported"
                className="w-full rounded-md border border-[var(--color-ink-200)] bg-white px-3.5 py-2.5 text-[15px] text-[var(--color-ink-900)] focus:border-[var(--color-forest-900)] focus:outline-none focus:ring-3 focus:ring-[var(--color-forest-900)]/10"
              />
            </Field>
          )}

          {block.type === "mastery" && (
            <>
              <Field label="Questions">
                <div className="rounded-md border border-[var(--color-ink-200)] bg-white px-3.5 py-2.5 text-[13px] text-[var(--color-ink-500)]">
                  {block.questionCount ?? 0} questions · pass at 80%
                </div>
              </Field>
              <Field label="Add questions from the question bank">
                <button
                  type="button"
                  className="w-full rounded-md border border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-50)]/40 px-3.5 py-2.5 text-[13px] font-semibold text-[var(--color-ink-500)] hover:border-[var(--color-mint-500)]/50 hover:text-[var(--color-mint-600)] transition-colors cursor-pointer"
                >
                  + Pick from bank
                </button>
              </Field>
            </>
          )}

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center rounded-md border border-[var(--color-ink-200)] bg-white px-4 py-3.5 text-[14px] font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer"
            >
              Save draft
            </button>
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--color-mint-500)] px-4 py-3.5 text-[14px] font-semibold text-white hover:bg-[var(--color-mint-400)] transition-colors cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              Add to course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptySettings() {
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-[var(--color-ink-200)] bg-white/60 px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-cream-100)] text-[var(--color-ink-400)]">
        <Type className="h-5 w-5" />
      </div>
      <p className="mt-4 text-[14px] font-semibold text-[var(--color-ink-700)]">
        No block selected
      </p>
      <p className="mt-1.5 text-[13px] text-[var(--color-ink-500)]">
        Click a block in the canvas to edit its title, video, toggles, and
        attached resources.
      </p>
    </div>
  );
}

function EmptyCanvas({ onAddModule }: { onAddModule: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[var(--color-ink-200)] bg-white/60 px-6 py-20 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-cream-100)] text-[var(--color-ink-500)]">
        <Plus className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-[17px] font-semibold text-[var(--color-ink-900)]">
        Start by adding a module
      </h3>
      <p className="mt-2 text-[13px] text-[var(--color-ink-500)]">
        Modules group related lessons. You can reorder them later by
        dragging.
      </p>
      <button
        type="button"
        onClick={onAddModule}
        className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-[var(--color-mint-500)] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[var(--color-mint-400)] transition-colors cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Add your first module
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SMALL PIECES                                                               */
/* -------------------------------------------------------------------------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-500)]">
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ToggleRow({
  label,
  description,
  defaultOn,
}: {
  label: string;
  description: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-[var(--color-cream-50)]/40 p-3.5">
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
          {label}
        </div>
        <div className="text-[12px] text-[var(--color-ink-500)]">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        role="switch"
        aria-checked={on}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors cursor-pointer",
          on ? "bg-[var(--color-mint-500)]" : "bg-[var(--color-ink-200)]"
        )}
      >
        <span
          className={cn(
            "inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform",
            on ? "translate-x-6" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

function BlockIcon({ type }: { type: BlockType }) {
  const cls = "h-5 w-5";
  switch (type) {
    case "video":
      return <Play className={cls} />;
    case "reading":
      return <BookOpen className={cls} />;
    case "knowledge-check":
      return <Sparkles className={cls} />;
    case "practice-set":
      return <Dumbbell className={cls} />;
    case "mastery":
      return <Trophy className={cls} />;
    case "discussion":
      return <MessageCircle className={cls} />;
    case "resource":
      return <Paperclip className={cls} />;
    case "capstone":
      return <GraduationCap className={cls} />;
  }
}

function labelFor(type: BlockType): string {
  switch (type) {
    case "video":
      return "Video";
    case "reading":
      return "Reading";
    case "knowledge-check":
      return "Knowledge check";
    case "practice-set":
      return "Practice set";
    case "mastery":
      return "Mastery check";
    case "discussion":
      return "Discussion";
    case "resource":
      return "Resource";
    case "capstone":
      return "Capstone";
  }
}

function nextBlockHint(prev: Block | undefined): string {
  if (!prev) return "any block works here";
  switch (prev.type) {
    case "video":
      return "try a Reading or Knowledge check next";
    case "reading":
      return "a Practice set reinforces what was just read";
    case "knowledge-check":
      return "a Reading before the check helps retention";
    case "practice-set":
      return "wrap the module with a Mastery check";
    case "mastery":
      return "this unlocks the next module — no need to add more here";
    case "discussion":
      return "let the conversation breathe";
    case "resource":
      return "consider a Practice set to apply what was shared";
    case "capstone":
      return "the track ends here";
  }
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

/** Find where a block currently lives. */
function findBlockLocation(
  blockId: string,
  modules: InstructorCourse["modules"]
): { moduleIndex: number; blockIndex: number } | null {
  for (let m = 0; m < modules.length; m++) {
    const b = modules[m].blocks.findIndex((x) => x.id === blockId);
    if (b >= 0) return { moduleIndex: m, blockIndex: b };
  }
  return null;
}

/** Resolve a drop target to a module + position. The target id can be:
 *  - a block id (insert before it within its module)
 *  - a module drop-zone id (insert at end of that module)
 *  - a module id (insert at end of that module — same as the drop zone)
 */
function resolveDropTarget(
  overId: string,
  modules: InstructorCourse["modules"]
): { moduleIndex: number; module: InstructorCourse["modules"][number] } | null {
  if (overId.startsWith(MODULE_DROP_PREFIX)) {
    const moduleId = overId.slice(MODULE_DROP_PREFIX.length);
    const idx = modules.findIndex((m) => m.id === moduleId);
    if (idx < 0) return null;
    return { moduleIndex: idx, module: modules[idx] };
  }
  // Try as block id first
  const blockLoc = findBlockLocation(overId, modules);
  if (blockLoc) {
    return {
      moduleIndex: blockLoc.moduleIndex,
      module: modules[blockLoc.moduleIndex],
    };
  }
  // Try as module id
  const idx = modules.findIndex((m) => m.id === overId);
  if (idx < 0) return null;
  return { moduleIndex: idx, module: modules[idx] };
}

/** Insert a block at a given position in a given module of a new array. */
function insertBlockAt(
  modules: InstructorCourse["modules"],
  moduleIndex: number,
  blockIndex: number,
  block: Block
): InstructorCourse["modules"] {
  const next = modules.map((m) => ({ ...m, blocks: [...m.blocks] }));
  if (moduleIndex < 0 || moduleIndex >= next.length) return modules;
  const target = next[moduleIndex];
  const at = Math.max(0, Math.min(blockIndex, target.blocks.length));
  target.blocks = [...target.blocks.slice(0, at), block, ...target.blocks.slice(at)];
  return next;
}

function makeBlock(type: BlockType, ordinal?: number, id?: number): Block {
  return {
    id: id ? `b-${id}` : `b-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title: defaultTitle(type, ordinal),
    durationMin: type === "video" ? 6 : type === "reading" ? 4 : undefined,
    questionCount:
      type === "practice-set" ? 8 : type === "mastery" ? 6 : undefined,
    required: type === "video" || type === "mastery",
  };
}

function defaultTitle(type: BlockType, ordinal?: number): string {
  const ord = ordinal ? ` ${ordinal}` : "";
  switch (type) {
    case "video":
      return `New video${ord}`;
    case "reading":
      return `New reading${ord}`;
    case "knowledge-check":
      return `Knowledge check${ord}`;
    case "practice-set":
      return `Practice set${ord}`;
    case "mastery":
      return `Mastery check${ord}`;
    case "discussion":
      return `Discussion${ord}`;
    case "resource":
      return `Resource${ord}`;
    case "capstone":
      return `Capstone${ord}`;
  }
}

/* -------------------------------------------------------------------------- */
/* dnd-kit hooks wrapper — keep imports tidy                                    */
/* -------------------------------------------------------------------------- */

function useDraggableItem(id: string) {
  return useDraggable({ id });
}
