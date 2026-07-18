"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { getCourseAccess } from "./courses/[id]/course-access";
import type { PostCategory } from "@prisma/client";

type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

const MAX_TITLE_CHARS = 200;
const MAX_BODY_CHARS = 10000;
const MAX_COMMENT_CHARS = 5000;
const COURSE_CATEGORIES: PostCategory[] = ["ANNOUNCEMENT", "QUESTION", "ADVICE"];

function revalidateBoard(courseID: number | null, postID?: number) {
  const base = courseID === null ? "/discussion" : `/courses/${courseID}/discussion`;
  revalidatePath(base);
  if (postID) revalidatePath(`${base}/${postID}`);
}

// ---------------- posts ----------------

/** Pass courseID = null to post in the site-wide general discussion space,
 *  open to any signed-in user regardless of enrollment. */
export async function createPost(
  courseID: number | null,
  input: { category: PostCategory; title: string; body: string }
): Promise<ActionResult<{ postID: number }>> {
  const { dbUser } = await requireDbUser();

  if (courseID === null) {
    if (input.category !== "GENERAL") {
      return fail("Pick a category.");
    }
  } else {
    const access = await getCourseAccess(courseID, dbUser.userID);
    if (!access?.allowed) return fail("Enroll in the course to post.");
    if (!COURSE_CATEGORIES.includes(input.category)) return fail("Pick a category.");
    if (input.category === "ANNOUNCEMENT" && !access.isOwner) {
      return fail("Only the course instructor can post announcements.");
    }
  }

  const title = input.title.trim().slice(0, MAX_TITLE_CHARS);
  const body = input.body.trim();
  if (!title) return fail("Give your post a title.");
  if (!body) return fail("Write something in the post.");
  if (body.length > MAX_BODY_CHARS) {
    return fail(`Keep the post under ${MAX_BODY_CHARS.toLocaleString()} characters.`);
  }

  const post = await prisma.coursePost.create({
    data: { courseID, authorID: dbUser.userID, category: input.category, title, body },
  });
  revalidateBoard(courseID);
  return { ok: true, data: { postID: post.postID } };
}

/** Comment box at the bottom of a lecture page: finds (or auto-creates) the
 *  lecture's LECTURE-category thread and appends a comment to it, so every
 *  comment from that lecture lands under a single, flagged discussion post. */
export async function commentOnLecture(
  courseID: number,
  itemID: number,
  body: string
): Promise<ActionResult<{ postID: number; commentID: number }>> {
  const { dbUser } = await requireDbUser();

  const access = await getCourseAccess(courseID, dbUser.userID);
  if (!access?.allowed) return fail("Enroll in the course to comment.");

  const item = await prisma.moduleItem.findFirst({
    where: { itemID, module: { topic: { courseID } } },
    select: { title: true, resource: { select: { title: true } } },
  });
  if (!item) return fail("Lecture not found.");

  const clean = body.trim();
  if (!clean) return fail("Write a comment first.");
  if (clean.length > MAX_COMMENT_CHARS) {
    return fail(`Keep comments under ${MAX_COMMENT_CHARS.toLocaleString()} characters.`);
  }

  const title = (item.title ?? item.resource?.title ?? "Lecture discussion").slice(
    0,
    MAX_TITLE_CHARS
  );

  const post = await prisma.coursePost.upsert({
    where: { courseID_itemID: { courseID, itemID } },
    create: {
      courseID,
      itemID,
      authorID: dbUser.userID,
      category: "LECTURE",
      title,
      body: "Comments for this lecture.",
    },
    update: {},
  });

  const comment = await prisma.postComment.create({
    data: { postID: post.postID, authorID: dbUser.userID, body: clean },
  });

  revalidateBoard(courseID, post.postID);
  revalidatePath(`/learn/${courseID}/${itemID}`);
  return { ok: true, data: { postID: post.postID, commentID: comment.commentID } };
}

/** The author or (for course posts) the course instructor can remove a post. */
export async function deletePost(postID: number): Promise<ActionResult> {
  const { dbUser } = await requireDbUser();

  const post = await prisma.coursePost.findUnique({
    where: { postID },
    select: {
      authorID: true,
      courseID: true,
      course: { select: { teacherID: true } },
    },
  });
  if (!post) return fail("Post not found.");
  const isModerator = post.course !== null && post.course.teacherID === dbUser.userID;
  if (post.authorID !== dbUser.userID && !isModerator) {
    return fail("You can only delete your own posts.");
  }

  await prisma.coursePost.delete({ where: { postID } });
  revalidateBoard(post.courseID, postID);
  return { ok: true };
}

