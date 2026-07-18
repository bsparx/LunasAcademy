import { notFound } from "next/navigation";
import coursesData from "../_data/courses.json";
import { CourseDetailClient } from "./_components/course-detail-client";

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

const courses = coursesData as unknown as Record<string, CourseDetail>;

export function getCourse(id: string): CourseDetail | null {
  return courses[id] ?? null;
}

export function generateStaticParams() {
  return Object.keys(courses).map((id) => ({ id }));
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = getCourse(id);
  if (!course) notFound();

  return <CourseDetailClient course={course} />;
}
