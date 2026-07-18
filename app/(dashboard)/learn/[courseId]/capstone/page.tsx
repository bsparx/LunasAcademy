import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { GraduationCap } from "lucide-react";
import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { demoCourses as courses } from "@/app/(dashboard)/learn/_data/demo-course-detail";
import { getCapstone } from "@/app/(dashboard)/learn/_data/learning-content";
import { CapstonePanel } from "@/app/(dashboard)/courses/[id]/_components/capstone-panel";
import { CapstoneClient } from "./_components/capstone-client";

export default async function CapstonePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  // Real courses: the DB-backed capstone inside the course watch chrome.
  if (/^\d+$/.test(courseId)) {
    const courseID = Number(courseId);
    const { dbUser } = await requireDbUser();

    const course = await prisma.course.findUnique({
      where: { courseID },
      select: {
        courseID: true,
        status: true,
        teacherID: true,
        capstone: {
          select: {
            capstoneID: true,
            title: true,
            brief: true,
            deliverables: true,
            criteria: true,
            resources: {
              orderBy: { createdAt: "asc" },
              select: { name: true, url: true, bytes: true },
            },
          },
        },
        enrollments: {
          where: { userID: dbUser.userID },
          select: { enrollmentID: true },
        },
      },
    });
    if (!course) notFound();

    if (!course.capstone) {
      return (
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:px-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c2871e]/15">
            <GraduationCap className="h-6 w-6 text-[#c2871e]" />
          </div>
          <h1 className="mt-4 text-[20px] font-semibold text-[var(--color-ink-900)]">
            No capstone project yet
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-[var(--color-ink-500)]">
            This course doesn&apos;t have a capstone project. Head back to the
            lessons to keep learning.
          </p>
          <Link
            href={`/courses/${course.courseID}`}
            className="mt-5 inline-flex items-center rounded-lg bg-[var(--color-forest-900)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-forest-800)]"
          >
            Back to the course
          </Link>
        </div>
      );
    }

    const submission = await prisma.capstoneSubmission.findUnique({
      where: {
        capstoneID_userID: {
          capstoneID: course.capstone.capstoneID,
          userID: dbUser.userID,
        },
      },
      select: {
        submittedAt: true,
        status: true,
        feedback: true,
        files: { select: { name: true, url: true, bytes: true } },
      },
    });

    const enrolled = course.enrollments.length > 0;
    const isOwner = course.teacherID === dbUser.userID;

    return (
      <div className="mx-auto max-w-4xl px-6 pb-12 md:px-10">
        <CapstonePanel
          courseID={course.courseID}
          capstone={{
            title: course.capstone.title,
            brief: course.capstone.brief,
            deliverables: course.capstone.deliverables,
            criteria: course.capstone.criteria,
            resources: course.capstone.resources,
          }}
          submission={
            submission
              ? {
                  submittedAt: submission.submittedAt.toISOString(),
                  status: submission.status,
                  feedback: submission.feedback,
                  files: submission.files,
                }
              : null
          }
          canSubmit={enrolled && !isOwner && course.status === "PUBLISHED"}
        />
      </div>
    );
  }

  // Demo (non-numeric) courses keep the sample capstone experience.
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const course = courses[courseId];
  if (!course) notFound();

  const capstone = getCapstone(courseId);
  if (!capstone) notFound();

  return (
    <CapstoneClient
      courseId={course.id}
      courseTitle={course.title}
      pathway={course.pathway}
      capstone={capstone}
    />
  );
}
