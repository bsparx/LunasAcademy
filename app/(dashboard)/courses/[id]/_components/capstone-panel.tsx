"use client";

import { useRef, useState, useTransition } from "react";
import {
  Award,
  Check,
  Clock,
  File as FileIcon,
  GraduationCap,
  ListChecks,
  Loader2,
  Package,
  Paperclip,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  formatBytes,
  uploadToCloudinary,
} from "@/lib/cloudinary-upload";
import {
  registerCapstoneUpload,
  discardCapstoneUpload,
  submitCapstone,
  withdrawCapstoneSubmission,
  type CapstoneUpload,
} from "../../actions";
import { ConfirmDeleteDialog } from "@/app/(dashboard)/_components/confirm-delete-dialog";

const MAX_FILES = 5;

export type CapstonePanelData = {
  title: string;
  brief: string;
  deliverables: string[];
  criteria: string[];
  resources: { name: string; url: string; bytes: number | null }[];
};

export type SubmissionStatusValue = "PENDING" | "PASSED" | "FAILED";

export type SubmissionData = {
  submittedAt: string; // ISO
  status: SubmissionStatusValue;
  feedback: string | null;
  files: { name: string; url: string; bytes: number | null }[];
};

type Props = {
  courseID: number;
  capstone: CapstonePanelData;
  submission: SubmissionData | null;
  /** Enrolled student (not the owner) → can upload and submit. */
  canSubmit: boolean;
};

type StagedFile = CapstoneUpload & { key: string };
type Uploading = { name: string; pct: number };

