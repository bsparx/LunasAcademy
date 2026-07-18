"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Flame, MessageSquare, MessagesSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoteWidget } from "@/app/(dashboard)/_components/discussion/vote-widget";
import { timeAgo } from "@/app/(dashboard)/_components/discussion/category-meta";
import { NewGeneralPostForm } from "./new-general-post-form";

/* Search/sort live entirely in client state — no navigation, no useEffect.
   All posts (up to 200, newest first) are fetched once by the server; every
   filter/sort here is plain array math over that same array. */

export type GeneralPostRow = {
  postID: number;
  title: string;
  body: string;
  createdAt: string; // ISO
  authorID: number;
  author: { name: string | null };
  _count: { comments: number };
  score: number;
  myVote: -1 | 0 | 1;
};

export function GeneralBoard({
  posts,
  initial,
}: {
  posts: GeneralPostRow[];
  initial: { q: string; sort: string };
}) {
  const [query, setQuery] = useState(initial.q);
  const [sort, setSort] = useState<"new" | "top">(initial.sort === "top" ? "top" : "new");

  const visible = useMemo(() => {
    let list = posts;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
      );
    }
    if (sort === "top") {
      list = [...list].sort(
        (a, b) => b.score - a.score || +new Date(b.createdAt) - +new Date(a.createdAt)
      );
    }
    return list;
  }, [posts, query, sort]);

  return (
    <>
      {/* Search */}
      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-400)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts…"
          className="w-full rounded-full border border-[var(--color-ink-200)] bg-white py-2.5 pl-11 pr-4 text-[13.5px] text-[var(--color-ink-900)] shadow-[0_1px_2px_rgba(15,40,30,0.03)] placeholder:text-[var(--color-ink-400)] focus:border-[#8b6fd1] focus:outline-none focus:ring-2 focus:ring-[#8b6fd1]/20"
        />
      </div>

      {/* Sort */}
      <div className="mt-4 flex items-center justify-end gap-1">
        {(
          [
            { key: "new", label: "New", icon: Clock },
            { key: "top", label: "Top", icon: Flame },
          ] as const
        ).map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSort(s.key)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold transition-colors",
              sort === s.key
                ? "bg-[var(--color-ink-900)]/90 text-white"
                : "text-[var(--color-ink-400)] hover:text-[var(--color-ink-900)]"
            )}
          >
            <s.icon className="h-3 w-3" />
            {s.label}
          </button>
        ))}
      </div>

      {/* New post */}
      <div className="mt-5">
        <NewGeneralPostForm />
      </div>

      {/* Posts */}
      {visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-ink-300)] bg-white/60 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#8b6fd1]/12">
            <MessagesSquare className="h-5 w-5 text-[#8b6fd1]" />
          </div>
          <p className="mx-auto mt-4 max-w-sm text-[13px] leading-relaxed text-[var(--color-ink-500)]">
            {query
              ? `No posts match “${query}”.`
              : "Nothing here yet — be the first to post."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((post) => (
            <li
              key={post.postID}
              className="flex gap-3.5 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-4 shadow-[0_1px_2px_rgba(15,40,30,0.03)] transition-all hover:shadow-[0_5px_16px_rgba(15,40,30,0.07)]"
            >
              <VoteWidget
                kind="post"
                id={post.postID}
                score={post.score}
                myVote={post.myVote}
                vertical
              />
              <div className="min-w-0 flex-1">
                <span className="text-[11.5px] text-[var(--color-ink-400)]">
                  {post.author.name ?? "Learner"} · {timeAgo(post.createdAt)}
                </span>
                <Link href={`/discussion/${post.postID}`} className="mt-1.5 block">
                  <h2 className="text-[15.5px] font-semibold leading-snug text-[var(--color-ink-900)] transition-colors hover:text-[#8b6fd1]">
                    {post.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--color-ink-500)]">
                    {post.body}
                  </p>
                </Link>
                <Link
                  href={`/discussion/${post.postID}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--color-ink-400)] transition-colors hover:text-[var(--color-ink-900)]"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {post._count.comments}{" "}
                  {post._count.comments === 1 ? "comment" : "comments"}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
