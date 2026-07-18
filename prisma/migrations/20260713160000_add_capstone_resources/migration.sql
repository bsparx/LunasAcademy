-- CreateTable
CREATE TABLE "CapstoneResource" (
    "resourceID" SERIAL NOT NULL,
    "capstoneID" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicID" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "bytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapstoneResource_pkey" PRIMARY KEY ("resourceID")
);

-- CreateIndex
CREATE INDEX "CapstoneResource_capstoneID_idx" ON "CapstoneResource"("capstoneID");

-- AddForeignKey
ALTER TABLE "CapstoneResource" ADD CONSTRAINT "CapstoneResource_capstoneID_fkey" FOREIGN KEY ("capstoneID") REFERENCES "Capstone"("capstoneID") ON DELETE CASCADE ON UPDATE CASCADE;
