import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getLeaderboard } from "@/app/(dashboard)/learn/_data/progress-content";
import { LeaderboardClient } from "./_components/leaderboard-client";

export default async function LeaderboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const board = getLeaderboard();
  const youRow = board.rows.find((r) => r.isYou);

  return (
    <LeaderboardClient
      scope={board.scope}
      rows={board.rows}
      youRank={youRow?.rank ?? null}
    />
  );
}
