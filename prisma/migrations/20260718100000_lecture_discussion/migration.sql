-- AlterEnum: add LECTURE category for auto-created per-lecture comment threads
ALTER TYPE "PostCategory" ADD VALUE 'LECTURE';

-- AlterTable: tag a post to a specific lecture (ModuleItem) within its course
ALTER TABLE "CoursePost" ADD COLUMN "itemID" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "CoursePost_courseID_itemID_key" ON "CoursePost"("courseID", "itemID");

-- CreateIndex
CREATE INDEX "CoursePost_itemID_idx" ON "CoursePost"("itemID");

-- AddForeignKey
ALTER TABLE "CoursePost" ADD CONSTRAINT "CoursePost_itemID_fkey" FOREIGN KEY ("itemID") REFERENCES "ModuleItem"("itemID") ON DELETE SET NULL ON UPDATE CASCADE;
