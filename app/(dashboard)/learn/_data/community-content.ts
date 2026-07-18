import communityData from "./community-content.json";

export type ResourceTier = "Common" | "Silver" | "Gold" | "Diamond";
export type ResourceType = "slides" | "pdf" | "dataset" | "software" | "image" | "reading" | "link";

export type Resource = {
  id: string;
  tier: ResourceTier;
  type: ResourceType;
  title: string;
  size: string;
  uploader: string;
  context: string | null;
  moduleId: string;
  moduleTitle: string;
  sharedBy: string | null;
};

export type ResourcesForCourse = {
  courseId: string;
  courseTitle: string;
  resources: Resource[];
};

export type ThreadType = "Question" | "Software" | "StudyGroup" | "Resource";
export type ThreadStatus = "solved" | "needs-answer" | "open";

export type ForumAnswer = {
  authorName: string;
  authorHandle: string;
  isMentor: boolean;
  body: string;
  upvotes: number;
  answeredAgo: string;
};

export type ForumThread = {
  id: string;
  type: ThreadType;
  status: ThreadStatus;
  title: string;
  authorName: string;
  authorHandle: string;
  replies: number;
  upvotes: number;
  askedAgo: string;
  body: string | null;
  answer: ForumAnswer | null;
};

export type ForumForCourse = {
  courseId: string;
  courseTitle: string;
  threads: ForumThread[];
};

export type RoleState = "done" | "current" | "locked";

export type CommunityRole = {
  id: number;
  name: string;
  minRep: number;
  state: RoleState;
};

export type WayToEarn = {
  id: string;
  label: string;
  meta: string | null;
  rep: string;
};

export type ActivityKind = "answer" | "best" | "review";

export type GlobalActivity = {
  kind: ActivityKind;
  courseId: string;
  courseTitle: string;
  text: string;
  rep: number;
  ago: string;
};

export type PerCourseActivity = {
  text: string;
  rep: number;
  ago: string;
};

export type UnansweredThread = {
  courseId: string;
  threadId: string;
  title: string;
  upvotes: number;
  askedAgo: string;
};

export type SparklineLevel = 0 | 1 | 2 | 3 | 4 | "today";

export type GlobalCommunity = {
  user: {
    name: string;
    karma: number;
    weeklyKarma: number;
    rank: string;
  };
  sparkline: {
    days: number;
    cells: { day: number; level: SparklineLevel }[];
  };
  topCourses: {
    courseId: string;
    courseTitle: string;
    rep: number;
    weeklyRep: number;
    role: string;
  }[];
  unanswered: UnansweredThread[];
  recentActivity: GlobalActivity[];
};

export type PerCourseCommunity = {
  courseId: string;
  courseTitle: string;
  reputation: number;
  repToNext: number;
  nextRole: string;
  unlocks: string;
  roles: CommunityRole[];
  ways: WayToEarn[];
  recentActivity: PerCourseActivity[];
  instructorNote: string;
};

const data = communityData as {
  resources: Record<string, ResourcesForCourse>;
  forum: Record<string, ForumForCourse>;
  global: GlobalCommunity;
  perCourse: Record<string, PerCourseCommunity>;
};

export function getResources(courseId: string): ResourcesForCourse | undefined {
  return data.resources[courseId];
}

export function getForum(courseId: string): ForumForCourse | undefined {
  return data.forum[courseId];
}

export function getGlobalCommunity(): GlobalCommunity {
  return data.global;
}

export function getCourseCommunity(courseId: string): PerCourseCommunity | undefined {
  return data.perCourse[courseId];
}

export function getAllCourseCommunities(): PerCourseCommunity[] {
  return Object.values(data.perCourse);
}

/** Group resources by moduleId in declaration order. */
export function groupResourcesByModule(
  resources: Resource[]
): { moduleId: string; moduleTitle: string; items: Resource[] }[] {
  const seen = new Map<string, { moduleId: string; moduleTitle: string; items: Resource[] }>();
  for (const r of resources) {
    if (!seen.has(r.moduleId)) {
      seen.set(r.moduleId, { moduleId: r.moduleId, moduleTitle: r.moduleTitle, items: [] });
    }
    seen.get(r.moduleId)!.items.push(r);
  }
  return Array.from(seen.values());
}

/** Compute role-ladder progress for the line between roles[i] and roles[i+1]. */
export function ladderProgress(
  roles: CommunityRole[],
  reputation: number
): { fromDone: boolean; pct: number }[] {
  const out: { fromDone: boolean; pct: number }[] = [];
  for (let i = 0; i < roles.length - 1; i++) {
    const from = roles[i];
    const to = roles[i + 1];
    if (reputation < from.minRep) {
      out.push({ fromDone: false, pct: 0 });
      continue;
    }
    if (reputation >= to.minRep) {
      out.push({ fromDone: true, pct: 100 });
      continue;
    }
    const span = to.minRep - from.minRep;
    const into = reputation - from.minRep;
    out.push({ fromDone: true, pct: Math.max(0, Math.min(100, (into / span) * 100)) });
  }
  return out;
}

/** Per-course accent color used by the specimen strip and Hub cards. */
export function courseAccent(courseId: string): {
  strip: string;
  badge: string;
  ring: string;
} {
  switch (courseId) {
    case "rock-cycle":
      return {
        strip: "bg-[#0d3327]",
        badge: "bg-[#0d3327]/10 text-[#0d3327]",
        ring: "ring-[#0d3327]/20",
      };
    case "geophysics-intro":
      return {
        strip: "bg-[#2a4a86]",
        badge: "bg-[#2a4a86]/10 text-[#2a4a86]",
        ring: "ring-[#2a4a86]/20",
      };
    case "materials":
      return {
        strip: "bg-[#8a5f25]",
        badge: "bg-[#8a5f25]/10 text-[#8a5f25]",
        ring: "ring-[#8a5f25]/20",
      };
    default:
      return {
        strip: "bg-[var(--color-mint-500)]",
        badge: "bg-[var(--color-mint-500)]/10 text-[var(--color-mint-600)]",
        ring: "ring-[var(--color-mint-500)]/20",
      };
  }
}
