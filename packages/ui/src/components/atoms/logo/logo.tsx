interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Logo Miru — SVG extrait du mockup de référence.
 * Couleur hérite de `currentColor`, donc contrôlable via text-*.
 */
export function Logo({ size = 20, className }: LogoProps) {
  return (
    <svg
      width={size * 3.2}
      height={size}
      viewBox="0 0 154 48"
      fill="none"
      aria-label="Miru"
      className={className}
    >
      <text
        x="0"
        y="38"
        fontFamily="'Clash Display'"
        fontSize="42"
        fontWeight="600"
        fill="currentColor"
        letterSpacing="-1"
      >
        m
      </text>
      <rect x="50" y="16" width="4.5" height="23" rx="2" fill="currentColor" />
      <g transform="translate(47, -1)">
        <rect
          x="0"
          y="1"
          width="11"
          height="13"
          rx="2"
          stroke="currentColor"
          strokeWidth="2.2"
          fill="none"
        />
        <line x1="2" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1.6" />
        <line x1="2" y1="9.5" x2="9" y2="9.5" stroke="currentColor" strokeWidth="1.6" />
      </g>
      <text
        x="66"
        y="38"
        fontFamily="'Clash Display'"
        fontSize="42"
        fontWeight="600"
        fill="currentColor"
        letterSpacing="-1"
      >
        r
      </text>
      <text
        x="86"
        y="38"
        fontFamily="'Clash Display'"
        fontSize="42"
        fontWeight="600"
        fill="currentColor"
        letterSpacing="-1"
      >
        u
      </text>
    </svg>
  );
}
