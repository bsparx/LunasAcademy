import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { WatchProgressProvider } from "./_components/watch-progress";
import { WatchTopBar } from "./_components/watch-top-bar";
import {
  WatchLessonFrame,
  type RailCapstone,
  type RailTopic,
} from "./_components/course-rail";
import { formatDuration, type WatchKind } from "./_components/watch-meta";

/* The course top bar and the course-content rail live here (not in the
   lesson page) so they persist — no remount or skeleton flash — when
   navigating between lessons. Progress state is shared with the pages via
   WatchProgressProvider; the rail's active row comes from useParams. */

export default async function CourseWatchLayout({
  params,
  children,
}: {
  params: Promise<{ courseId: string }>;
  children: React.ReactNode;
}) {
  const { courseId } = await params;

  // Demo (non-numeric) courses render their own chrome.
  if (!/^\d+$/.test(courseId)) return children;

  const courseID = Number(courseId);
  const { dbUser } = await requireDbUser();

  const course = await prisma.course.findUnique({
    where: { courseID },
    select: {
      courseID: true,
      title: true,
      pathway: true,
      capstone: {
        select: {
          capstoneID: true,
          title: true,
          submissions: {
            where: { userID: dbUser.userID },
            select: { status: true },
          },
        },
      },
      topics: {
        orderBy: { position: "asc" },
        select: {
          topicID: true,
          title: true,
          modules: {
            orderBy: { position: "asc" },
            select: {
              moduleID: true,
              title: true,
              items: {
                orderBy: { position: "asc" },
                select: {
                  itemID: true,
                  title: true,
                  resource: {
                    select: { kind: true, title: true, duration: true, format: true },
                  },
                  exam: { select: { _count: { select: { questions: true } } } },
                },
              },
            },
          },
        },
      },
    },
  });
  // Missing course: let the page handle its own notFound.
  if (!course) return children;

  const topics: RailTopic[] = course.topics.map((t) => ({
    topicID: t.topicID,
    title: t.title,
    modules: t.modules.map((m) => ({
      moduleID: m.moduleID,
      title: m.title,
      items: m.items.map((i) => {
        const kind: WatchKind = i.resource ? (i.resource.kind as WatchKind) : "EXAM";
        let meta: string;
        if (!i.resource) {
          const n = i.exam?._count.questions ?? 0;
          meta = `${n} Q${n === 1 ? "" : "s"}`;
        } else if (i.resource.kind === "VIDEO" && i.resource.duration) {
          meta = formatDuration(i.resource.duration);
        } else if (i.resource.kind === "LECTURE") {
          meta = "read";
        } else {
          meta = i.resource.format?.toUpperCase() ?? "file";
        }
        return {
          itemID: i.itemID,
          title: i.title ?? i.resource?.title ?? "Exam",
          kind,
          meta,
        };
      }),
    })),
  }));

  const totalItems = topics.reduce(
    (sum, t) => sum + t.modules.reduce((s, m) => s + m.items.length, 0),
    0
  );
  const rows = await prisma.itemProgress.findMany({
    where: { userID: dbUser.userID, item: { module: { topic: { courseID } } } },
    select: { itemID: true },
  });

  const capstone: RailCapstone | null = course.capstone
    ? {
        title: course.capstone.title,
        status: course.capstone.submissions[0]?.status ?? "NONE",
      }
    : null;

  return (
    <WatchProgressProvider
      initialDone={rows.map((r) => r.itemID)}
      totalItems={totalItems}
    >
      <WatchTopBar
        course={{
          courseID: course.courseID,
          title: course.title,
          pathway: course.pathway,
        }}
      />
      <WatchLessonFrame
        courseID={course.courseID}
        topics={topics}
        capstone={capstone}
      >
        {children}
      </WatchLessonFrame>
    </WatchProgressProvider>
  );
}
