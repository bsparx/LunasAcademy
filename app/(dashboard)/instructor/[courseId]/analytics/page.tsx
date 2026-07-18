import { notFound } from "next/navigation";
import { requireTeacher } from "@/app/utils/auth";
import { getInstructorCourse } from "@/app/(dashboard)/learn/_data/instructor-content";
import { InstructorAnalyticsClient } from "./_components/instructor-analytics";

export default async function InstructorAnalyticsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireTeacher();

  const { courseId } = await params;
  const course = getInstructorCourse(courseId);
  if (!course) notFound();

  return <InstructorAnalyticsClient course={course} />;
}
