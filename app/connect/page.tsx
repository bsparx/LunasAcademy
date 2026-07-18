import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../utils/db";

export default async function ConnectPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses[0]?.emailAddress ?? null;
  const name =
    user.username ??
    user.firstName ??
    user.emailAddresses[0]?.emailAddress?.split("@")[0] ??
    "User";

  if (!email) {
    redirect("/sign-in?error=missing_email");
  }

  const existing = await prisma.user.findUnique({
    where: { clerkID: user.id },
    select: { userID: true },
  });
  const isNewUser = !existing;

  await prisma.user.upsert({
    where: { clerkID: user.id },
    update: { email, name },
    create: {
      clerkID: user.id,
      email,
      name,
      role: "student",
    },
  });

  redirect(isNewUser ? "/onboarding" : "/dashboard");
}
