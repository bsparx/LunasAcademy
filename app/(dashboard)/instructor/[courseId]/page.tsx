import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Users,
  CalendarDays,
  GraduationCap,
  Hammer,
  Globe,
  EyeOff,
} from "lucide-react";
import { prisma } from "@/app/utils/db";
import { requireTeacher } from "@/app/utils/auth";
import { getInstructorCourse } from "@/app/(dashboard)/learn/_data/instructor-content";
import { toggleCourseStatus } from "../actions";
import { cn } from "@/lib/utils";
import { CourseBuilderClient } from "./_components/course-builder";

export default async function CourseBuilderPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { dbUser } = await requireTeacher();
  const { courseId } = await params;

  // Numeric ids are real courses in the database — only their owner may open them.
  if (/^\d+$/.test(courseId)) {
    const course = await prisma.course.findUnique({
      where: { courseID: Number(courseId) },
      include: {
        _count: { select: { enrollments: true } },
        capstone: {
          select: { submissions: { select: { status: true } } },
        },
      },
    });
    if (!course || course.teacherID !== dbUser.userID) notFound();

    const isDraft = course.status === "DRAFT";
    const submissionStatuses = course.capstone?.submissions ?? [];
    const pendingReviews = submissionStatuses.filter(
      (s) => s.status === "PENDING"
    ).length;
    return (
      <div className="mx-auto max-w-3xl px-10 py-10">
        <Link
          href="/instructor"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to your courses
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                isDraft
                  ? "bg-[var(--color-tint-tan)] text-[#8a5f25]"
                  : "bg-[var(--color-tint-green)] text-[var(--color-mint-600)]"
              )}
            >
              {course.status.toLowerCase()}
            </span>
            {course.pathway ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
                {course.pathway}
              </span>
            ) : null}
            {course.level ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-400)]">
                · {course.level}
              </span>
            ) : null}
          </div>
          <h1 className="mt-2.5 text-[32px] leading-[1.15] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
            {course.title}
          </h1>
          {course.description ? (
            <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--color-ink-500)]">
              {course.description}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--color-ink-500)]">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span className="font-semibold tabular-nums text-[var(--color-ink-700)]">
                {course._count.enrollments.toLocaleString()}
              </span>{" "}
              enrolled
            </span>
            <span className="text-[var(--color-ink-300)]">·</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              created{" "}
              {course.createdAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
          <div>
            <div className="text-[15px] font-semibold text-[var(--color-ink-900)]">
              {isDraft ? "This course is a draft" : "This course is live"}
            </div>
            <p className="mt-1 text-[13px] text-[var(--color-ink-500)]">
              {isDraft
                ? "Only you can see it. Publish when it's ready for learners."
                : "Learners can find and enroll in it. Unpublish to hide it."}
            </p>
          </div>
          <form action={toggleCourseStatus}>
            <input type="hidden" name="courseId" value={course.courseID} />
            <button
              type="submit"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-colors cursor-pointer",
                isDraft
                  ? "bg-[var(--color-mint-500)] text-[var(--color-forest-950)] hover:bg-[var(--color-mint-400)]"
                  : "border border-[var(--color-ink-200)] bg-white text-[var(--color-ink-700)] hover:bg-[var(--cream-50)]"
              )}
            >
              {isDraft ? (
                <>
                  <Globe className="h-4 w-4" />
                  Publish course
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  Unpublish
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-tint-green)]">
              <Hammer className="h-5 w-5 text-[var(--color-mint-600)]" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-[var(--color-ink-900)]">
                Course content
              </div>
              <p className="mt-1 text-[13px] text-[var(--color-ink-500)]">
                Build modules from your videos, markdown lectures, and files —
                drag to order them.
              </p>
            </div>
          </div>
          <Link
            href={`/instructor/${course.courseID}/builder`}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--color-forest-900)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors"
          >
            <Hammer className="h-4 w-4" />
            Open course builder
          </Link>
        </div>

        {course.capstone ? (
          <div
            className={cn(
              "mt-4 flex items-center justify-between gap-4 rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgba(15,40,30,0.03)]",
              pendingReviews > 0
                ? "border-[#c2871e]/40"
                : "border-[var(--color-ink-200)]/60"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#c2871e]/15">
                <GraduationCap className="h-5 w-5 text-[#c2871e]" />
                {pendingReviews > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c2871e] px-1 text-[11px] font-bold text-white shadow-[0_2px_6px_rgba(194,135,30,0.45)]">
                    {pendingReviews}
                  </span>
                ) : null}
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[var(--color-ink-900)]">
                  Capstone submissions
                </div>
                <p className="mt-1 text-[13px] text-[var(--color-ink-500)]">
                  {pendingReviews > 0
                    ? `${pendingReviews} submission${
                        pendingReviews === 1 ? " is" : "s are"
                      } waiting for your pass / fail verdict.`
                    : submissionStatuses.length > 0
                    ? `All ${submissionStatuses.length} submission${
                        submissionStatuses.length === 1 ? "" : "s"
                      } reviewed — nothing waiting.`
                    : "Student projects land here for you to review and grade."}
                </p>
              </div>
            </div>
            <Link
              href={`/instructor/${course.courseID}/submissions`}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-colors",
                pendingReviews > 0
                  ? "bg-[#c2871e] text-white hover:bg-[#a8741a]"
                  : "border border-[var(--color-ink-200)] bg-white text-[var(--color-ink-700)] hover:bg-[var(--cream-50)]"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              Review submissions
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  // Non-numeric ids are the demo workspace courses (teacher-only, shared samples).
  const course = getInstructorCourse(courseId);
  if (!course) notFound();

  return <CourseBuilderClient course={course} />;
}
