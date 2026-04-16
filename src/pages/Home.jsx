import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__overlay" />
        <div className="hero__content">
          <div className="hero__rule" />
          <h1 className="hero__title">THE GOLF HOUSE</h1>
          <p className="hero__tagline">Where the game comes home</p>
          <div className="hero__rule" />
          <p className="hero__location">PINEHURST, NORTH CAROLINA</p>
          <p className="hero__sub">A Golf & Hospitality Experience</p>
          <div className="hero__actions">
            <Link to="/experience" className="btn btn--primary">Explore the Experience</Link>
            <Link to="/property-planner" className="btn btn--outline">Property Planner</Link>
          </div>
        </div>
        <div className="hero__scroll">
          <span>Scroll to discover</span>
          <div className="hero__scroll-line" />
        </div>
      </section>

      {/* Intro */}
      <section className="intro">
        <div className="container">
          <div className="intro__grid">
            <div className="intro__text">
              <p className="section-label">01 &middot; The Concept</p>
              <h2 className="section-title">The Next Generation of Golf Hospitality</h2>
              <div className="gold-line" />
              <p className="section-subtitle">Where the spirit of Carolina golf tradition meets luxury experiential hospitality</p>
              <p className="intro__body">
                The Golf House is a luxury golf and hospitality experience rooted in the Sandhills
                of North Carolina. The first property in Pinehurst features 8 architect-designed group
                cabins organized around a communal clubhouse inspired by old Carolina architecture.
              </p>
              <p className="intro__body">
                The property brings together a communal short game area, fitness and recovery center
                with sauna and cold plunge, a curated restaurant and bar, and proximity to world-class courses.
              </p>
              <div className="intro__price">$500 &ndash; $1,500 per night</div>
            </div>
            <div className="intro__attributes">
              <h3 className="intro__attr-title">Brand Attributes</h3>
              {['Heritage Authenticity', 'Communal Intimacy', 'Refined Rusticity', 'Effortless Luxury', 'Wellness-Forward', 'Golf-Centric Culture'].map(attr => (
                <div key={attr} className="intro__attr">
                  <span className="intro__attr-dash">&mdash;</span>
                  <span>{attr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features">
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>02 &middot; The Property</p>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Six Pillars of the Experience</h2>
          <div className="gold-line" style={{ margin: '0 auto 3rem' }} />

          <div className="features__grid">
            {[
              { title: 'The Patio', desc: 'Communal short game grounds anchoring the social heart of the property', icon: '&#9971;', link: '/experience' },
              { title: 'The Suites', desc: 'Eight luxury group cabins designed for the modern golfer\'s retreat', icon: '&#9962;', link: '/suites' },
              { title: 'The Bar', desc: 'The 19th Hole \u2014 where the round lives on over craft cocktails', icon: '&#127863;', link: '/dining' },
              { title: 'The Dining Room', desc: 'Carolina-inspired gastropub with seasonal menus and Southern charm', icon: '&#127860;', link: '/dining' },
              { title: 'The Locker Room', desc: 'A private members-style retreat within the clubhouse', icon: '&#128084;', link: '/experience' },
              { title: 'Wellness & Recovery', desc: 'Cold plunge, sauna, and fitness designed for the active traveler', icon: '&#10052;', link: '/wellness' },
            ].map(f => (
              <Link to={f.link} key={f.title} className="feature-card">
                <span className="feature-card__icon" dangerouslySetInnerHTML={{ __html: f.icon }} />
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
                <span className="feature-card__arrow">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container">
          <div className="stats__grid">
            {[
              { value: '$860M', label: 'Annual visitor spending in Moore County', sub: '6.7% YoY growth' },
              { value: '40+', label: 'Golf courses within 15-mile radius', sub: 'Home of American Golf' },
              { value: '8', label: 'Luxury group cabins', sub: 'Sleeping 4\u20138 guests each' },
              { value: '$4.2M', label: 'Annual revenue target', sub: 'Year 3 stabilized' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <span className="stat-card__value">{s.value}</span>
                <span className="stat-card__label">{s.label}</span>
                <span className="stat-card__sub">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta__content">
          <div className="cta__rule" />
          <h2 className="cta__title">Begin Planning Your Property</h2>
          <p className="cta__sub">Use our interactive Property Planner to design the layout of your Golf House</p>
          <Link to="/property-planner" className="btn btn--gold">Open Property Planner</Link>
        </div>
      </section>
    </div>
  )
}
