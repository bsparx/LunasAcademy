import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, PlayCircle } from "lucide-react";
import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { cn } from "@/lib/utils";
import { getCourseAccess } from "../../course-access";
import { VoteWidget } from "@/app/(dashboard)/_components/discussion/vote-widget";
import { CommentForm } from "@/app/(dashboard)/_components/discussion/comment-form";
import { DeleteButton } from "@/app/(dashboard)/_components/discussion/delete-button";
import { CATEGORY_META, timeAgo } from "@/app/(dashboard)/_components/discussion/category-meta";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string; postId: string }>;
}) {
  const { id, postId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(postId)) notFound();
  const courseID = Number(id);
  const postID = Number(postId);

  const { dbUser } = await requireDbUser();
  const access = await getCourseAccess(courseID, dbUser.userID);
  if (!access) notFound();

  const backLink = (
    <Link
      href={`/courses/${courseID}/discussion`}
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-500)] transition-colors hover:text-[var(--color-ink-900)]"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to discussion
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
        </div>
      </div>
    );
  }

  const post = await prisma.coursePost.findFirst({
    where: { postID, courseID },
    select: {
      postID: true,
      category: true,
      title: true,
      body: true,
      createdAt: true,
      authorID: true,
      author: { select: { name: true } },
      votes: { select: { value: true, userID: true } },
      itemID: true,
      item: { select: { title: true, resource: { select: { title: true } } } },
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          commentID: true,
          body: true,
          createdAt: true,
          authorID: true,
          author: { select: { name: true } },
          votes: { select: { value: true, userID: true } },
        },
      },
    },
  });
  if (!post) notFound();

  const teacherID = (
    await prisma.course.findUnique({ where: { courseID }, select: { teacherID: true } })
  )?.teacherID;

  const score = post.votes.reduce((sum, v) => sum + v.value, 0);
  const myVote = (post.votes.find((v) => v.userID === dbUser.userID)?.value ?? 0) as
    | -1
    | 0
    | 1;
  const meta = CATEGORY_META[post.category];
  const isAuthorOrOwner = (authorID: number) =>
    authorID === dbUser.userID || dbUser.userID === teacherID;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      {backLink}

      {/* Post */}
      <article
        className={cn(
          "mt-6 flex gap-4 rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)]",
          post.category === "ANNOUNCEMENT"
            ? "border-[#c2871e]/30"
            : "border-[var(--color-ink-200)]/60"
        )}
      >
        {post.category !== "ANNOUNCEMENT" && (
          <VoteWidget kind="post" id={post.postID} score={score} myVote={myVote} vertical />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                meta.chip
              )}
            >
              <meta.icon className="h-3 w-3" />
              {meta.label}
            </span>
            {post.itemID !== null ? (
              <Link
                href={`/learn/${courseID}/${post.itemID}`}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-ink-200)]/70 bg-white px-2 py-0.5 text-[10.5px] font-semibold text-[var(--color-ink-500)] transition-colors hover:text-[var(--color-mint-600)]"
              >
                <PlayCircle className="h-3 w-3" />
                {post.item?.title ?? post.item?.resource?.title ?? "Lecture"}
              </Link>
            ) : null}
            <span className="text-[11.5px] text-[var(--color-ink-400)]">
              {post.author.name ?? "Learner"}
              {post.authorID === teacherID ? (
                <span className="ml-1.5 rounded bg-[var(--color-forest-900)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  Instructor
                </span>
              ) : null}
              {" · "}
              {timeAgo(post.createdAt)}
            </span>
          </div>
          <h1 className="mt-2 text-[20px] font-semibold leading-snug tracking-[-0.01em] text-[var(--color-ink-900)]">
            {post.title}
          </h1>
          <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-[var(--color-ink-700)]">
            {post.body}
          </p>
          {isAuthorOrOwner(post.authorID) ? (
            <div className="mt-3 flex items-center gap-2">
              <DeleteButton
                kind="post"
                id={post.postID}
                redirectTo={`/courses/${courseID}/discussion`}
              />
            </div>
          ) : null}
        </div>
      </article>

      {/* Comment form */}
      <div className="mt-6">
        <CommentForm postID={post.postID} />
      </div>

      {/* Comments */}
      <div className="mt-6">
        <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-500)]">
          {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
        </div>
        <ul className="mt-3 space-y-3">
          {post.comments.map((c) => {
            const cScore = c.votes.reduce((sum, v) => sum + v.value, 0);
            const cMyVote = (c.votes.find((v) => v.userID === dbUser.userID)?.value ??
              0) as -1 | 0 | 1;
            return (
              <li
                key={c.commentID}
                className="flex gap-3 rounded-xl border border-[var(--color-ink-200)]/50 bg-white px-4 py-3"
              >
                <VoteWidget kind="comment" id={c.commentID} score={cScore} myVote={cMyVote} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[var(--color-ink-900)]">
                      {c.author.name ?? "Learner"}
                    </span>
                    {c.authorID === teacherID ? (
                      <span className="rounded bg-[var(--color-forest-900)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        Instructor
                      </span>
                    ) : null}
                    <span className="text-[11px] text-[var(--color-ink-400)]">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--color-ink-700)]">
                    {c.body}
                  </p>
                  {isAuthorOrOwner(c.authorID) ? (
                    <div className="mt-1.5">
                      <DeleteButton kind="comment" id={c.commentID} />
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
