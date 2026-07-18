-- AlterTable
ALTER TABLE "ModuleItem" ALTER COLUMN "resourceID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VideoCheck" ADD COLUMN     "imagePublicID" TEXT,
ADD COLUMN     "imageURL" TEXT;

-- CreateTable
CREATE TABLE "Exam" (
    "examID" SERIAL NOT NULL,
    "itemID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("examID")
);

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "questionID" SERIAL NOT NULL,
    "examID" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,
    "imageURL" TEXT,
    "imagePublicID" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("questionID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exam_itemID_key" ON "Exam"("itemID");

-- CreateIndex
CREATE INDEX "ExamQuestion_examID_idx" ON "ExamQuestion"("examID");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_itemID_fkey" FOREIGN KEY ("itemID") REFERENCES "ModuleItem"("itemID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_examID_fkey" FOREIGN KEY ("examID") REFERENCES "Exam"("examID") ON DELETE CASCADE ON UPDATE CASCADE;

