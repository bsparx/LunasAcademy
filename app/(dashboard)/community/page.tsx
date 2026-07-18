import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getGlobalCommunity } from "@/app/learn/_data/community-content";
import { CommunityHub } from "./_components/community-hub";

export default async function CommunityPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return <CommunityHub data={getGlobalCommunity()} />;
}
