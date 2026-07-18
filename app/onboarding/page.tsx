import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../utils/db";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkID: user.id },
    select: { goal: true, startingTrack: true, streakGoal: true, onboardingDone: true },
  });

  if (dbUser?.onboardingDone) {
    redirect("/dashboard");
  }

  return (
    <OnboardingFlow
      initialGoal={dbUser?.goal ?? null}
      initialTrack={dbUser?.startingTrack ?? null}
      initialStreak={dbUser?.streakGoal ?? null}
      name={
        user.firstName ??
        user.username ??
        user.emailAddresses[0]?.emailAddress?.split("@")[0] ??
        "there"
      }
    />
  );
}
