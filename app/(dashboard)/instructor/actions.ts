"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/utils/db";
import { requireTeacher } from "@/app/utils/auth";
import { PATHWAYS, LEVELS } from "./course-options";

export async function createCourse(formData: FormData) {
  const { dbUser } = await requireTeacher();

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() || null;
  const pathwayRaw = formData.get("pathway") as string | null;
  const levelRaw = formData.get("level") as string | null;

  if (title.length < 3) {
    redirect("/instructor/new?error=title");
  }

  const pathway = PATHWAYS.includes(pathwayRaw as (typeof PATHWAYS)[number])
    ? pathwayRaw
    : null;
  const level = LEVELS.includes(levelRaw as (typeof LEVELS)[number])
    ? levelRaw
    : null;

  const course = await prisma.course.create({
    data: {
      title: title.slice(0, 120),
      description: description?.slice(0, 500) ?? null,
      pathway,
      level,
      teacherID: dbUser.userID,
    },
  });

  revalidatePath("/instructor");
  revalidatePath("/dashboard");
  redirect(`/instructor/${course.courseID}`);
}

export async function toggleCourseStatus(formData: FormData) {
  const { dbUser } = await requireTeacher();

  const courseID = Number(formData.get("courseId"));
  if (!Number.isInteger(courseID)) redirect("/instructor");

  const course = await prisma.course.findUnique({ where: { courseID } });
  if (!course || course.teacherID !== dbUser.userID) redirect("/instructor");

  await prisma.course.update({
    where: { courseID },
    data: { status: course.status === "DRAFT" ? "PUBLISHED" : "DRAFT" },
  });

  revalidatePath("/instructor");
  revalidatePath(`/instructor/${courseID}`);
  revalidatePath("/dashboard");
}
