import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogoMark } from './Logo'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isPlanner = location.pathname === '/property-planner'

  return (
    <nav className={`navbar ${isPlanner ? 'navbar--dark' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <LogoMark variant="green" className="navbar__logo-mark navbar__logo-mark--light" />
          <LogoMark variant="white" className="navbar__logo-mark navbar__logo-mark--dark" />
          <div className="navbar__logo-text">
            <span className="navbar__logo-title">THE ALBATROSS CLUB</span>
            <span className="navbar__logo-sub">PINEHURST, NC</span>
          </div>
        </Link>

        <button className="navbar__toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/experience" onClick={() => setMenuOpen(false)}>The Experience</Link></li>
          <li><Link to="/suites" onClick={() => setMenuOpen(false)}>Suites</Link></li>
          <li><Link to="/dining" onClick={() => setMenuOpen(false)}>Dining & Bar</Link></li>
          <li><Link to="/wellness" onClick={() => setMenuOpen(false)}>Wellness</Link></li>
          <li><Link to="/site-selection" onClick={() => setMenuOpen(false)}>Site Selection</Link></li>
          <li><Link to="/financial-model" onClick={() => setMenuOpen(false)}>Financial Model</Link></li>
          <li>
            <Link to="/property-planner" className="navbar__cta" onClick={() => setMenuOpen(false)}>
              Property Planner
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
