-- AlterTable
ALTER TABLE "PendingUpload" ADD COLUMN     "resourceType" TEXT NOT NULL DEFAULT 'image';

-- CreateTable
CREATE TABLE "Capstone" (
    "capstoneID" SERIAL NOT NULL,
    "courseID" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "deliverables" TEXT[],
    "criteria" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capstone_pkey" PRIMARY KEY ("capstoneID")
);

-- CreateTable
CREATE TABLE "CapstoneSubmission" (
    "submissionID" SERIAL NOT NULL,
    "capstoneID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" INTEGER,
    "feedback" TEXT,

    CONSTRAINT "CapstoneSubmission_pkey" PRIMARY KEY ("submissionID")
);

-- CreateTable
CREATE TABLE "CapstoneFile" (
    "fileID" SERIAL NOT NULL,
    "submissionID" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicID" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "bytes" INTEGER,

    CONSTRAINT "CapstoneFile_pkey" PRIMARY KEY ("fileID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Capstone_courseID_key" ON "Capstone"("courseID");

-- CreateIndex
CREATE INDEX "CapstoneSubmission_userID_idx" ON "CapstoneSubmission"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "CapstoneSubmission_capstoneID_userID_key" ON "CapstoneSubmission"("capstoneID", "userID");

-- CreateIndex
CREATE INDEX "CapstoneFile_submissionID_idx" ON "CapstoneFile"("submissionID");

-- AddForeignKey
ALTER TABLE "Capstone" ADD CONSTRAINT "Capstone_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "Course"("courseID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapstoneSubmission" ADD CONSTRAINT "CapstoneSubmission_capstoneID_fkey" FOREIGN KEY ("capstoneID") REFERENCES "Capstone"("capstoneID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapstoneSubmission" ADD CONSTRAINT "CapstoneSubmission_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapstoneFile" ADD CONSTRAINT "CapstoneFile_submissionID_fkey" FOREIGN KEY ("submissionID") REFERENCES "CapstoneSubmission"("submissionID") ON DELETE CASCADE ON UPDATE CASCADE;

