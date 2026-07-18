"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { destroyCloudinaryAsset } from "@/lib/cloudinary-admin";

type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

export async function enrollInCourse(formData: FormData) {
  const { dbUser } = await requireDbUser();

  const courseID = Number(formData.get("courseId"));
  if (!Number.isInteger(courseID)) redirect("/courses");

  const course = await prisma.course.findFirst({
    where: { courseID, status: "PUBLISHED" },
    select: { courseID: true, teacherID: true },
  });
  if (!course) redirect("/courses");

  // Teachers may only take their own courses.
  if (dbUser.role === "TEACHER" && course.teacherID !== dbUser.userID) {
    redirect(`/courses/${courseID}`);
  }

  await prisma.enrollment.upsert({
    where: { userID_courseID: { userID: dbUser.userID, courseID } },
    create: { userID: dbUser.userID, courseID },
    update: {},
  });

  revalidatePath("/courses");
  revalidatePath(`/courses/${courseID}`);
  redirect(`/courses/${courseID}`);
}

// ---------------- capstone submissions ----------------

const MAX_SUBMISSION_FILES = 5;

export type CapstoneUpload = {
  name: string;
  url: string;
  publicID: string;
  resourceType: string;
  bytes: number | null;
};

/** The viewer's capstone for a course, or null if they can't submit to it. */
async function submittableCapstone(courseID: number, userID: number) {
  return prisma.capstone.findFirst({
    where: {
      courseID,
      course: {
        status: "PUBLISHED",
        enrollments: { some: { userID } },
      },
    },
    select: { capstoneID: true },
  });
}

/** Track a capstone file the moment the browser upload finishes. */
export async function registerCapstoneUpload(
  upload: CapstoneUpload
): Promise<ActionResult> {
  const { dbUser } = await requireDbUser();

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const url = upload.url.trim();
  const publicID = upload.publicID.trim();
  if (
    !url ||
    !publicID ||
    !cloud ||
    !url.startsWith(`https://res.cloudinary.com/${cloud}/`)
  ) {
    return fail("Only files uploaded through this app can be registered.");
  }

  await prisma.pendingUpload.upsert({
    where: { publicID: publicID.slice(0, 512) },
    create: {
      ownerID: dbUser.userID,
      url: url.slice(0, 1024),
      publicID: publicID.slice(0, 512),
      resourceType: upload.resourceType.slice(0, 16),
    },
    update: {},
  });
  return { ok: true };
}

/** Remove a not-yet-submitted capstone file (Cloudinary + tracking row). */
export async function discardCapstoneUpload(
  publicID: string
): Promise<ActionResult> {
  const { dbUser } = await requireDbUser();

  const pending = await prisma.pendingUpload.findFirst({
    where: { publicID, ownerID: dbUser.userID },
    select: { uploadID: true, resourceType: true },
  });
  if (!pending) return fail("Upload not found.");

  const destroyed = await destroyCloudinaryAsset(publicID, pending.resourceType);
  if (!destroyed.ok) return destroyed;

  await prisma.pendingUpload.delete({ where: { uploadID: pending.uploadID } });
  return { ok: true };
}

