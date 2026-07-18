import progressData from "./progress-content.json";

export type ActivityLevel = 0 | 1 | 2 | 3 | 4 | "today";

export type Badge = {
  id: string;
  name: string;
  mineral: string;
  tier: "Common" | "Uncommon" | "Rare" | "Mythic";
  earned: boolean;
  earnedOn: string | null;
  description: string;
  icon: string;
};

export type LeaderboardRow = {
  rank: number;
  name: string;
  handle: string;
  xp: number;
  isYou: boolean;
};

export type Certificate = {
  courseId: string;
  courseTitle: string;
  badge: string;
  issuedOn: string;
  issuedTo: string;
  signatory: { name: string; role: string };
  id: string;
  nextCourse: { courseId: string; title: string } | null;
};

export type Graduate = {
  headline: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  confettiPalette: string[];
};

const data = progressData as {
  summary: {
    streakDays: number;
    xp: number;
    badgesEarned: number;
    weeklyGoalDone: number;
    weeklyGoalTotal: number;
    level: string;
  };
  activityGrid: {
    weeks: number;
    daysPerWeek: number;
    today: { weekIndex: number; dayIndex: number };
    cells: { week: number; day: number; level: ActivityLevel }[];
  };
  badges: Badge[];
  leaderboard: {
    scope: string;
    you: LeaderboardRow;
    rows: LeaderboardRow[];
  };
  certificates: Record<string, Certificate>;
  graduate: Graduate;
};

export function getProgressSummary() {
  return data.summary;
}

export function getActivityGrid() {
  return data.activityGrid;
}

export function getBadges(): Badge[] {
  return data.badges;
}

export function getLeaderboard() {
  return data.leaderboard;
}

export function getCertificate(courseId: string): Certificate | undefined {
  return data.certificates[courseId];
}

export function getAllCertificates(): Certificate[] {
  return Object.values(data.certificates);
}

export function getGraduate(): Graduate {
  return data.graduate;
}
