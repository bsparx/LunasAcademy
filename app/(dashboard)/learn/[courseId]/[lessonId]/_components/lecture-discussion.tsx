"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { commentOnLecture } from "@/app/(dashboard)/discussion-actions";
import { VoteWidget } from "@/app/(dashboard)/_components/discussion/vote-widget";
import { DeleteButton } from "@/app/(dashboard)/_components/discussion/delete-button";
import { timeAgo } from "@/app/(dashboard)/_components/discussion/category-meta";

export type LectureComment = {
  commentID: number;
  body: string;
  createdAt: string; // ISO
  authorID: number;
  author: { name: string | null };
  score: number;
  myVote: -1 | 0 | 1;
};

/* Comments here are just the course discussion board, filtered to this
   lecture's auto-created LECTURE-category thread — commentOnLecture finds
   or creates that thread and flags it with this lecture, so it also shows
   up (with a "flag" chip) on /courses/[id]/discussion. */
export function LectureDiscussion({
  courseID,
  itemID,
  comments,
  teacherID,
  currentUserID,
}: {
  courseID: number;
  itemID: number;
  comments: LectureComment[];
  teacherID: number;
  currentUserID: number;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (pending || !body.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await commentOnLecture(courseID, itemID, body);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--color-ink-900)]">
        <MessageSquare className="h-4 w-4 text-[var(--color-mint-600)]" />
        {comments.length === 0
          ? "Comments"
          : `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`}
      </div>

      <div>
        <div className="flex items-start gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Ask a question or share a thought about this lecture…"
            className="min-h-0 flex-1 rounded-xl border border-[var(--color-ink-200)] bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-400)] focus:border-[var(--color-mint-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-500)]/20"
          />
          <Button
            onClick={submit}
            disabled={pending || !body.trim()}
            aria-label="Post comment"
            className="bg-[var(--color-forest-900)] text-white hover:bg-[var(--color-forest-800)]"
          >
            {pending ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Send data-icon="inline-start" />
            )}
            Comment
          </Button>
        </div>
        {error ? (
          <p className="mt-1.5 text-[12px] font-medium text-red-600">{error}</p>
        ) : null}
      </div>

      {comments.length > 0 ? (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li
              key={c.commentID}
              className="flex gap-3 rounded-xl border border-[var(--color-ink-200)]/50 bg-[var(--color-cream-50)]/60 px-4 py-3"
            >
              <VoteWidget kind="comment" id={c.commentID} score={c.score} myVote={c.myVote} />
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
                {c.authorID === currentUserID || currentUserID === teacherID ? (
                  <div className="mt-1.5">
                    <DeleteButton kind="comment" id={c.commentID} />
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12.5px] text-[var(--color-ink-500)]">
          No comments yet — be the first to ask about this lecture.
        </p>
      )}
    </div>
  );
}