export async function submitCapstone(
  courseID: number,
  files: CapstoneUpload[]
): Promise<ActionResult> {
  const { dbUser } = await requireDbUser();

  const capstone = await submittableCapstone(courseID, dbUser.userID);
  if (!capstone) return fail("You must be enrolled to submit the capstone.");

  if (files.length === 0) return fail("Attach at least one file.");
  if (files.length > MAX_SUBMISSION_FILES)
    return fail(`At most ${MAX_SUBMISSION_FILES} files per submission.`);

  const existing = await prisma.capstoneSubmission.findUnique({
    where: {
      capstoneID_userID: { capstoneID: capstone.capstoneID, userID: dbUser.userID },
    },
    select: { status: true },
  });
  if (existing) {
    return fail(
      existing.status === "FAILED"
        ? "Remove your previous submission first, then submit the reworked project."
        : "You already have a submission under review."
    );
  }

  // Every file must be a tracked upload owned by this user.
  const publicIDs = files.map((f) => f.publicID);
  const pending = await prisma.pendingUpload.findMany({
    where: { publicID: { in: publicIDs }, ownerID: dbUser.userID },
    select: { publicID: true },
  });
  if (pending.length !== new Set(publicIDs).size) {
    return fail("Some files aren't tracked uploads — remove them and re-upload.");
  }

  await prisma.$transaction([
    prisma.capstoneSubmission.create({
      data: {
        capstoneID: capstone.capstoneID,
        userID: dbUser.userID,
        files: {
          create: files.map((f) => ({
            name: f.name.trim().slice(0, 200) || "file",
            url: f.url.slice(0, 1024),
            publicID: f.publicID.slice(0, 512),
            resourceType: f.resourceType.slice(0, 16),
            bytes: f.bytes,
          })),
        },
      },
    }),
    prisma.pendingUpload.deleteMany({
      where: { publicID: { in: publicIDs }, ownerID: dbUser.userID },
    }),
  ]);

  revalidatePath(`/courses/${courseID}`);
  revalidatePath(`/learn/${courseID}/capstone`);
  return { ok: true };
}

/** Withdraw a pending or failed submission so the student can rework and
 *  resubmit. A passed capstone is final and can't be withdrawn. */
export async function withdrawCapstoneSubmission(
  courseID: number
): Promise<ActionResult> {
  const { dbUser } = await requireDbUser();

  const submission = await prisma.capstoneSubmission.findFirst({
    where: { userID: dbUser.userID, capstone: { courseID } },
    select: {
      submissionID: true,
      status: true,
      files: { select: { publicID: true, resourceType: true } },
    },
  });
  if (!submission) return fail("No submission found.");
  if (submission.status === "PASSED")
    return fail("This capstone has already been passed — nothing to rework.");

  for (const f of submission.files) {
    const res = await destroyCloudinaryAsset(f.publicID, f.resourceType);
    if (!res.ok) return res;
  }

  await prisma.capstoneSubmission.delete({
    where: { submissionID: submission.submissionID },
  });
  revalidatePath(`/courses/${courseID}`);
  revalidatePath(`/learn/${courseID}/capstone`);
  return { ok: true };
}

// ---------------- course reviews ----------------

const MAX_REVIEW_CHARS = 2000;

/** Enrolled students (not the course owner) can rate a published course 1–5. */
export async function submitCourseReview(
  courseID: number,
  rating: number,
  comment: string
): Promise<ActionResult> {
  const { dbUser } = await requireDbUser();

  if (!Number.isInteger(courseID)) return fail("Course not found.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return fail("Pick a rating from 1 to 5 stars.");
  }
  const text = comment.trim();
  if (text.length > MAX_REVIEW_CHARS) {
    return fail(`Keep your review under ${MAX_REVIEW_CHARS} characters.`);
  }

  const course = await prisma.course.findFirst({
    where: {
      courseID,
      status: "PUBLISHED",
      enrollments: { some: { userID: dbUser.userID } },
    },
    select: { teacherID: true },
  });
  if (!course) return fail("Enroll in the course to leave a review.");
  if (course.teacherID === dbUser.userID) {
    return fail("You can't review your own course.");
  }

  await prisma.courseReview.upsert({
    where: { courseID_userID: { courseID, userID: dbUser.userID } },
    create: { courseID, userID: dbUser.userID, rating, comment: text || null },
    update: { rating, comment: text || null },
  });

  revalidatePath(`/courses/${courseID}`);
  revalidatePath("/courses");
  return { ok: true };
}

export async function deleteCourseReview(
  courseID: number
): Promise<ActionResult> {
  const { dbUser } = await requireDbUser();
  if (!Number.isInteger(courseID)) return fail("Course not found.");

  await prisma.courseReview.deleteMany({
    where: { courseID, userID: dbUser.userID },
  });

  revalidatePath(`/courses/${courseID}`);
  revalidatePath("/courses");
  return { ok: true };
}
