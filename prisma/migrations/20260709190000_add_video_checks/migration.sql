-- CreateTable
CREATE TABLE "VideoCheck" (
    "checkID" SERIAL NOT NULL,
    "resourceID" INTEGER NOT NULL,
    "timeSec" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoCheck_pkey" PRIMARY KEY ("checkID")
);

-- CreateIndex
CREATE INDEX "VideoCheck_resourceID_idx" ON "VideoCheck"("resourceID");

-- AddForeignKey
ALTER TABLE "VideoCheck" ADD CONSTRAINT "VideoCheck_resourceID_fkey" FOREIGN KEY ("resourceID") REFERENCES "Resource"("resourceID") ON DELETE CASCADE ON UPDATE CASCADE;

