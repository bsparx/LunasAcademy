import { MarkhorLogo } from "../mascot";

const columns = [
  {
    heading: "Learn",
    links: [
      { label: "Tracks", href: "#tracks" },
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Leaderboard", href: "#" },
      { label: "Course forums", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-[var(--color-forest-950)] text-white/55">
      {/* Mountain silhouette divider flowing out of the CTA section */}
      <svg
        className="block w-full h-10 md:h-14 text-[var(--color-forest-900)]"
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 0 L 1440 0 L 1440 8 L 1200 40 L 960 16 L 720 48 L 480 20 L 240 44 L 0 12 Z"
          fill="currentColor"
        />
      </svg>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <MarkhorLogo size={32} />
              <span className="font-display text-[15px] font-bold tracking-tight text-white/90">
                Luna&apos;s Academy
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-[1.7] max-w-xs">
              Free training for Pakistan&apos;s mineral sector. A National
              Talent Development Initiative program.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <div className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase">
                {col.heading}
              </div>
              <ul className="mt-4 space-y-2.5 text-[13px]">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px]">
          <span>
            © {new Date().getFullYear()}{" "}Luna&apos;s Academy · National
            Talent Development Initiative
          </span>
          <span className="inline-flex items-center gap-1.5">
            Built for Pakistan
            <span aria-hidden="true">🇵🇰</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
