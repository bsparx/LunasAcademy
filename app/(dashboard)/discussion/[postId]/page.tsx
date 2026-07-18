import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { VoteWidget } from "@/app/(dashboard)/_components/discussion/vote-widget";
import { CommentForm } from "@/app/(dashboard)/_components/discussion/comment-form";
import { DeleteButton } from "@/app/(dashboard)/_components/discussion/delete-button";
import { timeAgo } from "@/app/(dashboard)/_components/discussion/category-meta";

export default async function GeneralPostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  if (!/^\d+$/.test(postId)) notFound();
  const postID = Number(postId);

  const { dbUser } = await requireDbUser();

  const post = await prisma.coursePost.findFirst({
    where: { postID, courseID: null },
    select: {
      postID: true,
      title: true,
      body: true,
      createdAt: true,
      authorID: true,
      author: { select: { name: true } },
      votes: { select: { value: true, userID: true } },
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

  const score = post.votes.reduce((sum, v) => sum + v.value, 0);
  const myVote = (post.votes.find((v) => v.userID === dbUser.userID)?.value ?? 0) as
    | -1
    | 0
    | 1;
  const isAuthorOf = (authorID: number) => authorID === dbUser.userID;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <Link
        href="/discussion"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-500)] transition-colors hover:text-[var(--color-ink-900)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to general discussion
      </Link>

      {/* Post */}
      <article className="mt-6 flex gap-4 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
        <VoteWidget kind="post" id={post.postID} score={score} myVote={myVote} vertical />
        <div className="min-w-0 flex-1">
          <span className="text-[11.5px] text-[var(--color-ink-400)]">
            {post.author.name ?? "Learner"} · {timeAgo(post.createdAt)}
          </span>
          <h1 className="mt-2 text-[20px] font-semibold leading-snug tracking-[-0.01em] text-[var(--color-ink-900)]">
            {post.title}
          </h1>
          <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-[var(--color-ink-700)]">
            {post.body}
          </p>
          {isAuthorOf(post.authorID) ? (
            <div className="mt-3 flex items-center gap-2">
              <DeleteButton kind="post" id={post.postID} redirectTo="/discussion" />
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
                    <span className="text-[11px] text-[var(--color-ink-400)]">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--color-ink-700)]">
                    {c.body}
                  </p>
                  {isAuthorOf(c.authorID) ? (
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
