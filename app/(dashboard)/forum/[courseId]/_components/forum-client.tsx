"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clock, MessageSquare, Plus, ArrowUp, Trophy } from "lucide-react";
import { Sidebar } from "@/app/dashboard/_components/sidebar";
import { cn } from "@/lib/utils";
import {
  type ForumForCourse,
  type ForumThread,
  type ThreadType,
  type PerCourseCommunity,
} from "@/app/learn/_data/community-content";

type Props = {
  data: ForumForCourse;
  community: PerCourseCommunity | null;
};

type TabId = "all" | ThreadType;

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Question", label: "Question" },
  { id: "Software", label: "Software" },
  { id: "StudyGroup", label: "Study Group" },
  { id: "Resource", label: "Resource" },
];

const TYPE_LABEL: Record<ThreadType, string> = {
  Question: "Question",
  Software: "Software",
  StudyGroup: "Study group",
  Resource: "Resource",
};

export function ForumClient({ data, community }: Props) {
  const [tab, setTab] = useState<TabId>("all");

  const filtered = useMemo(() => {
    if (tab === "all") return data.threads;
    return data.threads.filter((t) => t.type === tab);
  }, [data.threads, tab]);

  return (
    <div className="flex min-h-screen bg-[var(--cream-50)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="mx-auto max-w-3xl px-10 py-10 space-y-8">
          <Link
            href={`/community/${data.courseId}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {data.courseTitle.split(" — ")[0]} community
          </Link>

          {/* HEADER */}
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
                Discussion &amp; Q&amp;A
              </div>
              <h1 className="mt-2 text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
                Discussion Forum
              </h1>
              <p className="mt-2 text-[13px] text-[var(--color-ink-500)]">
                {data.courseTitle}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {community && <RepPill community={community} />}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-forest-900)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-forest-800)] transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New post
              </button>
            </div>
          </header>

          {/* TABS */}
          <div className="flex items-center gap-1 border-b border-[var(--color-ink-200)]/60">
            {TABS.map((t) => {
              const count =
                t.id === "all"
                  ? data.threads.length
                  : data.threads.filter((th) => th.type === t.id).length;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative px-3 py-2.5 text-[13px] font-medium transition-colors cursor-pointer",
                    tab === t.id
                      ? "text-[var(--color-forest-900)]"
                      : "text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]"
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
                      tab === t.id
                        ? "bg-[var(--color-mint-500)]/15 text-[var(--color-mint-600)]"
                        : "bg-[var(--color-ink-100)] text-[var(--color-ink-500)]"
                    )}
                  >
                    {count}
                  </span>
                  {tab === t.id && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[var(--color-mint-500)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* THREADS */}
          {filtered.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <ul className="space-y-3">
              {filtered.map((thread) => (
                <li key={thread.id}>
                  <ThreadCard thread={thread} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreadCard({ thread }: { thread: ForumThread }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--color-ink-200)]/60 bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <div className="px-5 py-4">
        <div className="flex gap-4">
          {/* Upvote column */}
          <div className="flex w-12 shrink-0 flex-col items-center pt-0.5 text-[var(--color-ink-500)]">
            <ArrowUp className="h-3.5 w-3.5" />
            <span className="mt-0.5 text-[15px] font-semibold tabular-nums text-[var(--color-ink-900)]">
              {thread.upvotes}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-ink-400)]">votes</span>
          </div>

          {/* Body */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <TypePill type={thread.type} />
              <StatusPill status={thread.status} />
            </div>
            <h3 className="mt-2 text-[16px] font-semibold leading-snug text-[var(--color-ink-900)]">
              {thread.title}
            </h3>
            {thread.body && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-ink-700)]">
                {thread.body}
              </p>
            )}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[var(--color-ink-500)]">
              <span>
                Asked by{" "}
                <span className="font-medium text-[var(--color-ink-700)]">{thread.authorName}</span>
              </span>
              <span className="text-[var(--color-ink-300)]">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {thread.askedAgo}
              </span>
              <span className="text-[var(--color-ink-300)]">·</span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {thread.replies} {thread.replies === 1 ? "reply" : "replies"}
              </span>
              {thread.status === "needs-answer" && (
                <>
                  <span className="text-[var(--color-ink-300)]">·</span>
                  <span className="font-semibold text-amber-700">needs an answer</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mentor answer callout */}
      {thread.answer && thread.answer.isMentor && (
        <div className="border-t border-[var(--color-mint-500)]/20 bg-gradient-to-br from-[var(--color-tint-green)]/45 to-white px-5 py-4">
          <div className="flex gap-3">
            <Avatar name={thread.answer.authorName} isMentor />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-[var(--color-ink-900)]">
                  {thread.answer.authorName}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-mint-500)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Mentor
                  <Check className="h-2.5 w-2.5" strokeWidth={4} />
                </span>
                <span className="text-[11px] text-[var(--color-ink-500)]">
                  answered {thread.answer.answeredAgo}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-ink-700)]">
                {thread.answer.body}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[var(--color-ink-500)]">
                <ArrowUp className="h-3 w-3" />
                <span className="tabular-nums font-semibold text-[var(--color-ink-700)]">
                  {thread.answer.upvotes}
                </span>
                <span>upvotes</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {thread.answer && !thread.answer.isMentor && (
        <div className="border-t border-[var(--color-ink-200)]/60 bg-[var(--color-cream-50)]/40 px-5 py-3 text-[12px] text-[var(--color-ink-500)]">
          {thread.answer.authorName} answered · {thread.answer.upvotes} upvotes
        </div>
      )}
    </article>
  );
}

function Avatar({ name, isMentor }: { name: string; isMentor: boolean }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ring-2",
        isMentor
          ? "bg-[var(--color-mint-500)] text-white ring-[var(--color-mint-500)]/20"
          : "bg-[var(--color-cream-100)] text-[var(--color-ink-700)] ring-transparent"
      )}
    >
      {initials}
    </div>
  );
}

function TypePill({ type }: { type: ThreadType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        typePillStyle(type)
      )}
    >
      {TYPE_LABEL[type]}
    </span>
  );
}

function typePillStyle(type: ThreadType): string {
  switch (type) {
    case "Question":
      return "bg-[var(--color-tint-blue)] text-[#2a4a86]";
    case "Software":
      return "bg-[var(--color-tint-tan)] text-[#8a5f25]";
    case "StudyGroup":
      return "bg-[var(--color-tint-purple)] text-[#5a3aa0]";
    case "Resource":
      return "bg-[var(--color-tint-cyan)] text-[#1f6e75]";
  }
}

function StatusPill({ status }: { status: ForumThread["status"] }) {
  if (status === "solved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-mint-500)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-mint-600)]">
        Solved
        <Check className="h-2.5 w-2.5" strokeWidth={4} />
      </span>
    );
  }
  if (status === "needs-answer") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
        Needs answer
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--color-ink-100)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-500)]">
      Open
    </span>
  );
}

function EmptyState({ tab }: { tab: TabId }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-ink-200)] bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-cream-100)] text-[var(--color-ink-500)]">
        <MessageSquare className="h-4 w-4" />
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-[var(--color-ink-900)]">
        No threads in this view
      </h3>
      <p className="mt-1 text-[13px] text-[var(--color-ink-500)]">
        {tab === "all"
          ? "Be the first to post — instructors and mentors watch for new threads."
          : `No ${tab.toLowerCase()} threads yet. Try All, or start a new one.`}
      </p>
    </div>
  );
}

function RepPill({ community }: { community: PerCourseCommunity }) {
  const roleState = community.roles.find((r) => r.state === "current");
  const roleLabel = roleState?.name ?? "Learner";
  return (
    <Link
      href={`/community/${community.courseId}`}
      className="group hidden sm:inline-flex items-center gap-2 rounded-full border border-[var(--color-mint-500)]/30 bg-white px-3 py-1.5 text-[12px] text-[var(--color-ink-700)] shadow-[0_1px_2px_rgba(15,40,30,0.04)] transition-all hover:shadow-[0_3px_8px_rgba(15,40,30,0.08)] hover:-translate-y-0.5"
      title="Your reputation in this community"
    >
      <Trophy className="h-3.5 w-3.5 text-[var(--color-mint-600)]" />
      <span className="font-semibold tabular-nums text-[var(--color-ink-900)]">
        {community.reputation.toLocaleString()}
      </span>
      <span className="text-[var(--color-ink-500)]">rep here</span>
      <span
        className={cn(
          "ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
          rolePillClass(roleLabel)
        )}
      >
        {roleLabel}
      </span>
    </Link>
  );
}

function rolePillClass(role: string): string {
  switch (role) {
    case "Learner":
      return "bg-[var(--color-cream-100)] text-[var(--color-ink-700)]";
    case "Helper":
      return "bg-[var(--color-tint-blue)] text-[#2a4a86]";
    case "Mentor":
      return "bg-[var(--color-tint-green)] text-[var(--color-mint-600)]";
    case "Moderator":
      return "bg-[var(--color-tint-purple)] text-[#5a3aa0]";
    default:
      return "bg-[var(--color-ink-100)] text-[var(--color-ink-700)]";
  }
}
