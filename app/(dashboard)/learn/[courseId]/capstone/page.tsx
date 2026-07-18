import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import coursesData from "@/app/courses/_data/courses.json";
import type { CourseDetail } from "@/app/courses/[id]/page";
import { getCapstone } from "@/app/learn/_data/learning-content";
import { CapstoneClient } from "./_components/capstone-client";

const courses = coursesData as unknown as Record<string, CourseDetail>;

export function generateStaticParams() {
  return Object.keys(courses).map((id) => ({ courseId: id }));
}

export default async function CapstonePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const course = courses[courseId];
  if (!course) notFound();

  const capstone = getCapstone(courseId);
  if (!capstone) notFound();

  return (
    <CapstoneClient
      courseId={course.id}
      courseTitle={course.title}
      pathway={course.pathway}
      capstone={capstone}
    />
  );
}
