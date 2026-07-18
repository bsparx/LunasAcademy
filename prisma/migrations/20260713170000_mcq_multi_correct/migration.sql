-- AlterTable: VideoCheck.correctIndex (Int) -> correctIndices (Int[])
ALTER TABLE "VideoCheck" ADD COLUMN "correctIndices" INTEGER[];
UPDATE "VideoCheck" SET "correctIndices" = ARRAY["correctIndex"];
ALTER TABLE "VideoCheck" ALTER COLUMN "correctIndices" SET NOT NULL;
ALTER TABLE "VideoCheck" DROP COLUMN "correctIndex";

-- AlterTable: ExamQuestion.correctIndex (Int) -> correctIndices (Int[])
ALTER TABLE "ExamQuestion" ADD COLUMN "correctIndices" INTEGER[];
UPDATE "ExamQuestion" SET "correctIndices" = ARRAY["correctIndex"];
ALTER TABLE "ExamQuestion" ALTER COLUMN "correctIndices" SET NOT NULL;
ALTER TABLE "ExamQuestion" DROP COLUMN "correctIndex";
