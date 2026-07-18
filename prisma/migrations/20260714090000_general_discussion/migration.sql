-- AlterEnum: add GENERAL category for site-wide discussion posts
ALTER TYPE "PostCategory" ADD VALUE 'GENERAL';

-- AlterTable: courseID becomes optional (null = site-wide general post)
ALTER TABLE "CoursePost" ALTER COLUMN "courseID" DROP NOT NULL;
