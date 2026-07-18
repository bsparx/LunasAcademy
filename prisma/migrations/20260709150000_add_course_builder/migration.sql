-- CreateEnum
CREATE TYPE "ResourceKind" AS ENUM ('VIDEO', 'LECTURE', 'FILE');

-- CreateTable
CREATE TABLE "Resource" (
    "resourceID" SERIAL NOT NULL,
    "ownerID" INTEGER NOT NULL,
    "kind" "ResourceKind" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicID" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "format" TEXT,
    "bytes" INTEGER,
    "duration" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("resourceID")
);

-- CreateTable
CREATE TABLE "Module" (
    "moduleID" SERIAL NOT NULL,
    "courseID" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("moduleID")
);

-- CreateTable
CREATE TABLE "ModuleItem" (
    "itemID" SERIAL NOT NULL,
    "moduleID" INTEGER NOT NULL,
    "resourceID" INTEGER NOT NULL,
    "title" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuleItem_pkey" PRIMARY KEY ("itemID")
);

-- CreateIndex
CREATE INDEX "Resource_ownerID_idx" ON "Resource"("ownerID");

-- CreateIndex
CREATE INDEX "Module_courseID_idx" ON "Module"("courseID");

-- CreateIndex
CREATE INDEX "ModuleItem_moduleID_idx" ON "ModuleItem"("moduleID");

-- CreateIndex
CREATE INDEX "ModuleItem_resourceID_idx" ON "ModuleItem"("resourceID");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "Course"("courseID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleItem" ADD CONSTRAINT "ModuleItem_moduleID_fkey" FOREIGN KEY ("moduleID") REFERENCES "Module"("moduleID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleItem" ADD CONSTRAINT "ModuleItem_resourceID_fkey" FOREIGN KEY ("resourceID") REFERENCES "Resource"("resourceID") ON DELETE CASCADE ON UPDATE CASCADE;

