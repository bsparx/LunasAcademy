"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/utils/db";
import { requireTeacher } from "@/app/utils/auth";
import { destroyCloudinaryAsset } from "@/lib/cloudinary-admin";
import type { ResourceKind } from "@prisma/client";

type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

async function ownedCourse(courseID: number, userID: number) {
  return prisma.course.findFirst({
    where: { courseID, teacherID: userID },
    select: { courseID: true },
  });
}

function revalidateBuilder(courseID: number) {
  revalidatePath(`/instructor/${courseID}/builder`);
  revalidatePath(`/instructor/${courseID}`);
}

// ---------------- topics ----------------

export async function createTopic(
  courseID: number,
  title: string
): Promise<ActionResult<{ topicID: number }>> {
  const { dbUser } = await requireTeacher();
  if (!(await ownedCourse(courseID, dbUser.userID))) return fail("Course not found.");

  const clean = title.trim().slice(0, 120);
  if (!clean) return fail("Give the topic a name.");

  const position = await prisma.topic.count({ where: { courseID } });
  const topic = await prisma.topic.create({
    data: { courseID, title: clean, position },
  });
  revalidateBuilder(courseID);
  return { ok: true, data: { topicID: topic.topicID } };
}

export async function renameTopic(
  topicID: number,
  title: string
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const clean = title.trim().slice(0, 120);
  if (!clean) return fail("Give the topic a name.");

  const topic = await prisma.topic.findFirst({
    where: { topicID, course: { teacherID: dbUser.userID } },
    select: { courseID: true },
  });
  if (!topic) return fail("Topic not found.");

  await prisma.topic.update({ where: { topicID }, data: { title: clean } });
  revalidateBuilder(topic.courseID);
  return { ok: true };
}

export async function deleteTopic(topicID: number): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const topic = await prisma.topic.findFirst({
    where: { topicID, course: { teacherID: dbUser.userID } },
    select: { courseID: true },
  });
  if (!topic) return fail("Topic not found.");

  // Exam question images under this topic's modules would be orphaned by cascade.
  const questions = await prisma.examQuestion.findMany({
    where: { exam: { item: { module: { topicID } } }, imagePublicID: { not: null } },
    select: { imagePublicID: true },
  });
  const destroyed = await destroyImages(questions.map((q) => q.imagePublicID));
  if (!destroyed.ok) return destroyed;

  await prisma.topic.delete({ where: { topicID } });
  revalidateBuilder(topic.courseID);
  return { ok: true };
}

export async function reorderTopics(
  courseID: number,
  orderedTopicIDs: number[]
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  if (!(await ownedCourse(courseID, dbUser.userID))) return fail("Course not found.");

  const existing = await prisma.topic.findMany({
    where: { courseID },
    select: { topicID: true },
  });
  const existingIDs = new Set(existing.map((t) => t.topicID));
  const sameSet =
    existing.length === orderedTopicIDs.length &&
    orderedTopicIDs.every((id) => existingIDs.has(id));
  if (!sameSet) return fail("Topic list is out of date — refresh and try again.");

  await prisma.$transaction(
    orderedTopicIDs.map((topicID, i) =>
      prisma.topic.update({ where: { topicID }, data: { position: i } })
    )
  );
  revalidateBuilder(courseID);
  return { ok: true };
}

async function ownedTopic(topicID: number, userID: number) {
  return prisma.topic.findFirst({
    where: { topicID, course: { teacherID: userID } },
    select: { topicID: true },
  });
}

// ---------------- modules ----------------

export async function createModule(
  topicID: number,
  title: string
): Promise<ActionResult<{ moduleID: number }>> {
  const { dbUser } = await requireTeacher();
  if (!(await ownedTopic(topicID, dbUser.userID))) return fail("Topic not found.");

  const clean = title.trim().slice(0, 120);
  if (!clean) return fail("Give the module a name.");

  const position = await prisma.module.count({ where: { topicID } });
  const mod = await prisma.module.create({
    data: { topicID, title: clean, position },
  });
  const topic = await prisma.topic.findUnique({
    where: { topicID },
    select: { courseID: true },
  });
  revalidateBuilder(topic!.courseID);
  return { ok: true, data: { moduleID: mod.moduleID } };
}

