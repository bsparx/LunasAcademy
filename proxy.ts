import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

// Every localhost app shares one browser cookie jar, and stale Clerk dev
// cookies left by OTHER projects (suffixed with their publishable-key hash)
// send this app's Clerk handshake into an endless location.reload() loop.
// In dev we expire any Clerk cookie whose suffix isn't ours, which breaks
// the loop after a single reload. Signs you out of other localhost apps.
const FOREIGN_CLERK_COOKIE =
  /^(?:__client_uat|__session|__clerk_db_jwt|__refresh)_([A-Za-z0-9_-]{8})$/;

let suffixPromise: Promise<string> | null = null;
function ourCookieSuffix(): Promise<string> {
  suffixPromise ??= (async () => {
    const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!pk) return "";
    // Clerk's suffix: base64url(sha1(publishableKey)).slice(0, 8)
    const digest = await crypto.subtle.digest(
      "SHA-1",
      new TextEncoder().encode(pk)
    );
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .slice(0, 8);
  })();
  return suffixPromise;
}

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  if (process.env.NODE_ENV !== "development") return;
  const suffix = await ourCookieSuffix();
  if (!suffix) return;

  const foreign = request.cookies.getAll().filter((cookie) => {
    const match = FOREIGN_CLERK_COOKIE.exec(cookie.name);
    return match !== null && match[1] !== suffix;
  });
  if (foreign.length === 0) return;

  const response = NextResponse.next();
  const expired = `Path=/; Expires=${new Date(0).toUTCString()}; Max-Age=0`;
  for (const { name } of foreign) {
    // Host-only variant and Domain= variant — whichever way it was set.
    response.headers.append("Set-Cookie", `${name}=; ${expired}`);
    response.headers.append(
      "Set-Cookie",
      `${name}=; Domain=${request.nextUrl.hostname}; ${expired}`
    );
  }
  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
