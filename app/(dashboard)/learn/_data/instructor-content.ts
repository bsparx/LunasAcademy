import instructorData from "./instructor-content.json";

export type BlockType =
  | "video"
  | "reading"
  | "knowledge-check"
  | "practice-set"
  | "mastery"
  | "discussion"
  | "resource"
  | "capstone";

export type CourseStatus = "draft" | "published";

export type Block = {
  id: string;
  type: BlockType;
  title: string;
  durationMin?: number;
  questionCount?: number;
  required?: boolean;
};

export type ModuleBlock = {
  id: string;
  title: string;
  blocks: Block[];
};

export type FunnelPoint = {
  lesson: number;
  completion: number;
};

export type NeedsAttention = {
  kind: "questions" | "capstones";
  count: number;
  label: string;
  action: string;
};

export type DropWarning = {
  lesson: number;
  fromPct: number;
  toPct: number;
  deltaPct: number;
  advice: string;
};

export type CourseAnalytics = {
  enrolled: number;
  completion: number;
  rating: number;
  ratingCount: number;
  funnel: FunnelPoint[];
  needsAttention: NeedsAttention[];
  dropWarning: DropWarning;
};

export type InstructorCourse = {
  id: string;
  title: string;
  pathway: string;
  status: CourseStatus;
  duration: string;
  lessonCount: number;
  modules: ModuleBlock[];
  analytics: CourseAnalytics;
};

const data = instructorData as {
  courses: Record<string, InstructorCourse>;
};

export function getInstructorCourse(
  courseId: string
): InstructorCourse | undefined {
  return data.courses[courseId];
}

export function getAllInstructorCourses(): InstructorCourse[] {
  return Object.values(data.courses);
}

export const BLOCK_LIBRARY: {
  type: BlockType;
  label: string;
  description: string;
}[] = [
  { type: "video", label: "Video", description: "A Mux video lecture" },
  { type: "reading", label: "Reading", description: "A reading lesson with notes" },
  {
    type: "knowledge-check",
    label: "Knowledge check",
    description: "Inline question that pauses the video",
  },
  {
    type: "practice-set",
    label: "Practice set",
    description: "A set of practice questions, no grade",
  },
  {
    type: "mastery",
    label: "Mastery check",
    description: "Graded gate that unlocks the next module",
  },
  {
    type: "discussion",
    label: "Discussion",
    description: "A pinned forum thread for this module",
  },
  { type: "resource", label: "Resource", description: "A file from the library" },
  { type: "capstone", label: "Capstone", description: "End-of-track project" },
];

export function blockMeta(type: BlockType): {
  label: string;
  description: string;
} {
  const found = BLOCK_LIBRARY.find((b) => b.type === type);
  return found ?? { label: type, description: "" };
}

export function blockAccent(type: BlockType): {
  surface: string;
  text: string;
  iconBg: string;
  iconColor: string;
} {
  switch (type) {
    case "video":
      return {
        surface: "bg-[var(--color-tint-tan)]",
        text: "text-[#8a5f25]",
        iconBg: "bg-white/60",
        iconColor: "text-[#8a5f25]",
      };
    case "reading":
      return {
        surface: "bg-[var(--color-cream-100)]",
        text: "text-[var(--color-ink-700)]",
        iconBg: "bg-white/60",
        iconColor: "text-[var(--color-ink-700)]",
      };
    case "knowledge-check":
      return {
        surface: "bg-[var(--color-tint-blue)]",
        text: "text-[#2a4a86]",
        iconBg: "bg-white/60",
        iconColor: "text-[#2a4a86]",
      };
    case "practice-set":
      return {
        surface: "bg-[var(--color-tint-green)]",
        text: "text-[var(--color-mint-600)]",
        iconBg: "bg-white/60",
        iconColor: "text-[var(--color-mint-600)]",
      };
    case "mastery":
      return {
        surface: "bg-[var(--color-tint-purple)]",
        text: "text-[#5a3aa0]",
        iconBg: "bg-white/60",
        iconColor: "text-[#5a3aa0]",
      };
    case "discussion":
      return {
        surface: "bg-[var(--color-tint-cyan)]",
        text: "text-[#1f6e75]",
        iconBg: "bg-white/60",
        iconColor: "text-[#1f6e75]",
      };
    case "resource":
      return {
        surface: "bg-[var(--color-cream-50)]",
        text: "text-[var(--color-ink-700)]",
        iconBg: "bg-white/60",
        iconColor: "text-[var(--color-ink-500)]",
      };
    case "capstone":
      return {
        surface: "bg-[#f0d8a8]",
        text: "text-[#8a5f25]",
        iconBg: "bg-white/60",
        iconColor: "text-[#8a5f25]",
      };
  }
}
