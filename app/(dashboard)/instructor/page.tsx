import Link from "next/link";
import {
  Plus,
  Users,
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
import { prisma } from "@/app/utils/db";
import { requireTeacher } from "@/app/utils/auth";
import { cn } from "@/lib/utils";

export default async function InstructorPage() {
  const { dbUser } = await requireTeacher();

  const courses = await prisma.course.findMany({
    where: { teacherID: dbUser.userID },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { enrollments: true } },
      capstone: {
        select: {
          submissions: {
            where: { status: "PENDING" },
            select: { submissionID: true },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-10 py-10 space-y-10">
      {/* HEADER */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
            Instructor
          </div>
          <h1 className="mt-2 text-[36px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
            Your courses
          </h1>
          <p className="mt-2.5 text-[15px] text-[var(--color-ink-500)]">
            Build, edit, and watch how learners are doing — across{" "}
            {courses.length} {courses.length === 1 ? "course" : "courses"}.
          </p>
        </div>
        <Link
          href="/instructor/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(10,31,26,0.15)] hover:bg-[var(--color-forest-800)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New course
        </Link>
      </header>

      {/* COURSES */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-ink-300)] bg-white/60 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-tint-green)]">
            <BookOpen className="h-5 w-5 text-[var(--color-mint-600)]" />
          </div>
          <div className="mt-4 text-[16px] font-semibold text-[var(--color-ink-900)]">
            Nothing here yet
          </div>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-[var(--color-ink-500)]">
            A course starts with just a name and a short description. Lessons,
            modules, and analytics come after.
          </p>
          <Link
            href="/instructor/new"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-mint-500)] px-4 py-2 text-[13px] font-semibold text-[var(--color-forest-950)] hover:bg-[var(--color-mint-400)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create your first course
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {courses.map((c) => {
            const pendingReviews = c.capstone?.submissions.length ?? 0;
            return (
            <li key={c.courseID}>
              <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-ink-200)]/60 bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)] transition-all hover:shadow-[0_6px_18px_rgba(15,40,30,0.07)]">
                <div className="flex items-stretch">
                  <div className="flex-1 min-w-0 p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          c.status === "DRAFT"
                            ? "bg-[var(--color-tint-tan)] text-[#8a5f25]"
                            : "bg-[var(--color-tint-green)] text-[var(--color-mint-600)]"
                        )}
                      >
                        {c.status.toLowerCase()}
                      </span>
                      {pendingReviews > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#c2871e] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          <GraduationCap className="h-3 w-3" />
                          {pendingReviews} to review
                        </span>
                      ) : null}
                      {c.pathway ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
                          {c.pathway}
                        </span>
                      ) : null}
                      {c.level ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-400)]">
                          · {c.level}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-2.5 text-[22px] font-semibold tracking-[-0.01em] text-[var(--color-ink-900)]">
                      {c.title}
                    </h2>
                    {c.description ? (
                      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[var(--color-ink-500)]">
                        {c.description}
                      </p>
                    ) : null}
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--color-ink-500)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span className="font-semibold tabular-nums text-[var(--color-ink-700)]">
                          {c._count.enrollments.toLocaleString()}
                        </span>{" "}
                        enrolled
                      </span>
                      <span className="text-[var(--color-ink-300)]">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        updated{" "}
                        {c.updatedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch justify-center gap-2 border-l border-[var(--color-ink-200)]/60 p-4">
                    <Link
                      href={`/instructor/${c.courseID}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--color-forest-900)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors"
                    >
                      Open builder
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    {pendingReviews > 0 ? (
                      <Link
                        href={`/instructor/${c.courseID}/submissions`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#c2871e] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#a8741a] transition-colors"
                      >
                        <GraduationCap className="h-4 w-4" />
                        Review capstones
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
