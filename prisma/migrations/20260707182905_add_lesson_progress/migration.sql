-- CreateTable
CREATE TABLE "LessonProgress" (
    "progressID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "lessonID" TEXT NOT NULL,
    "durationPct" INTEGER NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("progressID")
);

-- CreateIndex
CREATE INDEX "LessonProgress_userID_idx" ON "LessonProgress"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userID_lessonID_key" ON "LessonProgress"("userID", "lessonID");

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;
