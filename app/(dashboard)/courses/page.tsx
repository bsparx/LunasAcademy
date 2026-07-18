import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "../dashboard/_components/sidebar";
import { CoursesClient } from "./_components/courses-client";

export default async function CoursesPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex min-h-screen bg-[var(--cream-50)]">
      <Sidebar />
      <CoursesClient />
    </div>
  );
}
