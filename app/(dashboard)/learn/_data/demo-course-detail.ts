import coursesData from "@/app/(dashboard)/courses/_data/courses.json";

// Static demo content that still powers the sample learn flow
// (lesson player, capstone). Real courses live in the database.

type LessonType = "video" | "reading" | "practice" | "mastery";

export type Lesson = {
  id: string;
  slug: string;
  type: LessonType;
  title: string;
  meta: string;
  hlsPublicId?: string;
  posterPublicId?: string;
  transcript?: { time: number; text: string }[];
};

export type Module = {
  id: string;
  slug: string;
  title: string;
  done?: boolean;
  lessons: Lesson[];
};

export type CourseDetail = {
  id: string;
  slug: string;
  pathway: string;
  title: string;
  subtitle: string;
  rating: number;
  ratingCount: number;
  enrolled: number;
  language: string;
  price: number;
  duration: string;
  lessons: number;
  level: string;
  software: string[];
  modules: Module[];
  capstone: { title: string; tag: string };
  includes: string[];
};

export const demoCourses = coursesData as unknown as Record<
  string,
  CourseDetail
>;

export function getDemoCourse(id: string): CourseDetail | null {
  return demoCourses[id] ?? null;
}
