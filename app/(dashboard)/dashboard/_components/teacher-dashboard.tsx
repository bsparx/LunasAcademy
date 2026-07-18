import Link from "next/link";
import {
  Flame,
  Sparkles,
  BookOpen,
  Users,
  Plus,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TeacherCourse = {
  courseID: number;
  title: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: Date;
  enrolledCount: number;
};

type Props = {
  name: string;
  streak: number;
  xp: number;
  courses: TeacherCourse[];
};

export function TeacherDashboard({ name, streak, xp, courses }: Props) {
  const published = courses.filter((c) => c.status === "PUBLISHED").length;
  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledCount, 0);

  return (
    <div className="mx-auto max-w-6xl px-10 py-10 space-y-10">
      {/* HEADER */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
            Instructor studio
          </div>
          <h1 className="mt-2 text-[36px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
            Welcome back, {name}
          </h1>
          <p className="mt-2.5 text-[15px] text-[var(--color-ink-500)]">
            {courses.length === 0
              ? "Your studio is ready — build your first course and open it to learners."
              : `${published} published · ${courses.length - published} in draft · ${totalStudents.toLocaleString()} learners enrolled.`}
          </p>
        </div>
        <Link
          href="/instructor/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-forest-900)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(10,31,26,0.15)] hover:bg-[var(--color-forest-800)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create course
        </Link>
      </header>

      {/* STATS */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          value={String(streak)}
          label="Day streak"
        />
        <StatTile
          icon={<Sparkles className="h-4 w-4 text-[var(--color-mint-600)]" />}
          value={xp.toLocaleString()}
          label="XP earned"
        />
        <StatTile
          icon={<BookOpen className="h-4 w-4 text-[var(--color-ink-500)]" />}
          value={String(courses.length)}
          label="Courses"
        />
        <StatTile
          icon={<Users className="h-4 w-4 text-[var(--color-ink-500)]" />}
          value={totalStudents.toLocaleString()}
          label="Learners"
        />
      </section>

      {/* COURSES */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--color-ink-900)]">
            Your courses
          </h2>
          <Link
            href="/instructor"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--color-mint-600)] hover:text-[var(--color-mint-500)] transition-colors"
          >
            Open instructor studio
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--color-ink-300)] bg-white/60 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-tint-green)]">
              <BookOpen className="h-5 w-5 text-[var(--color-mint-600)]" />
            </div>
            <div className="mt-4 text-[16px] font-semibold text-[var(--color-ink-900)]">
              No courses yet
            </div>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-[var(--color-ink-500)]">
              Start with a name and a short description — you&apos;ll add
              modules and lessons right after.
            </p>
            <Link
              href="/instructor/new"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-mint-500)] px-4 py-2 text-[13px] font-semibold text-[var(--color-forest-950)] hover:bg-[var(--color-mint-400)] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create your first course
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {courses.map((c) => (
              <li key={c.courseID}>
                <Link
                  href={`/instructor/${c.courseID}`}
                  className="group flex items-center gap-5 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)] transition-all hover:shadow-[0_6px_18px_rgba(15,40,30,0.07)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          c.status === "DRAFT"
                            ? "bg-[var(--color-tint-tan)] text-[#8a5f25]"
                            : "bg-[var(--color-tint-green)] text-[var(--color-mint-600)]"
                        )}
                      >
                        {c.status.toLowerCase()}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[12px] text-[var(--color-ink-500)]">
                        <Users className="h-3 w-3" />
                        {c.enrolledCount.toLocaleString()} enrolled
                      </span>
                    </div>
                    <div className="mt-1.5 truncate text-[17px] font-semibold tracking-[-0.01em] text-[var(--color-ink-900)]">
                      {c.title}
                    </div>
                    {c.description ? (
                      <div className="mt-0.5 truncate text-[13px] text-[var(--color-ink-500)]">
                        {c.description}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-500)] group-hover:text-[var(--color-ink-900)] transition-colors">
                    <BarChart3 className="h-4 w-4" />
                    Manage
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,40,30,0.03)]">
      <div className="flex items-center gap-2">{icon}</div>
      <div className="mt-3 text-[26px] font-semibold tabular-nums tracking-[-0.01em] text-[var(--color-ink-900)]">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
        {label}
      </div>
    </div>
  );
}
