import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getResources } from "@/app/learn/_data/community-content";
import { ResourcesClient } from "./_components/resources-client";

export function generateStaticParams() {
  return [
    { courseId: "rock-cycle" },
    { courseId: "geophysics-intro" },
    { courseId: "materials" },
  ];
}

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { courseId } = await params;
  const data = getResources(courseId);
  if (!data) notFound();

  return <ResourcesClient data={data} />;
}
