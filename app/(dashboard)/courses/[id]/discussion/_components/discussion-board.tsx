"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Flame, MessageSquare, MessagesSquare, PlayCircle, Search } from "lucide-react";
import type { PostCategory } from "@prisma/client";
import { cn } from "@/lib/utils";
import { NewPostForm } from "./new-post-form";
import { VoteWidget } from "@/app/(dashboard)/_components/discussion/vote-widget";
import { CATEGORY_META, timeAgo } from "@/app/(dashboard)/_components/discussion/category-meta";

/* Category/search/sort live entirely in client state — no navigation, no
   useEffect. All posts (up to 200, newest first) are fetched once by the
   server; every filter/sort here is plain array math over that same array. */

export type PostRow = {
  postID: number;
  category: PostCategory;
  title: string;
  body: string;
  createdAt: string; // ISO
  authorID: number;
  author: { name: string | null };
  _count: { comments: number };
  score: number;
  myVote: -1 | 0 | 1;
  itemID: number | null;
  itemTitle: string | null;
};

type CategoryCount = { category: PostCategory; _count: number };

const CATEGORY_TABS: { key: string; category: PostCategory | null; label: string }[] = [
  { key: "all", category: null, label: "All posts" },
  { key: "announcements", category: "ANNOUNCEMENT", label: "Announcements" },
  { key: "questions", category: "QUESTION", label: "Questions" },
  { key: "advice", category: "ADVICE", label: "Advice" },
  { key: "lectures", category: "LECTURE", label: "Lectures" },
];

export function DiscussionBoard({
  courseID,
  posts,
  categoryCounts,
  teacherID,
  canAnnounce,
  initial,
}: {
  courseID: number;
  posts: PostRow[];
  categoryCounts: CategoryCount[];
  teacherID: number | null;
  canAnnounce: boolean;
  initial: { cat: string; q: string; sort: string };
}) {
  const [category, setCategory] = useState(initial.cat);
  const [query, setQuery] = useState(initial.q);
  const [sort, setSort] = useState<"new" | "top">(initial.sort === "top" ? "top" : "new");

  const activeTab = CATEGORY_TABS.find((t) => t.key === category) ?? CATEGORY_TABS[0];

  const countFor = (cat: PostCategory | null) =>
    cat === null
      ? categoryCounts.reduce((sum, c) => sum + c._count, 0)
      : categoryCounts.find((c) => c.category === cat)?._count ?? 0;

  const visible = useMemo(() => {
    let list = activeTab.category
      ? posts.filter((p) => p.category === activeTab.category)
      : posts;
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
  }, [posts, activeTab.category, query, sort]);

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
          className="w-full rounded-full border border-[var(--color-ink-200)] bg-white py-2.5 pl-11 pr-4 text-[13.5px] text-[var(--color-ink-900)] shadow-[0_1px_2px_rgba(15,40,30,0.03)] placeholder:text-[var(--color-ink-400)] focus:border-[var(--color-mint-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-500)]/20"
        />
      </div>

      {/* Category tabs + sort */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORY_TABS.map((tab) => {
            const active = tab.key === activeTab.key;
            const meta = tab.category ? CATEGORY_META[tab.category] : null;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCategory(tab.key)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  active
                    ? "bg-[var(--color-forest-900)] text-white"
                    : "border border-[var(--color-ink-200)]/60 bg-white text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]"
                )}
              >
                {meta ? <meta.icon className="h-3.5 w-3.5" /> : null}
                {tab.label}
                <span
                  className={cn(
                    "text-[10.5px] font-bold tabular-nums",
                    active ? "text-white/60" : "text-[var(--color-ink-400)]"
                  )}
                >
                  {countFor(tab.category)}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1">
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
      </div>

      {/* New post */}
      <div className="mt-5">
        <NewPostForm courseID={courseID} canAnnounce={canAnnounce} />
      </div>

      {/* Posts */}
      {visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-ink-300)] bg-white/60 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-tint-green)]">
            <MessagesSquare className="h-5 w-5 text-[var(--color-mint-600)]" />
          </div>
          <p className="mx-auto mt-4 max-w-sm text-[13px] leading-relaxed text-[var(--color-ink-500)]">
            {query
              ? `No posts match “${query}”.`
              : "Nothing here yet — be the first to start a discussion."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((post) => {
            const meta = CATEGORY_META[post.category];
            const isInstructor = post.authorID === teacherID;
            return (
              <li
                key={post.postID}
                className={cn(
                  "flex gap-3.5 rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,40,30,0.03)] transition-all hover:shadow-[0_5px_16px_rgba(15,40,30,0.07)]",
                  post.category === "ANNOUNCEMENT"
                    ? "border-[#c2871e]/30"
                    : "border-[var(--color-ink-200)]/60"
                )}
              >
                {post.category !== "ANNOUNCEMENT" && (
                  <VoteWidget
                    kind="post"
                    id={post.postID}
                    score={post.score}
                    myVote={post.myVote}
                    vertical
                  />
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
                    {post.itemID !== null && post.itemTitle ? (
                      <Link
                        href={`/learn/${courseID}/${post.itemID}`}
                        className="inline-flex max-w-[200px] items-center gap-1 truncate rounded-full border border-[var(--color-ink-200)]/70 bg-white px-2 py-0.5 text-[10.5px] font-semibold text-[var(--color-ink-500)] transition-colors hover:text-[var(--color-mint-600)]"
                      >
                        <PlayCircle className="h-3 w-3 shrink-0" />
                        <span className="truncate">{post.itemTitle}</span>
                      </Link>
                    ) : null}
                    <span className="text-[11.5px] text-[var(--color-ink-400)]">
                      {post.author.name ?? "Learner"}
                      {isInstructor ? (
                        <span className="ml-1.5 rounded bg-[var(--color-forest-900)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          Instructor
                        </span>
                      ) : null}
                      {" · "}
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>
                  <Link
                    href={`/courses/${courseID}/discussion/${post.postID}`}
                    className="mt-1.5 block"
                  >
                    <h2 className="text-[15.5px] font-semibold leading-snug text-[var(--color-ink-900)] transition-colors hover:text-[var(--color-mint-600)]">
                      {post.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--color-ink-500)]">
                      {post.body}
                    </p>
                  </Link>
                  <Link
                    href={`/courses/${courseID}/discussion/${post.postID}`}
                    className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--color-ink-400)] transition-colors hover:text-[var(--color-ink-900)]"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {post._count.comments}{" "}
                    {post._count.comments === 1 ? "comment" : "comments"}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
