import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/utils/db";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkID: user.id },
    select: { userID: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { lessonId, durationPct } = (body ?? {}) as {
    lessonId?: unknown;
    durationPct?: unknown;
  };

  if (typeof lessonId !== "string" || lessonId.length === 0) {
    return NextResponse.json({ error: "lessonId required" }, { status: 400 });
  }
  if (typeof durationPct !== "number" || !Number.isFinite(durationPct)) {
    return NextResponse.json(
      { error: "durationPct must be a number" },
      { status: 400 }
    );
  }

  const incomingPct = Math.max(0, Math.min(100, Math.round(durationPct)));

  const existing = await prisma.lessonProgress.findUnique({
    where: {
      userID_lessonID: { userID: dbUser.userID, lessonID: lessonId },
    },
    select: { durationPct: true },
  });

  if (existing) {
    if (incomingPct > existing.durationPct) {
      await prisma.lessonProgress.update({
        where: {
          userID_lessonID: { userID: dbUser.userID, lessonID: lessonId },
        },
        data: { durationPct: incomingPct },
      });
    }
  } else {
    await prisma.lessonProgress.create({
      data: {
        userID: dbUser.userID,
        lessonID: lessonId,
        durationPct: incomingPct,
      },
    });
  }

  const done = incomingPct >= 90;
  return NextResponse.json({ ok: true, done, durationPct: incomingPct });
}
