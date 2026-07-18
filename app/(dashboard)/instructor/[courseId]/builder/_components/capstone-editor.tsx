"use client";

import { useState } from "react";
import {
  Award,
  Check,
  ExternalLink,
  File as FileIcon,
  GraduationCap,
  ListChecks,
  Loader2,
  Package,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/cloudinary-upload";
import type { CapstoneDTO, CapstoneResourceDTO } from "./types";
import type { CapstoneInput } from "../actions";
import { useCapstoneResourceUploads } from "./use-capstone-resource-uploads";

/* Capstone = end-of-course project. Ore amber (#c2871e) is the brand accent
   for capstones & certificates. */

const AMBER = "#c2871e";
const AMBER_DARK = "#8a5f25";

type Props = {
  capstone: CapstoneDTO | null;
  /** Returns an error to display, or null on success. */
  onSave: (input: CapstoneInput) => Promise<string | null>;
  onDelete: () => void;
  onResourceUploaded: (resource: CapstoneResourceDTO) => void;
  onResourceDelete: (resource: CapstoneResourceDTO) => void;
  deletingResourceIDs: Set<number>;
};

export function CapstoneCard({
  capstone,
  onSave,
  onDelete,
  onResourceUploaded,
  onResourceDelete,
  deletingResourceIDs,
}: Props) {
  const [editing, setEditing] = useState(false);

  if (!editing && !capstone) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#c2871e]/35 bg-[#c2871e]/[0.05] px-6 py-8 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#c2871e]/15 text-[#c2871e]">
          <GraduationCap className="h-5.5 w-5.5" />
        </span>
        <div className="mt-3 text-[15px] font-semibold text-[var(--color-ink-900)]">
          Capstone project
        </div>
        <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-[var(--color-ink-500)]">
          Optional end-of-course project. Students upload their work, and it is
          reviewed by humans against a grading rubric you define.
        </p>
        <Button
          onClick={() => setEditing(true)}
          className="mt-4 bg-[#c2871e] text-white hover:bg-[#a8741a]"
        >
          <Plus data-icon="inline-start" />
          Add capstone project
        </Button>
      </div>
    );
  }

  if (editing) {
    return (
      <CapstoneForm
        capstone={capstone}
        onSave={async (input) => {
          const err = await onSave(input);
          if (!err) setEditing(false);
          return err;
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  // capstone is set and we're not editing
  const c = capstone!;
  return (
    <div className="overflow-hidden rounded-2xl border border-[#c2871e]/30 bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <div className="flex items-center gap-3 border-b border-[#c2871e]/20 bg-[#c2871e]/[0.07] px-6 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c2871e] text-white">
          <GraduationCap className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a5f25]">
            Capstone project
          </div>
          <h3 className="truncate text-[15.5px] font-semibold text-[var(--color-ink-900)]">
            {c.title}
          </h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--color-ink-500)] ring-1 ring-[var(--color-ink-200)]/70">
          <Users className="h-3 w-3" />
          {c.submissionCount}{" "}
          {c.submissionCount === 1 ? "submission" : "submissions"}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Edit capstone"
          onClick={() => setEditing(true)}
          className="text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)]"
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete capstone"
          onClick={onDelete}
          className="text-[var(--color-ink-400)] hover:text-red-600"
        >
          <Trash2 />
        </Button>
      </div>

      <div className="space-y-4 px-6 py-5">
        <p className="text-[13px] leading-relaxed text-[var(--color-ink-700)]">
          {c.brief}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
              <Package className="h-3.5 w-3.5 text-[#c2871e]" />
              Deliverables
            </div>
            <ul className="mt-2 space-y-1.5">
              {c.deliverables.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-2 text-[12.5px] text-[var(--color-ink-700)]"
                >
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c2871e]"
                    strokeWidth={3}
                  />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
              <ListChecks className="h-3.5 w-3.5 text-[#c2871e]" />
              Grading rubric
            </div>
            <ul className="mt-2 space-y-1.5">
              {c.criteria.map((cr, i) => (
                <li
                  key={cr}
                  className="flex items-start gap-2 text-[12.5px] text-[var(--color-ink-700)]"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#c2871e]/15 text-[9px] font-bold text-[#8a5f25]">
                    {i + 1}
                  </span>
                  {cr}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-500)]">
          <Award className="h-3.5 w-3.5 text-[#c2871e]" />
          Submissions are reviewed by humans and graded against this rubric.
        </p>
      </div>

      <ResourcesSection
        capstone={c}
        onUploaded={onResourceUploaded}
        onDelete={onResourceDelete}
        deletingResourceIDs={deletingResourceIDs}
      />
    </div>
  );
}

/* ------------------------------- resources -------------------------------- */

function ResourcesSection({
  capstone,
  onUploaded,
  onDelete,
  deletingResourceIDs,
}: {
  capstone: CapstoneDTO;
  onUploaded: (resource: CapstoneResourceDTO) => void;
  onDelete: (resource: CapstoneResourceDTO) => void;
  deletingResourceIDs: Set<number>;
}) {
  const [dragOver, setDragOver] = useState(false);
  const { entries, handleFiles, dismiss } = useCapstoneResourceUploads(
    capstone.capstoneID,
    onUploaded
  );

  return (
    <div className="space-y-3 border-t border-[var(--color-ink-200)]/50 px-6 py-5">
      <div>
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
          <Paperclip className="h-3.5 w-3.5 text-[#c2871e]" />
          Resources for students
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-500)]">
          Reference files students can download alongside the brief — specs,
          datasets, templates.
        </p>
      </div>

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
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all",
          dragOver
            ? "border-[#c2871e] bg-[#c2871e]/10 scale-[1.01]"
            : "border-[#c2871e]/35 bg-[#c2871e]/[0.04] hover:border-[#c2871e]/60"
        )}
      >
        <UploadCloud
          className={cn("h-5 w-5", dragOver ? "text-[#c2871e]" : "text-[#8a5f25]/70")}
        />
        <span className="text-[12.5px] font-semibold text-[var(--color-ink-900)]">
          Drop files or click to upload
        </span>
        <span className="text-[11px] text-[var(--color-ink-500)]">
          PDFs, docs, spreadsheets, slides, zips
        </span>
        <input
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.md,.markdown"
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map((u) => (
            <li
              key={u.id}
              className="rounded-lg border border-[var(--color-ink-200)]/60 bg-white px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                {u.status === "error" ? (
                  <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" />
                ) : (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#c2871e]" />
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
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {capstone.resources.length > 0 && (
        <ul className="space-y-1.5">
          {capstone.resources.map((r) => {
            const deleting = deletingResourceIDs.has(r.resourceID);
            return (
              <li
                key={r.resourceID}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2 transition-colors",
                  deleting
                    ? "border-red-200 bg-red-50/60"
                    : "border-[var(--color-ink-200)]/60 hover:border-[#c2871e]/40"
                )}
              >
                <FileIcon className="h-4 w-4 shrink-0 text-[#c2871e]" />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-[12.5px] font-medium",
                    deleting
                      ? "text-[var(--color-ink-400)] line-through decoration-red-300"
                      : "text-[var(--color-ink-900)]"
                  )}
                >
                  {r.name}
                </span>
                {r.bytes ? (
                  <span className="shrink-0 text-[11px] tabular-nums text-[var(--color-ink-400)]">
                    {formatBytes(r.bytes)}
                  </span>
                ) : null}
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-red-500" />
                ) : (
                  <>
                    <a
                      href={r.url}
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
                      onClick={() => onDelete(r)}
                      aria-label={`Delete ${r.name}`}
                      className="text-[var(--color-ink-400)] hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* --------------------------------- form ---------------------------------- */

function ListEditor({
  label,
  icon: Icon,
  values,
  onChange,
  placeholder,
  max = 10,
  maxLength,
}: {
  label: string;
  icon: typeof Package;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  max?: number;
  maxLength: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
        <Icon className="h-3.5 w-3.5 text-[#c2871e]" />
        {label}
      </div>
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Input
            value={v}
            maxLength={maxLength}
            placeholder={placeholder}
            onChange={(e) =>
              onChange(values.map((x, idx) => (idx === i ? e.target.value : x)))
            }
            className="h-8 bg-white text-[12.5px]"
          />
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
            disabled={values.length <= 1}
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
            className="text-[var(--color-ink-300)] hover:text-red-500"
          >
            <X />
          </Button>
        </div>
      ))}
      {values.length < max && (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onChange([...values, ""])}
          className="text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]"
        >
          <Plus data-icon="inline-start" />
          Add ({values.length}/{max})
        </Button>
      )}
    </div>
  );
}

