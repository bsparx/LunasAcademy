"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { saveOnboarding, skipOnboarding } from "./actions";

type Goal = "job-ready" | "specialize" | "explore" | "certificates";
type Track =
  | "core"
  | "geologist"
  | "geophysicist"
  | "mining"
  | "metallurgist"
  | "unsure";
type Streak = 1 | 3 | 5 | 7;

type Props = {
  initialGoal: string | null;
  initialTrack: string | null;
  initialStreak: number | null;
  name: string;
};

const GOALS: {
  id: Goal;
  title: string;
  detail: string;
}[] = [
  {
    id: "job-ready",
    title: "Become job-ready",
    detail: "Land your first role in the mineral sector.",
  },
  {
    id: "specialize",
    title: "Specialize deeper",
    detail: "Build on what I already know with advanced topics.",
  },
  {
    id: "explore",
    title: "Explore the field",
    detail: "See whether geology or mining is right for me.",
  },
  {
    id: "certificates",
    title: "Earn certificates",
    detail: "Stack credentials I can show on my CV.",
  },
];

const TRACKS: {
  id: Track;
  title: string;
  detail: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: "core",
    title: "Core Pathway",
    detail: "7 foundation courses",
    iconBg: "#d9f0e3",
    iconColor: "#2fbf6f",
  },
  {
    id: "geologist",
    title: "Geologist",
    detail: "5 specialist courses",
    iconBg: "#d8e3f4",
    iconColor: "#5b7bd6",
  },
  {
    id: "geophysicist",
    title: "Geophysicist",
    detail: "5 specialist courses",
    iconBg: "#e0d9f0",
    iconColor: "#8b6fd1",
  },
  {
    id: "mining",
    title: "Mining Engineer",
    detail: "5 specialist courses",
    iconBg: "#d2eef0",
    iconColor: "#3fb0bd",
  },
  {
    id: "metallurgist",
    title: "Metallurgist",
    detail: "5 specialist courses",
    iconBg: "#f0e6d2",
    iconColor: "#c9a063",
  },
  {
    id: "unsure",
    title: "Let Luna suggest",
    detail: "I'll decide after the Core Pathway",
    iconBg: "#e8ecea",
    iconColor: "#7a8a85",
  },
];

const STREAKS: { days: Streak; title: string; detail: string; tag: string }[] =
  [
    { days: 1, title: "1 day / week", detail: "Casual pace", tag: "Casual" },
    { days: 3, title: "3 days / week", detail: "Steady habit", tag: "Steady" },
    { days: 5, title: "5 days / week", detail: "Serious learner", tag: "Serious" },
    { days: 7, title: "7 days / week", detail: "All in", tag: "All in" },
  ];

const STEP_META = [
  { subtitle: "this personalizes your home" },
  { subtitle: "your starting point" },
  { subtitle: "Luna will keep you honest" },
] as const;

function DiamondIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M12 2 L22 12 L12 22 L2 12 Z" fill={color} />
    </svg>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
            i <= step ? "bg-[var(--color-mint-500)]" : "bg-[var(--color-ink-200)]"
          }`}
        />
      ))}
    </div>
  );
}

function MascotSmall() {
  return (
    <svg
      viewBox="0 0 200 220"
      width={64}
      height={70}
      aria-hidden="true"
      className="shrink-0"
    >
      <g fill="#7a4a2a">
        <path d="M78 28 C 72 18, 64 14, 60 22 C 58 26, 62 30, 66 30 C 70 30, 74 26, 78 28 Z" />
        <path d="M122 28 C 128 18, 136 14, 140 22 C 142 26, 138 30, 134 30 C 130 30, 126 26, 122 28 Z" />
        <path
          d="M70 24 C 64 16, 56 14, 54 22"
          stroke="#7a4a2a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M130 24 C 136 16, 144 14, 146 22"
          stroke="#7a4a2a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <ellipse cx="100" cy="60" rx="42" ry="38" fill="#f5d8a8" />
      <ellipse
        cx="62"
        cy="48"
        rx="8"
        ry="11"
        fill="#e6c79a"
        transform="rotate(-25 62 48)"
      />
      <ellipse
        cx="138"
        cy="48"
        rx="8"
        ry="11"
        fill="#e6c79a"
        transform="rotate(25 138 48)"
      />
      <path
        d="M78 64 q 6 4 12 0"
        stroke="#3a2418"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M110 64 q 6 4 12 0"
        stroke="#3a2418"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="76" cy="74" r="4" fill="#f4a8a0" opacity="0.6" />
      <circle cx="124" cy="74" r="4" fill="#f4a8a0" opacity="0.6" />
      <ellipse cx="100" cy="150" rx="48" ry="55" fill="#f5d8a8" />
      <ellipse cx="100" cy="170" rx="36" ry="28" fill="#ead0a8" opacity="0.5" />
      <rect x="76" y="195" width="10" height="18" rx="4" fill="#e6c79a" />
      <rect x="114" y="195" width="10" height="18" rx="4" fill="#e6c79a" />
      <g fill="#f5d35a">
        <path d="M170 40 l 2 6 l 6 2 l -6 2 l -2 6 l -2 -6 l -6 -2 l 6 -2 z" />
      </g>
    </svg>
  );
}

function OptionCard({
  selected,
  onSelect,
  title,
  detail,
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  detail?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex items-start gap-3 text-left rounded-2xl p-4 transition-all duration-150 cursor-pointer ${
        selected
          ? "bg-white border-2 border-[var(--color-mint-500)] shadow-[0_4px_12px_rgba(52,194,119,0.12)]"
          : "bg-white border border-[var(--color-ink-200)]/70 hover:border-[var(--color-ink-300)] hover:shadow-sm"
      }`}
    >
      {icon ? <div className="shrink-0 mt-0.5">{icon}</div> : null}
      <div className="flex-1 min-w-0">
        <div
          className={`text-[15px] font-semibold tracking-tight ${
            selected
              ? "text-[var(--color-ink-900)]"
              : "text-[var(--color-ink-900)]"
          }`}
        >
          {title}
        </div>
        {detail ? (
          <div className="mt-1 text-[13px] text-[var(--color-ink-500)] leading-relaxed">
            {detail}
          </div>
        ) : null}
      </div>
    </button>
  );
}

