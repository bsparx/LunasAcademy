import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { computeBadges } from "./_lib/badges";
import { ProgressClient, type ActivityGrid } from "./_components/progress-client";

const XP_PER_LESSON = 50;
const GRID_WEEKS = 20;

/** A date-only value (server-local day, stored at UTC midnight). */
function localDay(offsetDays = 0): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays)
  );
}

export default async function ProgressPage() {
  const { clerkUser, dbUser } = await requireDbUser();
  const displayName =
    dbUser.name ??
    clerkUser.firstName ??
    clerkUser.username ??
    clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ??
    "there";

  const today = localDay();
  const yesterday = localDay(-1);
  // Monday-first day-of-week index, matching the grid's row labels.
  const todayDayIndex = (new Date().getDay() + 6) % 7;
  const gridStart = localDay(-((GRID_WEEKS - 1) * 7 + todayDayIndex));

  const [itemProgressRows, activityRows, enrollments] = await Promise.all([
    prisma.itemProgress.findMany({
      where: { userID: dbUser.userID },
      select: { itemID: true, completedAt: true },
    }),
    prisma.dailyActivity.findMany({
      where: { userID: dbUser.userID, day: { gte: gridStart } },
      select: { day: true, lecturesDone: true },
    }),
    prisma.enrollment.findMany({
      where: { userID: dbUser.userID, course: { status: "PUBLISHED" } },
      select: {
        course: {
          select: {
            courseID: true,
            topics: {
              select: { modules: { select: { items: { select: { itemID: true } } } } },
            },
          },
        },
      },
    }),
  ]);
  const lessonsDone = itemProgressRows.length;

  // Which enrolled course was completed most recently, if any — drives the
  // "Your latest certificate" link (null hides it in favor of a browse CTA).
  const doneAt = new Map(itemProgressRows.map((r) => [r.itemID, r.completedAt]));
  let latestCertificateCourseID: number | null = null;
  let latestCompletedAt = 0;
  for (const { course } of enrollments) {
    const itemIDs = course.topics.flatMap((t) =>
      t.modules.flatMap((m) => m.items.map((i) => i.itemID))
    );
    if (itemIDs.length === 0 || !itemIDs.every((id) => doneAt.has(id))) continue;
    const finishedAt = Math.max(...itemIDs.map((id) => doneAt.get(id)!.getTime()));
    if (finishedAt > latestCompletedAt) {
      latestCompletedAt = finishedAt;
      latestCertificateCourseID = course.courseID;
    }
  }

  const activity: ActivityGrid = {
    weeks: GRID_WEEKS,
    daysPerWeek: 7,
    today: { weekIndex: GRID_WEEKS - 1, dayIndex: todayDayIndex },
    cells: activityRows.map((r) => {
      const diffDays = Math.round(
        (r.day.getTime() - gridStart.getTime()) / 86_400_000
      );
      return {
        week: Math.floor(diffDays / 7),
        day: diffDays % 7,
        count: r.lecturesDone,
      };
    }),
  };

  // A stored streak only counts if it's still alive (activity today or yesterday).
  const last = dbUser.lastActiveDay?.getTime();
  const streakDays =
    last === today.getTime() || last === yesterday.getTime() ? dbUser.streak : 0;

  const badges = computeBadges({
    longestStreak: dbUser.longestStreak,
    lessonsCompleted: lessonsDone,
  });

  return (
    <ProgressClient
      name={displayName}
      summary={{
        streakDays,
        longestStreak: dbUser.longestStreak,
        xp: lessonsDone * XP_PER_LESSON,
        badgesEarned: badges.filter((b) => b.earned).length,
      }}
      activity={activity}
      badges={badges}
      latestCertificateCourseID={latestCertificateCourseID}
    />
  );
}
