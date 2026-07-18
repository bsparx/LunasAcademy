import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { getCourseAccess } from "../course-access";
import { DiscussionBoard } from "./_components/discussion-board";

export default async function CourseDiscussionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; cat?: string; sort?: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const courseID = Number(id);

  // Parsed only to seed the client component's initial state (deep-link
  // support on first paint) — filtering itself happens client-side.
  const { q = "", cat = "all", sort = "new" } = await searchParams;
  const query = q.trim().slice(0, 100);

  const { dbUser } = await requireDbUser();
  const access = await getCourseAccess(courseID, dbUser.userID);
  if (!access) notFound();

  const backLink = (
    <Link
      href={`/courses/${courseID}`}
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-500)] transition-colors hover:text-[var(--color-ink-900)]"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to {access.title}
    </Link>
  );

  if (!access.allowed) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
        {backLink}
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-ink-300)] bg-white/60 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-tint-tan)]">
            <Lock className="h-5 w-5 text-[#8a5f25]" />
          </div>
          <div className="mt-4 text-[16px] font-semibold text-[var(--color-ink-900)]">
            The discussion is for enrolled learners
          </div>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-[var(--color-ink-500)]">
            Enroll in the course (it&apos;s free) to ask questions, share
            advice, and hear announcements from your instructor.
          </p>
          <Link
            href={`/courses/${courseID}`}
            className="mt-5 inline-flex items-center rounded-lg bg-[var(--color-forest-900)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-forest-800)]"
          >
            Go to the course page
          </Link>
        </div>
      </div>
    );
  }

  const [posts, categoryCounts, course] = await Promise.all([
    prisma.coursePost.findMany({
      where: { courseID },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        postID: true,
        category: true,
        title: true,
        body: true,
        createdAt: true,
        authorID: true,
        author: { select: { name: true } },
        _count: { select: { comments: true } },
        votes: { select: { value: true, userID: true } },
        itemID: true,
        item: { select: { title: true, resource: { select: { title: true } } } },
      },
    }),
    prisma.coursePost.groupBy({
      by: ["category"],
      where: { courseID },
      _count: true,
    }),
    prisma.course.findUnique({
      where: { courseID },
      select: { teacherID: true },
    }),
  ]);

  const rows = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    score: p.votes.reduce((sum, v) => sum + v.value, 0),
    myVote: (p.votes.find((v) => v.userID === dbUser.userID)?.value ?? 0) as -1 | 0 | 1,
    itemTitle: p.item?.title ?? p.item?.resource?.title ?? null,
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      {backLink}

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-px w-6 bg-[var(--color-mint-500)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-mint-600)]">
              Course discussion
            </span>
          </div>
          <h1 className="mt-2.5 text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--color-ink-900)]">
            {access.title}
          </h1>
        </div>
      </header>

      <DiscussionBoard
        courseID={courseID}
        posts={rows}
        categoryCounts={categoryCounts}
        teacherID={course?.teacherID ?? null}
        canAnnounce={access.isOwner}
        initial={{ cat, q: query, sort }}
      />
    </div>
  );
}