export async function renameModule(
  moduleID: number,
  title: string
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const clean = title.trim().slice(0, 120);
  if (!clean) return fail("Give the module a name.");

  const mod = await prisma.module.findFirst({
    where: { moduleID, topic: { course: { teacherID: dbUser.userID } } },
    select: { topic: { select: { courseID: true } } },
  });
  if (!mod) return fail("Module not found.");

  await prisma.module.update({ where: { moduleID }, data: { title: clean } });
  revalidateBuilder(mod.topic.courseID);
  return { ok: true };
}

export async function deleteModule(moduleID: number): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const mod = await prisma.module.findFirst({
    where: { moduleID, topic: { course: { teacherID: dbUser.userID } } },
    select: { topic: { select: { courseID: true } } },
  });
  if (!mod) return fail("Module not found.");

  // Exam question images would be orphaned by the cascade — delete them first.
  const questions = await prisma.examQuestion.findMany({
    where: { exam: { item: { moduleID } }, imagePublicID: { not: null } },
    select: { imagePublicID: true },
  });
  const destroyed = await destroyImages(questions.map((q) => q.imagePublicID));
  if (!destroyed.ok) return destroyed;

  await prisma.module.delete({ where: { moduleID } });
  revalidateBuilder(mod.topic.courseID);
  return { ok: true };
}

export async function reorderModules(
  topicID: number,
  orderedModuleIDs: number[]
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const topic = await ownedTopic(topicID, dbUser.userID);
  if (!topic) return fail("Topic not found.");

  const existing = await prisma.module.findMany({
    where: { topicID },
    select: { moduleID: true },
  });
  const existingIDs = new Set(existing.map((m) => m.moduleID));
  const sameSet =
    existing.length === orderedModuleIDs.length &&
    orderedModuleIDs.every((id) => existingIDs.has(id));
  if (!sameSet) return fail("Module list is out of date — refresh and try again.");

  await prisma.$transaction(
    orderedModuleIDs.map((moduleID, i) =>
      prisma.module.update({ where: { moduleID }, data: { position: i } })
    )
  );
  const full = await prisma.topic.findUnique({
    where: { topicID },
    select: { courseID: true },
  });
  revalidateBuilder(full!.courseID);
  return { ok: true };
}

export async function moveModules(
  courseID: number,
  topics: { topicID: number; orderedModuleIDs: number[] }[]
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  if (!(await ownedCourse(courseID, dbUser.userID))) return fail("Course not found.");

  const [courseTopics, courseModules] = await Promise.all([
    prisma.topic.findMany({ where: { courseID }, select: { topicID: true } }),
    prisma.module.findMany({
      where: { topic: { courseID } },
      select: { moduleID: true },
    }),
  ]);
  const topicIDs = new Set(courseTopics.map((t) => t.topicID));
  const moduleIDs = new Set(courseModules.map((m) => m.moduleID));

  for (const t of topics) {
    if (!topicIDs.has(t.topicID)) return fail("Topic list is out of date.");
    for (const id of t.orderedModuleIDs) {
      if (!moduleIDs.has(id)) return fail("Module list is out of date.");
    }
  }

  await prisma.$transaction(
    topics.flatMap((t) =>
      t.orderedModuleIDs.map((moduleID, i) =>
        prisma.module.update({
          where: { moduleID },
          data: { topicID: t.topicID, position: i },
        })
      )
    )
  );
  revalidateBuilder(courseID);
  return { ok: true };
}

// ---------------- resources ----------------

export async function createResource(input: {
  courseID: number;
  kind: ResourceKind;
  title: string;
  url: string;
  publicID: string;
  resourceType: string;
  format?: string | null;
  bytes?: number | null;
  duration?: number | null;
}): Promise<ActionResult<{ resourceID: number }>> {
  const { dbUser } = await requireTeacher();
  if (!(await ownedCourse(input.courseID, dbUser.userID))) {
    return fail("Course not found.");
  }

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return fail("Cloudinary is not configured on the server.");
  if (!input.url.startsWith(`https://res.cloudinary.com/${cloud}/`)) {
    return fail("Only Cloudinary uploads from this app can be saved.");
  }

  const title = input.title.trim().slice(0, 160);
  if (!title) return fail("The resource needs a title.");

  const resource = await prisma.resource.create({
    data: {
      ownerID: dbUser.userID,
      courseID: input.courseID,
      kind: input.kind,
      title,
      url: input.url,
      publicID: input.publicID.slice(0, 512),
      resourceType: input.resourceType.slice(0, 20),
      format: input.format?.slice(0, 20) ?? null,
      bytes: input.bytes ?? null,
      duration: input.duration ?? null,
    },
  });
  return { ok: true, data: { resourceID: resource.resourceID } };
}

