-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable: convert existing text roles ('student'/'teacher') to the enum in place
ALTER TABLE "User" ADD COLUMN "streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role"
  USING (CASE WHEN lower("role") = 'teacher' THEN 'TEACHER' ELSE 'STUDENT' END)::"Role";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE "Course" (
    "courseID" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pathway" TEXT,
    "level" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "teacherID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("courseID")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "enrollmentID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "courseID" INTEGER NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("enrollmentID")
);

-- CreateIndex
CREATE INDEX "Course_teacherID_idx" ON "Course"("teacherID");

-- CreateIndex
CREATE INDEX "Enrollment_courseID_idx" ON "Enrollment"("courseID");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userID_courseID_key" ON "Enrollment"("userID", "courseID");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacherID_fkey" FOREIGN KEY ("teacherID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "Course"("courseID") ON DELETE CASCADE ON UPDATE CASCADE;
