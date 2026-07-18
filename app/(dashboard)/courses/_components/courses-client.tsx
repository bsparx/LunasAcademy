"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  Lock,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TrackId = "all" | "core" | "geologist" | "geophysicist" | "metallurgist" | "mining";

type SpecialistTrack = {
  id: Exclude<TrackId, "all" | "core">;
  name: string;
  detail: string;
  count: number;
  bannerFrom: string;
  bannerTo: string;
  swatch: string;
  border: string;
  text: string;
  chipText: string;
  chipBorder: string;
  chipBg: string;
};

type CoreCourse = {
  id: string;
  title: string;
  track: "core";
  rating: number;
  ratingCount: number;
  lessons: number;
  hours: number;
  price: number;
};

const SPECIALIST_TRACKS: SpecialistTrack[] = [
  {
    id: "geologist",
    name: "Geologist",
    detail: "5 courses · Structural, Mineralogy, Petrology…",
    count: 5,
    bannerFrom: "#3b5bcc",
    bannerTo: "#5b7bd6",
    swatch: "#5b7bd6",
    border: "border-[#5b7bd6]/30",
    text: "text-[#3b5bcc]",
    chipText: "text-[#3b5bcc]",
    chipBorder: "border-[#5b7bd6]/40",
    chipBg: "bg-[#d8e3f4]/50",
  },
  {
    id: "mining",
    name: "Mining Engineer",
    detail: "5 courses · incl. Surpac / MineSight",
    count: 5,
    bannerFrom: "#1f7a87",
    bannerTo: "#3fb0bd",
    swatch: "#3fb0bd",
    border: "border-[#3fb0bd]/30",
    text: "text-[#1f7a87]",
    chipText: "text-[#1f7a87]",
    chipBorder: "border-[#3fb0bd]/40",
    chipBg: "bg-[#d2eef0]/50",
  },
  {
    id: "geophysicist",
    name: "Geophysicist",
    detail: "5 courses · Seismic, Gravity, Magnetics…",
    count: 5,
    bannerFrom: "#6b4fcf",
    bannerTo: "#8b6fd1",
    swatch: "#8b6fd1",
    border: "border-[#8b6fd1]/30",
    text: "text-[#6b4fcf]",
    chipText: "text-[#6b4fcf]",
    chipBorder: "border-[#8b6fd1]/40",
    chipBg: "bg-[#e0d9f0]/50",
  },
  {
    id: "metallurgist",
    name: "Metallurgist",
    detail: "5 courses · Pyromet, Hydromet, Electromet…",
    count: 5,
    bannerFrom: "#b08240",
    bannerTo: "#c9a063",
    swatch: "#c9a063",
    border: "border-[#c9a063]/30",
    text: "text-[#8a5f25]",
    chipText: "text-[#8a5f25]",
    chipBorder: "border-[#c9a063]/40",
    chipBg: "bg-[#f0e6d2]/50",
  },
];

const CORE_COURSES: CoreCourse[] = [
  { id: "rock-cycle", title: "The Rock Cycle — Geology", track: "core", rating: 4.8, ratingCount: 1240, lessons: 8, hours: 4, price: 1500 },
  { id: "geophysics-intro", title: "Introduction to Geophysics", track: "core", rating: 4.7, ratingCount: 980, lessons: 8, hours: 5, price: 1500 },
  { id: "materials", title: "Materials — Metallurgy", track: "core", rating: 4.9, ratingCount: 1560, lessons: 8, hours: 5, price: 1500 },
];

const FILTERS: { id: TrackId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "core", label: "Core" },
  { id: "geologist", label: "Geologist" },
  { id: "geophysicist", label: "Geophysicist" },
  { id: "metallurgist", label: "Metallurgist" },
  { id: "mining", label: "Mining" },
];

function CourseThumb() {
  return (
    <div className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-tint-green)]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(52,194,119,0.25) 0 2px, transparent 2px 12px)",
        }}
      />
    </div>
  );
}