export async function deleteResource(resourceID: number): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const resource = await prisma.resource.findFirst({
    where: { resourceID, ownerID: dbUser.userID },
    select: { resourceID: true, publicID: true, resourceType: true },
  });
  if (!resource) return fail("Resource not found.");

  // Delete the Cloudinary file first — if that fails, keep the DB row so the
  // teacher can retry instead of leaving an orphaned asset in Cloudinary.
  const destroyed = await destroyCloudinaryAsset(
    resource.publicID,
    resource.resourceType
  );
  if (!destroyed.ok) return fail(destroyed.error);

  // Removes the library entry and any module placements (cascade).
  await prisma.resource.delete({ where: { resourceID } });
  return { ok: true };
}

// ---------------- MCQ validation (video checks + exam questions) ----------------

export type McqInput = {
  question: string;
  options: string[];
  correctIndices: number[];
  imageURL?: string | null;
  imagePublicID?: string | null;
};

export type VideoCheckInput = McqInput & { timeSec: number };

type McqData = {
  question: string;
  options: string[];
  correctIndices: number[];
  imageURL: string | null;
  imagePublicID: string | null;
};

function validateMcq(
  input: McqInput
): { ok: true; data: McqData } | { ok: false; error: string } {
  const question = input.question.trim().slice(0, 500);
  if (!question) return fail("Write the question.");

  const options = input.options.map((o) => o.trim().slice(0, 200));
  if (options.length < 2 || options.length > 12) {
    return fail("A question needs between 2 and 12 answers.");
  }
  if (options.some((o) => !o)) return fail("Answers can't be empty.");

  const correctIndices = Array.from(new Set(input.correctIndices)).sort(
    (a, b) => a - b
  );
  if (correctIndices.length === 0) {
    return fail("Mark at least one correct answer.");
  }
  if (
    correctIndices.some(
      (i) => !Number.isInteger(i) || i < 0 || i >= options.length
    )
  ) {
    return fail("Pick which answers are correct.");
  }

  const imageURL = input.imageURL?.trim() || null;
  const imagePublicID = input.imagePublicID?.trim() || null;
  if (Boolean(imageURL) !== Boolean(imagePublicID)) {
    return fail("The image upload looks incomplete — remove it and try again.");
  }
  if (imageURL) {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloud || !imageURL.startsWith(`https://res.cloudinary.com/${cloud}/`)) {
      return fail("Only images uploaded through this app can be attached.");
    }
  }

  return {
    ok: true,
    data: {
      question,
      options,
      correctIndices,
      imageURL: imageURL?.slice(0, 1024) ?? null,
      imagePublicID: imagePublicID?.slice(0, 512) ?? null,
    },
  };
}

// ---------------- tracked image uploads ----------------
// Every question/check image is registered in PendingUpload the moment the
// browser upload finishes, so it can always be found and deleted later.

export async function registerUploadedImage(
  url: string,
  publicID: string
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const cleanURL = url.trim();
  const cleanID = publicID.trim();
  if (
    !cleanURL ||
    !cleanID ||
    !cloud ||
    !cleanURL.startsWith(`https://res.cloudinary.com/${cloud}/`)
  ) {
    return fail("Only images uploaded through this app can be registered.");
  }

  await prisma.pendingUpload.upsert({
    where: { publicID: cleanID.slice(0, 512) },
    create: {
      ownerID: dbUser.userID,
      url: cleanURL.slice(0, 1024),
      publicID: cleanID.slice(0, 512),
    },
    update: {},
  });
  return { ok: true };
}

export async function discardUploadedImage(
  publicID: string
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();

  const pending = await prisma.pendingUpload.findFirst({
    where: { publicID, ownerID: dbUser.userID },
    select: { uploadID: true },
  });
  if (!pending) return fail("Upload not found.");

  const destroyed = await destroyCloudinaryAsset(publicID, "image");
  if (!destroyed.ok) return destroyed;

  await prisma.pendingUpload.delete({ where: { uploadID: pending.uploadID } });
  return { ok: true };
}

/**
 * A question/check may only reference an image that is either a tracked
 * pending upload of this teacher or already stored on the row being edited.
 */
