import { Link } from 'react-router-dom'
import { LogoMark } from '../components/Logo'
import './Home.css'

export default function Home() {
  const base = import.meta.env.BASE_URL
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero" style={{ backgroundImage: `url(${base}renderings/cabin-front-porch.png)` }}>
        <div className="hero__overlay" />
        <div className="hero__content">
          <LogoMark variant="white" className="hero__logo" />
          <div className="hero__rule" />
          <h1 className="hero__title">THE ALBATROSS CLUB</h1>
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
                The Albatross Club is a luxury golf and hospitality experience rooted in the Sandhills
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
              { title: 'The Patio', desc: 'Communal short game grounds anchoring the social heart of the property', link: '/experience' },
              { title: 'The Cabins', desc: 'Eight luxury group cabins designed for the modern golfer\'s retreat', link: '/cabins' },
              { title: 'The Bar', desc: 'The 19th Hole \u2014 where the round lives on over craft cocktails', link: '/dining' },
              { title: 'The Dining Room', desc: 'Carolina-inspired gastropub with seasonal menus and Southern charm', link: '/dining' },
              { title: 'The Locker Room', desc: 'A private members-style retreat within the clubhouse', link: '/experience' },
              { title: 'Wellness & Recovery', desc: 'Cold plunge, sauna, and fitness designed for the active traveler', link: '/wellness' },
            ].map(f => (
              <Link to={f.link} key={f.title} className="feature-card">
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
                <span className="feature-card__arrow">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery - property renderings */}
      <section className="home-gallery">
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>A First Look</p>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Inside The Albatross Club</h2>
          <div className="gold-line" style={{ margin: '0 auto 3rem' }} />
          <div className="home-gallery__grid">
            <Link to="/cabins" className="home-gallery__item home-gallery__item--tall">
              <img src={`${base}renderings/cabin-front-porch.png`} alt="Cabin front porch" loading="lazy" />
              <div className="home-gallery__caption">
                <span className="home-gallery__label">The Cabins</span>
                <span className="home-gallery__name">Cabin Front Porch</span>
              </div>
            </Link>
            <Link to="/cabins" className="home-gallery__item">
              <img src={`${base}renderings/cabin-hitting-bay.png`} alt="Cabin hitting bay" loading="lazy" />
              <div className="home-gallery__caption">
                <span className="home-gallery__label">The Cabins</span>
                <span className="home-gallery__name">Private Hitting Bay</span>
              </div>
            </Link>
            <Link to="/dining" className="home-gallery__item">
              <img src={`${base}renderings/lobby-bar.png`} alt="Lobby bar" loading="lazy" />
              <div className="home-gallery__caption">
                <span className="home-gallery__label">Dining &amp; Bar</span>
                <span className="home-gallery__name">The Lobby Bar</span>
              </div>
            </Link>
            <Link to="/dining" className="home-gallery__item">
              <img src={`${base}renderings/sports-bar.png`} alt="Sports bar" loading="lazy" />
              <div className="home-gallery__caption">
                <span className="home-gallery__label">Dining &amp; Bar</span>
                <span className="home-gallery__name">The Sports Bar</span>
              </div>
            </Link>
            <Link to="/wellness" className="home-gallery__item">
              <img src={`${base}renderings/spa-cold-tubs.png`} alt="Spa cold tubs" loading="lazy" />
              <div className="home-gallery__caption">
                <span className="home-gallery__label">Wellness</span>
                <span className="home-gallery__name">Spa &amp; Cold Tubs</span>
              </div>
            </Link>
            <Link to="/wellness" className="home-gallery__item">
              <img src={`${base}renderings/workout-room.png`} alt="Workout room" loading="lazy" />
              <div className="home-gallery__caption">
                <span className="home-gallery__label">Wellness</span>
                <span className="home-gallery__name">Fitness Studio</span>
              </div>
            </Link>
            <Link to="/experience" className="home-gallery__item home-gallery__item--wide">
              <img src={`${base}renderings/locker-room.png`} alt="Locker room" loading="lazy" />
              <div className="home-gallery__caption">
                <span className="home-gallery__label">The Experience</span>
                <span className="home-gallery__name">Members Locker Room</span>
              </div>
            </Link>
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
          <p className="cta__sub">Use our interactive Property Planner to design the layout of your Albatross Club</p>
          <Link to="/property-planner" className="btn btn--gold">Open Property Planner</Link>
        </div>
      </section>
    </div>
  )
}
