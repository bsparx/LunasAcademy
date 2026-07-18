import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { CoursesClient, type CourseCardDTO } from "./_components/courses-client";

export default async function CoursesPage() {
  const { dbUser } = await requireDbUser();

  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { enrollments: true } },
      topics: {
        select: {
          modules: {
            select: {
              items: { select: { resource: { select: { duration: true } } } },
            },
          },
        },
      },
      enrollments: {
        where: { userID: dbUser.userID },
        select: { enrollmentID: true },
      },
    },
  });

  const cards: CourseCardDTO[] = courses.map((c) => {
    const modules = c.topics.flatMap((t) => t.modules);
    const items = modules.flatMap((m) => m.items);
    const seconds = items.reduce(
      (sum, i) => sum + (i.resource?.duration ?? 0),
      0
    );
    return {
      courseID: c.courseID,
      title: c.title,
      description: c.description,
      pathway: c.pathway,
      level: c.level,
      teacherName: c.teacher.name ?? "Luna's Academy instructor",
      moduleCount: modules.length,
      lessonCount: items.length,
      videoHours: seconds / 3600,
      enrolledCount: c._count.enrollments,
      enrolled: c.enrollments.length > 0,
    };
  });

  return <CoursesClient courses={cards} />;
}