async function verifyImageSource(
  userID: number,
  imagePublicID: string | null,
  currentPublicID: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!imagePublicID || imagePublicID === currentPublicID) return { ok: true };
  const pending = await prisma.pendingUpload.findFirst({
    where: { publicID: imagePublicID, ownerID: userID },
    select: { uploadID: true },
  });
  if (!pending) {
    return fail("That image isn't a tracked upload — remove it and re-upload.");
  }
  return { ok: true };
}

/** The image now belongs to a saved question/check — drop the pending record. */
async function consumePendingImage(userID: number, imagePublicID: string | null) {
  if (!imagePublicID) return;
  await prisma.pendingUpload.deleteMany({
    where: { publicID: imagePublicID, ownerID: userID },
  });
}

/** Deletes question/check images from Cloudinary; stops at the first failure. */
async function destroyImages(
  publicIDs: (string | null)[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  for (const publicID of publicIDs) {
    if (!publicID) continue;
    const res = await destroyCloudinaryAsset(publicID, "image");
    if (!res.ok) return res;
  }
  return { ok: true };
}

// ---------------- video knowledge checks ----------------

async function ownedVideoResource(resourceID: number, userID: number) {
  return prisma.resource.findFirst({
    where: { resourceID, ownerID: userID, kind: "VIDEO" },
    select: { resourceID: true },
  });
}

function validateTimeSec(timeSec: number): number | null {
  const t = Math.floor(timeSec);
  return Number.isFinite(t) && t >= 0 ? t : null;
}

export async function createVideoCheck(
  resourceID: number,
  input: VideoCheckInput
): Promise<ActionResult<{ checkID: number }>> {
  const { dbUser } = await requireTeacher();
  if (!(await ownedVideoResource(resourceID, dbUser.userID))) {
    return fail("Video not found.");
  }

  const valid = validateMcq(input);
  if (!valid.ok) return valid;
  const timeSec = validateTimeSec(input.timeSec);
  if (timeSec === null) return fail("Set when the check should appear.");

  const imageOk = await verifyImageSource(
    dbUser.userID,
    valid.data.imagePublicID,
    null
  );
  if (!imageOk.ok) return imageOk;

  const check = await prisma.videoCheck.create({
    data: { resourceID, timeSec, ...valid.data },
  });
  await consumePendingImage(dbUser.userID, valid.data.imagePublicID);
  return { ok: true, data: { checkID: check.checkID } };
}

export async function updateVideoCheck(
  checkID: number,
  input: VideoCheckInput
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const check = await prisma.videoCheck.findFirst({
    where: { checkID, resource: { ownerID: dbUser.userID } },
    select: { checkID: true, imagePublicID: true },
  });
  if (!check) return fail("Check not found.");

  const valid = validateMcq(input);
  if (!valid.ok) return valid;
  const timeSec = validateTimeSec(input.timeSec);
  if (timeSec === null) return fail("Set when the check should appear.");

  const imageOk = await verifyImageSource(
    dbUser.userID,
    valid.data.imagePublicID,
    check.imagePublicID
  );
  if (!imageOk.ok) return imageOk;

  // The old image was replaced or removed — clean it up in Cloudinary.
  if (check.imagePublicID && check.imagePublicID !== valid.data.imagePublicID) {
    const destroyed = await destroyImages([check.imagePublicID]);
    if (!destroyed.ok) return destroyed;
  }

  await prisma.videoCheck.update({
    where: { checkID },
    data: { timeSec, ...valid.data },
  });
  await consumePendingImage(dbUser.userID, valid.data.imagePublicID);
  return { ok: true };
}

export async function deleteVideoCheck(checkID: number): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const check = await prisma.videoCheck.findFirst({
    where: { checkID, resource: { ownerID: dbUser.userID } },
    select: { checkID: true, imagePublicID: true },
  });
  if (!check) return fail("Check not found.");

  const destroyed = await destroyImages([check.imagePublicID]);
  if (!destroyed.ok) return destroyed;

  await prisma.videoCheck.delete({ where: { checkID } });
  return { ok: true };
}

// ---------------- exams ----------------

async function ownedExam(examID: number, userID: number) {
  return prisma.exam.findFirst({
    where: { examID, item: { module: { topic: { course: { teacherID: userID } } } } },
    select: {
      examID: true,
      item: { select: { module: { select: { topic: { select: { courseID: true } } } } } },
    },
  });
}

