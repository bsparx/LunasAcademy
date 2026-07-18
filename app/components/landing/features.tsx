import {
  Flame,
  MessagesSquare,
  Play,
  RefreshCw,
  Target,
  Trophy,
} from "lucide-react";
import { SectionLabel } from "./icons";
import { ScrollReveal } from "./scroll-reveal";

// Deterministic pseudo-random fills for the decorative streak grid
const streakCells = Array.from({ length: 28 }, (_, i) => (i * 7) % 9 < 5);

function VideoMock() {
  return (
    <div
      className="mt-6 rounded-xl border border-[var(--color-ink-200)]/70 bg-[var(--color-forest-900)] p-3 shadow-inner"
      aria-hidden="true"
    >
      <div className="flex items-center gap-1.5 pb-2.5">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
      </div>
      <div className="relative flex h-28 items-center justify-center rounded-lg bg-[var(--color-forest-800)] bg-dots-dark">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-mint-500)] shadow-lg shadow-[var(--color-mint-500)]/30">
          <Play className="h-4.5 w-4.5 translate-x-px text-white" fill="currentColor" />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 px-1 pb-1">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
          <span className="block h-full w-2/3 rounded-full bg-[var(--color-mint-400)]" />
        </span>
        <span className="text-[10px] font-medium text-white/50">12:40</span>
      </div>
    </div>
  );
}

function StreakMock() {
  return (
    <div className="mt-6 grid grid-cols-7 gap-1.5 max-w-[180px]" aria-hidden="true">
      {streakCells.map((filled, i) => (
        <span
          key={i}
          className={`h-4 w-4 rounded-[5px] ${
            filled
              ? "bg-[var(--color-mint-500)]"
              : "bg-[var(--color-ink-100)]"
          }`}
        />
      ))}
    </div>
  );
}

const cells = [
  {
    icon: Play,
    title: "Expert-led video courses",
    body: "24 courses taught by industry professionals — watch, pause, and rewatch at your own pace.",
    wide: true,
    mock: <VideoMock />,
  },
  {
    icon: Target,
    title: "Practice & mastery checks",
    body: "Quizzes after every lesson, and a mastery check before you move on — so nothing is left shaky.",
  },
  {
    icon: RefreshCw,
    title: "Spaced-repetition review",
    body: "Luna resurfaces what you're about to forget, right before you forget it.",
  },
  {
    icon: Flame,
    title: "Streaks & badges",
    body: "Show up daily and watch the streak grow. Earn badges for every milestone on the climb.",
    mock: <StreakMock />,
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    body: "Compete with learners across Pakistan — friendly pressure that keeps you moving.",
  },
  {
    icon: MessagesSquare,
    title: "Course communities",
    body: "Every course has its own forum. Ask, answer, and never climb alone.",
    full: true,
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative bg-white border-y border-[var(--color-ink-200)]/60 bg-grid-faint"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-24">
        <ScrollReveal>
          <div className="max-w-2xl">
            <SectionLabel>The toolkit</SectionLabel>
            <h2 className="mt-4 font-display text-[32px] md:text-[40px] leading-[1.1] font-bold tracking-[-0.02em] text-[var(--color-ink-900)] text-balance">
              Everything you need for the climb.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-[var(--color-ink-500)] max-w-xl">
              Not just videos — a full learning system built to get you to the
              summit and keep you there.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {cells.map((cell, i) => (
            <ScrollReveal
              key={cell.title}
              delay={i * 60}
              className={
                cell.full ? "md:col-span-3" : cell.wide ? "md:col-span-2" : undefined
              }
            >
              <div
                className={`h-full rounded-2xl bg-white border border-[var(--color-ink-200)]/70 shadow-[0_1px_2px_rgba(15,40,30,0.04)] hover:shadow-lg hover:shadow-[var(--color-forest-900)]/5 hover:border-[var(--color-ink-300)] hover:-translate-y-1 transition-all duration-200 ${
                  cell.full
                    ? "flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-6 md:px-7"
                    : "flex flex-col p-6 md:p-7"
                }`}
              >
                <div className="h-11 w-11 shrink-0 rounded-lg bg-[var(--color-tint-green)] flex items-center justify-center">
                  <cell.icon className="h-5 w-5 text-[var(--color-mint-600)]" />
                </div>
                <div>
                  <div
                    className={`text-[17px] font-semibold text-[var(--color-ink-900)] tracking-tight ${
                      cell.full ? "" : "mt-5"
                    }`}
                  >
                    {cell.title}
                  </div>
                  <p className="mt-1.5 text-[14px] leading-[1.65] text-[var(--color-ink-500)]">
                    {cell.body}
                  </p>
                </div>
                {cell.mock}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
