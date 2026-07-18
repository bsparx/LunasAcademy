-- Scope the resource library per course: every resource belongs to exactly
-- one course. Backfill order: (1) the course of the resource's earliest
-- module placement, (2) otherwise the owner's first course. Resources whose
-- owner has no course at all cannot be scoped and are dropped.

-- AlterTable (added nullable first so existing rows can be backfilled)
ALTER TABLE "Resource" ADD COLUMN     "courseID" INTEGER;

-- Backfill 1: from the earliest module placement
UPDATE "Resource" r
SET "courseID" = sub."courseID"
FROM (
  SELECT DISTINCT ON (mi."resourceID") mi."resourceID", m."courseID"
  FROM "ModuleItem" mi
  JOIN "Module" m ON m."moduleID" = mi."moduleID"
  WHERE mi."resourceID" IS NOT NULL
  ORDER BY mi."resourceID", m."courseID" ASC, mi."itemID" ASC
) sub
WHERE r."resourceID" = sub."resourceID";

-- Backfill 2: unplaced resources go to the owner's first course
UPDATE "Resource" r
SET "courseID" = (
  SELECT c."courseID" FROM "Course" c
  WHERE c."teacherID" = r."ownerID"
  ORDER BY c."courseID" ASC
  LIMIT 1
)
WHERE r."courseID" IS NULL;

-- Owner has no course: nothing to scope the resource to
DELETE FROM "Resource" WHERE "courseID" IS NULL;

ALTER TABLE "Resource" ALTER COLUMN "courseID" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Resource_courseID_idx" ON "Resource"("courseID");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "Course"("courseID") ON DELETE CASCADE ON UPDATE CASCADE;