export function OnboardingFlow({ initialGoal, initialTrack, initialStreak, name }: Props) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(
    (initialGoal as Goal | null) ?? null
  );
  const [track, setTrack] = useState<Track | null>(
    (initialTrack as Track | null) ?? null
  );
  const [streak, setStreak] = useState<Streak | null>(
    (initialStreak as Streak | null) ?? null
  );
  const [pending, startTransition] = useTransition();

  const cta = useMemo(() => {
    if (step === 0) return "Continue → pick a starting track";
    if (step === 1) return "Continue → set your streak";
    return "Start learning →";
  }, [step]);

  const canContinue = useMemo(() => {
    if (step === 0) return !!goal;
    if (step === 1) return !!track;
    return !!streak;
  }, [step, goal, track, streak]);

  const bottomHint = useMemo(() => {
    if (step === 0) {
      return (
        <>
          Next you&apos;ll start with the{" "}
          <span className="font-semibold text-[var(--color-mint-600)]">
            Core Pathway
          </span>{" "}
          (specialist tracks unlock after). Then Luna sets a realistic streak
          goal with you.
        </>
      );
    }
    if (step === 1) {
      return (
        <>
          You&apos;ll begin with the{" "}
          <span className="font-semibold text-[var(--color-mint-600)]">
            Core Pathway
          </span>{" "}
          — specialist tracks unlock after. Then Luna sets a streak goal with
          you.
        </>
      );
    }
    return (
      <>
        Luna uses this to send you smart reminders. You can change it anytime
        in settings.
      </>
    );
  }, [step]);

  function handleNext() {
    if (!canContinue) return;
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    const fd = new FormData();
    if (goal) fd.set("goal", goal);
    if (track) fd.set("startingTrack", track);
    if (streak) fd.set("streakGoal", String(streak));
    startTransition(() => {
      void saveOnboarding(fd);
    });
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function handleSkip() {
    startTransition(() => {
      void skipOnboarding();
    });
  }

  return (
    <div className="min-h-screen bg-[var(--cream-50)] flex flex-col">
      <header className="bg-white border-b border-[var(--color-ink-200)]/60">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <svg viewBox="0 0 40 40" width={32} height={32} aria-hidden="true">
              <ellipse cx="20" cy="22" rx="11" ry="13" fill="#f1d9b6" />
              <ellipse cx="20" cy="13" rx="9" ry="8" fill="#f1d9b6" />
              <path
                d="M14 8 q -2 -4 -4 -2"
                stroke="#7a4a2a"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M26 8 q 2 -4 4 -2"
                stroke="#7a4a2a"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="16" cy="13" r="1.2" fill="#3a2418" />
              <circle cx="24" cy="13" r="1.2" fill="#3a2418" />
            </svg>
            <div className="leading-tight">
              <div className="text-[14px] font-semibold tracking-tight text-[var(--color-ink-900)]">
                Welcome, {name}
              </div>
              <div className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-ink-500)] uppercase mt-0.5">
                Let&apos;s set things up
              </div>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-[520px]">
          <div className="rounded-3xl bg-white border border-[var(--color-ink-200)]/60 shadow-[0_2px_4px_rgba(15,40,30,0.04)] p-6 sm:p-8">
            <StepIndicator step={step} />

            <div className="mt-7 flex items-start gap-4">
              <MascotSmall />
              <div className="flex-1 min-w-0">
                <h1 className="text-[24px] sm:text-[28px] leading-[1.15] font-semibold tracking-[-0.02em] text-[var(--color-ink-900)] text-balance">
                  {step === 0
                    ? "What brings you to Luna's Academy?"
                    : step === 1
                    ? "Which path interests you most?"
                    : "How often can you learn?"}
                </h1>
                <p className="mt-1.5 text-[13px] text-[var(--color-ink-500)]">
                  Step {step + 1} of 3 · {STEP_META[step].subtitle}
                </p>
              </div>
            </div>

            <div className="mt-7">
              {step === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOALS.map((g) => (
                    <OptionCard
                      key={g.id}
                      selected={goal === g.id}
                      onSelect={() => setGoal(g.id)}
                      title={g.title}
                      detail={g.detail}
                    />
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TRACKS.map((t) => (
                    <OptionCard
                      key={t.id}
                      selected={track === t.id}
                      onSelect={() => setTrack(t.id)}
                      title={t.title}
                      detail={t.detail}
                      icon={
                        <div
                          className="h-9 w-9 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: t.iconBg }}
                        >
                          <DiamondIcon color={t.iconColor} />
                        </div>
                      }
                    />
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STREAKS.map((s) => (
                    <OptionCard
                      key={s.days}
                      selected={streak === s.days}
                      onSelect={() => setStreak(s.days)}
                      title={s.title}
                      detail={s.detail}
                      icon={
                        <div className="h-9 w-9 rounded-lg bg-[var(--color-tint-green)] flex items-center justify-center">
                          <span className="text-[13px] font-semibold text-[var(--color-mint-600)]">
                            {s.days}×
                          </span>
                        </div>
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue || pending}
              className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-forest-900)] px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(10,31,26,0.15)] hover:bg-[var(--color-forest-800)] hover:shadow-[0_4px_16px_rgba(10,31,26,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-forest-900)] transition-all cursor-pointer"
            >
              {pending ? "Saving..." : cta}
            </button>

            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0}
                className="text-[13px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] disabled:opacity-0 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSkip}
                disabled={pending}
                className="text-[13px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] transition-colors cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-[13px] text-[var(--color-ink-500)] leading-relaxed max-w-md mx-auto">
            {bottomHint}
          </p>
        </div>
      </main>
    </div>
  );
}
