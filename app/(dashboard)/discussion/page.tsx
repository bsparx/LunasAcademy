import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { GeneralBoard } from "./_components/general-board";

export default async function GeneralDiscussionPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q = "", sort = "new" } = await searchParams;
  const query = q.trim().slice(0, 100);

  const { dbUser } = await requireDbUser();

  const posts = await prisma.coursePost.findMany({
    where: { courseID: null },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      postID: true,
      title: true,
      body: true,
      createdAt: true,
      authorID: true,
      author: { select: { name: true } },
      _count: { select: { comments: true } },
      votes: { select: { value: true, userID: true } },
    },
  });

  const rows = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    score: p.votes.reduce((sum, v) => sum + v.value, 0),
    myVote: (p.votes.find((v) => v.userID === dbUser.userID)?.value ?? 0) as -1 | 0 | 1,
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <header>
        <div className="flex items-center gap-2.5">
          <span className="h-px w-6 bg-[#8b6fd1]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6fd1]">
            General discussion
          </span>
        </div>
        <h1 className="mt-2.5 text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--color-ink-900)]">
          The Lounge
        </h1>
        <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-[var(--color-ink-500)]">
          Open to every student and teacher at Luna&apos;s Academy — no course
          enrollment needed. Share memes, wins, off-topic chatter, whatever.
        </p>
      </header>

      <GeneralBoard posts={rows} initial={{ q: query, sort }} />
    </div>
  );
}
