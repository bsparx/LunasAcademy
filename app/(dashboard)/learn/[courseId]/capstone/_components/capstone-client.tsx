"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  UploadCloud,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Capstone } from "@/app/(dashboard)/learn/_data/learning-content";

type Props = {
  courseId: string;
  courseTitle: string;
  pathway: string;
  capstone: Capstone;
};

export function CapstoneClient({ courseId, courseTitle, pathway, capstone }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function toggle(item: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const names = Array.from(files).map((f) => f.name).join(", ");
    setFileLabel(names);
  }

  const allDone = capstone.deliverables.every((d) => checked.has(d));

  return (
    <div className="mx-auto max-w-4xl px-10 py-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to course
      </Link>

      {/* HEADER BANNER */}
      <div className="mt-5 relative overflow-hidden rounded-2xl bg-[#8a5f25] p-8 text-white shadow-[0_8px_28px_rgba(80,40,10,0.25)]">
        <div className="absolute inset-0 bg-dots-dark opacity-40 pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase">
            <GraduationCap className="h-3.5 w-3.5" />
            {capstone.badge}
          </div>
          <h1 className="mt-4 text-[32px] md:text-[38px] leading-[1.1] font-semibold tracking-[-0.02em] text-balance">
            {capstone.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/80">
            {capstone.description}
          </p>
          <div className="mt-5 text-[12px] text-white/65">
            {pathway} · {courseTitle}
          </div>
        </div>
      </div>

      {/* DELIVERABLES */}
      <div className="mt-8 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-7 shadow-[0_2px_8px_rgba(15,40,30,0.04)]">
        <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
          Deliverables
        </div>
        <div className="mt-4 space-y-2.5">
          {capstone.deliverables.map((d) => {
            const isChecked = checked.has(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggle(d)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all cursor-pointer",
                  isChecked
                    ? "border-[var(--color-mint-500)]/40 bg-[var(--color-tint-green)]/30"
                    : "border-[var(--color-ink-200)] bg-white hover:bg-[var(--color-cream-50)]"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                    isChecked
                      ? "border-[var(--color-mint-500)] bg-[var(--color-mint-500)] text-white"
                      : "border-[var(--color-ink-300)] bg-white"
                  )}
                >
                  {isChecked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span
                  className={cn(
                    "text-[14px]",
                    isChecked ? "font-semibold text-[var(--color-ink-900)]" : "text-[var(--color-ink-700)]"
                  )}
                >
                  {d}
                </span>
              </button>
            );
          })}
        </div>

        {/* UPLOAD ZONE */}
        <div className="mt-6">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
            Upload your work
          </div>
          <label
            htmlFor="capstone-files"
            className="mt-3 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-tint-tan)] bg-[var(--color-tint-tan)]/20 px-6 py-10 text-center transition-colors hover:bg-[var(--color-tint-tan)]/30 cursor-pointer"
          >
            <UploadCloud className="h-8 w-8 text-[#8a5f25]" />
            <div className="mt-3 text-[14px] font-semibold text-[var(--color-ink-900)]">
              {fileLabel ? "Files ready" : "Drag & drop files or browse"}
            </div>
            <div className="mt-1 text-[12px] text-[var(--color-ink-500)]">
              {fileLabel ?? "PDFs, images, notebooks, datasets — up to 50MB each."}
            </div>
            <input
              id="capstone-files"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>

        {/* SUBMIT */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-[12px] text-[var(--color-ink-500)]">
            You can save and come back — submissions close at the end of the term.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!allDone || submitted}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(10,31,26,0.18)] hover:bg-[var(--color-forest-800)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitted ? "Submitted ✓" : "Submit capstone"}
          </button>
        </div>
      </div>

      {/* RUBRIC */}
      <div className="mt-6 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-7 shadow-[0_2px_8px_rgba(15,40,30,0.04)]">
        <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
          Rubric
        </div>
        <ol className="mt-3 space-y-2.5">
          {capstone.rubric.map((line, i) => (
            <li
              key={line}
              className="flex items-start gap-3 text-[14px] text-[var(--color-ink-700)]"
            >
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-tint-green)] text-[11px] font-semibold text-[var(--color-mint-600)]">
                {i + 1}
              </span>
              {line}
            </li>
          ))}
        </ol>
      </div>

      {/* REVIEW NOTE */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--color-tint-tan)] bg-[var(--color-tint-tan)]/30 p-5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#8a5f25]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="text-[13px] leading-relaxed text-[var(--color-ink-700)]">
          {capstone.reviewNote}
        </div>
      </div>
    </div>
  );
}