export async function createExam(
  moduleID: number,
  title: string
): Promise<ActionResult<{ itemID: number; examID: number }>> {
  const { dbUser } = await requireTeacher();
  const mod = await prisma.module.findFirst({
    where: { moduleID, topic: { course: { teacherID: dbUser.userID } } },
    select: { topic: { select: { courseID: true } } },
  });
  if (!mod) return fail("Module not found.");

  const clean = title.trim().slice(0, 160) || "Exam";
  const position = await prisma.moduleItem.count({ where: { moduleID } });
  const item = await prisma.moduleItem.create({
    data: { moduleID, position, title: clean, exam: { create: {} } },
    include: { exam: { select: { examID: true } } },
  });
  revalidateBuilder(mod.topic.courseID);
  return { ok: true, data: { itemID: item.itemID, examID: item.exam!.examID } };
}

export async function createExamQuestion(
  examID: number,
  input: McqInput
): Promise<ActionResult<{ questionID: number }>> {
  const { dbUser } = await requireTeacher();
  if (!(await ownedExam(examID, dbUser.userID))) return fail("Exam not found.");

  const valid = validateMcq(input);
  if (!valid.ok) return valid;

  const imageOk = await verifyImageSource(
    dbUser.userID,
    valid.data.imagePublicID,
    null
  );
  if (!imageOk.ok) return imageOk;

  const position = await prisma.examQuestion.count({ where: { examID } });
  const question = await prisma.examQuestion.create({
    data: { examID, position, ...valid.data },
  });
  await consumePendingImage(dbUser.userID, valid.data.imagePublicID);
  return { ok: true, data: { questionID: question.questionID } };
}

export async function updateExamQuestion(
  questionID: number,
  input: McqInput
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const existing = await prisma.examQuestion.findFirst({
    where: {
      questionID,
      exam: { item: { module: { topic: { course: { teacherID: dbUser.userID } } } } },
    },
    select: { questionID: true, imagePublicID: true },
  });
  if (!existing) return fail("Question not found.");

  const valid = validateMcq(input);
  if (!valid.ok) return valid;

  const imageOk = await verifyImageSource(
    dbUser.userID,
    valid.data.imagePublicID,
    existing.imagePublicID
  );
  if (!imageOk.ok) return imageOk;

  if (
    existing.imagePublicID &&
    existing.imagePublicID !== valid.data.imagePublicID
  ) {
    const destroyed = await destroyImages([existing.imagePublicID]);
    if (!destroyed.ok) return destroyed;
  }

  await prisma.examQuestion.update({ where: { questionID }, data: valid.data });
  await consumePendingImage(dbUser.userID, valid.data.imagePublicID);
  return { ok: true };
}

export async function deleteExamQuestion(
  questionID: number
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const existing = await prisma.examQuestion.findFirst({
    where: {
      questionID,
      exam: { item: { module: { topic: { course: { teacherID: dbUser.userID } } } } },
    },
    select: { questionID: true, imagePublicID: true },
  });
  if (!existing) return fail("Question not found.");

  const destroyed = await destroyImages([existing.imagePublicID]);
  if (!destroyed.ok) return destroyed;

  await prisma.examQuestion.delete({ where: { questionID } });
  return { ok: true };
}

// ---------------- module items ----------------

export async function attachResource(
  moduleID: number,
  resourceID: number
): Promise<ActionResult<{ itemID: number }>> {
  const { dbUser } = await requireTeacher();

  const [mod, resource] = await Promise.all([
    prisma.module.findFirst({
      where: { moduleID, topic: { course: { teacherID: dbUser.userID } } },
      select: { topic: { select: { courseID: true } } },
    }),
    prisma.resource.findFirst({
      where: { resourceID, ownerID: dbUser.userID },
      select: { resourceID: true, courseID: true },
    }),
  ]);
  if (!mod) return fail("Module not found.");
  if (!resource) return fail("Resource not found.");
  if (resource.courseID !== mod.topic.courseID) {
    return fail("That resource belongs to another course.");
  }

  const position = await prisma.moduleItem.count({ where: { moduleID } });
  const item = await prisma.moduleItem.create({
    data: { moduleID, resourceID, position },
  });
  revalidateBuilder(mod.topic.courseID);
  return { ok: true, data: { itemID: item.itemID } };
}