function CapstoneForm({
  capstone,
  onSave,
  onCancel,
}: {
  capstone: CapstoneDTO | null;
  onSave: (input: CapstoneInput) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(capstone?.title ?? "");
  const [brief, setBrief] = useState(capstone?.brief ?? "");
  const [deliverables, setDeliverables] = useState<string[]>(
    capstone?.deliverables.length ? [...capstone.deliverables] : [""]
  );
  const [criteria, setCriteria] = useState<string[]>(
    capstone?.criteria.length ? [...capstone.criteria] : [""]
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    const err = await onSave({ title, brief, deliverables, criteria });
    setSaving(false);
    if (err) setError(err);
  }

  return (
    <div className="rounded-2xl border border-[#c2871e]/30 bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <div className="flex items-center gap-3 border-b border-[#c2871e]/20 bg-[#c2871e]/[0.07] px-6 py-4">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: AMBER }}
        >
          <GraduationCap className="h-4.5 w-4.5" />
        </span>
        <div className="text-[15px] font-semibold" style={{ color: AMBER_DARK }}>
          {capstone ? "Edit capstone project" : "New capstone project"}
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div className="space-y-1.5">
          <label
            htmlFor="capstone-title"
            className="block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]"
          >
            Title
          </label>
          <Input
            id="capstone-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            placeholder="e.g. Build a mineral exploration strategy"
            className="bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="capstone-brief"
            className="block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]"
          >
            Project brief
          </label>
          <textarea
            id="capstone-brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="What will students build, and why does it matter?"
            className="w-full resize-none rounded-lg border border-[var(--color-ink-200)] bg-white px-3 py-2 text-[13px] leading-relaxed text-[var(--color-ink-900)] transition-colors focus:border-[#c2871e] focus:outline-none"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ListEditor
            label="Deliverables"
            icon={Package}
            values={deliverables}
            onChange={setDeliverables}
            placeholder="e.g. Dataset analysis"
            maxLength={140}
          />
          <ListEditor
            label="Grading rubric"
            icon={ListChecks}
            values={criteria}
            onChange={setCriteria}
            placeholder="e.g. Sound structural model (30%)"
            maxLength={200}
          />
        </div>

        {error ? (
          <p className="text-[12px] font-medium text-red-600">{error}</p>
        ) : null}

        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={save}
            disabled={saving}
            className={cn("flex-1 text-white", "bg-[#c2871e] hover:bg-[#a8741a]")}
          >
            {saving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Check data-icon="inline-start" strokeWidth={3} />
            )}
            {capstone ? "Save capstone" : "Create capstone"}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
