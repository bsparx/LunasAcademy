"use client";

import { useRef, useState } from "react";
import MuxPlayer, {
  type MuxPlayerCSSProperties,
  type MuxPlayerRefAttributes,
} from "@mux/mux-player-react";
import { markLessonProgress } from "@/lib/progress";
import {
  publicHlsUrl,
  publicPosterUrl,
  muxPlaybackIdFrom,
  DEMO_MUX_PLAYBACK_ID,
  DEMO_POSTER_URL,
} from "@/lib/cloudinary";
import type { KnowledgeCheck } from "@/app/learn/_data/learning-content";
import { KnowledgeCheckOverlay } from "./knowledge-check-overlay";

type Props = {
  lessonId: string;
  hlsPublicId?: string;
  posterPublicId?: string;
  knowledgeCheck?: KnowledgeCheck;
};

const THRESHOLD_PCT = 90;
const REPLAY_BACK_SECONDS = 30;

export function LessonPlayer({ lessonId, hlsPublicId, posterPublicId, knowledgeCheck }: Props) {
  const [markedPct, setMarkedPct] = useState<number | null>(null);
  const [hasFired, setHasFired] = useState(false);
  const [checkActive, setCheckActive] = useState(false);
  const playerRef = useRef<MuxPlayerRefAttributes | null>(null);

  const rawHls = hlsPublicId ? publicHlsUrl(hlsPublicId) : undefined;
  const playbackId =
    muxPlaybackIdFrom(hlsPublicId) ?? DEMO_MUX_PLAYBACK_ID;
  const rawPoster = posterPublicId ? publicPosterUrl(posterPublicId) : undefined;
  const poster = rawPoster ?? DEMO_POSTER_URL;

  function tryMark(pct: number) {
    if (pct < THRESHOLD_PCT) return;
    if (hasFired) return;
    setHasFired(true);
    setMarkedPct(pct);
    void markLessonProgress(lessonId, pct);
  }

  function manualMark() {
    setHasFired(true);
    setMarkedPct(100);
    void markLessonProgress(lessonId, 100);
  }

  function maybeTriggerCheck(currentTime: number) {
    if (!knowledgeCheck) return;
    if (checkActive) return;
    if (currentTime >= knowledgeCheck.triggerAt) {
      const el = playerRef.current;
      if (el) el.pause();
      setCheckActive(true);
    }
  }

  function resumeFromReplay() {
    const el = playerRef.current;
    if (el && knowledgeCheck) {
      el.currentTime = Math.max(0, knowledgeCheck.triggerAt - REPLAY_BACK_SECONDS);
      void el.play();
    }
    setCheckActive(false);
  }

  function resumeKeepWatching() {
    const el = playerRef.current;
    if (el) void el.play();
    setCheckActive(false);
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full overflow-hidden rounded-2xl bg-[var(--color-forest-900)] shadow-[0_12px_32px_rgba(0,0,0,0.25)] ring-1 ring-white/5">
        <MuxPlayer
          ref={playerRef}
          streamType="on-demand"
          playbackId={playbackId}
          poster={poster}
          accentColor="#34c277"
          primaryColor="#ffffff"
          secondaryColor="#0d3327"
          metadata={{
            video_title: lessonId,
            viewer_user_id: lessonId,
          }}
          onTimeUpdate={(event) => {
            const target = event.currentTarget as HTMLVideoElement;
            const duration = target.duration;
            if (!Number.isFinite(duration) || duration <= 0) return;
            const pct = (target.currentTime / duration) * 100;
            tryMark(pct);
            maybeTriggerCheck(target.currentTime);
          }}
          onEnded={() => tryMark(100)}
          style={{
            width: "100%",
            aspectRatio: "16/9",
            "--media-control-background": "transparent",
            "--media-control-hover-background": "rgba(255,255,255,0.1)",
          } as MuxPlayerCSSProperties}
        />
        {checkActive && knowledgeCheck && (
          <KnowledgeCheckOverlay
            check={knowledgeCheck}
            onResume={resumeFromReplay}
            onClose={resumeKeepWatching}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {markedPct !== null ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-mint-500)]/15 px-3 py-1 text-[12px] font-semibold text-[var(--color-mint-600)] ring-1 ring-[var(--color-mint-500)]/30">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-mint-500)]" />
            Marked complete at {Math.round(markedPct)}%
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-cream-100)] px-3 py-1 text-[12px] font-medium text-[var(--color-ink-500)] ring-1 ring-[var(--color-ink-200)]">
            Watch 90% to mark complete
          </span>
        )}

        {!rawHls && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-tint-tan)]/50 px-3 py-1 text-[12px] font-medium text-[var(--color-ink-700)] ring-1 ring-[var(--color-tint-tan)]">
            Demo HLS stream
          </span>
        )}

        <button
          type="button"
          onClick={manualMark}
          disabled={hasFired}
          className="ml-auto inline-flex items-center rounded-md border border-[var(--color-ink-200)] bg-white px-3 py-1 text-[12px] font-medium text-[var(--color-ink-700)] hover:bg-[var(--color-cream-100)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Mark complete (demo)
        </button>
      </div>
    </div>
  );
}
