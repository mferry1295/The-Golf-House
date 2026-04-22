import './Logo.css'

/**
 * The Albatross Club mark — serif "A" with an albatross silhouette
 * passing through the crossbar. Uses currentColor so it can be tinted
 * (deep-forest on cream bgs, cream on dark bgs, warm-gold as accent).
 */
export function LogoMark({ className = '', style, title = 'The Albatross Club' }) {
  return (
    <svg
      viewBox="0 0 260 180"
      xmlns="http://www.w3.org/2000/svg"
      className={`albatross-logo ${className}`}
      style={style}
      role="img"
      aria-label={title}
    >
      {/* Serif letter A */}
      <text
        x="130"
        y="158"
        fontFamily="'Playfair Display', 'Times New Roman', serif"
        fontSize="190"
        fontWeight="500"
        textAnchor="middle"
        fill="currentColor"
        letterSpacing="0"
      >
        A
      </text>

      {/* Albatross silhouette flying through the A's crossbar */}
      <g fill="currentColor">
        <path d="
          M 18,82
          C 52,94 88,104 116,108
          C 136,110 153,108 166,105
          L 174,103
          L 178,103
          L 238,107
          L 178,112
          L 174,113
          L 166,114
          C 152,118 134,121 115,118
          C 88,114 52,105 20,96
          L 18,95
          Z
        " />
      </g>

      {/* Small accent dot for eye (optional, disappears at small sizes) */}
      <circle cx="170" cy="110" r="1.4" fill="currentColor" opacity="0.35" />
    </svg>
  )
}

/**
 * Full logo lock-up: mark + wordmark + location tagline.
 * Stacks vertically, centered — suited for hero sections.
 */
export function LogoLockup({ className = '', style, color = 'currentColor' }) {
  return (
    <div className={`albatross-lockup ${className}`} style={{ color, ...style }}>
      <LogoMark className="albatross-lockup__mark" />
      <div className="albatross-lockup__wordmark">THE ALBATROSS CLUB</div>
      <div className="albatross-lockup__tagline">PINEHURST · NORTH CAROLINA</div>
    </div>
  )
}
