import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { requireTeacher } from "@/app/utils/auth";
import { createCourse } from "../actions";
import { PATHWAYS, LEVELS } from "../course-options";

export default async function NewCoursePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireTeacher();
  const { error } = await searchParams;

  const inputClass =
    "w-full rounded-xl border border-[var(--color-ink-200)] bg-white px-4 py-3 text-[14px] text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-400)] focus:outline-none focus:border-[var(--color-mint-500)] focus:ring-2 focus:ring-[var(--color-mint-500)]/20 transition-colors";
  const labelClass =
    "block text-[13px] font-semibold text-[var(--color-ink-700)]";

  return (
    <div className="mx-auto max-w-2xl px-10 py-10">
      <Link
        href="/instructor"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to your courses
      </Link>

      <header className="mt-6">
        <div className="text-[12px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
          New course
        </div>
        <h1 className="mt-2 text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
          Start with the basics
        </h1>
        <p className="mt-2.5 text-[15px] text-[var(--color-ink-500)]">
          Every course begins as a draft only you can see. You&apos;ll add
          modules and lessons next — publish whenever it&apos;s ready.
        </p>
      </header>

      {error === "title" ? (
        <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-800">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          Give your course a name of at least 3 characters.
        </div>
      ) : null}

      <form
        action={createCourse}
        className="mt-8 space-y-6 rounded-3xl border border-[var(--color-ink-200)]/60 bg-white p-8 shadow-[0_2px_4px_rgba(15,40,30,0.04)]"
      >
        <div className="space-y-2">
          <label htmlFor="title" className={labelClass}>
            Course name <span className="text-[var(--color-mint-600)]">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={3}
            maxLength={120}
            placeholder="e.g. Introduction to Ore Deposits"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className={labelClass}>
            Short description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="One or two sentences on what learners will be able to do by the end."
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="pathway" className={labelClass}>
              Pathway
            </label>
            <select id="pathway" name="pathway" className={inputClass}>
              <option value="">Choose a pathway…</option>
              {PATHWAYS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="level" className={labelClass}>
              Level
            </label>
            <select id="level" name="level" className={inputClass}>
              <option value="">Choose a level…</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[var(--color-forest-900)] px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(10,31,26,0.15)] hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
        >
          Create draft course
        </button>
      </form>
    </div>
  );
}
