import Link from "next/link";
import {
  BookOpen,
  PlayCircle,
  ChevronRight,
  GraduationCap,
  CircleCheck,
} from "lucide-react";
import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { cn } from "@/lib/utils";

export default async function LearnPage() {
  const { dbUser } = await requireDbUser();

  const [enrollments, progressRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userID: dbUser.userID, course: { status: "PUBLISHED" } },
      orderBy: { enrolledAt: "desc" },
      include: {
        course: {
          include: {
            teacher: { select: { name: true } },
            topics: {
              orderBy: { position: "asc" },
              include: {
                modules: {
                  orderBy: { position: "asc" },
                  include: {
                    items: {
                      orderBy: { position: "asc" },
                      select: { itemID: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.itemProgress.findMany({
      where: { userID: dbUser.userID },
      select: { itemID: true, completedAt: true },
    }),
  ]);

  const doneAt = new Map<number, Date>();
  for (const row of progressRows) {
    doneAt.set(row.itemID, row.completedAt);
  }

  const cards = enrollments.map(({ course }) => {
    const itemIDs = course.topics.flatMap((t) =>
      t.modules.flatMap((m) => m.items.map((i) => i.itemID))
    );
    const doneCount = itemIDs.filter((id) => doneAt.has(id)).length;
    const continueItemID =
      itemIDs.find((id) => !doneAt.has(id)) ?? itemIDs[0] ?? null;
    const lastStudied = itemIDs.reduce<Date | null>((latest, id) => {
      const d = doneAt.get(id);
      return d && (!latest || d > latest) ? d : latest;
    }, null);
    return {
      courseID: course.courseID,
      title: course.title,
      pathway: course.pathway,
      level: course.level,
      teacherName: course.teacher.name ?? "Luna's Academy instructor",
      total: itemIDs.length,
      done: doneCount,
      continueItemID,
      lastStudied,
    };
  });

  return (
    <div className="mx-auto max-w-4xl px-10 py-10">
      <header>
        <h1 className="text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
          My Learning
        </h1>
        <p className="mt-1.5 text-[15px] text-[var(--color-ink-500)]">
          {cards.length === 0
            ? "Courses you enroll in show up here."
            : cards.length === 1
            ? "You're enrolled in 1 course."
            : `You're enrolled in ${cards.length} courses.`}
        </p>
      </header>

      {cards.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--color-ink-200)] bg-white/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-tint-green)]">
            <BookOpen className="h-5 w-5 text-[var(--color-mint-600)]" />
          </div>
          <div className="mt-3 text-[16px] font-semibold text-[var(--color-ink-900)]">
            You&apos;re not enrolled in anything yet
          </div>
          <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-[var(--color-ink-500)]">
            Browse the catalog and enroll in a course to start learning.
          </p>
          <Link
            href="/courses"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-mint-500)] px-4 py-2.5 text-[13px] font-semibold text-[var(--color-forest-950)] hover:bg-[var(--color-mint-400)] transition-colors"
          >
            <GraduationCap className="h-4 w-4" />
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {cards.map((c) => {
            const pct =
              c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
            const finished = c.total > 0 && c.done === c.total;
            return (
              <div
                key={c.courseID}
                className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-6 shadow-[0_1px_2px_rgba(15,40,30,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {c.pathway ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mint-600)]">
                          {c.pathway}
                        </span>
                      ) : null}
                      {c.level ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-400)]">
                          · {c.level}
                        </span>
                      ) : null}
                    </div>
                    <Link
                      href={`/courses/${c.courseID}`}
                      className="mt-1 block text-[18px] font-semibold tracking-tight text-[var(--color-ink-900)] hover:text-[var(--color-forest-900)] transition-colors truncate"
                    >
                      {c.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--color-ink-500)]">
                      <span className="truncate">{c.teacherName}</span>
                      {c.lastStudied ? (
                        <>
                          <span className="h-1 w-1 rounded-full bg-[var(--color-ink-300)]" />
                          <span>
                            Last studied{" "}
                            {c.lastStudied.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {c.continueItemID !== null ? (
                    <Link
                      href={`/learn/${c.courseID}/${c.continueItemID}`}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-colors",
                        finished
                          ? "border border-[var(--color-ink-200)] bg-white text-[var(--color-ink-700)] hover:bg-[var(--cream-50)]"
                          : "bg-[var(--color-mint-500)] text-[var(--color-forest-950)] hover:bg-[var(--color-mint-400)]"
                      )}
                    >
                      {finished ? (
                        <>
                          <CircleCheck className="h-4 w-4" />
                          Review course
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4" />
                          {c.done > 0 ? "Continue" : "Start learning"}
                        </>
                      )}
                    </Link>
                  ) : (
                    <span className="shrink-0 text-[12px] text-[var(--color-ink-400)]">
                      No content yet
                    </span>
                  )}
                </div>

                {c.total > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-[12px]">
                      <span
                        className={cn(
                          "font-semibold",
                          finished
                            ? "text-[var(--color-mint-600)]"
                            : "text-[var(--color-ink-700)]"
                        )}
                      >
                        {c.done} of {c.total}{" "}
                        {c.total === 1 ? "lesson" : "lessons"}
                        {finished ? " — complete!" : ""}
                      </span>
                      <span className="tabular-nums text-[var(--color-ink-500)]">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-ink-200)]/50">
                      <div
                        className="h-full rounded-full bg-[var(--color-mint-500)] transition-[width]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-mint-600)] hover:text-[var(--color-mint-500)] transition-colors"
            >
              Browse more courses
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