export async function detachItem(itemID: number): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const item = await prisma.moduleItem.findFirst({
    where: { itemID, module: { topic: { course: { teacherID: dbUser.userID } } } },
    select: {
      module: { select: { topic: { select: { courseID: true } } } },
      exam: {
        select: {
          questions: {
            where: { imagePublicID: { not: null } },
            select: { imagePublicID: true },
          },
        },
      },
    },
  });
  if (!item) return fail("Item not found.");

  // Deleting an exam item deletes the exam + questions (cascade) — clean up
  // their Cloudinary images first so nothing is orphaned.
  if (item.exam && item.exam.questions.length > 0) {
    const destroyed = await destroyImages(
      item.exam.questions.map((q) => q.imagePublicID)
    );
    if (!destroyed.ok) return destroyed;
  }

  await prisma.moduleItem.delete({ where: { itemID } });
  revalidateBuilder(item.module.topic.courseID);
  return { ok: true };
}

export async function renameItem(
  itemID: number,
  title: string
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const item = await prisma.moduleItem.findFirst({
    where: { itemID, module: { topic: { course: { teacherID: dbUser.userID } } } },
    select: { module: { select: { topic: { select: { courseID: true } } } } },
  });
  if (!item) return fail("Item not found.");

  const clean = title.trim().slice(0, 160);
  await prisma.moduleItem.update({
    where: { itemID },
    data: { title: clean || null },
  });
  revalidateBuilder(item.module.topic.courseID);
  return { ok: true };
}

export async function moveItems(
  courseID: number,
  modules: { moduleID: number; orderedItemIDs: number[] }[]
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  if (!(await ownedCourse(courseID, dbUser.userID))) return fail("Course not found.");

  const [courseModules, courseItems] = await Promise.all([
    prisma.module.findMany({ where: { topic: { courseID } }, select: { moduleID: true } }),
    prisma.moduleItem.findMany({
      where: { module: { topic: { courseID } } },
      select: { itemID: true },
    }),
  ]);
  const moduleIDs = new Set(courseModules.map((m) => m.moduleID));
  const itemIDs = new Set(courseItems.map((i) => i.itemID));

  for (const m of modules) {
    if (!moduleIDs.has(m.moduleID)) return fail("Module list is out of date.");
    for (const id of m.orderedItemIDs) {
      if (!itemIDs.has(id)) return fail("Item list is out of date.");
    }
  }

  await prisma.$transaction(
    modules.flatMap((m) =>
      m.orderedItemIDs.map((itemID, i) =>
        prisma.moduleItem.update({
          where: { itemID },
          data: { moduleID: m.moduleID, position: i },
        })
      )
    )
  );
  revalidateBuilder(courseID);
  return { ok: true };
}

// ---------------- capstone project ----------------

export type CapstoneInput = {
  title: string;
  brief: string;
  deliverables: string[];
  criteria: string[];
};

function validateCapstone(input: CapstoneInput): { ok: true; clean: CapstoneInput } | { ok: false; error: string } {
  const title = input.title.trim();
  const brief = input.brief.trim();
  const deliverables = input.deliverables.map((d) => d.trim()).filter(Boolean);
  const criteria = input.criteria.map((c) => c.trim()).filter(Boolean);

  if (!title) return fail("Give the capstone a title.");
  if (title.length > 140) return fail("Keep the title under 140 characters.");
  if (!brief) return fail("Describe the project brief.");
  if (brief.length > 2000) return fail("Keep the brief under 2000 characters.");
  if (deliverables.length === 0) return fail("List at least one deliverable.");
  if (deliverables.length > 10) return fail("At most 10 deliverables.");
  if (deliverables.some((d) => d.length > 140))
    return fail("Keep each deliverable under 140 characters.");
  if (criteria.length === 0)
    return fail("Add at least one grading criterion — reviewers grade against it.");
  if (criteria.length > 10) return fail("At most 10 grading criteria.");
  if (criteria.some((c) => c.length > 200))
    return fail("Keep each criterion under 200 characters.");
  return { ok: true, clean: { title, brief, deliverables, criteria } };
}

export async function saveCapstone(
  courseID: number,
  input: CapstoneInput
): Promise<ActionResult<{ capstoneID: number }>> {
  const { dbUser } = await requireTeacher();
  if (!(await ownedCourse(courseID, dbUser.userID))) return fail("Course not found.");

  const v = validateCapstone(input);
  if (!v.ok) return v;

  const capstone = await prisma.capstone.upsert({
    where: { courseID },
    create: { courseID, ...v.clean },
    update: v.clean,
  });
  revalidateBuilder(courseID);
  revalidatePath(`/courses/${courseID}`);
  return { ok: true, data: { capstoneID: capstone.capstoneID } };
}

