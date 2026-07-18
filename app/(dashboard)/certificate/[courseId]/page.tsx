import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getCertificate } from "@/app/learn/_data/progress-content";
import { CertificateClient } from "./_components/certificate-client";

export function generateStaticParams() {
  return [
    { courseId: "rock-cycle" },
    { courseId: "geophysics-intro" },
    { courseId: "materials" },
  ];
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { courseId } = await params;
  const certificate = getCertificate(courseId);
  if (!certificate) notFound();

  return <CertificateClient certificate={certificate} />;
}