function SpecialistCard({ track }: { track: SpecialistTrack }) {
  return (
    <Link
      href="#"
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_2px_8px_rgba(15,40,30,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,40,30,0.1)]",
        track.border
      )}
    >
      {/* Banner */}
      <div
        className="relative h-32 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, ${track.bannerFrom} 0%, ${track.bannerTo} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0, transparent 50%)",
          }}
        />
        <div className="absolute left-4 bottom-3 inline-flex items-center rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-[0.2em] text-white uppercase backdrop-blur-sm">
          Specialist
        </div>
        <div className="absolute right-4 bottom-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
          <Lock className="h-3.5 w-3.5 text-white" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn("text-[17px] font-semibold tracking-tight", track.text)}>
            {track.name}
          </h3>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink-500)]">
          {track.detail}
        </p>
        <div className="mt-auto pt-4 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-700)]">
          <Lock className="h-3.5 w-3.5 text-[var(--color-ink-500)]" />
          Complete Core to unlock
        </div>
      </div>
    </Link>
  );
}

function CourseRow({ course }: { course: CoreCourse }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex items-center gap-5 rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-4 shadow-[0_1px_2px_rgba(15,40,30,0.04)] transition-all duration-200 hover:border-[var(--color-ink-300)] hover:shadow-[0_6px_20px_rgba(15,40,30,0.06)] hover:-translate-y-0.5"
    >
      <CourseThumb />
      <div className="min-w-0 flex-1">
        <h3 className="text-[16px] font-semibold tracking-tight text-[var(--color-ink-900)] group-hover:text-[var(--color-forest-900)] transition-colors truncate">
          {course.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-3 text-[13px] text-[var(--color-ink-500)]">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-[var(--color-ink-700)]">{course.rating}</span>
            <span className="text-[var(--color-ink-400)]">
              ({(course.ratingCount / 1000).toFixed(1)}k)
            </span>
          </span>
          <span className="h-1 w-1 rounded-full bg-[var(--color-ink-300)]" />
          <span>{course.lessons} lessons</span>
          <span className="h-1 w-1 rounded-full bg-[var(--color-ink-300)]" />
          <span>{course.hours}h</span>
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <div className="text-[12px] font-medium text-[var(--color-ink-400)] uppercase tracking-wider">
          Rs
        </div>
        <div className="text-[20px] font-semibold tracking-tight tabular-nums text-[var(--color-mint-600)]">
          {course.price.toLocaleString()}
        </div>
      </div>
    </Link>
  );
}

function FilterChip({
  filter,
  active,
  onClick,
}: {
  filter: { id: TrackId; label: string };
  active: boolean;
  onClick: () => void;
}) {
  if (filter.id === "all") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "rounded-full border px-4 py-1.5 text-[14px] font-medium transition-all duration-150 cursor-pointer",
          active
            ? "border-[var(--color-forest-900)] bg-[var(--color-forest-900)] text-white shadow-[0_2px_8px_rgba(10,31,26,0.2)]"
            : "border-[var(--color-ink-200)] bg-white text-[var(--color-ink-700)] hover:border-[var(--color-ink-300)]"
        )}
      >
        {filter.label}
      </button>
    );
  }
  if (filter.id === "core") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "rounded-full border px-4 py-1.5 text-[14px] font-medium transition-all duration-150 cursor-pointer",
          active
            ? "border-[var(--color-mint-500)] bg-[var(--color-mint-500)]/15 text-[var(--color-mint-600)]"
            : "border-[var(--color-tint-green)] bg-[var(--color-tint-green)]/30 text-[var(--color-mint-600)] hover:bg-[var(--color-tint-green)]/50"
        )}
      >
        {filter.label}
      </button>
    );
  }
  const track = SPECIALIST_TRACKS.find((t) => t.id === filter.id);
  if (!track) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-[14px] font-medium transition-all duration-150 cursor-pointer",
        active
          ? `${track.chipBorder} ${track.chipBg} ${track.chipText}`
          : `${track.chipBorder} bg-white ${track.chipText} hover:${track.chipBg}`
      )}
    >
      {filter.label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-px w-6 bg-[var(--color-mint-500)]" />
      <span className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-mint-600)] uppercase">
        {children}
      </span>
    </div>
  );
}

