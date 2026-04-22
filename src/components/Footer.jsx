import { Link } from 'react-router-dom'
import { LogoMark } from './Logo'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <LogoMark className="footer__mark" />
          <h3 className="footer__title">THE ALBATROSS CLUB</h3>
          <p className="footer__tagline">Where the game comes home</p>
          <p className="footer__location">Pinehurst, North Carolina</p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>Explore</h4>
            <Link to="/experience">The Experience</Link>
            <Link to="/suites">Suites</Link>
            <Link to="/dining">Dining & Bar</Link>
            <Link to="/wellness">Wellness</Link>
          </div>
          <div className="footer__col">
            <h4>Plan</h4>
            <Link to="/property-planner">Property Planner</Link>
            <a href="#inquire">Inquire</a>
            <a href="#invest">Investor Info</a>
          </div>
          <div className="footer__col">
            <h4>Connect</h4>
            <a href="mailto:info@albatrossclub.com">info@albatrossclub.com</a>
            <p>Pinehurst, NC 28374</p>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; 2026 The Albatross Club. All rights reserved.</p>
      </div>
    </footer>
  )
}
