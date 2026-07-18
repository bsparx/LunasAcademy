import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./db";

export async function requireDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkID: clerkUser.id },
  });
  if (!dbUser) redirect("/connect");

  return { clerkUser, dbUser };
}

export async function requireTeacher() {
  const session = await requireDbUser();
  if (session.dbUser.role !== "TEACHER") redirect("/dashboard");
  return session;
}
