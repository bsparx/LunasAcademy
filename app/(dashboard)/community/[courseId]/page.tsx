import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getCourseCommunity } from "@/app/learn/_data/community-content";
import { CommunityCourseClient } from "./_components/community-course";

export function generateStaticParams() {
  return [
    { courseId: "rock-cycle" },
    { courseId: "geophysics-intro" },
    { courseId: "materials" },
  ];
}

export default async function CommunityCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { courseId } = await params;
  const data = getCourseCommunity(courseId);
  if (!data) notFound();

  return <CommunityCourseClient data={data} />;
}
