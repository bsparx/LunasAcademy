import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../utils/db";
import { Sidebar } from "./_components/sidebar";
import { DashboardClient } from "./_components/dashboard-client";
import { getGlobalCommunity, getAllCourseCommunities } from "@/app/learn/_data/community-content";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkID: user.id },
  });

  const displayName =
    dbUser?.name ??
    user.firstName ??
    user.username ??
    user.emailAddresses[0]?.emailAddress?.split("@")[0] ??
    "there";

  // Community stats for the dashboard widget. In a real app these come from
  // the DB; for MVP we pull from the hardcoded community content.
  const community = getGlobalCommunity();
  const allCommunities = getAllCourseCommunities();
  const unansweredCount = allCommunities.reduce((acc, c) => {
    for (const w of c.ways) {
      if (w.meta) {
        const m = w.meta.match(/^(\d+)\s+waiting/);
        if (m) acc += parseInt(m[1], 10);
      }
    }
    return acc;
  }, 0);

  // In a real app, these come from the DB. Hardcoded for now to match the design.
  const dashboardProps = {
    name: displayName,
    email:
      user.emailAddresses[0]?.emailAddress ??
      dbUser?.email ??
      "",
    avatarUrl: user.imageUrl ?? null,
    streak: 7,
    xp: 1840,
    weeklyGoalDone: 4,
    weeklyGoalTotal: 5,
    dueCards: 5,
    karma: community.user.karma,
    weeklyKarma: community.user.weeklyKarma,
    karmaRank: community.user.rank,
    unansweredCount,
    currentCourse: {
      pathway: "Core Pathway",
      courseIndex: 1,
      courseTotal: 7,
      title: "Earth & Environmental Systems",
      progress: 50,
      lesson: {
        current: 4,
        total: 8,
        title: "The hydrosphere",
        minutes: 9,
      },
    },
    pathwayNodes: [
      { id: "earth-sys", label: "Earth Sys", state: "done" as const },
      { id: "data-mgmt", label: "Data Mgmt", state: "current" as const },
      { id: "field", label: "Field", state: "locked" as const },
      { id: "rock-cycle", label: "Rock Cycle", state: "locked" as const },
    ],
    hasMorePathway: true,
  };

  return (
    <div className="flex min-h-screen bg-[var(--cream-50)]">
      <Sidebar />
      <DashboardClient {...dashboardProps} />
    </div>
  );
}
