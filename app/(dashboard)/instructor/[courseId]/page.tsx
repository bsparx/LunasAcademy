import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getInstructorCourse } from "@/app/learn/_data/instructor-content";
import { CourseBuilderClient } from "./_components/course-builder";

export function generateStaticParams() {
  return [
    { courseId: "rock-cycle" },
    { courseId: "geophysics-intro" },
    { courseId: "materials" },
  ];
}

export default async function CourseBuilderPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { courseId } = await params;
  const course = getInstructorCourse(courseId);
  if (!course) notFound();

  return <CourseBuilderClient course={course} />;
}
