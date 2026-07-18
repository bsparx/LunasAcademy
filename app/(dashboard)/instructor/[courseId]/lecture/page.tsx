import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import {
  getInstructorCourse,
  type Block,
} from "@/app/learn/_data/instructor-content";
import { getResources } from "@/app/learn/_data/community-content";
import { LectureEditorClient } from "./_components/lecture-editor";

export function generateStaticParams() {
  return [
    { courseId: "rock-cycle" },
    { courseId: "geophysics-intro" },
    { courseId: "materials" },
  ];
}

export default async function LectureEditorPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { courseId } = await params;
  const course = getInstructorCourse(courseId);
  if (!course) notFound();

  // Pick the first video block from the first module that has one. For MVP
  // we always default to that — no block picker yet.
  const firstModule = course.modules[0];
  const firstVideo = firstModule?.blocks.find((b) => b.type === "video");
  if (!firstModule || !firstVideo) notFound();

  const block: Block & { moduleTitle: string } = {
    ...firstVideo,
    moduleTitle: firstModule.title,
  };

  const resources = getResources(courseId) ?? null;

  return (
    <LectureEditorClient
      course={course}
      block={block}
      resources={resources}
    />
  );
}