export async function deleteCapstone(courseID: number): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  if (!(await ownedCourse(courseID, dbUser.userID))) return fail("Course not found.");

  const capstone = await prisma.capstone.findUnique({
    where: { courseID },
    select: {
      capstoneID: true,
      submissions: {
        select: { files: { select: { publicID: true, resourceType: true } } },
      },
      resources: { select: { publicID: true, resourceType: true } },
    },
  });
  if (!capstone) return fail("This course has no capstone.");

  // Student submission files and teacher-uploaded resources would be
  // orphaned by the cascade — delete them from storage first.
  for (const sub of capstone.submissions) {
    for (const f of sub.files) {
      const res = await destroyCloudinaryAsset(f.publicID, f.resourceType);
      if (!res.ok) return res;
    }
  }
  for (const r of capstone.resources) {
    const res = await destroyCloudinaryAsset(r.publicID, r.resourceType);
    if (!res.ok) return res;
  }

  await prisma.capstone.delete({ where: { capstoneID: capstone.capstoneID } });
  revalidateBuilder(courseID);
  revalidatePath(`/courses/${courseID}`);
  revalidatePath(`/learn/${courseID}/capstone`);
  revalidatePath(`/instructor/${courseID}/submissions`);
  return { ok: true };
}

// ---------------- capstone resources ----------------

function revalidateCapstone(courseID: number) {
  revalidateBuilder(courseID);
  revalidatePath(`/courses/${courseID}`);
  revalidatePath(`/learn/${courseID}/capstone`);
  revalidatePath(`/instructor/${courseID}/submissions`);
}

export async function createCapstoneResource(
  capstoneID: number,
  input: {
    name: string;
    url: string;
    publicID: string;
    resourceType: string;
    bytes: number | null;
  }
): Promise<ActionResult<{ resourceID: number }>> {
  const { dbUser } = await requireTeacher();
  const capstone = await prisma.capstone.findFirst({
    where: { capstoneID, course: { teacherID: dbUser.userID } },
    select: { courseID: true },
  });
  if (!capstone) return fail("Capstone not found.");

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return fail("Cloudinary is not configured on the server.");
  if (!input.url.startsWith(`https://res.cloudinary.com/${cloud}/`)) {
    return fail("Only files uploaded through this app can be saved.");
  }

  const name = input.name.trim().slice(0, 200);
  if (!name) return fail("The file needs a name.");

  const resource = await prisma.capstoneResource.create({
    data: {
      capstoneID,
      name,
      url: input.url.slice(0, 1024),
      publicID: input.publicID.slice(0, 512),
      resourceType: input.resourceType.slice(0, 16),
      bytes: input.bytes,
    },
  });
  revalidateCapstone(capstone.courseID);
  return { ok: true, data: { resourceID: resource.resourceID } };
}

export async function deleteCapstoneResource(
  resourceID: number
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  const resource = await prisma.capstoneResource.findFirst({
    where: { resourceID, capstone: { course: { teacherID: dbUser.userID } } },
    select: {
      publicID: true,
      resourceType: true,
      capstone: { select: { courseID: true } },
    },
  });
  if (!resource) return fail("File not found.");

  const destroyed = await destroyCloudinaryAsset(
    resource.publicID,
    resource.resourceType
  );
  if (!destroyed.ok) return destroyed;

  await prisma.capstoneResource.delete({ where: { resourceID } });
  revalidateCapstone(resource.capstone.courseID);
  return { ok: true };
}

// ---------------- course overview ----------------

const MAX_OVERVIEW_CHARS = 20000;

/** Long-form markdown shown on the course page's Overview tab. */
export async function saveOverview(
  courseID: number,
  overview: string
): Promise<ActionResult> {
  const { dbUser } = await requireTeacher();
  if (!(await ownedCourse(courseID, dbUser.userID))) return fail("Course not found.");

  const clean = overview.trim();
  if (clean.length > MAX_OVERVIEW_CHARS) {
    return fail(`Keep the overview under ${MAX_OVERVIEW_CHARS.toLocaleString()} characters.`);
  }

  await prisma.course.update({
    where: { courseID },
    data: { overview: clean || null },
  });
  revalidateBuilder(courseID);
  revalidatePath(`/courses/${courseID}`);
  return { ok: true };
}
