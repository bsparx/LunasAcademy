import { prisma } from "@/app/utils/db";

/**
 * Enrollment gate shared by the resources page, the discussion board, and
 * their actions: the course owner always has access; students need an
 * enrollment in a PUBLISHED course.
 */
export async function getCourseAccess(courseID: number, userID: number) {
  if (!Number.isInteger(courseID)) return null;
  const course = await prisma.course.findUnique({
    where: { courseID },
    select: {
      courseID: true,
      title: true,
      status: true,
      teacherID: true,
      enrollments: { where: { userID }, select: { enrollmentID: true } },
    },
  });
  if (!course) return null;

  const isOwner = course.teacherID === userID;
  const enrolled = course.enrollments.length > 0;
  return {
    courseID: course.courseID,
    title: course.title,
    isOwner,
    enrolled,
    allowed: isOwner || (course.status === "PUBLISHED" && enrolled),
  };
}
