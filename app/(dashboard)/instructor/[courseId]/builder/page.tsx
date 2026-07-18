import { notFound } from "next/navigation";
import { prisma } from "@/app/utils/db";
import { requireTeacher } from "@/app/utils/auth";
import { destroyCloudinaryAsset } from "@/lib/cloudinary-admin";
import { BuilderClient } from "./_components/builder-client";

const STALE_UPLOAD_MS = 24 * 60 * 60 * 1000;

/** Best-effort cleanup of uploads abandoned without saving (browser closed, etc.). */
async function sweepStaleUploads(ownerID: number) {
  try {
    const stale = await prisma.pendingUpload.findMany({
      where: {
        ownerID,
        createdAt: { lt: new Date(Date.now() - STALE_UPLOAD_MS) },
      },
      select: { uploadID: true, publicID: true, resourceType: true },
    });
    for (const upload of stale) {
      const destroyed = await destroyCloudinaryAsset(
        upload.publicID,
        upload.resourceType
      );
      if (destroyed.ok) {
        await prisma.pendingUpload.delete({
          where: { uploadID: upload.uploadID },
        });
      }
    }
  } catch {
    // Never block the builder over cleanup.
  }
}

export default async function CourseBuilderPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { dbUser } = await requireTeacher();
  const { courseId } = await params;
  if (!/^\d+$/.test(courseId)) notFound();

  await sweepStaleUploads(dbUser.userID);

  const course = await prisma.course.findFirst({
    where: { courseID: Number(courseId), teacherID: dbUser.userID },
    include: {
      capstone: {
        select: {
          capstoneID: true,
          title: true,
          brief: true,
          deliverables: true,
          criteria: true,
          _count: { select: { submissions: true } },
          resources: {
            orderBy: { createdAt: "asc" },
            select: {
              resourceID: true,
              name: true,
              url: true,
              publicID: true,
              resourceType: true,
              bytes: true,
            },
          },
        },
      },
      topics: {
        orderBy: { position: "asc" },
        include: {
          modules: {
            orderBy: { position: "asc" },
            include: {
              items: {
                orderBy: { position: "asc" },
                include: {
                  resource: true,
                  exam: {
                    include: { questions: { orderBy: { position: "asc" } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const library = await prisma.resource.findMany({
    where: { ownerID: dbUser.userID, courseID: course.courseID },
    orderBy: { createdAt: "desc" },
    include: { checks: { orderBy: { timeSec: "asc" } } },
  });

  const initialChecks: Record<
    number,
    { checkID: number; timeSec: number; question: string; options: string[]; correctIndices: number[] }[]
  > = {};
  for (const r of library) {
    if (r.checks.length > 0) {
      initialChecks[r.resourceID] = r.checks.map((c) => ({
        checkID: c.checkID,
        timeSec: c.timeSec,
        question: c.question,
        options: c.options,
        correctIndices: c.correctIndices,
      }));
    }
  }

  return (
    <BuilderClient
      course={{
        courseID: course.courseID,
        title: course.title,
        status: course.status,
      }}
      initialTopics={course.topics.map((t) => ({
        topicID: t.topicID,
        title: t.title,
        modules: t.modules.map((m) => ({
          moduleID: m.moduleID,
          topicID: m.topicID,
          title: m.title,
          items: m.items.map((i) => ({
            itemID: i.itemID,
            title: i.title,
            resource: i.resource ? toResourceDTO(i.resource) : null,
            exam: i.exam
              ? {
                  examID: i.exam.examID,
                  questions: i.exam.questions.map((q) => ({
                    questionID: q.questionID,
                    question: q.question,
                    options: q.options,
                    correctIndices: q.correctIndices,
                    imageURL: q.imageURL,
                    imagePublicID: q.imagePublicID,
                  })),
                }
              : null,
          })),
        })),
      }))}
      library={library.map(toResourceDTO)}
      initialChecks={initialChecks}
      initialCapstone={
        course.capstone
          ? {
              capstoneID: course.capstone.capstoneID,
              title: course.capstone.title,
              brief: course.capstone.brief,
              deliverables: course.capstone.deliverables,
              criteria: course.capstone.criteria,
              submissionCount: course.capstone._count.submissions,
              resources: course.capstone.resources,
            }
          : null
      }
      initialOverview={course.overview}
    />
  );
}

function toResourceDTO(r: {
  resourceID: number;
  kind: "VIDEO" | "LECTURE" | "FILE";
  title: string;
  url: string;
  publicID: string;
  format: string | null;
  bytes: number | null;
  duration: number | null;
}) {
  return {
    resourceID: r.resourceID,
    kind: r.kind,
    title: r.title,
    url: r.url,
    publicID: r.publicID,
    format: r.format,
    bytes: r.bytes,
    duration: r.duration,
  };
}
