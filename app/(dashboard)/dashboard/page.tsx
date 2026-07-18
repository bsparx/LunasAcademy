import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { DashboardClient, type ContinueCourse, type PathwayNodeDTO } from "./_components/dashboard-client";
import { TeacherDashboard } from "./_components/teacher-dashboard";

const XP_PER_LESSON = 50;
const DEFAULT_WEEKLY_GOAL_DAYS = 5;
const MAX_PATHWAY_NODES = 6;

/** A date-only value (server-local day, stored at UTC midnight) — same convention as /progress and learn/actions.ts. */
function localDay(offsetDays = 0): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays)
  );
}

export default async function DashboardPage() {
  const { clerkUser: user, dbUser } = await requireDbUser();

  const displayName =
    dbUser?.name ??
    user.firstName ??
    user.username ??
    user.emailAddresses[0]?.emailAddress?.split("@")[0] ??
    "there";

  if (dbUser.role === "TEACHER") {
    const courses = await prisma.course.findMany({
      where: { teacherID: dbUser.userID },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { enrollments: true } } },
    });
    return (
      <TeacherDashboard
        name={displayName}
        streak={dbUser.streak}
        xp={dbUser.xp}
        courses={courses.map((c) => ({
          courseID: c.courseID,
          title: c.title,
          description: c.description,
          status: c.status,
          updatedAt: c.updatedAt,
          enrolledCount: c._count.enrollments,
        }))}
      />
    );
  }

  const today = localDay();
  const weekStart = localDay(-6);

  const [enrollments, itemProgressRows, dailyActivityRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userID: dbUser.userID, course: { status: "PUBLISHED" } },
      orderBy: { enrolledAt: "desc" },
      include: {
        course: {
          include: {
            topics: {
              orderBy: { position: "asc" },
              include: {
                modules: {
                  orderBy: { position: "asc" },
                  include: {
                    items: {
                      orderBy: { position: "asc" },
                      select: {
                        itemID: true,
                        title: true,
                        resource: { select: { title: true, duration: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.itemProgress.findMany({
      where: { userID: dbUser.userID },
      select: { itemID: true, completedAt: true },
    }),
    prisma.dailyActivity.findMany({
      where: { userID: dbUser.userID, day: { gte: weekStart } },
      select: { day: true, lecturesDone: true },
    }),
  ]);

  const doneAt = new Map<number, Date>();
  for (const row of itemProgressRows) doneAt.set(row.itemID, row.completedAt);

  const courseCards = enrollments.map(({ course, enrolledAt }) => {
    const items = course.topics.flatMap((t) =>
      t.modules.flatMap((m) =>
        m.items.map((i) => ({ ...i, moduleTitle: m.title }))
      )
    );
    const doneCount = items.filter((i) => doneAt.has(i.itemID)).length;
    const continueItem = items.find((i) => !doneAt.has(i.itemID)) ?? items[0] ?? null;
    const lastStudied = items.reduce<Date | null>((latest, i) => {
      const d = doneAt.get(i.itemID);
      return d && (!latest || d > latest) ? d : latest;
    }, null);
    return {
      courseID: course.courseID,
      title: course.title,
      pathway: course.pathway,
      level: course.level,
      items,
      doneCount,
      continueItem,
      finished: items.length > 0 && doneCount === items.length,
      lastStudied,
      enrolledAt,
    };
  });

  // "Continue learning" target: the in-progress course studied most recently,
  // falling back to the most recently enrolled course you haven't started.
  // courseCards is already ordered by enrolledAt desc, so ties resolve to it.
  const inProgress = courseCards.filter((c) => c.items.length > 0 && !c.finished);
  const active =
    inProgress.reduce<typeof inProgress[number] | null>((best, c) => {
      if (!best) return c;
      const bestTime = best.lastStudied?.getTime() ?? 0;
      const cTime = c.lastStudied?.getTime() ?? 0;
      return cTime > bestTime ? c : best;
    }, null) ?? courseCards[0] ?? null;

  let continueCourse: ContinueCourse | null = null;
  let pathwayNodes: PathwayNodeDTO[] = [];
  let pathwayName: string | null = null;
  let pathwayMoreCount = 0;

  if (active) {
    const pct = active.items.length
      ? Math.round((active.doneCount / active.items.length) * 100)
      : 0;
    const minutesLeft = active.continueItem?.resource?.duration
      ? Math.max(1, Math.round(active.continueItem.resource.duration / 60))
      : null;

    let courseIndex: number | null = null;
    let courseTotal: number | null = null;

    if (active.pathway) {
      pathwayName = active.pathway;
      const siblings = await prisma.course.findMany({
        where: { pathway: active.pathway, status: "PUBLISHED" },
        orderBy: { courseID: "asc" },
        select: { courseID: true, title: true },
      });
      const finishedByCourseID = new Map(
        courseCards.map((c) => [c.courseID, c.finished])
      );
      courseIndex = siblings.findIndex((s) => s.courseID === active.courseID) + 1;
      courseTotal = siblings.length;
      pathwayMoreCount = Math.max(0, siblings.length - MAX_PATHWAY_NODES);
      pathwayNodes = siblings.slice(0, MAX_PATHWAY_NODES).map((s) => ({
        id: s.courseID,
        label: s.title,
        href: `/courses/${s.courseID}`,
        state:
          s.courseID === active.courseID
            ? "current"
            : finishedByCourseID.get(s.courseID)
            ? "done"
            : "todo",
      }));
    }

    continueCourse = {
      courseID: active.courseID,
      pathway: active.pathway,
      level: active.level,
      title: active.title,
      progress: pct,
      finished: active.finished,
      moduleTitle: active.continueItem?.moduleTitle ?? "",
      lessonTitle:
        active.continueItem?.title ?? active.continueItem?.resource?.title ?? "Lesson",
      lessonNumber: active.finished ? active.items.length : active.doneCount + 1,
      lessonTotal: active.items.length,
      minutesLeft,
      continueItemID: active.continueItem?.itemID ?? null,
      courseIndex,
      courseTotal,
    };
  }

  // Streak only counts if it's still alive (activity today or yesterday) — same rule as /progress.
  const lastActive = dbUser.lastActiveDay?.getTime();
  const yesterday = localDay(-1);
  const streak =
    lastActive === today.getTime() || lastActive === yesterday.getTime()
      ? dbUser.streak
      : 0;

  const lessonsCompleted = itemProgressRows.length;
  const xp = lessonsCompleted * XP_PER_LESSON;
  const weeklyGoalDone = dailyActivityRows.filter((r) => r.lecturesDone > 0).length;
  const weeklyGoalTotal = dbUser.streakGoal ?? DEFAULT_WEEKLY_GOAL_DAYS;

  const enrolledCourseIDs = enrollments.map((e) => e.course.courseID);
  const openQuestions =
    enrolledCourseIDs.length > 0
      ? await prisma.coursePost.count({
          where: {
            courseID: { in: enrolledCourseIDs },
            category: "QUESTION",
            comments: { none: {} },
          },
        })
      : 0;
  const discussionHref = continueCourse
    ? `/courses/${continueCourse.courseID}/discussion`
    : enrolledCourseIDs[0]
    ? `/courses/${enrolledCourseIDs[0]}/discussion`
    : "/courses";

  return (
    <DashboardClient
      name={displayName}
      email={user.emailAddresses[0]?.emailAddress ?? dbUser?.email ?? ""}
      avatarUrl={user.imageUrl ?? null}
      streak={streak}
      xp={xp}
      weeklyGoalDone={Math.min(weeklyGoalDone, weeklyGoalTotal)}
      weeklyGoalTotal={weeklyGoalTotal}
      lessonsCompleted={lessonsCompleted}
      openQuestions={openQuestions}
      discussionHref={discussionHref}
      enrolledCount={enrollments.length}
      continueCourse={continueCourse}
      pathwayNodes={pathwayNodes}
      pathwayName={pathwayName}
      pathwayMoreCount={pathwayMoreCount}
    />
  );
}
