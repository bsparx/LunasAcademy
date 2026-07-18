import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { clerkAppearance, clerkLocalization } from "./lib/clerk-theme";
import { cn } from "@/lib/utils";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luna's Academy — National Talent Development Initiative",
  description:
    "Free, self-paced courses that turn students across Pakistan into job-ready professionals for the mineral sector.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        "font-sans",
        bricolage.variable
      )}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--cream-50)] text-[var(--ink-900)]">
        <ClerkProvider
          appearance={clerkAppearance}
          localization={clerkLocalization}
        >
          <TooltipProvider delay={150}>{children}</TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
