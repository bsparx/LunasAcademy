"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  User,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Flame,
  Medal,
  Users,
  PencilRuler,
  GraduationCap,
  MessagesSquare,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/courses", label: "Courses", icon: GraduationCap },
  { href: "/review", label: "Review", icon: Flame },
  { href: "/community", label: "Community", icon: Users },
  { href: "/discussion", label: "General Discussion", icon: MessagesSquare },
  { href: "/instructor", label: "Instructor", icon: PencilRuler },
  { href: "/progress", label: "Progress", icon: Medal },
  { href: "/profile", label: "Profile", icon: User },
];

const COLLAPSE_KEY = "luna.sidebar.collapsed";

function DeerLogo() {
  return (
    <svg viewBox="0 0 40 40" width={32} height={32} aria-hidden="true">
      <ellipse cx="20" cy="22" rx="11" ry="13" fill="#f1d9b6" />
      <ellipse cx="20" cy="13" rx="9" ry="8" fill="#f1d9b6" />
      <path
        d="M14 8 q -2 -4 -4 -2"
        stroke="#7a4a2a"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M26 8 q 2 -4 4 -2"
        stroke="#7a4a2a"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="16" cy="13" r="1.2" fill="#3a2418" />
      <circle cx="24" cy="13" r="1.2" fill="#3a2418" />
    </svg>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: NavItem & { active: boolean; collapsed: boolean }) {
  const link = (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center rounded-lg text-[14px] font-medium transition-all duration-150",
        collapsed ? "h-11 w-11 justify-center" : "items-center gap-3 px-3 py-2.5",
        active
          ? "bg-[var(--color-mint-500)]/15 text-white shadow-[inset_0_0_0_1px_rgba(52,194,119,0.25)]"
          : "text-white/70 hover:bg-white/[0.06] hover:text-white"
      )}
    >
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--color-mint-400)]" />
      )}
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active
            ? "text-[var(--color-mint-400)]"
            : "text-white/70 group-hover:text-white"
        )}
      />
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right" sideOffset={12}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function BottomButton({
  href,
  onClick,
  label,
  icon: Icon,
  collapsed,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed: boolean;
}) {
  const className = cn(
    "group flex w-full items-center rounded-lg text-[14px] font-medium text-white/70 hover:bg-white/[0.06] hover:text-white transition-all cursor-pointer",
    collapsed ? "h-11 w-11 justify-center" : "items-center gap-3 px-3 py-2.5"
  );

  const inner = (
    <>
      <Icon className="h-[18px] w-[18px] shrink-0 text-white/70 group-hover:text-white transition-colors" />
      {!collapsed && <span>{label}</span>}
    </>
  );

  const button = href ? (
    <Link href={href} aria-label={label} className={className}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} className={className}>
      {inner}
    </button>
  );

  if (!collapsed) return button;

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="right" sideOffset={12}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === "true";
  } catch {
    return false;
  }
}

export function Sidebar({ isTeacher = false }: { isTeacher?: boolean }) {
  const pathname = usePathname();
  const navItems = isTeacher
    ? NAV
    : NAV.filter((item) => item.href !== "/instructor");
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(readCollapsed());
    setHydrated(true);
  }, []);

  function toggle() {
    if (!hydrated) return;
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-black/30 bg-[var(--color-forest-900)] transition-[width] duration-200 ease-out shadow-[2px_0_20px_rgba(0,0,0,0.15)]",
        collapsed ? "w-[76px] py-5" : "w-[248px] py-6"
      )}
    >
      {/* BRAND + COLLAPSE TOGGLE */}
      <div className="flex items-center px-3" style={{ height: "44px" }}>
        {collapsed ? (
          <div className="flex w-full justify-center">
            <Link
              href="/"
              aria-label="Luna's Academy home"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white/15"
            >
              <DeerLogo />
            </Link>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between pr-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <DeerLogo />
              </div>
              <div className="leading-tight">
                <div className="text-[15px] font-semibold tracking-tight text-white">
                  Luna&apos;s Academy
                </div>
                <div className="mt-0.5 text-[10px] font-semibold tracking-[0.18em] text-white/60 uppercase">
                  By NTDI
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* COLLAPSE / EXPAND BUTTON */}
      <div
        className={cn(
          "flex w-full items-center",
          collapsed ? "justify-center px-3 mt-3" : "justify-end px-4 mt-2"
        )}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className={cn(
            "group flex h-8 w-8 items-center justify-center rounded-lg text-white/60 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 hover:text-white transition-colors cursor-pointer",
            !hydrated && "invisible"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* NAV */}
      <nav
        className={cn(
          "mt-6 flex flex-col gap-1",
          collapsed ? "items-center px-2" : "px-3"
        )}
      >
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-[0.2em] text-white/50 uppercase">
            Menu
          </div>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            active={
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(item.href) ?? false
            }
          />
        ))}
      </nav>

      {/* BOTTOM */}
      <div
        className={cn(
          "mt-auto flex flex-col gap-1 pt-4 border-t border-white/10",
          collapsed ? "items-center px-2" : "px-3"
        )}
      >
        <BottomButton
          href="/settings"
          label="Settings"
          icon={Settings}
          collapsed={collapsed}
        />
        <SignOutButton>
          <BottomButton
            label="Sign out"
            icon={LogOut}
            collapsed={collapsed}
          />
        </SignOutButton>
      </div>
    </aside>
  );
}