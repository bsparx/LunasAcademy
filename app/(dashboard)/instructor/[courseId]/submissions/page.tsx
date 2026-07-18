import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  File as FileIcon,
  GraduationCap,
  ListChecks,
  Paperclip,
} from "lucide-react";
import { prisma } from "@/app/utils/db";
import { requireTeacher } from "@/app/utils/auth";
import { formatBytes } from "@/lib/cloudinary-upload";
import { SubmissionsClient, type SubmissionDTO } from "./_components/submissions-client";

export default async function CapstoneSubmissionsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { dbUser } = await requireTeacher();
  const { courseId } = await params;
  if (!/^\d+$/.test(courseId)) notFound();

  const course = await prisma.course.findFirst({
    where: { courseID: Number(courseId), teacherID: dbUser.userID },
    select: {
      courseID: true,
      title: true,
      capstone: {
        select: {
          title: true,
          criteria: true,
          resources: {
            orderBy: { createdAt: "asc" },
            select: { name: true, url: true, bytes: true },
          },
          submissions: {
            orderBy: { submittedAt: "asc" },
            select: {
              submissionID: true,
              status: true,
              feedback: true,
              submittedAt: true,
              gradedAt: true,
              user: { select: { name: true, email: true } },
              files: { select: { name: true, url: true, bytes: true } },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const backLink = (
    <Link
      href={`/instructor/${course.courseID}`}
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-500)] transition-colors hover:text-[var(--color-ink-900)]"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to {course.title}
    </Link>
  );

  if (!course.capstone) {
    return (
      <div className="mx-auto max-w-3xl px-10 py-10">
        {backLink}
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-ink-300)] bg-white/60 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#c2871e]/15">
            <GraduationCap className="h-5 w-5 text-[#c2871e]" />
          </div>
          <div className="mt-4 text-[16px] font-semibold text-[var(--color-ink-900)]">
            No capstone project yet
          </div>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-[var(--color-ink-500)]">
            Create a capstone in the course builder — student submissions will
            land here for you to review.
          </p>
          <Link
            href={`/instructor/${course.courseID}/builder`}
            className="mt-5 inline-flex items-center rounded-lg bg-[var(--color-forest-900)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-forest-800)]"
          >
            Open course builder
          </Link>
        </div>
      </div>
    );
  }

  const submissions: SubmissionDTO[] = course.capstone.submissions.map((s) => ({
    submissionID: s.submissionID,
    status: s.status,
    feedback: s.feedback,
    submittedAt: s.submittedAt.toISOString(),
    gradedAt: s.gradedAt?.toISOString() ?? null,
    student: {
      name: s.user.name,
      email: s.user.email,
    },
    files: s.files,
  }));
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

  return (
    <div className="mx-auto max-w-4xl px-10 py-10">
      {backLink}

      <header className="mt-6">
        <div className="flex items-center gap-2.5">
          <span className="h-px w-6 bg-[#c2871e]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c2871e]">
            Capstone review
          </span>
        </div>
        <h1 className="mt-2.5 text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--color-ink-900)]">
          {course.capstone.title}
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-ink-500)]">
          {submissions.length === 0
            ? "No submissions yet — they'll appear here the moment a student submits."
            : pendingCount > 0
            ? `${pendingCount} submission${pendingCount === 1 ? "" : "s"} waiting for your review.`
            : "All caught up — every submission has been reviewed."}
        </p>
      </header>

      {/* Rubric reminder */}
      <div className="mt-6 rounded-2xl border border-[#c2871e]/25 bg-[#c2871e]/[0.05] px-6 py-5">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8a5f25]">
          <ListChecks className="h-3.5 w-3.5" />
          Grading rubric
        </div>
        <ul className="mt-2.5 grid gap-x-8 gap-y-1.5 md:grid-cols-2">
          {course.capstone.criteria.map((c, i) => (
            <li
              key={c}
              className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--color-ink-700)]"
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#c2871e]/15 text-[9px] font-bold text-[#8a5f25]">
                {i + 1}
              </span>
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Resources reminder */}
      {course.capstone.resources.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-[#c2871e]/25 bg-[#c2871e]/[0.05] px-6 py-5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8a5f25]">
            <Paperclip className="h-3.5 w-3.5" />
            Resources attached to this capstone
          </div>
          <ul className="mt-2.5 grid gap-x-8 gap-y-1.5 md:grid-cols-2">
            {course.capstone.resources.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-lg border border-[#c2871e]/20 bg-white px-3 py-2 text-[12.5px] font-medium text-[var(--color-ink-700)] transition-colors hover:border-[#c2871e]/40"
                >
                  <FileIcon className="h-4 w-4 shrink-0 text-[#c2871e]" />
                  <span className="min-w-0 flex-1 truncate">{r.name}</span>
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

      <SubmissionsClient submissions={submissions} />
    </div>
  );
}
