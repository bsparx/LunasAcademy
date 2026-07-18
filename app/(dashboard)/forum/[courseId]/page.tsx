import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import {
  getForum,
  getCourseCommunity,
} from "@/app/(dashboard)/learn/_data/community-content";
import { ForumClient } from "./_components/forum-client";

export function generateStaticParams() {
  return [
    { courseId: "rock-cycle" },
    { courseId: "geophysics-intro" },
    { courseId: "materials" },
  ];
}

export default async function ForumPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { courseId } = await params;
  const data = getForum(courseId);
  if (!data) notFound();

  const community = getCourseCommunity(courseId) ?? null;

  return <ForumClient data={data} community={community} />;
}
