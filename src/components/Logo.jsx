import './Logo.css'

// Vite serves /public files at the base URL; use BASE_URL so this works
// in both dev (/) and production (/The-Golf-House/).
const BASE = import.meta.env.BASE_URL
const LOGO_GREEN = `${BASE}logo-green.png`
const LOGO_WHITE = `${BASE}logo-white.png`

/**
 * The Albatross Club logo — serif "A" with an albatross passing through.
 *
 * Pass `variant="green"` (default) for light backgrounds,
 * or `variant="white"` for dark backgrounds.
 */
export function LogoMark({ variant = 'green', className = '', style, title = 'The Albatross Club' }) {
  const src = variant === 'white' ? LOGO_WHITE : LOGO_GREEN
  return (
    <img
      src={src}
      alt={title}
      className={`albatross-logo ${className}`}
      style={style}
      draggable={false}
    />
  )
}

/**
 * Full logo lock-up: mark + wordmark + location tagline.
 */
export function LogoLockup({ variant = 'white', className = '', style }) {
  return (
    <div className={`albatross-lockup ${className}`} style={style}>
      <LogoMark variant={variant} className="albatross-lockup__mark" />
      <div className="albatross-lockup__wordmark">THE ALBATROSS CLUB</div>
      <div className="albatross-lockup__tagline">PINEHURST · NORTH CAROLINA</div>
    </div>
  )
}
