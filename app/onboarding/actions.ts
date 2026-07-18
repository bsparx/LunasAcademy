"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../utils/db";

export async function saveOnboarding(formData: FormData) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const isTeacher = formData.get("role") === "teacher";
  const goal = (formData.get("goal") as string) || null;
  const startingTrack = (formData.get("startingTrack") as string) || null;
  const streakGoalRaw = formData.get("streakGoal") as string | null;
  const streakGoal = streakGoalRaw ? Number.parseInt(streakGoalRaw, 10) : null;

  await prisma.user.update({
    where: { clerkID: user.id },
    data: {
      role: isTeacher ? "TEACHER" : "STUDENT",
      goal: isTeacher ? null : goal,
      startingTrack: isTeacher ? null : startingTrack,
      streakGoal,
      onboardingDone: true,
    },
  });

  redirect("/dashboard");
}

export async function skipOnboarding() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  await prisma.user.update({
    where: { clerkID: user.id },
    data: { onboardingDone: true },
  });

  redirect("/dashboard");
}

