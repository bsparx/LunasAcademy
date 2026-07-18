"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Zap, ImageIcon } from "lucide-react";
import type { CheckDTO } from "./types";
import type { VideoCheckInput } from "../actions";
import { McqForm } from "./mcq-form";

export function formatCheckTime(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Accepts "90", "1:30", or "1:02:05" and returns seconds (or null). */
function parseCheckTime(raw: string): number | null {
  const clean = raw.trim();
  if (!clean) return null;
  if (/^\d+$/.test(clean)) return Number(clean);
  const parts = clean.split(":");
  if (parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null;
  return parts.reduce((acc, p) => acc * 60 + Number(p), 0);
}

type Props = {
  resourceID: number;
  duration: number | null;
  checks: CheckDTO[];
  onCreate: (resourceID: number, input: VideoCheckInput) => Promise<string | null>;
  onUpdate: (
    resourceID: number,
    checkID: number,
    input: VideoCheckInput
  ) => Promise<string | null>;
  onDelete: (resourceID: number, checkID: number) => void;
};

export function KnowledgeChecks({
  resourceID,
  duration,
  checks,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  // null = list view; -1 = creating; otherwise checkID being edited
  const [editing, setEditing] = useState<number | null>(null);

  const editingCheck =
    editing !== null && editing !== -1
      ? checks.find((c) => c.checkID === editing) ?? null
      : null;

  return (
    <div className="space-y-2 border-t border-[var(--color-ink-200)]/60 pt-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
          <Zap className="h-3.5 w-3.5 text-[#8a5f25]" />
          Knowledge checks
        </span>
        {editing === null && (
          <button
            type="button"
            onClick={() => setEditing(-1)}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--color-mint-600)] hover:text-[var(--color-mint-500)] transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-[var(--color-ink-500)]">
        Pop-up questions that pause the video at a set time.
      </p>

      {editing !== null ? (
        <CheckForm
          key={editing}
          duration={duration}
          initial={editingCheck}
          onCancel={() => setEditing(null)}
          onSave={async (input) => {
            const error = editingCheck
              ? await onUpdate(resourceID, editingCheck.checkID, input)
              : await onCreate(resourceID, input);
            if (!error) setEditing(null);
            return error;
          }}
        />
      ) : checks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--color-ink-200)] bg-[var(--cream-50)]/60 px-3 py-3 text-center text-[11px] text-[var(--color-ink-500)]">
          No checks yet.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {checks.map((c) => (
            <li
              key={c.checkID}
              className="group flex items-center gap-2 rounded-lg border border-[var(--color-ink-200)]/60 bg-white px-2.5 py-2"
            >
              <span className="shrink-0 rounded bg-[var(--color-tint-tan)]/60 px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums text-[#8a5f25]">
                {formatCheckTime(c.timeSec)}
              </span>
              {c.imageURL ? (
                <ImageIcon className="h-3 w-3 shrink-0 text-[var(--color-ink-400)]" />
              ) : null}
              <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--color-ink-900)]">
                {c.question}
              </span>
              <span className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setEditing(c.checkID)}
                  aria-label="Edit check"
                  className="text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)] cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(resourceID, c.checkID)}
                  aria-label="Delete check"
                  className="text-[var(--color-ink-400)] hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CheckForm({
  duration,
  initial,
  onSave,
  onCancel,
}: {
  duration: number | null;
  initial: CheckDTO | null;
  onSave: (input: VideoCheckInput) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [time, setTime] = useState(
    initial ? formatCheckTime(initial.timeSec) : ""
  );

  return (
    <McqForm
      initial={
        initial
          ? {
              question: initial.question,
              options: initial.options,
              correctIndices: initial.correctIndices,
              image:
                initial.imageURL && initial.imagePublicID
                  ? { url: initial.imageURL, publicID: initial.imagePublicID }
                  : null,
            }
          : null
      }
      saveLabel={initial ? "Save check" : "Add check"}
      onCancel={onCancel}
      onSave={async (value) => {
        const timeSec = parseCheckTime(time);
        if (timeSec === null) {
          return "Enter the time as m:ss or seconds, e.g. 1:30.";
        }
        if (duration && timeSec >= duration) {
          return `The video is only ${formatCheckTime(duration)} long — pick an earlier time.`;
        }
        return onSave({
          timeSec,
          question: value.question,
          options: value.options,
          correctIndices: value.correctIndices,
          imageURL: value.image?.url ?? null,
          imagePublicID: value.image?.publicID ?? null,
        });
      }}
    >
      <div className="flex items-center gap-2">
        <label
          htmlFor="check-time"
          className="text-[11px] font-semibold text-[var(--color-ink-700)]"
        >
          Pauses at
        </label>
        <input
          id="check-time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="1:30"
          className="w-20 rounded-md border border-[var(--color-ink-200)] bg-white px-2 py-1.5 text-center font-mono text-[12px] tabular-nums text-[var(--color-ink-900)] focus:outline-none focus:border-[var(--color-mint-500)] transition-colors"
        />
        {duration ? (
          <span className="text-[10px] text-[var(--color-ink-400)]">
            of {formatCheckTime(duration)}
          </span>
        ) : null}
      </div>
    </McqForm>
  );
}
