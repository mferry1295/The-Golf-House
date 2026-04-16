import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isPlanner = location.pathname === '/property-planner'

  return (
    <nav className={`navbar ${isPlanner ? 'navbar--dark' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark">&#9830;</span>
          <div className="navbar__logo-text">
            <span className="navbar__logo-title">THE GOLF HOUSE</span>
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
