"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";

const PASS_PCT = 70;

type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

type AccessibleItem = {
  itemID: number;
  courseID: number;
  examID: number | null;
};

/** Item must exist and the viewer must own the course or be enrolled in it (published). */
async function accessibleItem(
  itemID: number,
  userID: number
): Promise<AccessibleItem | null> {
  if (!Number.isInteger(itemID)) return null;

  const item = await prisma.moduleItem.findUnique({
    where: { itemID },
    select: {
      itemID: true,
      exam: { select: { examID: true } },
      module: {
        select: {
          topic: {
            select: {
              course: { select: { courseID: true, teacherID: true, status: true } },
            },
          },
        },
      },
    },
  });
  if (!item) return null;

  const course = item.module.topic.course;
  if (course.teacherID !== userID) {
    if (course.status !== "PUBLISHED") return null;
    const enrollment = await prisma.enrollment.findUnique({
      where: { userID_courseID: { userID, courseID: course.courseID } },
      select: { enrollmentID: true },
    });
    if (!enrollment) return null;
  }

  return {
    itemID: item.itemID,
    courseID: course.courseID,
    examID: item.exam?.examID ?? null,
  };
}

/** Today as a date-only value (server-local day, stored at UTC midnight). */
function localDay(offsetDays = 0): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays)
  );
}

async function recordCompletion(userID: number, itemID: number) {
  // Only first-time completions count toward activity and streaks —
  // re-watching an already-completed lecture changes nothing.
  try {
    await prisma.itemProgress.create({ data: { userID, itemID } });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return;
    }
    throw e;
  }

  const today = localDay();
  const yesterday = localDay(-1);
  await prisma.$transaction(async (tx) => {
    await tx.dailyActivity.upsert({
      where: { userID_day: { userID, day: today } },
      create: { userID, day: today, lecturesDone: 1 },
      update: { lecturesDone: { increment: 1 } },
    });

    const user = await tx.user.findUniqueOrThrow({
      where: { userID },
      select: { streak: true, longestStreak: true, lastActiveDay: true },
    });
    // ≥1 lecture a day keeps the streak alive; a gap resets it to 1.
    const last = user.lastActiveDay?.getTime();
    const streak =
      last === today.getTime()
        ? Math.max(user.streak, 1)
        : last === yesterday.getTime()
        ? user.streak + 1
        : 1;
    await tx.user.update({
      where: { userID },
      data: {
        streak,
        longestStreak: Math.max(user.longestStreak, streak),
        lastActiveDay: today,
      },
    });
  });
}

function revalidateProgress(courseID: number, itemID: number) {
  revalidatePath(`/learn/${courseID}/${itemID}`);
  revalidatePath(`/courses/${courseID}`);
  revalidatePath("/learn");
  revalidatePath("/progress");
}

export async function markItemDone(itemID: number): Promise<ActionResult> {
  const { dbUser } = await requireDbUser();

  const item = await accessibleItem(itemID, dbUser.userID);
  if (!item) return { ok: false, error: "Lesson not found." };
  if (item.examID !== null) {
    return { ok: false, error: "Pass the exam to complete it." };
  }

  await recordCompletion(dbUser.userID, item.itemID);
  revalidateProgress(item.courseID, item.itemID);
  return { ok: true };
}

/** Check must exist and the viewer must own the course or be enrolled in it (published). */
async function accessibleCheck(
  checkID: number,
  userID: number
): Promise<boolean> {
  if (!Number.isInteger(checkID)) return false;

  const check = await prisma.videoCheck.findUnique({
    where: { checkID },
    select: {
      resource: {
        select: {
          courseID: true,
          course: { select: { teacherID: true, status: true } },
        },
      },
    },
  });
  if (!check) return false;

  const course = check.resource.course;
  if (course.teacherID === userID) return true;
  if (course.status !== "PUBLISHED") return false;
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userID_courseID: { userID, courseID: check.resource.courseID },
    },
    select: { enrollmentID: true },
  });
  return enrollment !== null;
}

/** Records that the viewer answered a video knowledge check correctly, so
 *  the player can skip it on rewatch and enforce skip-blocking across reloads. */
export async function markCheckDone(checkID: number): Promise<ActionResult> {
  const { dbUser } = await requireDbUser();

  if (!(await accessibleCheck(checkID, dbUser.userID))) {
    return { ok: false, error: "Check not found." };
  }

  await prisma.checkProgress.upsert({
    where: { userID_checkID: { userID: dbUser.userID, checkID } },
    create: { userID: dbUser.userID, checkID },
    update: {},
  });
  return { ok: true };
}

export type ExamResult = {
  scorePct: number;
  correctCount: number;
  total: number;
  passed: boolean;
  correctness: Record<number, boolean>;
  /** questionID -> selected option index -> whether that pick was correct.
   *  Only carries entries for options the student actually selected — an
   *  unselected correct answer is never revealed. */
  optionCorrectness: Record<number, Record<number, boolean>>;
};

export async function submitExam(
  itemID: number,
  answers: { questionID: number; optionIndices: number[] }[]
): Promise<ActionResult<ExamResult>> {
  const { dbUser } = await requireDbUser();

  const item = await accessibleItem(itemID, dbUser.userID);
  if (!item) return { ok: false, error: "Exam not found." };
  if (item.examID === null) {
    return { ok: false, error: "This lesson isn't an exam." };
  }

  const questions = await prisma.examQuestion.findMany({
    where: { examID: item.examID },
    select: { questionID: true, correctIndices: true },
  });
  if (questions.length === 0) {
    return { ok: false, error: "This exam has no questions yet." };
  }

  const answerByQuestion = new Map(
    answers.map((a) => [a.questionID, a.optionIndices])
  );
  const correctness: Record<number, boolean> = {};
  const optionCorrectness: Record<number, Record<number, boolean>> = {};
  let correctCount = 0;
  for (const q of questions) {
    const answer = answerByQuestion.get(q.questionID);
    if (answer === undefined || answer.length === 0) {
      return { ok: false, error: "Answer every question before submitting." };
    }
    // Checkbox-style grading: the student must select exactly the correct set.
    const selected = new Set(answer);
    const correct = new Set(q.correctIndices);
    const isCorrect =
      selected.size === correct.size &&
      [...selected].every((i) => correct.has(i));
    correctness[q.questionID] = isCorrect;
    optionCorrectness[q.questionID] = Object.fromEntries(
      [...selected].map((i) => [i, correct.has(i)])
    );
    if (isCorrect) correctCount++;
  }

  const scorePct = Math.round((correctCount / questions.length) * 100);
  const passed = scorePct >= PASS_PCT;

  // Only pass/fail is stored — a pass writes the progress row, nothing else.
  if (passed) {
    await recordCompletion(dbUser.userID, item.itemID);
    revalidateProgress(item.courseID, item.itemID);
  }

  return {
    ok: true,
    data: {
      scorePct,
      correctCount,
      total: questions.length,
      passed,
      correctness,
      optionCorrectness,
    },
  };
}
