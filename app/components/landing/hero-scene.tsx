export function HeroScene() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1440 700"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="moon-halo">
          <stop offset="0%" stopColor="var(--color-cream-100)" stopOpacity="0.18" />
          <stop offset="55%" stopColor="var(--color-mint-400)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--color-mint-400)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="luna-glow">
          <stop offset="0%" stopColor="var(--color-mint-400)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-mint-400)" stopOpacity="0" />
        </radialGradient>
        <mask id="moon-mask">
          <rect x="1180" y="40" width="140" height="140" fill="black" />
          <circle cx="1250" cy="110" r="38" fill="white" />
          <circle cx="1264" cy="100" r="34" fill="black" />
        </mask>
      </defs>

      {/* Stars */}
      <g className="twinkle-a" fill="white">
        <circle cx="80" cy="90" r="1.4" opacity="0.7" />
        <circle cx="240" cy="180" r="1.1" opacity="0.5" />
        <circle cx="420" cy="70" r="1.5" opacity="0.8" />
        <circle cx="700" cy="150" r="1.1" opacity="0.5" />
        <circle cx="930" cy="60" r="1.4" opacity="0.7" />
        <circle cx="1120" cy="210" r="1.1" opacity="0.5" />
        <circle cx="1380" cy="150" r="1.3" opacity="0.6" />
        <path
          d="M320 220 l 1.8 5 l 5 1.8 l -5 1.8 l -1.8 5 l -1.8 -5 l -5 -1.8 l 5 -1.8 z"
          fill="var(--color-amber-400)"
          opacity="0.85"
        />
        <path
          d="M1060 100 l 1.5 4.2 l 4.2 1.5 l -4.2 1.5 l -1.5 4.2 l -1.5 -4.2 l -4.2 -1.5 l 4.2 -1.5 z"
          fill="white"
          opacity="0.7"
        />
      </g>
      <g className="twinkle-b" fill="white">
        <circle cx="160" cy="250" r="1.2" opacity="0.6" />
        <circle cx="540" cy="200" r="1.3" opacity="0.6" />
        <circle cx="620" cy="60" r="1.1" opacity="0.5" />
        <circle cx="820" cy="230" r="1.4" opacity="0.7" />
        <circle cx="1010" cy="160" r="1.1" opacity="0.5" />
        <circle cx="1250" cy="230" r="1.2" opacity="0.55" />
        <circle cx="1330" cy="60" r="1.1" opacity="0.5" />
        <path
          d="M880 110 l 1.8 5 l 5 1.8 l -5 1.8 l -1.8 5 l -1.8 -5 l -5 -1.8 l 5 -1.8 z"
          fill="var(--color-amber-300)"
          opacity="0.8"
        />
        <path
          d="M180 60 l 1.5 4.2 l 4.2 1.5 l -4.2 1.5 l -1.5 4.2 l -1.5 -4.2 l -4.2 -1.5 l 4.2 -1.5 z"
          fill="white"
          opacity="0.6"
        />
      </g>

      {/* Crescent moon */}
      <circle cx="1250" cy="110" r="110" fill="url(#moon-halo)" />
      <circle
        cx="1250"
        cy="110"
        r="38"
        fill="var(--color-cream-100)"
        mask="url(#moon-mask)"
      />

      {/* Back ridge */}
      <g className="parallax-back">
        <path
          d="M0 470 L 90 380 L 180 440 L 280 330 L 370 420 L 470 350 L 560 430 L 660 310 L 760 420 L 860 360 L 960 440 L 1060 340 L 1160 430 L 1260 370 L 1360 440 L 1440 390 L 1440 700 L 0 700 Z"
          fill="var(--color-forest-800)"
          opacity="0.55"
        />
        <g fill="var(--color-cream-100)" opacity="0.55">
          <path d="M636 334 L 660 310 L 684 334 L 672 328 L 660 338 L 648 328 Z" />
          <path d="M258 352 L 280 330 L 302 352 L 291 347 L 280 356 L 269 347 Z" />
          <path d="M1038 362 L 1060 340 L 1082 362 L 1071 357 L 1060 366 L 1049 357 Z" />
        </g>
      </g>

      {/* Mid ridge */}
      <path
        className="parallax-mid"
        d="M0 560 L 120 460 L 240 530 L 360 420 L 480 520 L 620 400 L 760 510 L 900 430 L 1040 530 L 1180 440 L 1300 520 L 1440 460 L 1440 700 L 0 700 Z"
        fill="var(--color-forest-800)"
      />

      {/* Glow on Luna's perch */}
      <circle cx="1170" cy="440" r="200" fill="url(#luna-glow)" />

      {/* Front ridge — plateau on the right is Luna's perch */}
      <path
        d="M0 640 L 140 590 L 300 620 L 460 560 L 640 610 L 800 540 L 940 500 L 1020 445 L 1120 430 L 1300 425 L 1440 440 L 1440 700 L 0 700 Z"
        fill="var(--color-forest-700)"
      />

      {/* Crystal clusters */}
      <g className="animate-pulse-soft" transform="translate(-30 78)">
        <path d="M330 578 L 339 598 L 330 616 L 321 598 Z" fill="var(--color-mint-600)" />
        <path d="M350 556 L 362 592 L 350 620 L 338 592 Z" fill="var(--color-mint-500)" />
        <path d="M350 556 L 356 592 L 350 620 L 347 592 Z" fill="var(--color-mint-400)" opacity="0.8" />
        <path d="M372 572 L 380 594 L 372 614 L 364 594 Z" fill="var(--color-mint-400)" />
        <path
          d="M388 552 l 2 5.5 l 5.5 2 l -5.5 2 l -2 5.5 l -2 -5.5 l -5.5 -2 l 5.5 -2 z"
          fill="var(--color-amber-400)"
          opacity="0.9"
        />
      </g>
      <g className="animate-pulse-soft">
        <path d="M1052 452 L 1059 468 L 1052 482 L 1045 468 Z" fill="var(--color-mint-600)" />
        <path d="M1068 438 L 1077 466 L 1068 486 L 1059 466 Z" fill="var(--color-mint-500)" />
        <path d="M1068 438 L 1072 466 L 1068 486 L 1066 466 Z" fill="var(--color-mint-400)" opacity="0.8" />
        <path
          d="M1088 444 l 1.8 5 l 5 1.8 l -5 1.8 l -1.8 5 l -1.8 -5 l -5 -1.8 l 5 -1.8 z"
          fill="var(--color-amber-400)"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}
