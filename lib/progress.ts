export async function markLessonProgress(lessonId: string, durationPct: number) {
  try {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lessonId, durationPct: Math.floor(durationPct) }),
      keepalive: true,
    });
  } catch (err) {
    console.error("Failed to record progress", err);
  }
}
