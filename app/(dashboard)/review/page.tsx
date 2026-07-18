import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getReviewCards } from "@/app/(dashboard)/learn/_data/learning-content";
import { ReviewApp } from "./_components/review-app";

export default async function ReviewPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const cards = getReviewCards();

  return <ReviewApp cards={cards} />;
}
