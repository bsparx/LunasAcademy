-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActiveDay" DATE,
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DailyActivity" (
    "activityID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "day" DATE NOT NULL,
    "lecturesDone" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("activityID")
);

-- CreateIndex
CREATE INDEX "DailyActivity_userID_day_idx" ON "DailyActivity"("userID", "day");

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_userID_day_key" ON "DailyActivity"("userID", "day");

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;


-- Backfill daily activity from existing completion history (local time = Asia/Karachi).
INSERT INTO "DailyActivity" ("userID", "day", "lecturesDone")
SELECT "userID",
       date("completedAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Karachi') AS day,
       COUNT(*)
FROM "ItemProgress"
GROUP BY "userID", day
ON CONFLICT ("userID", "day") DO NOTHING;

-- Backfill streaks: consecutive-day runs per user (gaps-and-islands).
WITH runs AS (
  SELECT "userID", COUNT(*) AS len, MAX(day) AS last_day
  FROM (
    SELECT "userID", day,
           day - (ROW_NUMBER() OVER (PARTITION BY "userID" ORDER BY day))::int AS grp
    FROM "DailyActivity"
  ) d
  GROUP BY "userID", grp
),
agg AS (
  SELECT "userID",
         MAX(len) AS longest,
         (ARRAY_AGG(len ORDER BY last_day DESC))[1] AS current_len,
         MAX(last_day) AS last_day
  FROM runs
  GROUP BY "userID"
)
UPDATE "User" u
SET "streak" = agg.current_len,
    "longestStreak" = agg.longest,
    "lastActiveDay" = agg.last_day
FROM agg
WHERE u."userID" = agg."userID";
