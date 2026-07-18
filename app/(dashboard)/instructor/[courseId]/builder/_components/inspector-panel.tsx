"use client";

import { useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { ExternalLink, Trash2, MousePointerClick } from "lucide-react";
import { publicPosterUrl } from "@/lib/cloudinary";
import { MarkdownViewer } from "@/app/(dashboard)/_components/markdown-viewer";
import { formatBytes } from "@/lib/cloudinary-upload";
import type { CheckDTO, ItemDTO, ModuleDTO } from "./types";
import { itemTitle, itemKind } from "./types";
import { kindAccent, itemMeta } from "./module-card";
import { KnowledgeChecks } from "./check-editor";
import { ExamEditor } from "./exam-editor";
import { ConfirmDeleteDialog } from "@/app/(dashboard)/_components/confirm-delete-dialog";
import type { McqInput, VideoCheckInput } from "../actions";

type CheckHandlers = {
  checks: CheckDTO[];
  onCreateCheck: (
    resourceID: number,
    input: VideoCheckInput
  ) => Promise<string | null>;
  onUpdateCheck: (
    resourceID: number,
    checkID: number,
    input: VideoCheckInput
  ) => Promise<string | null>;
  onDeleteCheck: (resourceID: number, checkID: number) => void;
  onCreateQuestion: (examID: number, input: McqInput) => Promise<string | null>;
  onUpdateQuestion: (
    examID: number,
    questionID: number,
    input: McqInput
  ) => Promise<string | null>;
  onDeleteQuestion: (examID: number, questionID: number) => void;
};

type Props = CheckHandlers & {
  selected: { item: ItemDTO; module: ModuleDTO } | null;
  onRename: (itemID: number, title: string) => void;
  onDetach: (itemID: number) => void;
};

export function InspectorPanel({
  selected,
  onRename,
  onDetach,
  checks,
  onCreateCheck,
  onUpdateCheck,
  onDeleteCheck,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: Props) {
  return (
    <aside className="lg:sticky lg:top-20">
      <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
        {selected ? (
          <SelectedItem
            key={selected.item.itemID}
            item={selected.item}
            module={selected.module}
            onRename={onRename}
            onDetach={onDetach}
            checks={checks}
            onCreateCheck={onCreateCheck}
            onUpdateCheck={onUpdateCheck}
            onDeleteCheck={onDeleteCheck}
            onCreateQuestion={onCreateQuestion}
            onUpdateQuestion={onUpdateQuestion}
            onDeleteQuestion={onDeleteQuestion}
          />
        ) : (
          <div className="py-10 text-center">
            <MousePointerClick className="mx-auto h-6 w-6 text-[var(--color-ink-300)]" />
            <div className="mt-3 text-[14px] font-semibold text-[var(--color-ink-900)]">
              Nothing selected
            </div>
            <p className="mx-auto mt-1 max-w-[240px] text-[12px] leading-relaxed text-[var(--color-ink-500)]">
              Select an item in a module to preview it and edit how it appears
              to learners.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function SelectedItem({
  item,
  module,
  onRename,
  onDetach,
  checks,
  onCreateCheck,
  onUpdateCheck,
  onDeleteCheck,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: CheckHandlers & {
  item: ItemDTO;
  module: ModuleDTO;
  onRename: (itemID: number, title: string) => void;
  onDetach: (itemID: number) => void;
}) {
  const [draft, setDraft] = useState(itemTitle(item));
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const kind = itemKind(item);
  const accent = kindAccent(kind);
  const pending = item.itemID < 0;

  function commit() {
    const clean = draft.trim();
    if (clean && clean !== itemTitle(item)) onRename(item.itemID, clean);
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${accent.surface} ${accent.text}`}
          >
            {accent.label}
          </span>
          <span className="truncate text-[11px] text-[var(--color-ink-500)]">
            in {module.title}
          </span>
        </div>
      </div>

      {/* PREVIEW */}
      {item.resource?.kind === "VIDEO" && (
        <div className="overflow-hidden rounded-xl border border-[var(--color-ink-200)]/60 bg-black">
          <MuxPlayer
            src={item.resource.url}
            poster={publicPosterUrl(item.resource.publicID)}
            streamType="on-demand"
            accentColor="#34c277"
            className="aspect-video w-full"
          />
        </div>
      )}
      {item.resource?.kind === "LECTURE" && (
        <MarkdownViewer url={item.resource.url} />
      )}
      {item.resource?.kind === "FILE" && (
        <div className="rounded-xl border border-[var(--color-ink-200)]/60 bg-[var(--cream-50)]/60 px-4 py-5 text-center">
          <div className="text-[13px] font-semibold text-[var(--color-ink-900)]">
            {item.resource.format?.toUpperCase() ?? "FILE"}
            {item.resource.bytes ? ` · ${formatBytes(item.resource.bytes)}` : ""}
          </div>
          <a
            href={item.resource.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-mint-600)] hover:text-[var(--color-mint-500)] transition-colors"
          >
            Open file
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* DETAILS */}
      <div className="space-y-2">
        <label
          htmlFor="item-title"
          className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-500)]"
        >
          Display title
        </label>
        <input
          id="item-title"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          maxLength={160}
          disabled={pending}
          className="w-full rounded-lg border border-[var(--color-ink-200)] px-3 py-2 text-[13px] text-[var(--color-ink-900)] focus:outline-none focus:border-[var(--color-mint-500)] focus:ring-2 focus:ring-[var(--color-mint-500)]/20 disabled:opacity-60 transition-colors"
        />
        <p className="text-[11px] text-[var(--color-ink-500)]">
          {item.resource
            ? `Source: ${item.resource.title} · ${itemMeta(item)}`
            : itemMeta(item)}
        </p>
      </div>

      {item.resource?.kind === "VIDEO" && (
        <KnowledgeChecks
          resourceID={item.resource.resourceID}
          duration={item.resource.duration}
          checks={checks}
          onCreate={onCreateCheck}
          onUpdate={onUpdateCheck}
          onDelete={onDeleteCheck}
        />
      )}

      {item.exam && (
        <ExamEditor
          exam={item.exam}
          onCreate={onCreateQuestion}
          onUpdate={onUpdateQuestion}
          onDelete={onDeleteQuestion}
        />
      )}

      <button
        type="button"
        onClick={() => {
          if (item.exam) {
            setConfirmingDelete(true);
            return;
          }
          onDetach(item.itemID);
        }}
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors cursor-pointer"
      >
        <Trash2 className="h-4 w-4" />
        {item.exam ? "Delete exam" : "Remove from module"}
      </button>

      {item.exam ? (
        <ConfirmDeleteDialog
          confirm={
            confirmingDelete
              ? {
                  title: `Delete "${itemTitle(item)}"?`,
                  description: `The exam and its ${
                    item.exam.questions.length
                  } question${
                    item.exam.questions.length === 1 ? "" : "s"
                  } will be permanently deleted, including any question images — this can't be undone.`,
                  confirmLabel: "Delete exam",
                }
              : null
          }
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            onDetach(item.itemID);
          }}
        />
      ) : null}
    </div>
  );
}
