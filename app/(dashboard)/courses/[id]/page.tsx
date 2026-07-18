import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Layers,
  Clock,
  CalendarDays,
  CircleCheck,
  PlayCircle,
  FileText,
  Paperclip,
  Hammer,
  Info,
  ClipboardList,
  Award,
  Check,
  GraduationCap,
  Star,
  MessageSquareText,
  MessagesSquare,
  FolderOpen,
  PencilRuler,
} from "lucide-react";
import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { cn } from "@/lib/utils";
import { enrollInCourse } from "../actions";
import { CapstonePanel } from "./_components/capstone-panel";
import { CourseTabs } from "./_components/course-tabs";
import { MarkdownProse } from "./_components/markdown-prose";
import { ReviewsPanel, type ReviewDTO } from "./_components/reviews-panel";
import type { ResourceKind } from "@prisma/client";

/* Brand accents: success/progress = #16a34a, ore amber = #c2871e. */

function KindIcon({ kind }: { kind: ResourceKind | "EXAM" }) {
  if (kind === "VIDEO")
    return <PlayCircle className="h-4 w-4 text-[var(--color-mint-600)]" />;
  if (kind === "LECTURE")
    return <FileText className="h-4 w-4 text-[#8b6fd1]" />;
  if (kind === "EXAM")
    return <ClipboardList className="h-4 w-4 text-[#3b5bcc]" />;
  return <Paperclip className="h-4 w-4 text-[#8a5f25]" />;
}

