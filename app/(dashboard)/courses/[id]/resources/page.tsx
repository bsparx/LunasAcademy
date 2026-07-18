import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  FolderOpen,
  Lock,
  PlayCircle,
} from "lucide-react";
import { prisma } from "@/app/utils/db";
import { requireDbUser } from "@/app/utils/auth";
import { formatBytes } from "@/lib/cloudinary-upload";
import {
  KindIcon,
  formatDuration,
  type WatchKind,
} from "@/app/(dashboard)/learn/[courseId]/_components/watch-meta";
import { getCourseAccess } from "../course-access";

function resourceMeta(r: {
  kind: WatchKind;
  duration: number | null;
  format: string | null;
  bytes: number | null;
}): string {
  const parts: string[] = [];
  if (r.kind === "VIDEO" && r.duration) parts.push(formatDuration(r.duration));
  else if (r.kind === "LECTURE") parts.push("Reading");
  else if (r.format) parts.push(r.format.toUpperCase());
  if (r.bytes) parts.push(formatBytes(r.bytes));
  return parts.join(" · ") || "File";
}

export default async function CourseResourcesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const courseID = Number(id);

  const { dbUser } = await requireDbUser();
  const access = await getCourseAccess(courseID, dbUser.userID);
  if (!access) notFound();

  const backLink = (
    <Link
      href={`/courses/${courseID}`}
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-500)] transition-colors hover:text-[var(--color-ink-900)]"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to {access.title}
    </Link>
  );

  // Enrollment gate — resources are for enrolled students and the instructor.
  if (!access.allowed) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
        {backLink}
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-ink-300)] bg-white/60 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-tint-tan)]">
            <Lock className="h-5 w-5 text-[#8a5f25]" />
          </div>
          <div className="mt-4 text-[16px] font-semibold text-[var(--color-ink-900)]">
            Resources are for enrolled learners
          </div>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-[var(--color-ink-500)]">
            Enroll in the course (it&apos;s free) and every video, lecture, and
            file will be available here, organised by module.
          </p>
          <Link
            href={`/courses/${courseID}`}
            className="mt-5 inline-flex items-center rounded-lg bg-[var(--color-forest-900)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-forest-800)]"
          >
            Go to the course page
          </Link>
        </div>
      </div>
    );
  }

  const modules = await prisma.module.findMany({
    where: { topic: { courseID } },
    orderBy: { position: "asc" },
    select: {
      moduleID: true,
      title: true,
      items: {
        orderBy: { position: "asc" },
        where: { resourceID: { not: null } },
        select: {
          itemID: true,
          title: true,
          resource: {
            select: {
              kind: true,
              title: true,
              url: true,
              format: true,
              bytes: true,
              duration: true,
            },
          },
        },
      },
    },
  });
  const withResources = modules.filter((m) => m.items.length > 0);
  const total = withResources.reduce((sum, m) => sum + m.items.length, 0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      {backLink}

      <header className="mt-6">
        <div className="flex items-center gap-2.5">
          <span className="h-px w-6 bg-[var(--color-mint-500)]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-mint-600)]">
            Course resources
          </span>
        </div>
        <h1 className="mt-2.5 text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--color-ink-900)]">
          {access.title}
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-ink-500)]">
          {total === 0
            ? "No resources have been added to this course yet."
            : `${total} resource${total === 1 ? "" : "s"} across ${withResources.length} module${withResources.length === 1 ? "" : "s"} — open a file directly or jump into its lesson.`}
        </p>
      </header>

      {total === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-ink-300)] bg-white/60 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-tint-green)]">
            <FolderOpen className="h-5 w-5 text-[var(--color-mint-600)]" />
          </div>
          <p className="mx-auto mt-4 max-w-sm text-[13px] leading-relaxed text-[var(--color-ink-500)]">
            The instructor hasn&apos;t uploaded any videos, lectures, or files
            yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {withResources.map((mod, mi) => (
            <section
              key={mod.moduleID}
              className="overflow-hidden rounded-2xl border border-[var(--color-ink-200)]/60 bg-white shadow-[0_1px_2px_rgba(15,40,30,0.03)]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[var(--color-ink-200)]/50 bg-[var(--cream-50)]/60 px-5 py-3.5">
                <h2 className="text-[13px] font-bold text-[var(--color-ink-900)]">
                  <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-400)]">
                    Module {mi + 1}
                  </span>
                  {mod.title}
                </h2>
                <span className="text-[11.5px] font-semibold tabular-nums text-[var(--color-ink-400)]">
                  {mod.items.length} {mod.items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <ul className="divide-y divide-[var(--color-ink-200)]/40">
                {mod.items.map((item) => {
                  const r = item.resource!;
                  const kind = r.kind as WatchKind;
                  return (
                    <li
                      key={item.itemID}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--cream-50)]/50"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-ink-100)]/60">
                        <KindIcon kind={kind} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-[var(--color-ink-900)]">
                          {item.title ?? r.title}
                        </span>
                        <span className="block text-[11.5px] text-[var(--color-ink-500)]">
                          {resourceMeta({
                            kind,
                            duration: r.duration,
                            format: r.format,
                            bytes: r.bytes,
                          })}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <Link
                          href={`/learn/${courseID}/${item.itemID}`}
                          title="Open in the course player"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-ink-200)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--color-ink-700)] transition-colors hover:bg-[var(--cream-50)]"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                          Lesson
                        </Link>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          title="Open the file"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-ink-200)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--color-ink-700)] transition-colors hover:bg-[var(--cream-50)]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          File
                        </a>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
