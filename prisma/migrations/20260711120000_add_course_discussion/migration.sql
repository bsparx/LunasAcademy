-- CreateEnum
CREATE TYPE "PostCategory" AS ENUM ('ANNOUNCEMENT', 'QUESTION', 'ADVICE');

-- CreateTable
CREATE TABLE "CoursePost" (
    "postID" SERIAL NOT NULL,
    "courseID" INTEGER NOT NULL,
    "authorID" INTEGER NOT NULL,
    "category" "PostCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoursePost_pkey" PRIMARY KEY ("postID")
);

-- CreateTable
CREATE TABLE "PostComment" (
    "commentID" SERIAL NOT NULL,
    "postID" INTEGER NOT NULL,
    "authorID" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("commentID")
);

-- CreateTable
CREATE TABLE "PostVote" (
    "voteID" SERIAL NOT NULL,
    "postID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "PostVote_pkey" PRIMARY KEY ("voteID")
);

-- CreateTable
CREATE TABLE "CommentVote" (
    "voteID" SERIAL NOT NULL,
    "commentID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "CommentVote_pkey" PRIMARY KEY ("voteID")
);

-- CreateIndex
CREATE INDEX "CoursePost_courseID_category_idx" ON "CoursePost"("courseID", "category");

-- CreateIndex
CREATE INDEX "CoursePost_courseID_createdAt_idx" ON "CoursePost"("courseID", "createdAt");

-- CreateIndex
CREATE INDEX "PostComment_postID_idx" ON "PostComment"("postID");

-- CreateIndex
CREATE UNIQUE INDEX "PostVote_postID_userID_key" ON "PostVote"("postID", "userID");

-- CreateIndex
CREATE UNIQUE INDEX "CommentVote_commentID_userID_key" ON "CommentVote"("commentID", "userID");

-- AddForeignKey
ALTER TABLE "CoursePost" ADD CONSTRAINT "CoursePost_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "Course"("courseID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePost" ADD CONSTRAINT "CoursePost_authorID_fkey" FOREIGN KEY ("authorID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postID_fkey" FOREIGN KEY ("postID") REFERENCES "CoursePost"("postID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_authorID_fkey" FOREIGN KEY ("authorID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVote" ADD CONSTRAINT "PostVote_postID_fkey" FOREIGN KEY ("postID") REFERENCES "CoursePost"("postID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVote" ADD CONSTRAINT "PostVote_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_commentID_fkey" FOREIGN KEY ("commentID") REFERENCES "PostComment"("commentID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