function formatDuration(seconds: number) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { dbUser } = await requireDbUser();
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const course = await prisma.course.findUnique({
    where: { courseID: Number(id) },
    include: {
      teacher: {
        select: {
          userID: true,
          name: true,
          headline: true,
          bio: true,
        },
      },
      _count: { select: { enrollments: true } },
      capstone: {
        select: {
          capstoneID: true,
          title: true,
          brief: true,
          deliverables: true,
          criteria: true,
          resources: {
            orderBy: { createdAt: "asc" },
            select: { name: true, url: true, bytes: true },
          },
        },
      },
      topics: {
        orderBy: { position: "asc" },
        include: {
          modules: {
            orderBy: { position: "asc" },
            include: {
              items: {
                orderBy: { position: "asc" },
                include: {
                  resource: {
                    select: { kind: true, title: true, duration: true },
                  },
                  exam: {
                    select: {
                      examID: true,
                      _count: { select: { questions: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      enrollments: {
        where: { userID: dbUser.userID },
        select: { enrollmentID: true },
      },
    },
  });
  if (!course) notFound();

  const isOwner = course.teacher.userID === dbUser.userID;
  // Drafts are only visible to their owner.
  if (course.status !== "PUBLISHED" && !isOwner) notFound();

  const enrolled = course.enrollments.length > 0;
  const isTeacher = dbUser.role === "TEACHER";
  const canEnroll = !enrolled && (!isTeacher || isOwner);

  const modules = course.topics.flatMap((t) => t.modules);
  const allItems = modules.flatMap((m) => m.items);
  const totalSeconds = allItems.reduce(
    (sum, i) => sum + (i.resource?.duration ?? 0),
    0
  );
  const examCount = allItems.filter((i) => i.exam).length;

  // Which lessons can the viewer open, and where should "continue" point?
  const canWatch = enrolled || isOwner;
  let doneItemIDs = new Set<number>();
  if (canWatch && allItems.length > 0) {
    const rows = await prisma.itemProgress.findMany({
      where: {
        userID: dbUser.userID,
        item: { module: { topic: { courseID: course.courseID } } },
      },
      select: { itemID: true },
    });
    doneItemIDs = new Set(rows.map((r) => r.itemID));
  }
  const continueItem =
    allItems.find((i) => !doneItemIDs.has(i.itemID)) ?? allItems[0] ?? null;
  const courseFinished =
    enrolled && allItems.length > 0 && doneItemIDs.size === allItems.length;
  const started = doneItemIDs.size > 0;

  // Viewer's capstone submission, if the course has a capstone.
  const submission = course.capstone
    ? await prisma.capstoneSubmission.findUnique({
        where: {
          capstoneID_userID: {
            capstoneID: course.capstone.capstoneID,
            userID: dbUser.userID,
          },
        },
        select: {
          submittedAt: true,
          status: true,
          feedback: true,
          files: { select: { name: true, url: true, bytes: true } },
        },
      })
    : null;
  const pct =
    allItems.length === 0
      ? 0
      : Math.round((doneItemIDs.size / allItems.length) * 100);

  // Ratings, reviews, and instructor stats for the tab panels.
  const teacherID = course.teacher.userID;
  const [ratingAgg, reviewRows, myReviewRow, teacherCourseCount, teacherStudentCount, teacherRatingAgg] =
    await Promise.all([
      prisma.courseReview.aggregate({
        where: { courseID: course.courseID },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.courseReview.findMany({
        where: { courseID: course.courseID },
        orderBy: { updatedAt: "desc" },
        take: 50,
        select: {
          reviewID: true,
          userID: true,
          rating: true,
          comment: true,
          updatedAt: true,
          user: { select: { name: true } },
        },
      }),
      prisma.courseReview.findUnique({
        where: {
          courseID_userID: { courseID: course.courseID, userID: dbUser.userID },
        },
        select: { rating: true, comment: true },
      }),
      prisma.course.count({
        where: { teacherID, status: "PUBLISHED" },
      }),
      prisma.enrollment.count({ where: { course: { teacherID } } }),
      prisma.courseReview.aggregate({
        where: { course: { teacherID } },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

  const ratingCount = ratingAgg._count;
  const ratingAvg = ratingAgg._avg.rating ?? 0;
  const distribution = [1, 2, 3, 4, 5].map(
    (s) => reviewRows.filter((r) => r.rating === s).length
  );
  const reviewDTOs: ReviewDTO[] = reviewRows.map((r) => ({
    reviewID: r.reviewID,
    name: r.user.name ?? "Student",
    rating: r.rating,
    comment: r.comment,
    createdAt: r.updatedAt.toISOString(),
    isYou: r.userID === dbUser.userID,
  }));
  const canReview = enrolled && !isOwner;

  const overviewPanel = course.overview ? (
    <div className="max-w-3xl rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-7 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <MarkdownProse text={course.overview} />
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-[var(--color-ink-200)] bg-white/50 p-8 text-center text-[13px] text-[var(--color-ink-500)]">
      The instructor hasn&apos;t written an overview yet.
      {isOwner ? (
        <>
          {" "}
          <Link
            href={`/instructor/${course.courseID}/builder`}
            className="font-semibold text-[var(--color-mint-600)] underline"
          >
            Add one in the course builder.
          </Link>
        </>
      ) : null}
    </div>
  );

  const teacherName = course.teacher.name ?? "Luna's Academy instructor";
  const instructorPanel = (
    <div className="max-w-3xl rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-7 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-forest-900)] text-[26px] font-bold text-white">
          {teacherName[0]?.toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="text-[19px] font-semibold tracking-[-0.01em] text-[var(--color-ink-900)]">
            {teacherName}
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-[var(--color-ink-500)]">
            <PencilRuler className="h-3.5 w-3.5" />
            {course.teacher.headline ?? "Instructor at Luna's Academy"}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          ...(teacherRatingAgg._count > 0
            ? [
                {
                  icon: Star,
                  label: `${(teacherRatingAgg._avg.rating ?? 0).toFixed(1)} instructor rating`,
                },
              ]
            : []),
          {
            icon: MessageSquareText,
            label: `${teacherRatingAgg._count} review${teacherRatingAgg._count === 1 ? "" : "s"}`,
          },
          {
            icon: Users,
            label: `${teacherStudentCount.toLocaleString()} student${teacherStudentCount === 1 ? "" : "s"}`,
          },
          {
            icon: Layers,
            label: `${teacherCourseCount} course${teacherCourseCount === 1 ? "" : "s"}`,
          },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--cream-50)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-700)] ring-1 ring-[var(--color-ink-200)]/60"
          >
            <Icon className="h-3.5 w-3.5 text-[var(--color-mint-600)]" />
            {label}
          </span>
        ))}
      </div>

      {course.teacher.bio ? (
        <p className="mt-5 whitespace-pre-line text-[14px] leading-relaxed text-[var(--color-ink-700)]">
          {course.teacher.bio}
        </p>
      ) : (
        <p className="mt-5 text-[13px] italic text-[var(--color-ink-400)]">
          This instructor hasn&apos;t added a bio yet.
        </p>
      )}
    </div>
  );

  return (
    <div className="pb-14">
      {/* HERO — deep forest brand band */}
      <section className="bg-[var(--color-forest-900)] bg-gradient-to-br from-[var(--color-forest-900)] to-[var(--color-forest-800)] text-white">
        <div className="mx-auto max-w-5xl px-6 pb-10 pt-8 md:px-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All courses
          </Link>

          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_320px]">
            {/* Left: title + meta */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {course.status === "DRAFT" && (
                  <span className="inline-flex items-center rounded-full bg-[#c2871e] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Draft preview
                  </span>
                )}
                {course.pathway ? (
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[var(--color-mint-400)]">
                    {course.pathway}
                  </span>
                ) : null}
                {course.level ? (
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    · {course.level}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-3 text-balance text-[32px] font-semibold leading-[1.12] tracking-[-0.02em] md:text-[40px]">
                {course.title}
              </h1>

              {course.description ? (
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/70">
                  {course.description}
                </p>
              ) : null}

              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-mint-500)]/20 text-[13px] font-bold text-[var(--color-mint-400)] ring-1 ring-[var(--color-mint-400)]/30">
                  {(course.teacher.name ?? "L")[0].toUpperCase()}
                </span>
                <div>
                  <div className="text-[13px] font-semibold">
                    {course.teacher.name ?? "Luna's Academy instructor"}
                  </div>
                  <div className="text-[11.5px] text-white/50">Instructor</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {[
                  ...(ratingCount > 0
                    ? [
                        {
                          icon: Star,
                          label: `${ratingAvg.toFixed(1)} (${ratingCount} rating${ratingCount === 1 ? "" : "s"})`,
                        },
                      ]
                    : []),
                  {
                    icon: Layers,
                    label: `${modules.length} ${
                      modules.length === 1 ? "module" : "modules"
                    }`,
                  },
                  {
                    icon: GraduationCap,
                    label: `${allItems.length} ${
                      allItems.length === 1 ? "lesson" : "lessons"
                    }`,
                  },
                  ...(totalSeconds > 0
                    ? [
                        {
                          icon: Clock,
                          label: `${formatDuration(totalSeconds)} of video`,
                        },
                      ]
                    : []),
                  ...(examCount > 0
                    ? [
                        {
                          icon: ClipboardList,
                          label: `${examCount} graded ${
                            examCount === 1 ? "exam" : "exams"
                          }`,
                        },
                      ]
                    : []),
                  {
                    icon: Users,
                    label: `${course._count.enrollments.toLocaleString()} enrolled`,
                  },
                  {
                    icon: CalendarDays,
                    label: course.createdAt.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    }),
                  },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white/85 ring-1 ring-white/10"
                  >
                    <Icon className="h-3.5 w-3.5 text-white/60" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: CTA card */}
            <div className="overflow-hidden rounded-2xl bg-white text-[var(--color-ink-900)] shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
              <div className="p-5">
                {enrolled ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#16a34a]">
                        <CircleCheck className="h-4 w-4" />
                        You&apos;re enrolled
                      </span>
                      <span className="text-[12px] font-semibold tabular-nums text-[var(--color-ink-500)]">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[var(--color-ink-100)]">
                      <div
                        className="h-full rounded-full bg-[#16a34a]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[12px] text-[var(--color-ink-500)]">
                      {allItems.length > 0
                        ? `${doneItemIDs.size} of ${allItems.length} lessons completed`
                        : "This course is part of your learning plan."}
                    </p>
                    {continueItem && (
                      <Link
                        href={`/learn/${course.courseID}/${continueItem.itemID}`}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-forest-900)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[var(--color-forest-800)]"
                      >
                        <PlayCircle className="h-4 w-4" />
                        {started ? "Continue learning" : "Start learning"}
                      </Link>
                    )}
                  </>
                ) : canEnroll ? (
                  <>
                    <div className="text-[15px] font-semibold">
                      Ready to start learning?
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-ink-500)]">
                      Enroll for free to add this course to your learning plan
                      and track your progress.
                    </p>
                    <form action={enrollInCourse} className="mt-4">
                      <input
                        type="hidden"
                        name="courseId"
                        value={course.courseID}
                      />
                      <button
                        type="submit"
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--color-forest-900)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[var(--color-forest-800)]"
                      >
                        Enroll in this course
                      </button>
                    </form>
                    <ul className="mt-4 space-y-1.5">
                      {[
                        "Learn at your own pace",
                        "Inline knowledge checks",
                        ...(examCount > 0 ? ["Graded module exams"] : []),
                      ].map((line) => (
                        <li
                          key={line}
                          className="flex items-center gap-2 text-[12px] text-[var(--color-ink-500)]"
                        >
                          <Check
                            className="h-3.5 w-3.5 shrink-0 text-[#16a34a]"
                            strokeWidth={3}
                          />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-ink-400)]" />
                    <p className="text-[12.5px] leading-relaxed text-[var(--color-ink-500)]">
                      Teachers can&apos;t enroll in other instructors&apos;
                      courses.
                    </p>
                  </div>
                )}

                {isOwner && (
                  <Link
                    href={`/instructor/${course.courseID}`}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-ink-200)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-ink-700)] transition-colors hover:bg-[var(--cream-50)]"
                  >
                    <Hammer className="h-4 w-4" />
                    Manage course
                  </Link>
                )}

                {canWatch && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href={`/courses/${course.courseID}/resources`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-ink-200)] bg-white px-3 py-2.5 text-[12.5px] font-semibold text-[var(--color-ink-700)] transition-colors hover:bg-[var(--cream-50)]"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Resources
                    </Link>
                    <Link
                      href={`/courses/${course.courseID}/discussion`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-ink-200)] bg-white px-3 py-2.5 text-[12.5px] font-semibold text-[var(--color-ink-700)] transition-colors hover:bg-[var(--cream-50)]"
                    >
                      <MessagesSquare className="h-4 w-4" />
                      Discussion
                    </Link>
                  </div>
                )}
              </div>

              {/* Certificate strip — ore amber */}
              {courseFinished ? (
                <Link
                  href={`/certificate/${course.courseID}`}
                  className="flex items-center gap-3 border-t border-[#c2871e]/20 bg-[#c2871e]/[0.1] px-5 py-3.5 transition-colors hover:bg-[#c2871e]/[0.16]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c2871e] text-white">
                    <Award className="h-4 w-4" />
                  </span>
                  <p className="text-[11.5px] font-semibold leading-snug text-[#8a5f25]">
                    Certificate unlocked — view yours &rarr;
                  </p>
                </Link>
              ) : (
                <div className="flex items-center gap-3 border-t border-[#c2871e]/20 bg-[#c2871e]/[0.08] px-5 py-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c2871e]/15 text-[#c2871e]">
                    <Award className="h-4 w-4" />
                  </span>
                  <p className="text-[11.5px] font-medium leading-snug text-[#8a5f25]">
                    Earn a course certificate by completing every lesson
                    {examCount > 0 ? " and passing the exams" : ""}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TABS: curriculum / overview / instructor / reviews */}
      <section className="mx-auto mt-8 max-w-5xl px-6 md:px-10">
        <CourseTabs
          reviewCount={ratingCount}
          overview={overviewPanel}
          instructor={instructorPanel}
          reviews={
            <ReviewsPanel
              courseID={course.courseID}
              avg={ratingAvg}
              count={ratingCount}
              distribution={distribution}
              reviews={reviewDTOs}
              canReview={canReview}
              myReview={myReviewRow}
            />
          }
          curriculum={
            <>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--color-ink-900)]">
            Course curriculum
          </h2>
          {canWatch && allItems.length > 0 ? (
            <span className="text-[12.5px] font-medium text-[var(--color-ink-500)]">
              <span className="font-bold tabular-nums text-[#16a34a]">
                {doneItemIDs.size}
              </span>{" "}
              of {allItems.length} completed
            </span>
          ) : null}
        </div>

        {modules.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-[var(--color-ink-200)] bg-white/50 p-8 text-center text-[13px] text-[var(--color-ink-500)]">
            The instructor hasn&apos;t added content yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {modules.map((mod, i) => {
              const modSeconds = mod.items.reduce(
                (sum, it) => sum + (it.resource?.duration ?? 0),
                0
              );
              const modDone = mod.items.filter((it) =>
                doneItemIDs.has(it.itemID)
              ).length;
              const modComplete =
                mod.items.length > 0 && modDone === mod.items.length;
              return (
                <div
                  key={mod.moduleID}
                  className="overflow-hidden rounded-2xl border border-[var(--color-ink-200)]/60 bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)]"
                >
                  <div className="flex items-center gap-3.5 border-b border-[var(--color-ink-200)]/50 px-5 py-4">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold tabular-nums",
                        modComplete
                          ? "bg-[#16a34a] text-white"
                          : "bg-[var(--color-forest-900)] text-white"
                      )}
                    >
                      {modComplete ? (
                        <Check className="h-4 w-4" strokeWidth={3} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15.5px] font-semibold text-[var(--color-ink-900)]">
                        {mod.title}
                      </h3>
                      <p className="text-[11.5px] text-[var(--color-ink-500)]">
                        {mod.items.length}{" "}
                        {mod.items.length === 1 ? "lesson" : "lessons"}
                        {modSeconds > 0
                          ? ` · ${formatDuration(modSeconds)}`
                          : ""}
                      </p>
                    </div>
                    {canWatch && mod.items.length > 0 ? (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums",
                          modComplete
                            ? "bg-[#16a34a]/10 text-[#16a34a]"
                            : "bg-[var(--color-ink-100)] text-[var(--color-ink-500)]"
                        )}
                      >
                        {modDone}/{mod.items.length}
                      </span>
                    ) : null}
                  </div>
                  {mod.items.length > 0 && (
                    <ul className="px-3 py-2">
                      {mod.items.map((item) => {
                        const done = doneItemIDs.has(item.itemID);
                        const row = (
                          <>
                            {done ? (
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-white">
                                <Check className="h-3 w-3" strokeWidth={3.5} />
                              </span>
                            ) : (
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                                <KindIcon
                                  kind={item.resource?.kind ?? "EXAM"}
                                />
                              </span>
                            )}
                            <span
                              className={cn(
                                "min-w-0 flex-1 truncate",
                                done && "text-[var(--color-ink-400)]"
                              )}
                            >
                              {item.title ?? item.resource?.title ?? "Exam"}
                            </span>
                            {item.exam ? (
                              <span className="shrink-0 rounded-full bg-[#d8e3f4]/60 px-2 py-0.5 text-[10.5px] font-bold text-[#3b5bcc]">
                                Exam · {item.exam._count.questions} Qs
                              </span>
                            ) : item.resource?.duration ? (
                              <span className="shrink-0 text-[12px] tabular-nums text-[var(--color-ink-400)]">
                                {formatDuration(item.resource.duration)}
                              </span>
                            ) : null}
                          </>
                        );
                        return (
                          <li key={item.itemID}>
                            {canWatch ? (
                              <Link
                                href={`/learn/${course.courseID}/${item.itemID}`}
                                className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] text-[var(--color-ink-700)] transition-colors hover:bg-[var(--cream-50)]"
                              >
                                {row}
                              </Link>
                            ) : (
                              <div className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] text-[var(--color-ink-700)]">
                                {row}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {course.capstone ? (
          <CapstonePanel
            courseID={course.courseID}
            capstone={{
              title: course.capstone.title,
              brief: course.capstone.brief,
              deliverables: course.capstone.deliverables,
              criteria: course.capstone.criteria,
              resources: course.capstone.resources,
            }}
            submission={
              submission
                ? {
                    submittedAt: submission.submittedAt.toISOString(),
                    status: submission.status,
                    feedback: submission.feedback,
                    files: submission.files,
                  }
                : null
            }
            canSubmit={enrolled && !isOwner}
          />
        ) : null}
            </>
          }
        />
      </section>
    </div>
  );
}
