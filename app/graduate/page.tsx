import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/utils/db";
import { getGraduate } from "@/app/(dashboard)/learn/_data/progress-content";
import { GraduateClient } from "./_components/graduate-client";

export default async function GraduatePage() {
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
    "friend";

  return <GraduateClient graduate={getGraduate()} name={displayName} />;
}