export function CoursesClient() {
  const [active, setActive] = useState<TrackId>("all");
  const [query, setQuery] = useState("");

  const filteredCoreCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CORE_COURSES.filter((c) => {
      const matchesQuery = !q || c.title.toLowerCase().includes(q);
      return matchesQuery;
    });
  }, [query]);

  const filteredSpecialists = useMemo(() => {
    if (active === "all") return SPECIALIST_TRACKS.slice(0, 2);
    if (active === "core") return [];
    return SPECIALIST_TRACKS.filter((t) => t.id === active);
  }, [active]);

  return (
    <div className="flex min-h-screen flex-1 bg-[var(--cream-50)]">
      <div className="flex-1 min-w-0">
        <div className="mx-auto max-w-6xl px-10 py-10 space-y-10">
          {/* HEADER */}
          <header>
            <h1 className="text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
              Browse Courses
            </h1>
            <p className="mt-1.5 text-[15px] text-[var(--color-ink-500)]">
              {CORE_COURSES.length + SPECIALIST_TRACKS.reduce((s, t) => s + t.count, 0)} courses across the Core Pathway and {SPECIALIST_TRACKS.length} specialist tracks.
            </p>
          </header>

          {/* SEARCH + FILTERS */}
          <section className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-400)] pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, software, topics…"
                className="h-12 rounded-xl border-[var(--color-ink-200)] bg-white pl-11 pr-4 text-[14px] shadow-[0_1px_2px_rgba(15,40,30,0.03)] focus-visible:border-[var(--color-forest-900)] focus-visible:ring-3 focus-visible:ring-[var(--color-forest-900)]/15"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => (
                <FilterChip
                  key={f.id}
                  filter={f}
                  active={active === f.id}
                  onClick={() => setActive(f.id)}
                />
              ))}
            </div>
          </section>

          {/* SPECIALIST TRACKS */}
          {filteredSpecialists.length > 0 && (
            <section>
              <div className="mb-5">
                <SectionLabel>Specialist tracks · Curated paths</SectionLabel>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {filteredSpecialists.map((t) => (
                  <SpecialistCard key={t.id} track={t} />
                ))}
              </div>
            </section>
          )}

          {/* CORE PATHWAY COURSES */}
          {(active === "all" || active === "core") && (
            <section>
              <div className="mb-5 flex items-center justify-between">
                <SectionLabel>Core Pathway courses</SectionLabel>
                <span className="text-[13px] text-[var(--color-ink-500)]">
                  {filteredCoreCourses.length} of {CORE_COURSES.length}
                </span>
              </div>

              {filteredCoreCourses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--color-ink-200)] bg-white/50 p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-cream-100)]">
                    <Sparkles className="h-5 w-5 text-[var(--color-ink-400)]" />
                  </div>
                  <div className="mt-3 text-[15px] font-medium text-[var(--color-ink-700)]">
                    No courses match your search
                  </div>
                  <div className="mt-1 text-[13px] text-[var(--color-ink-500)]">
                    Try a different keyword or clear the filter.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCoreCourses.map((c) => (
                    <CourseRow key={c.id} course={c} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* FOOTER NOTE */}
          <section className="pt-4">
            <div className="rounded-2xl border border-[var(--color-ink-200)]/60 bg-white p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-tint-green)]">
                <GraduationCap className="h-5 w-5 text-[var(--color-mint-600)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                  Need help choosing?
                </div>
                <div className="text-[13px] text-[var(--color-ink-500)]">
                  Luna can recommend a track based on your goals.
                </div>
              </div>
              <Link
                href="#"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-lg border border-[var(--color-ink-200)] bg-white px-4 text-[13px] font-medium text-[var(--color-ink-900)] hover:bg-[var(--color-cream-100)]"
                )}
              >
                Ask Luna
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}