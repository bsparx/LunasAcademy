-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "overview" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "headline" TEXT;

-- CreateTable
CREATE TABLE "CourseReview" (
    "reviewID" SERIAL NOT NULL,
    "courseID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("reviewID")
);

-- CreateIndex
CREATE INDEX "CourseReview_courseID_idx" ON "CourseReview"("courseID");

-- CreateIndex
CREATE UNIQUE INDEX "CourseReview_courseID_userID_key" ON "CourseReview"("courseID", "userID");

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "Course"("courseID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

