export type AchievementBadge = {
  id: string;
  name: string;
  milestone: string;
  tier: "Common" | "Uncommon" | "Rare" | "Mythic";
  earned: boolean;
  earnedOn: string | null;
  description: string;
  icon: string;
};

// The 4 real, DB-driven achievement badges. Streak badges read off
// User.longestStreak (the high-water mark, so a lapsed streak still keeps
// its badge); lecture badges read off a straight ItemProgress count.
export function computeBadges(input: {
  longestStreak: number;
  lessonsCompleted: number;
}): AchievementBadge[] {
  const { longestStreak, lessonsCompleted } = input;
  return [
    {
      id: "high-fiver",
      name: "High Fiver",
      milestone: "5-Day Streak",
      tier: "Common",
      icon: "🖐️",
      description: "Kept a 5-day learning streak alive.",
      earned: longestStreak >= 5,
      earnedOn: null,
    },
    {
      id: "perfect-ten",
      name: "Perfect Ten",
      milestone: "10-Day Streak",
      tier: "Uncommon",
      icon: "🔟",
      description: "Kept a 10-day learning streak alive.",
      earned: longestStreak >= 10,
      earnedOn: null,
    },
    {
      id: "half-century-hero",
      name: "Half-Century Hero",
      milestone: "50 Lectures",
      tier: "Rare",
      icon: "📖",
      description: "Completed 50 lectures.",
      earned: lessonsCompleted >= 50,
      earnedOn: null,
    },
    {
      id: "century-club",
      name: "Century Club",
      milestone: "100 Lectures",
      tier: "Mythic",
      icon: "💯",
      description: "Completed 100 lectures.",
      earned: lessonsCompleted >= 100,
      earnedOn: null,
    },
  ];
}