export function CapstonePanel({ courseID, capstone, submission, canSubmit }: Props) {
  return (
    <section className="mt-12">
      <div className="flex items-center gap-2.5">
        <span className="h-px w-6 bg-[#c2871e]" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c2871e]">
          Capstone project
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#c2871e]/30 bg-white shadow-[0_2px_12px_rgba(194,135,30,0.08)]">
        {/* Header */}
        <div className="border-b border-[#c2871e]/20 bg-gradient-to-br from-[#c2871e]/12 to-[#c2871e]/[0.04] px-7 py-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#c2871e] text-white shadow-[0_4px_14px_rgba(194,135,30,0.35)]">
              <GraduationCap className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[22px] font-semibold leading-snug tracking-[-0.01em] text-[var(--color-ink-900)]">
                {capstone.title}
              </h2>
              <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-[var(--color-ink-700)]">
                {capstone.brief}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-7 py-6 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
              <Package className="h-3.5 w-3.5 text-[#c2871e]" />
              Deliverables
            </div>
            <ul className="mt-2.5 space-y-2">
              {capstone.deliverables.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-2.5 text-[13px] text-[var(--color-ink-700)]"
                >
                  <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#c2871e]/15">
                    <Check className="h-3 w-3 text-[#c2871e]" strokeWidth={3} />
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
              <ListChecks className="h-3.5 w-3.5 text-[#c2871e]" />
              How it&apos;s graded
            </div>
            <ul className="mt-2.5 space-y-2">
              {capstone.criteria.map((c, i) => (
                <li
                  key={c}
                  className="flex items-start gap-2.5 text-[13px] text-[var(--color-ink-700)]"
                >
                  <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#c2871e]/15 text-[9.5px] font-bold text-[#8a5f25]">
                    {i + 1}
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {capstone.resources.length > 0 ? (
          <div className="border-t border-[var(--color-ink-200)]/50 px-7 py-6">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
              <Paperclip className="h-3.5 w-3.5 text-[#c2871e]" />
              Resources
            </div>
            <ul className="mt-2.5 space-y-1.5">
              {capstone.resources.map((r) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-lg border border-[var(--color-ink-200)]/60 bg-white px-3 py-2 transition-colors hover:border-[#c2871e]/40 hover:bg-[#c2871e]/[0.04]"
                  >
                    <FileIcon className="h-4 w-4 shrink-0 text-[#c2871e]" />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--color-ink-900)]">
                      {r.name}
                    </span>
                    {r.bytes ? (
                      <span className="shrink-0 text-[11px] tabular-nums text-[var(--color-ink-400)]">
                        {formatBytes(r.bytes)}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Submission area */}
        <div className="border-t border-[var(--color-ink-200)]/50 px-7 py-6">
          {submission ? (
            <SubmissionStatus courseID={courseID} submission={submission} />
          ) : canSubmit ? (
            <SubmitForm courseID={courseID} />
          ) : (
            <p className="text-[12.5px] text-[var(--color-ink-500)]">
              Enroll in the course to submit your capstone project.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-[#c2871e]/15 bg-[#c2871e]/[0.05] px-7 py-3.5">
          <Award className="h-4 w-4 shrink-0 text-[#c2871e]" />
          <p className="text-[12px] font-medium text-[#8a5f25]">
            Your instructor reviews every submission against the rubric above
            and grades it pass / fail, with written feedback either way.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ submit form ------------------------------ */

function SubmitForm({ courseID }: { courseID: number }) {
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [uploading, setUploading] = useState<Uploading | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function addFiles(files: FileList | File[]) {
    setError(null);
    for (const file of Array.from(files)) {
      if (staged.length >= MAX_FILES) {
        setError(`At most ${MAX_FILES} files per submission.`);
        return;
      }
      setUploading({ name: file.name, pct: 0 });
      try {
        const { promise } = uploadToCloudinary(file, (pct) =>
          setUploading({ name: file.name, pct })
        );
        const asset = await promise;
        const upload: CapstoneUpload = {
          name: file.name,
          url: asset.url,
          publicID: asset.publicID,
          resourceType: asset.resourceType,
          bytes: asset.bytes,
        };
        // Track in the DB immediately so the file can always be cleaned up.
        const registered = await registerCapstoneUpload(upload);
        if (!registered.ok) {
          setError(registered.error);
          continue;
        }
        setStaged((prev) => [...prev, { ...upload, key: asset.publicID }]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setUploading(null);
      }
    }
  }

  function removeStaged(file: StagedFile) {
    setStaged((prev) => prev.filter((f) => f.key !== file.key));
    void discardCapstoneUpload(file.publicID);
  }

  function submit() {
    if (staged.length === 0 || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await submitCapstone(
          courseID,
          staged.map(({ key: _key, ...f }) => f)
        );
        if (!res.ok) setError(res.error);
        // On success the page revalidates and shows the submission status.
      } catch {
        setError("Couldn't submit — check your connection and try again.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
        Your submission
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragOver
            ? "border-[#c2871e] bg-[#c2871e]/10"
            : "border-[#c2871e]/35 bg-[#c2871e]/[0.04]"
        )}
      >
        <Upload className="mx-auto h-5 w-5 text-[#c2871e]" />
        <div className="mt-2 text-[13.5px] font-semibold text-[var(--color-ink-900)]">
          Drag &amp; drop files
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading !== null}
          className="mt-0.5 cursor-pointer text-[12.5px] font-semibold text-[#8a5f25] underline underline-offset-2 hover:text-[#c2871e] disabled:opacity-50"
        >
          or browse
        </button>
        <p className="mt-1.5 text-[11px] text-[var(--color-ink-400)]">
          Up to {MAX_FILES} files · 10 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Upload in progress */}
      {uploading && (
        <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-ink-200)]/60 bg-white px-3 py-2">
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#c2871e]" />
          <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--color-ink-700)]">
            {uploading.name}
          </span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[var(--color-ink-100)]">
            <div
              className="h-full rounded-full bg-[#c2871e] transition-[width]"
              style={{ width: `${uploading.pct}%` }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-[var(--color-ink-500)]">
            {uploading.pct}%
          </span>
        </div>
      )}

      {/* Staged files */}
      {staged.length > 0 && (
        <ul className="space-y-1.5">
          {staged.map((f) => (
            <li
              key={f.key}
              className="flex items-center gap-2.5 rounded-lg border border-[var(--color-ink-200)]/60 bg-white px-3 py-2"
            >
              <FileIcon className="h-4 w-4 shrink-0 text-[#c2871e]" />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--color-ink-900)]">
                {f.name}
              </span>
              {f.bytes ? (
                <span className="shrink-0 text-[11px] tabular-nums text-[var(--color-ink-400)]">
                  {formatBytes(f.bytes)}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => removeStaged(f)}
                disabled={pending}
                aria-label={`Remove ${f.name}`}
                className="cursor-pointer text-[var(--color-ink-300)] transition-colors hover:text-red-500 disabled:opacity-40"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p className="text-[12px] font-medium text-red-600">{error}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-[11.5px] text-[var(--color-ink-400)]">
          {staged.length} of {MAX_FILES} files attached
        </span>
        <Button
          onClick={submit}
          disabled={staged.length === 0 || pending || uploading !== null}
          className="bg-[#c2871e] text-white hover:bg-[#a8741a]"
        >
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Send data-icon="inline-start" />
          )}
          Submit for review
        </Button>
      </div>
    </div>
  );
}

/* --------------------------- submission status --------------------------- */

function SubmissionStatus({
  courseID,
  submission,
}: {
  courseID: number;
  submission: SubmissionData;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const failed = submission.status === "FAILED";

  function withdraw() {
    setConfirming(false);
    startTransition(async () => {
      const res = await withdrawCapstoneSubmission(courseID);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {submission.status === "PASSED" ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#16a34a]/10 px-3.5 py-1.5 text-[13px] font-bold text-[#16a34a]">
            <Award className="h-4 w-4" />
            Passed
          </span>
        ) : failed ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3.5 py-1.5 text-[13px] font-bold text-red-600">
            <X className="h-4 w-4" strokeWidth={3} />
            Not passed yet
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#c2871e]/12 px-3.5 py-1.5 text-[13px] font-semibold text-[#8a5f25]">
            <Clock className="h-4 w-4" />
            Submitted · awaiting review
          </span>
        )}
        <span className="text-[11.5px] text-[var(--color-ink-400)]">
          {new Date(submission.submittedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {submission.feedback ? (
        <div
          className={cn(
            "rounded-xl border px-4 py-3",
            failed
              ? "border-red-200 bg-red-50/50"
              : "border-[var(--color-ink-200)]/60 bg-[var(--cream-50)]/60"
          )}
        >
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
            Instructor feedback
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink-700)]">
            {submission.feedback}
          </p>
        </div>
      ) : null}

      <ul className="space-y-1.5">
        {submission.files.map((f) => (
          <li key={f.url}>
            <a
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-lg border border-[var(--color-ink-200)]/60 bg-white px-3 py-2 transition-colors hover:border-[#c2871e]/40 hover:bg-[#c2871e]/[0.04]"
            >
              <FileIcon className="h-4 w-4 shrink-0 text-[#c2871e]" />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--color-ink-900)]">
                {f.name}
              </span>
              {f.bytes ? (
                <span className="shrink-0 text-[11px] tabular-nums text-[var(--color-ink-400)]">
                  {formatBytes(f.bytes)}
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>

      {error ? (
        <p className="text-[12px] font-medium text-red-600">{error}</p>
      ) : null}

      {submission.status !== "PASSED" && (
        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirming(true)}
            disabled={pending}
            className="text-red-600 hover:text-red-700"
          >
            {pending ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Trash2 data-icon="inline-start" />
            )}
            {failed ? "Remove submission & rework" : "Withdraw submission"}
          </Button>
        </div>
      )}

      <ConfirmDeleteDialog
        confirm={
          confirming
            ? {
                title: failed
                  ? "Remove this submission?"
                  : "Withdraw your submission?",
                description:
                  "Your uploaded files will be permanently deleted and the submission removed from the review queue. You can submit again afterwards.",
                confirmLabel: failed ? "Remove" : "Withdraw",
              }
            : null
        }
        onCancel={() => setConfirming(false)}
        onConfirm={withdraw}
      />
    </div>
  );
}
