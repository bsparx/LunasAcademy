-- CreateTable
CREATE TABLE "CheckProgress" (
    "progressID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "checkID" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckProgress_pkey" PRIMARY KEY ("progressID")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckProgress_userID_checkID_key" ON "CheckProgress"("userID", "checkID");

-- CreateIndex
CREATE INDEX "CheckProgress_checkID_idx" ON "CheckProgress"("checkID");

-- AddForeignKey
ALTER TABLE "CheckProgress" ADD CONSTRAINT "CheckProgress_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckProgress" ADD CONSTRAINT "CheckProgress_checkID_fkey" FOREIGN KEY ("checkID") REFERENCES "VideoCheck"("checkID") ON DELETE CASCADE ON UPDATE CASCADE;
