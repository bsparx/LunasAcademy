import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import coursesData from "@/app/courses/_data/courses.json";
import type { CourseDetail } from "@/app/courses/[id]/page";
import { prisma } from "@/app/utils/db";
import { LessonShell } from "./_components/lesson-shell";

const courses = coursesData as unknown as Record<string, CourseDetail>;

type Lesson = CourseDetail["modules"][number]["lessons"][number];

function flattenLessons(course: CourseDetail) {
  const out: { module: CourseDetail["modules"][number]; lesson: Lesson }[] = [];
  for (const m of course.modules) {
    for (const l of m.lessons) {
      out.push({ module: m, lesson: l });
    }
  }
  return out;
}

function findContext(course: CourseDetail, lessonId: string) {
  const all = flattenLessons(course);
  const idx = all.findIndex((x) => x.lesson.id === lessonId);
  if (idx === -1) return null;
  return {
    module: all[idx].module,
    lesson: all[idx].lesson,
    prev: idx > 0 ? { id: all[idx - 1].lesson.id, module: all[idx - 1].module } : null,
    next:
      idx < all.length - 1
        ? { id: all[idx + 1].lesson.id, module: all[idx + 1].module }
        : null,
  };
}

export async function generateStaticParams() {
  const params: { courseId: string; lessonId: string }[] = [];
  for (const course of Object.values(courses)) {
    for (const m of course.modules) {
      for (const l of m.lessons) {
        if (l.type === "video" || l.type === "reading") {
          params.push({ courseId: course.id, lessonId: l.id });
        }
      }
    }
  }
  return params;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const course = courses[courseId];
  if (!course) notFound();

  const ctx = findContext(course, lessonId);
  if (!ctx) notFound();

  const dbUser = await prisma.user.findUnique({
    where: { clerkID: user.id },
    select: { userID: true },
  });

  let completedLessonIds = new Set<string>();
  if (dbUser) {
    const rows = await prisma.lessonProgress.findMany({
      where: { userID: dbUser.userID, durationPct: { gte: 90 } },
      select: { lessonID: true },
    });
    completedLessonIds = new Set(rows.map((r) => r.lessonID));
  }

  return (
    <LessonShell
      course={course}
      lesson={ctx.lesson}
      module={ctx.module}
      completedLessonIds={completedLessonIds}
      prevLesson={ctx.prev}
      nextLesson={ctx.next}
    />
  );
}
