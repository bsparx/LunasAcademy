import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { MarkhorLogo } from "../mascot";

const navLinks = [
  { href: "#tracks", label: "Tracks" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[var(--color-ink-200)]/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a href="#" className="flex items-center gap-2.5 shrink-0">
          <MarkhorLogo />
          <div className="leading-tight">
            <div className="font-display text-[15px] font-bold tracking-tight text-[var(--color-ink-900)]">
              Luna&apos;s Academy
            </div>
            <div className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-ink-500)] uppercase mt-0.5">
              By NTDI
            </div>
          </div>
        </a>

        <nav className="hidden md:flex items-center text-[14px] text-[var(--color-ink-700)]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 rounded-md hover:bg-[var(--color-cream-100)] hover:text-[var(--color-ink-900)] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                className="hidden sm:inline-flex px-3.5 py-2 text-[14px] font-medium text-[var(--color-ink-700)] hover:text-[var(--color-ink-900)] rounded-md transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-[var(--color-forest-900)] px-4 py-2 text-[14px] font-medium text-white shadow-sm hover:bg-[var(--color-forest-800)] hover:shadow-md transition-all cursor-pointer"
              >
                Get started
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <div className="ml-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
