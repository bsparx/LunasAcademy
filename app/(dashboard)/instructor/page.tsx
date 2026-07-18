import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getAllInstructorCourses } from "@/app/learn/_data/instructor-content";
import { InstructorHomeClient } from "./_components/instructor-home";

export default async function InstructorPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return <InstructorHomeClient courses={getAllInstructorCourses()} />;
}
