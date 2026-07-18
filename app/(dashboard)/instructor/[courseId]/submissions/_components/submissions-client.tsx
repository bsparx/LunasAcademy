"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Clock,
  Download,
  File as FileIcon,
  Inbox,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/cloudinary-upload";
import { gradeCapstoneSubmission, type CapstoneVerdict } from "../actions";

export type SubmissionDTO = {
  submissionID: number;
  status: "PENDING" | "PASSED" | "FAILED";
  feedback: string | null;
  submittedAt: string; // ISO
  gradedAt: string | null; // ISO
  student: { name: string | null; email: string };
  files: { name: string; url: string; bytes: number | null }[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SubmissionsClient({
  submissions,
}: {
  submissions: SubmissionDTO[];
}) {
  const pending = submissions.filter((s) => s.status === "PENDING");
  const reviewed = submissions.filter((s) => s.status !== "PENDING");

  if (submissions.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-ink-300)] bg-white/60 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-tint-green)]">
          <Inbox className="h-5 w-5 text-[var(--color-mint-600)]" />
        </div>
        <div className="mt-4 text-[16px] font-semibold text-[var(--color-ink-900)]">
          Nothing to review yet
        </div>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-[var(--color-ink-500)]">
          When a student submits their capstone project, it shows up here with
          their files ready to download.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      {pending.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.16em] text-[#8a5f25]">
            <Clock className="h-4 w-4" />
            Waiting for review
            <span className="rounded-full bg-[#c2871e] px-2 py-0.5 text-[11px] font-bold text-white">
              {pending.length}
            </span>
          </h2>
          <ul className="mt-3.5 space-y-4">
            {pending.map((s) => (
              <SubmissionCard key={s.submissionID} submission={s} />
            ))}
          </ul>
        </section>
      )}

      {reviewed.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--color-ink-500)]">
            <Check className="h-4 w-4" />
            Reviewed
            <span className="rounded-full bg-[var(--color-ink-200)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-ink-600)]">
              {reviewed.length}
            </span>
          </h2>
          <ul className="mt-3.5 space-y-4">
            {reviewed.map((s) => (
              <SubmissionCard key={s.submissionID} submission={s} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* ----------------------------- submission card ---------------------------- */

function SubmissionCard({ submission }: { submission: SubmissionDTO }) {
  const isPending = submission.status === "PENDING";
  const [editing, setEditing] = useState(false);
  const showForm = isPending || editing;
  const studentName = submission.student.name?.trim() || submission.student.email;

  return (
    <li
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)]",
        isPending
          ? "border-[#c2871e]/35"
          : "border-[var(--color-ink-200)]/60"
      )}
    >
      {/* Student header */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 border-b px-6 py-4",
          isPending
            ? "border-[#c2871e]/20 bg-[#c2871e]/[0.05]"
            : "border-[var(--color-ink-200)]/50"
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-forest-900)] text-[15px] font-bold text-white">
          {studentName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px] font-semibold text-[var(--color-ink-900)]">
            {studentName}
          </div>
          <div className="truncate text-[12px] text-[var(--color-ink-500)]">
            {submission.student.email} · submitted {formatDate(submission.submittedAt)}
          </div>
        </div>
        <StatusChip submission={submission} />
      </div>

      <div className="space-y-4 px-6 py-5">
        {/* Files to review */}
        <div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
            Submitted material
          </div>
          <ul className="mt-2 space-y-1.5">
            {submission.files.map((f) => (
              <li key={f.url}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2.5 rounded-lg border border-[var(--color-ink-200)]/60 bg-[var(--cream-50)]/50 px-3 py-2 transition-colors hover:border-[#c2871e]/40 hover:bg-[#c2871e]/[0.04]"
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
                  <Download className="h-3.5 w-3.5 shrink-0 text-[var(--color-ink-300)] transition-colors group-hover:text-[#c2871e]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {showForm ? (
          <GradeForm submission={submission} onDone={() => setEditing(false)} />
        ) : (
          <div className="space-y-2.5">
            {submission.feedback ? (
              <div className="rounded-xl border border-[var(--color-ink-200)]/60 bg-[var(--cream-50)]/60 px-4 py-3">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
                  Your feedback
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink-700)]">
                  {submission.feedback}
                </p>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11.5px] text-[var(--color-ink-400)]">
                Reviewed {submission.gradedAt ? formatDate(submission.gradedAt) : ""}
              </span>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil data-icon="inline-start" />
                Edit review
              </Button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

function StatusChip({ submission }: { submission: SubmissionDTO }) {
  if (submission.status === "PASSED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16a34a]/10 px-3 py-1 text-[12px] font-bold text-[#16a34a]">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
        Passed
      </span>
    );
  }
  if (submission.status === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-[12px] font-bold text-red-600">
        <X className="h-3.5 w-3.5" strokeWidth={3} />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c2871e]/12 px-3 py-1 text-[12px] font-bold text-[#8a5f25]">
      <Clock className="h-3.5 w-3.5" />
      Needs review
    </span>
  );
}

/* -------------------------------- grade form ------------------------------ */

function GradeForm({
  submission,
  onDone,
}: {
  submission: SubmissionDTO;
  onDone: () => void;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [error, setError] = useState<string | null>(null);
  const [verdictInFlight, setVerdictInFlight] = useState<CapstoneVerdict | null>(null);
  const [pending, startTransition] = useTransition();
  const canGrade = feedback.trim().length > 0 && !pending;

  function grade(verdict: CapstoneVerdict) {
    if (!canGrade) return;
    setError(null);
    setVerdictInFlight(verdict);
    startTransition(async () => {
      const res = await gradeCapstoneSubmission(
        submission.submissionID,
        verdict,
        feedback
      );
      if (!res.ok) {
        setError(res.error);
        setVerdictInFlight(null);
        return;
      }
      onDone();
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor={`feedback-${submission.submissionID}`}
          className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]"
        >
          Feedback for the student
        </label>
        <textarea
          id={`feedback-${submission.submissionID}`}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          placeholder="What was strong, and what should they improve? The student sees this alongside your verdict."
          className="mt-1.5 w-full rounded-xl border border-[var(--color-ink-200)] bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-400)] focus:border-[#c2871e] focus:outline-none focus:ring-2 focus:ring-[#c2871e]/20"
        />
      </div>

      {error ? (
        <p className="text-[12px] font-medium text-red-600">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!feedback.trim() && (
          <span className="mr-auto text-[11.5px] text-[var(--color-ink-400)]">
            Write feedback to unlock the verdict buttons.
          </span>
        )}
        {submission.status !== "PENDING" && (
          <Button variant="ghost" size="sm" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => grade("FAILED")}
          disabled={!canGrade}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          {pending && verdictInFlight === "FAILED" ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <X data-icon="inline-start" />
          )}
          Fail
        </Button>
        <Button
          size="sm"
          onClick={() => grade("PASSED")}
          disabled={!canGrade}
          className="bg-[#16a34a] text-white hover:bg-[#15803d]"
        >
          {pending && verdictInFlight === "PASSED" ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Check data-icon="inline-start" />
          )}
          Pass
        </Button>
      </div>
    </div>
  );
}
