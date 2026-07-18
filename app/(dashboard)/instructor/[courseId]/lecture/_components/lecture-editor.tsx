"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Send,
  UploadCloud,
  X,
  FileText,
  Plus,
} from "lucide-react";
import { Sidebar } from "@/app/dashboard/_components/sidebar";
import { cn } from "@/lib/utils";
import {
  type Block,
  type InstructorCourse,
} from "@/app/learn/_data/instructor-content";
import type { ResourcesForCourse } from "@/app/learn/_data/community-content";

type Props = {
  course: InstructorCourse;
  block: Block & { moduleTitle: string };
  resources: ResourcesForCourse | null;
};

export function LectureEditorClient({ course, block, resources }: Props) {
  // Find the attached resources — those that share a title prefix with the
  // selected lecture. For MVP, we just show all available resources and let
  // the instructor attach via click.
  const [attachedIds, setAttachedIds] = useState<string[]>(
    resources?.resources.slice(0, 2).map((r) => r.id) ?? []
  );
  const [required, setRequired] = useState(!!block.required);
  const [addKc, setAddKc] = useState(false);

  const attached = resources?.resources.filter((r) => attachedIds.includes(r.id)) ?? [];
  const available = resources?.resources.filter((r) => !attachedIds.includes(r.id)) ?? [];

  function toggleAttach(id: string) {
    setAttachedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--cream-50)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="mx-auto max-w-6xl px-10 py-10 space-y-8">
          <Link
            href={`/instructor/${course.id}`}
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to builder
          </Link>

          {/* HEADER */}
          <header>
            <div className="text-[12px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
              {course.title}
            </div>
            <h1 className="mt-2 text-[36px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
              New lecture
            </h1>
            <p className="mt-2.5 text-[15px] text-[var(--color-ink-500)]">
              {block.moduleTitle} · Video block
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            {/* LEFT — EDIT FORM */}
            <main className="space-y-5">
              {/* Title */}
              <Field label="Lecture title">
                <input
                  type="text"
                  defaultValue="Crystallization explainer"
                  className="w-full rounded-lg border border-[var(--color-ink-200)] bg-white px-4 py-3 text-[16px] font-semibold text-[var(--color-ink-900)] focus:border-[var(--color-forest-900)] focus:outline-none focus:ring-3 focus:ring-[var(--color-forest-900)]/10"
                />
              </Field>

              {/* Video upload */}
              <Field label="Video">
                <div className="rounded-2xl border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-50)]/40 px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--color-ink-500)] ring-1 ring-[var(--color-ink-200)]">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-[15px] font-semibold text-[var(--color-ink-900)]">
                    Drag video file here
                  </div>
                  <div className="mt-1.5 text-[13px] text-[var(--color-ink-500)]">
                    MP4 up to 4GB · or paste a link below
                  </div>
                  <input
                    type="text"
                    placeholder="https://stream.mux.com/…"
                    className="mx-auto mt-5 block w-full max-w-md rounded-md border border-[var(--color-ink-200)] bg-white px-3.5 py-2 text-[13px] text-[var(--color-ink-900)] focus:border-[var(--color-forest-900)] focus:outline-none focus:ring-3 focus:ring-[var(--color-forest-900)]/10"
                  />
                </div>
              </Field>

              {/* Toggles */}
              <div className="space-y-2">
                <ToggleRow
                  label="Required to advance"
                  description="Learners must complete this block before moving on."
                  on={required}
                  onChange={setRequired}
                />
                <ToggleRow
                  label="Add knowledge check"
                  description="Insert an inline question at the end of this video."
                  on={addKc}
                  onChange={setAddKc}
                />
              </div>

              {/* Attached resources */}
              {resources && (
                <section>
                  <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-ink-500)]">
                    Attached resources
                  </div>
                  <div className="mt-2 space-y-2">
                    {attached.map((r) => (
                      <AttachedRow
                        key={r.id}
                        title={r.title}
                        meta={`${r.size} · ${r.context ?? r.type}`}
                        onRemove={() => toggleAttach(r.id)}
                      />
                    ))}
                    {available.length > 0 && (
                      <div className="rounded-xl border-2 border-dashed border-[var(--color-ink-200)] bg-white/60">
                        <button
                          type="button"
                          onClick={() => available[0] && toggleAttach(available[0].id)}
                          className="flex w-full items-center justify-center gap-2 px-4 py-4 text-[13px] font-semibold text-[var(--color-ink-500)] hover:text-[var(--color-mint-600)] transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add slides, PDFs, datasets, links
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* CTAs */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-ink-200)] bg-white px-5 py-3.5 text-[14px] font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save draft
                </button>
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-mint-500)] px-5 py-3.5 text-[14px] font-semibold text-white hover:bg-[var(--color-mint-400)] transition-colors cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  Add to course
                </button>
              </div>
            </main>

            {/* RIGHT — FUNNEL CHART */}
            <aside className="lg:sticky lg:top-8">
              <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-7 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
                <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
                  Where learners drop off
                </div>
                <div className="mt-1.5 text-[12px] text-[var(--color-ink-500)]">
                  Last 30 days · all lectures in this course
                </div>

                <div className="mt-5 space-y-2.5">
                  {course.analytics.funnel.map((p) => {
                    const isDrop = course.analytics.dropWarning.lesson === p.lesson;
                    const pct = Math.round(p.completion * 100);
                    return (
                      <div key={p.lesson} className="flex items-center gap-2">
                        <div className="w-6 text-[11px] font-semibold text-[var(--color-ink-500)] tabular-nums">
                          L{p.lesson}
                        </div>
                        <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-[var(--color-cream-100)]">
                          <div
                            className={cn(
                              "h-full transition-all duration-500 ease-out",
                              isDrop
                                ? "bg-gradient-to-r from-[#d8a23a] to-[#b88a2a]"
                                : pct >= 80
                                ? "bg-gradient-to-r from-[var(--color-mint-500)] to-[var(--color-mint-400)]"
                                : "bg-gradient-to-r from-[var(--color-mint-500)]/70 to-[var(--color-mint-400)]/70"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="w-10 text-right text-[11px] font-semibold tabular-nums text-[var(--color-ink-700)]">
                          {pct}%
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-lg border border-[#d8a23a]/40 bg-[#d8a23a]/10 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8a5f25]">
                    Drop at Lesson {course.analytics.dropWarning.lesson}
                  </div>
                  <div className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-ink-700)]">
                    {course.analytics.dropWarning.advice}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold tracking-wider uppercase text-[var(--color-ink-500)]">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ToggleRow({
  label,
  description,
  on,
  onChange,
}: {
  label: string;
  description: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
          {label}
        </div>
        <div className="text-[13px] text-[var(--color-ink-500)]">
          {description}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!on)}
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

function AttachedRow({
  title,
  meta,
  onRemove,
}: {
  title: string;
  meta: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--color-ink-200)]/60 bg-white p-4 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-tint-tan)] text-[#8a5f25]">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-[var(--color-ink-900)]">
          {title}
        </div>
        <div className="text-[12px] text-[var(--color-ink-500)]">{meta}</div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--color-ink-400)] hover:bg-[var(--color-cream-50)] hover:text-[var(--color-ink-700)] transition-colors cursor-pointer"
        aria-label="Remove"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
