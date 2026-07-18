"use client";

import { useState } from "react";
import { BookOpen, Info, Star, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/* Tab shell for the course page. Panels arrive server-rendered as props and
   stay mounted — switching tabs only toggles visibility. */

type TabID = "curriculum" | "overview" | "instructor" | "reviews";

const TABS: { id: TabID; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "curriculum", label: "Curriculum", icon: BookOpen },
  { id: "overview", label: "Overview", icon: Info },
  { id: "instructor", label: "Instructor", icon: UserRound },
  { id: "reviews", label: "Reviews", icon: Star },
];

export function CourseTabs({
  curriculum,
  overview,
  instructor,
  reviews,
  reviewCount,
}: {
  curriculum: React.ReactNode;
  overview: React.ReactNode;
  instructor: React.ReactNode;
  reviews: React.ReactNode;
  reviewCount: number;
}) {
  const [active, setActive] = useState<TabID>("curriculum");
  const panels: Record<TabID, React.ReactNode> = {
    curriculum,
    overview,
    instructor,
    reviews,
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Course sections"
        className="flex flex-wrap gap-1 border-b border-[var(--color-ink-200)]/70"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(id)}
              className={cn(
                "relative -mb-px inline-flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-[13.5px] font-semibold transition-colors",
                isActive
                  ? "border-[var(--color-forest-900)] text-[var(--color-ink-900)]"
                  : "border-transparent text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive
                    ? "text-[var(--color-mint-600)]"
                    : "text-[var(--color-ink-400)]"
                )}
              />
              {label}
              {id === "reviews" && reviewCount > 0 ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums",
                    isActive
                      ? "bg-[var(--color-forest-900)] text-white"
                      : "bg-[var(--color-ink-100)] text-[var(--color-ink-500)]"
                  )}
                >
                  {reviewCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {TABS.map(({ id }) => (
        <div key={id} role="tabpanel" hidden={id !== active} className="pt-6">
          {panels[id]}
        </div>
      ))}
    </div>
  );
}
