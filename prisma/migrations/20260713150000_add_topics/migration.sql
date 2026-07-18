-- CreateTable
CREATE TABLE "Topic" (
    "topicID" SERIAL NOT NULL,
    "courseID" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("topicID")
);

CREATE INDEX "Topic_courseID_idx" ON "Topic"("courseID");

ALTER TABLE "Topic" ADD CONSTRAINT "Topic_courseID_fkey"
  FOREIGN KEY ("courseID") REFERENCES "Course"("courseID") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add topicID to Module as nullable first, so existing rows can be backfilled
ALTER TABLE "Module" ADD COLUMN "topicID" INTEGER;

-- Data migration: one default "Topic 1" per course that already has modules
INSERT INTO "Topic" ("courseID", "title", "position")
SELECT DISTINCT "courseID", 'Topic 1', 0
FROM "Module";

UPDATE "Module" m
SET "topicID" = t."topicID"
FROM "Topic" t
WHERE t."courseID" = m."courseID" AND t."title" = 'Topic 1';

-- Now that every Module has a topicID, enforce the constraint and drop the old column
ALTER TABLE "Module" ALTER COLUMN "topicID" SET NOT NULL;

CREATE INDEX "Module_topicID_idx" ON "Module"("topicID");

ALTER TABLE "Module" ADD CONSTRAINT "Module_topicID_fkey"
  FOREIGN KEY ("topicID") REFERENCES "Topic"("topicID") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_courseID_fkey";

-- DropIndex
DROP INDEX "Module_courseID_idx";

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "courseID";
