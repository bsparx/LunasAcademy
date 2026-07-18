"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/utils/db";
import { requireTeacher } from "@/app/utils/auth";

type ActionResult = { ok: true } | { ok: false; error: string };

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

const MAX_FEEDBACK_CHARS = 4000;

export type CapstoneVerdict = "PASSED" | "FAILED";

/**
 * Pass or fail a capstone submission. Feedback is required either way —
 * the student sees it next to the verdict. Re-grading is allowed until the
 * student withdraws a failed submission to rework it.
 */
export async function gradeCapstoneSubmission(
  submissionID: number,
  verdict: CapstoneVerdict,
  feedback: string
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();

  if (verdict !== "PASSED" && verdict !== "FAILED") {
    return fail("Pick pass or fail.");
  }
  const clean = feedback.trim();
  if (!clean) {
    return fail("Write feedback for the student — they see it with the verdict.");
  }
  if (clean.length > MAX_FEEDBACK_CHARS) {
    return fail(`Keep feedback under ${MAX_FEEDBACK_CHARS.toLocaleString()} characters.`);
  }

  const submission = await prisma.capstoneSubmission.findFirst({
    where: {
      submissionID,
      capstone: { course: { teacherID: dbUser.userID } },
    },
    select: { capstone: { select: { courseID: true } } },
  });
  if (!submission) return fail("Submission not found.");

  await prisma.capstoneSubmission.update({
    where: { submissionID },
    data: { status: verdict, feedback: clean, gradedAt: new Date() },
  });

  const courseID = submission.capstone.courseID;
  revalidatePath(`/instructor/${courseID}/submissions`);
  revalidatePath(`/instructor/${courseID}`);
  revalidatePath(`/instructor`);
  revalidatePath(`/courses/${courseID}`);
  revalidatePath(`/learn/${courseID}/capstone`);
  return { ok: true };
}
