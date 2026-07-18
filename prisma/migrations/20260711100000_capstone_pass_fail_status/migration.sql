-- Capstone submissions are graded pass/fail by the course instructor instead
-- of a percent. Any percent grades that exist are mapped at 70% (the exam
-- pass mark) before the column is dropped.

-- CreateEnum
CREATE TYPE "CapstoneStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- AlterTable (status added first so existing rows can be mapped from grade)
ALTER TABLE "CapstoneSubmission"
ADD COLUMN     "gradedAt" TIMESTAMP(3),
ADD COLUMN     "status" "CapstoneStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "CapstoneSubmission"
SET "status" = CASE WHEN "grade" >= 70 THEN 'PASSED'::"CapstoneStatus" ELSE 'FAILED'::"CapstoneStatus" END,
    "gradedAt" = CURRENT_TIMESTAMP
WHERE "grade" IS NOT NULL;

ALTER TABLE "CapstoneSubmission" DROP COLUMN "grade";

-- CreateIndex
CREATE INDEX "CapstoneSubmission_capstoneID_status_idx" ON "CapstoneSubmission"("capstoneID", "status");
