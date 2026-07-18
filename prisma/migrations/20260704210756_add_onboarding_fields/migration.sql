-- AlterTable
ALTER TABLE "User" ADD COLUMN     "goal" TEXT,
ADD COLUMN     "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startingTrack" TEXT,
ADD COLUMN     "streakGoal" INTEGER;
