import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import {
  demoCourses as courses,
  type CourseDetail,
} from "@/app/(dashboard)/learn/_data/demo-course-detail";
import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { LessonShell } from "./_components/lesson-shell";
import {
  CourseLessonShell,
  type WatchItem,
  type WatchTopic,
} from "./_components/course-lesson-shell";

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

// Real courses (numeric ids) come from the database; other ids fall through
// to the static demo flow below.
async function DbLessonPage(courseID: number, lessonId: string) {
  const { dbUser } = await requireDbUser();
  if (!/^\d+$/.test(lessonId)) notFound();
  const itemID = Number(lessonId);

  const course = await prisma.course.findUnique({
    where: { courseID },
    include: {
      topics: {
        orderBy: { position: "asc" },
        include: {
          modules: {
            orderBy: { position: "asc" },
            include: {
              items: {
                orderBy: { position: "asc" },
                include: {
                  exam: {
                    select: {
                      examID: true,
                      questions: {
                        orderBy: { position: "asc" },
                        // correctIndex stays server-side — grading happens in submitExam
                        select: {
                          questionID: true,
                          question: true,
                          options: true,
                          imageURL: true,
                        },
                      },
                    },
                  },
                  resource: {
                    select: {
                      kind: true,
                      title: true,
                      url: true,
                      publicID: true,
                      format: true,
                      bytes: true,
                      duration: true,
                      checks: {
                        orderBy: { timeSec: "asc" },
                        select: {
                          checkID: true,
                          timeSec: true,
                          question: true,
                          options: true,
                          correctIndices: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const isOwner = course.teacherID === dbUser.userID;
  if (!isOwner) {
    if (course.status !== "PUBLISHED") notFound();
    const enrollment = await prisma.enrollment.findUnique({
      where: { userID_courseID: { userID: dbUser.userID, courseID } },
      select: { enrollmentID: true },
    });
    if (!enrollment) redirect(`/courses/${courseID}`);
  }

  const allCheckIDs = course.topics.flatMap((t) =>
    t.modules.flatMap((m) =>
      m.items.flatMap((i) => i.resource?.checks.map((c) => c.checkID) ?? [])
    )
  );
  const doneCheckIDs = new Set(
    allCheckIDs.length === 0
      ? []
      : (
          await prisma.checkProgress.findMany({
            where: { userID: dbUser.userID, checkID: { in: allCheckIDs } },
            select: { checkID: true },
          })
        ).map((p) => p.checkID)
  );

  const topics: WatchTopic[] = course.topics.map((t) => ({
    topicID: t.topicID,
    title: t.title,
    modules: t.modules.map((m) => ({
      moduleID: m.moduleID,
      title: m.title,
      items: m.items.map((i) => ({
        itemID: i.itemID,
        title: i.title ?? i.resource?.title ?? "Exam",
        resource: i.resource
          ? {
              kind: i.resource.kind as NonNullable<
                WatchItem["resource"]
              >["kind"],
              title: i.resource.title,
              url: i.resource.url,
              publicID: i.resource.publicID,
              format: i.resource.format,
              bytes: i.resource.bytes,
              duration: i.resource.duration,
              checks: i.resource.checks.map((c) => ({
                ...c,
                done: doneCheckIDs.has(c.checkID),
              })),
            }
          : null,
        exam: i.exam,
      })),
    })),
  }));

  const flat = topics.flatMap((t) =>
    t.modules.flatMap((m) =>
      m.items.map((item) => ({ moduleTitle: m.title, item }))
    )
  );
  const idx = flat.findIndex((x) => x.item.itemID === itemID);
  if (idx === -1) notFound();

  const lectureThread = await prisma.coursePost.findFirst({
    where: { courseID, itemID },
    select: {
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          commentID: true,
          body: true,
          createdAt: true,
          authorID: true,
          author: { select: { name: true } },
          votes: { select: { value: true, userID: true } },
        },
      },
    },
  });
  const lectureComments = (lectureThread?.comments ?? []).map((c) => ({
    commentID: c.commentID,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    authorID: c.authorID,
    author: c.author,
    score: c.votes.reduce((sum, v) => sum + v.value, 0),
    myVote: (c.votes.find((v) => v.userID === dbUser.userID)?.value ?? 0) as -1 | 0 | 1,
  }));

  // Completed-item state comes from the [courseId] layout via WatchProgressProvider.
  return (
    <CourseLessonShell
      course={{
        courseID: course.courseID,
        title: course.title,
        pathway: course.pathway,
      }}
      topics={topics}
      moduleTitle={flat[idx].moduleTitle}
      item={flat[idx].item}
      prevItemID={idx > 0 ? flat[idx - 1].item.itemID : null}
      nextItemID={idx < flat.length - 1 ? flat[idx + 1].item.itemID : null}
      lectureComments={lectureComments}
      teacherID={course.teacherID}
      currentUserID={dbUser.userID}
    />
  );
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;

  if (/^\d+$/.test(courseId)) {
    return DbLessonPage(Number(courseId), lessonId);
  }

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
