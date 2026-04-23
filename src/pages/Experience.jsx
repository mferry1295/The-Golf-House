import { Link } from 'react-router-dom'
import './Experience.css'

export default function Experience() {
  const base = import.meta.env.BASE_URL
  return (
    <div className="experience">
      {/* Hero */}
      <section className="exp-hero" style={{ backgroundImage: `url(${base}renderings/locker-room.png)` }}>
        <div className="exp-hero__overlay" />
        <div className="exp-hero__content">
          <p className="section-label">02 &middot; The Experience</p>
          <h1 className="exp-hero__title">The Experience</h1>
          <div className="gold-line" style={{ margin: '1rem auto' }} />
          <p className="exp-hero__sub">From short game grounds to the members' locker room &mdash; every corner of the clubhouse</p>
        </div>
      </section>

      {/* Amenities Gallery */}
      <section className="exp-gallery">
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>Six Pillars</p>
          <h2 className="section-title" style={{ textAlign: 'center' }}>The Albatross Club Amenities</h2>
          <div className="gold-line" style={{ margin: '0 auto 3rem' }} />
          <div className="exp-gallery__grid">
            {[
              { img: 'cabin-front-porch.png', title: 'The Cabins', sub: 'Plantation-inspired retreats', link: '/cabins' },
              { img: 'cabin-hitting-bay.png', title: 'Private Hitting Bays', sub: 'Simulator-equipped practice', link: '/cabins' },
              { img: 'locker-room.png', title: 'Members Locker Room', sub: 'Old-world luxury ritual', link: '#locker-room' },
              { img: 'lobby-bar.png', title: 'The Lobby Bar', sub: 'Craft cocktail program', link: '/dining' },
              { img: 'sports-bar.png', title: 'The Sports Bar', sub: 'Live music + whiskey tastings', link: '/dining' },
              { img: 'workout-room.png', title: 'Fitness Studio', sub: 'Peloton + free weights', link: '/wellness' },
              { img: 'spa-cold-tubs.png', title: 'Spa & Cold Tubs', sub: 'Recovery after 36 holes', link: '/wellness' },
            ].map(a => (
              <Link to={a.link} key={a.title} className="exp-gallery__item">
                <img src={`${base}renderings/${a.img}`} alt={a.title} loading="lazy" />
                <div className="exp-gallery__caption">
                  <span className="exp-gallery__title">{a.title}</span>
                  <span className="exp-gallery__sub">{a.sub}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Patio Section */}
      <section className="exp-section">
        <div className="container">
          <div className="exp-section__grid">
            <div className="exp-section__text">
              <p className="section-label">Short Game & Patio</p>
              <h2 className="section-title">The Social Heart of the Property</h2>
              <div className="gold-line" />
              <p className="section-subtitle">Where the game continues after the round</p>
              <div className="exp-section__features">
                {[
                  'Practice putting greens with sand bunkers',
                  'Covered verandas with ceiling fans',
                  'Brick columns + white railing plantation style',
                  'Outdoor fire pit lounge areas',
                  'Longleaf pine landscape framing',
                  'Adjacent pool + cabana seating',
                  'Slate gray roofline with dormers',
                  'Evening lighting + twilight ambiance',
                ].map(f => (
                  <div key={f} className="exp-feature">
                    <span className="exp-feature__dash">&mdash;</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="exp-section__visual">
              <div className="exp-visual-card exp-visual-card--green">
                <h3>Short Game Area</h3>
                <p>Practice greens, bunkers, and chipping areas steps from your cabin</p>
              </div>
              <div className="exp-visual-card exp-visual-card--gold">
                <h3>Fire Pit Lounges</h3>
                <p>Gather under the Sandhills stars for evening cocktails</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locker Room */}
      <section className="exp-section exp-section--dark">
        <div className="container">
          <div className="exp-section__grid exp-section__grid--reverse">
            <div className="exp-section__visual">
              <div className="exp-visual-card exp-visual-card--tobacco">
                <h3>Members-Style Lockers</h3>
                <p>Walnut cabinetry, brass hardware, and your name on the door</p>
              </div>
              <div className="exp-visual-card exp-visual-card--forest">
                <h3>Cigar Humidor</h3>
                <p>Shoeshine station and curated cigar selection</p>
              </div>
            </div>
            <div className="exp-section__text">
              <p className="section-label" style={{ color: 'var(--warm-gold)' }}>04 &middot; The Locker Room</p>
              <h2 className="section-title" style={{ color: 'var(--cream)' }}>Old-World Luxury Meets Post-Round Ritual</h2>
              <div className="gold-line" />
              <p className="section-subtitle">A private members-style retreat within the clubhouse</p>
              <div className="exp-section__features">
                {[
                  'Exposed wood beam ceilings',
                  'Walnut cabinetry + brass hardware',
                  'Leather seating + tufted ottomans',
                  'Private locker + vanity areas',
                  'Wide plank hardwood flooring',
                  'Oriental rugs + wainscoting details',
                  'Slate + granite stone countertops',
                  'Shoeshine station + cigar humidor',
                ].map(f => (
                  <div key={f} className="exp-feature" style={{ color: 'var(--sage)' }}>
                    <span className="exp-feature__dash">&mdash;</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="exp-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ color: 'var(--cream)' }}>Explore More</h2>
          <div className="gold-line" style={{ margin: '1rem auto 2rem' }} />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/cabins" className="btn btn--outline" style={{ color: 'var(--warm-gold)', borderColor: 'var(--warm-gold)' }}>The Cabins</Link>
            <Link to="/dining" className="btn btn--outline" style={{ color: 'var(--warm-gold)', borderColor: 'var(--warm-gold)' }}>Dining & Bar</Link>
            <Link to="/wellness" className="btn btn--outline" style={{ color: 'var(--warm-gold)', borderColor: 'var(--warm-gold)' }}>Wellness</Link>
            <Link to="/property-planner" className="btn btn--gold">Property Planner</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