// ---------------- comments ----------------

export async function createComment(
  postID: number,
  body: string
): Promise<ActionResult<{ commentID: number }>> {
  const { dbUser } = await requireDbUser();

  const post = await prisma.coursePost.findUnique({
    where: { postID },
    select: { courseID: true },
  });
  if (!post) return fail("Post not found.");

  if (post.courseID !== null) {
    const access = await getCourseAccess(post.courseID, dbUser.userID);
    if (!access?.allowed) return fail("Enroll in the course to comment.");
  }

  const clean = body.trim();
  if (!clean) return fail("Write a comment first.");
  if (clean.length > MAX_COMMENT_CHARS) {
    return fail(`Keep comments under ${MAX_COMMENT_CHARS.toLocaleString()} characters.`);
  }

  const comment = await prisma.postComment.create({
    data: { postID, authorID: dbUser.userID, body: clean },
  });
  revalidateBoard(post.courseID, postID);
  return { ok: true, data: { commentID: comment.commentID } };
}

/** The author or (for course posts) the course instructor can remove a comment. */
export async function deleteComment(commentID: number): Promise<ActionResult> {
  const { dbUser } = await requireDbUser();

  const comment = await prisma.postComment.findUnique({
    where: { commentID },
    select: {
      authorID: true,
      post: {
        select: {
          postID: true,
          courseID: true,
          course: { select: { teacherID: true } },
        },
      },
    },
  });
  if (!comment) return fail("Comment not found.");
  const isModerator =
    comment.post.course !== null && comment.post.course.teacherID === dbUser.userID;
  if (comment.authorID !== dbUser.userID && !isModerator) {
    return fail("You can only delete your own comments.");
  }

  await prisma.postComment.delete({ where: { commentID } });
  revalidateBoard(comment.post.courseID, comment.post.postID);
  return { ok: true };
}

// ---------------- votes ----------------
// value: 1 = upvote, -1 = downvote, 0 = remove your vote (toggle off).

function validVote(value: number): value is -1 | 0 | 1 {
  return value === -1 || value === 0 || value === 1;
}

export async function votePost(
  postID: number,
  value: number
): Promise<ActionResult> {
  const { dbUser } = await requireDbUser();
  if (!validVote(value)) return fail("Invalid vote.");

  const post = await prisma.coursePost.findUnique({
    where: { postID },
    select: { courseID: true, category: true },
  });
  if (!post) return fail("Post not found.");
  if (post.category === "ANNOUNCEMENT") {
    return fail("Announcements can't be voted on.");
  }

  if (post.courseID !== null) {
    const access = await getCourseAccess(post.courseID, dbUser.userID);
    if (!access?.allowed) return fail("Enroll in the course to vote.");
  }

  if (value === 0) {
    await prisma.postVote.deleteMany({ where: { postID, userID: dbUser.userID } });
  } else {
    await prisma.postVote.upsert({
      where: { postID_userID: { postID, userID: dbUser.userID } },
      create: { postID, userID: dbUser.userID, value },
      update: { value },
    });
  }
  revalidateBoard(post.courseID, postID);
  return { ok: true };
}

export async function voteComment(
  commentID: number,
  value: number
): Promise<ActionResult> {
  const { dbUser } = await requireDbUser();
  if (!validVote(value)) return fail("Invalid vote.");

  const comment = await prisma.postComment.findUnique({
    where: { commentID },
    select: { post: { select: { postID: true, courseID: true } } },
  });
  if (!comment) return fail("Comment not found.");

  if (comment.post.courseID !== null) {
    const access = await getCourseAccess(comment.post.courseID, dbUser.userID);
    if (!access?.allowed) return fail("Enroll in the course to vote.");
  }

  if (value === 0) {
    await prisma.commentVote.deleteMany({
      where: { commentID, userID: dbUser.userID },
    });
  } else {
    await prisma.commentVote.upsert({
      where: { commentID_userID: { commentID, userID: dbUser.userID } },
      create: { commentID, userID: dbUser.userID, value },
      update: { value },
    });
  }
  revalidateBoard(comment.post.courseID, comment.post.postID);
  return { ok: true };
}
