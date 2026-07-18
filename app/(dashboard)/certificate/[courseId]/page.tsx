import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { CertificateClient } from "./_components/certificate-client";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  if (!/^\d+$/.test(courseId)) notFound();
  const courseID = Number(courseId);

  const { dbUser } = await requireDbUser();

  const course = await prisma.course.findUnique({
    where: { courseID },
    select: {
      courseID: true,
      title: true,
      pathway: true,
      teacher: { select: { name: true } },
      enrollments: {
        where: { userID: dbUser.userID },
        select: { enrollmentID: true },
      },
      topics: {
        select: {
          modules: { select: { items: { select: { itemID: true } } } },
        },
      },
    },
  });
  if (!course) notFound();
  if (course.enrollments.length === 0) notFound();

  const allItemIDs = course.topics.flatMap((t) =>
    t.modules.flatMap((m) => m.items.map((i) => i.itemID))
  );
  if (allItemIDs.length === 0) notFound();

  const progressRows = await prisma.itemProgress.findMany({
    where: { userID: dbUser.userID, itemID: { in: allItemIDs } },
    select: { completedAt: true },
  });
  // Certificate only exists once every lesson in the course is done.
  if (progressRows.length < allItemIDs.length) {
    redirect(`/courses/${courseID}`);
  }

  const issuedOnDate = progressRows.reduce(
    (latest, r) => (r.completedAt > latest ? r.completedAt : latest),
    progressRows[0].completedAt
  );

  let nextCourse: { courseId: string; title: string } | null = null;
  if (course.pathway) {
    const sibling = await prisma.course.findFirst({
      where: {
        pathway: course.pathway,
        status: "PUBLISHED",
        courseID: { not: courseID },
        enrollments: { none: { userID: dbUser.userID } },
      },
      orderBy: { courseID: "asc" },
      select: { courseID: true, title: true },
    });
    if (sibling) {
      nextCourse = { courseId: String(sibling.courseID), title: sibling.title };
    }
  }

  const certificate = {
    courseId: String(course.courseID),
    courseTitle: course.title,
    badge: "Luna's Academy",
    issuedOn: issuedOnDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    issuedTo: dbUser.name ?? "Learner",
    signatory: { name: course.teacher.name ?? "Course Instructor", role: "Instructor" },
    id: `NTDI-C${course.courseID}-U${dbUser.userID}`,
    nextCourse,
  };

  return <CertificateClient certificate={certificate} />;
}
