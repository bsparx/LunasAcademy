import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/utils/db";
import {
  getProgressSummary,
  getActivityGrid,
  getBadges,
} from "@/app/learn/_data/progress-content";
import { ProgressClient } from "./_components/progress-client";

export default async function ProgressPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkID: user.id },
    select: { name: true },
  });
  const displayName =
    dbUser?.name ??
    user.firstName ??
    user.username ??
    user.emailAddresses[0]?.emailAddress?.split("@")[0] ??
    "there";

  return (
    <ProgressClient
      name={displayName}
      summary={getProgressSummary()}
      activity={getActivityGrid()}
      badges={getBadges()}
    />
  );
}
