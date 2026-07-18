import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/utils/db";
import { Sidebar } from "./_components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const dbUser = userId
    ? await prisma.user.findUnique({
        where: { clerkID: userId },
        select: { role: true },
      })
    : null;

  return (
    <div className="flex min-h-screen bg-[var(--cream-50)]">
      <Sidebar isTeacher={dbUser?.role === "TEACHER"} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
