import { Megaphone, CircleHelp, Lightbulb, PartyPopper, PlayCircle } from "lucide-react";
import type { PostCategory } from "@prisma/client";

/** Visual identity of each post category (used by list, detail, and form). */
export const CATEGORY_META: Record<
  PostCategory,
  {
    label: string;
    icon: typeof Megaphone;
    chip: string; // chip colors
    dot: string; // solid accent
  }
> = {
  ANNOUNCEMENT: {
    label: "Announcement",
    icon: Megaphone,
    chip: "bg-[#c2871e]/12 text-[#8a5f25]",
    dot: "bg-[#c2871e]",
  },
  QUESTION: {
    label: "Question",
    icon: CircleHelp,
    chip: "bg-[#3b5bcc]/10 text-[#3b5bcc]",
    dot: "bg-[#3b5bcc]",
  },
  ADVICE: {
    label: "Advice",
    icon: Lightbulb,
    chip: "bg-[var(--color-tint-green)] text-[var(--color-mint-600)]",
    dot: "bg-[var(--color-mint-500)]",
  },
  GENERAL: {
    label: "General",
    icon: PartyPopper,
    chip: "bg-[#8b6fd1]/12 text-[#8b6fd1]",
    dot: "bg-[#8b6fd1]",
  },
  LECTURE: {
    label: "Lecture",
    icon: PlayCircle,
    chip: "bg-[#0e9f8f]/12 text-[#0e9f8f]",
    dot: "bg-[#0e9f8f]",
  },
};

export function timeAgo(iso: string | Date): string {
  const then = typeof iso === "string" ? new Date(iso) : iso;
  const secs = Math.max(0, Math.floor((Date.now() - then.getTime()) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
