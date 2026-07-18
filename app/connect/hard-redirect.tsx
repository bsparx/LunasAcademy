"use client";

import { useEffect } from "react";

// Clerk lands here via a client-side (soft) navigation after sign-in/sign-up,
// not a full page load. Next's router sometimes fails to apply a server
// redirect() reached that way — it fetches the destination's RSC payload but
// never commits the navigation, leaving the user stuck on this blank page.
// A real browser navigation sidesteps that entirely.
export function HardRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return null;
}
