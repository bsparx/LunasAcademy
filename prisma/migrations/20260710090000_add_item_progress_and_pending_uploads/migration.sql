-- CreateTable
CREATE TABLE "ItemProgress" (
    "progressID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "itemID" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemProgress_pkey" PRIMARY KEY ("progressID")
);

-- CreateTable
CREATE TABLE "PendingUpload" (
    "uploadID" SERIAL NOT NULL,
    "ownerID" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "publicID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingUpload_pkey" PRIMARY KEY ("uploadID")
);

-- CreateIndex
CREATE INDEX "ItemProgress_itemID_idx" ON "ItemProgress"("itemID");

-- CreateIndex
CREATE UNIQUE INDEX "ItemProgress_userID_itemID_key" ON "ItemProgress"("userID", "itemID");

-- CreateIndex
CREATE UNIQUE INDEX "PendingUpload_publicID_key" ON "PendingUpload"("publicID");

-- CreateIndex
CREATE INDEX "PendingUpload_ownerID_idx" ON "PendingUpload"("ownerID");

-- AddForeignKey
ALTER TABLE "ItemProgress" ADD CONSTRAINT "ItemProgress_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemProgress" ADD CONSTRAINT "ItemProgress_itemID_fkey" FOREIGN KEY ("itemID") REFERENCES "ModuleItem"("itemID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingUpload" ADD CONSTRAINT "PendingUpload_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;


-- Backfill: carry over course-item completions recorded in LessonProgress
-- (lessonID 'item-<id>') for items that still exist.
INSERT INTO "ItemProgress" ("userID", "itemID", "completedAt")
SELECT lp."userID", mi."itemID", lp."watchedAt"
FROM "LessonProgress" lp
JOIN "ModuleItem" mi ON lp."lessonID" = 'item-' || mi."itemID"
WHERE lp."lessonID" ~ '^item-[0-9]+$' AND lp."durationPct" >= 90
ON CONFLICT ("userID", "itemID") DO NOTHING;
