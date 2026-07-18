type MascotProps = {
  size?: number;
  className?: string;
};

export function Mascot({ size = 200, className = "" }: MascotProps) {
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size * 1.1}
      className={className}
      role="img"
      aria-label="Luna the markhor mascot"
    >
      {/* Spiral horns */}
      <g>
        <path
          d="M76 34 C 58 28, 48 16, 52 3 C 53 1, 55 1, 57 3 C 66 12, 80 22, 90 29 C 92 31, 90 33, 86 34 Z"
          fill="#7a4a2a"
        />
        <path
          d="M124 34 C 142 28, 152 16, 148 3 C 147 1, 145 1, 143 3 C 134 12, 120 22, 110 29 C 108 31, 110 33, 114 34 Z"
          fill="#7a4a2a"
        />
        {/* Ridge lines that read as the spiral twist */}
        <g
          stroke="#935c36"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        >
          <path d="M64 27 q 6 -6 12 -2" />
          <path d="M58 19 q 5 -6 10 -2" />
          <path d="M54 11 q 4 -5 8 -2" />
          <path d="M136 27 q -6 -6 -12 -2" />
          <path d="M142 19 q -5 -6 -10 -2" />
          <path d="M146 11 q -4 -5 -8 -2" />
        </g>
      </g>

      {/* Head */}
      <ellipse cx="100" cy="60" rx="42" ry="38" fill="#f1d9b6" />

      {/* Ears */}
      <ellipse cx="62" cy="48" rx="8" ry="11" fill="#e6c79a" transform="rotate(-25 62 48)" />
      <ellipse cx="138" cy="48" rx="8" ry="11" fill="#e6c79a" transform="rotate(25 138 48)" />

      {/* Open friendly eyes */}
      <circle cx="84" cy="63" r="5" fill="#3a2418" />
      <circle cx="116" cy="63" r="5" fill="#3a2418" />
      <circle cx="82.5" cy="61" r="1.8" fill="#ffffff" opacity="0.9" />
      <circle cx="114.5" cy="61" r="1.8" fill="#ffffff" opacity="0.9" />

      {/* Nose + smile */}
      <ellipse cx="100" cy="73" rx="4.5" ry="3.2" fill="#3a2418" />
      <path
        d="M93 79 q 7 6 14 0"
        stroke="#3a2418"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Cheeks */}
      <circle cx="76" cy="74" r="4" fill="#f4a8a0" opacity="0.6" />
      <circle cx="124" cy="74" r="4" fill="#f4a8a0" opacity="0.6" />

      {/* Body */}
      <ellipse cx="100" cy="150" rx="48" ry="55" fill="#f1d9b6" />

      {/* Body shading */}
      <ellipse cx="100" cy="170" rx="36" ry="28" fill="#ead0a8" opacity="0.5" />

      {/* Chin beard */}
      <path
        d="M92 90 C 94 100, 98 106, 100 110 C 102 106, 106 100, 108 90 C 103 96, 97 96, 92 90 Z"
        fill="#e6c79a"
      />
      <path
        d="M100 96 L 100 106"
        stroke="#c9a063"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Legs */}
      <rect x="76" y="195" width="10" height="18" rx="4" fill="#e6c79a" />
      <rect x="114" y="195" width="10" height="18" rx="4" fill="#e6c79a" />

      {/* Hooves */}
      <rect x="76" y="207" width="10" height="6" rx="3" fill="#7a4a2a" />
      <rect x="114" y="207" width="10" height="6" rx="3" fill="#7a4a2a" />

      {/* Sparkle */}
      <g fill="#f5d35a">
        <path d="M170 40 l 2 6 l 6 2 l -6 2 l -2 6 l -2 -6 l -6 -2 l 6 -2 z" />
      </g>
    </svg>
  );
}

export function MarkhorLogo({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      {/* Spiral horns */}
      <g fill="none" stroke="#7a4a2a" strokeWidth="2.5" strokeLinecap="round">
        <path d="M16 15 C 14 7, 9 3, 4 6" />
        <path d="M24 15 C 26 7, 31 3, 36 6" />
      </g>
      <g fill="none" stroke="#935c36" strokeWidth="1.4" strokeLinecap="round">
        <path d="M12 8 l 2.5 2" />
        <path d="M28 8 l -2.5 2" />
      </g>

      {/* Ears */}
      <ellipse cx="9" cy="20" rx="3.5" ry="5" fill="#e6c79a" transform="rotate(-25 9 20)" />
      <ellipse cx="31" cy="20" rx="3.5" ry="5" fill="#e6c79a" transform="rotate(25 31 20)" />

      {/* Head */}
      <ellipse cx="20" cy="24" rx="10.5" ry="11.5" fill="#f1d9b6" />

      {/* Eyes + nose */}
      <circle cx="16" cy="23" r="1.5" fill="#3a2418" />
      <circle cx="24" cy="23" r="1.5" fill="#3a2418" />
      <ellipse cx="20" cy="28" rx="2" ry="1.5" fill="#3a2418" />

      {/* Beard */}
      <path
        d="M20 35 l 0 3"
        stroke="#c9a063"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
