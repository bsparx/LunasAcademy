import { PlayCircle, FileText, Paperclip, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

/* Shared between the persistent course rail (rendered by the [courseId]
   layout) and the per-lesson shell. */

export type WatchKind = "VIDEO" | "LECTURE" | "FILE" | "EXAM";

export const KIND_LABEL: Record<WatchKind, string> = {
  VIDEO: "Video lesson",
  LECTURE: "Reading",
  FILE: "Resource",
  EXAM: "Graded exam",
};

export function KindIcon({
  kind,
  className,
}: {
  kind: WatchKind;
  className?: string;
}) {
  if (kind === "VIDEO")
    return (
      <PlayCircle className={cn("text-[var(--color-mint-600)]", className)} />
    );
  if (kind === "LECTURE")
    return <FileText className={cn("text-[#8b6fd1]", className)} />;
  if (kind === "EXAM")
    return <ClipboardList className={cn("text-[#3b5bcc]", className)} />;
  return <Paperclip className={cn("text-[#8a5f25]", className)} />;
}

export function formatDuration(seconds: number) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
