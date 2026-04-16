import { Link } from 'react-router-dom'
import './Experience.css'

export default function Experience() {
  return (
    <div className="experience">
      {/* Hero */}
      <section className="exp-hero">
        <div className="exp-hero__overlay" />
        <div className="exp-hero__content">
          <p className="section-label">02 &middot; The Experience</p>
          <h1 className="exp-hero__title">The Patio</h1>
          <div className="gold-line" style={{ margin: '1rem auto' }} />
          <p className="exp-hero__sub">Communal short game grounds anchoring the social heart of the property</p>
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
                <span className="exp-visual-card__icon">&#9971;</span>
                <h3>Short Game Area</h3>
                <p>Practice greens, bunkers, and chipping areas steps from your cabin</p>
              </div>
              <div className="exp-visual-card exp-visual-card--gold">
                <span className="exp-visual-card__icon">&#9832;</span>
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
                <span className="exp-visual-card__icon">&#128084;</span>
                <h3>Members-Style Lockers</h3>
                <p>Walnut cabinetry, brass hardware, and your name on the door</p>
              </div>
              <div className="exp-visual-card exp-visual-card--forest">
                <span className="exp-visual-card__icon">&#127942;</span>
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
            <Link to="/suites" className="btn btn--outline" style={{ color: 'var(--warm-gold)', borderColor: 'var(--warm-gold)' }}>The Suites</Link>
            <Link to="/dining" className="btn btn--outline" style={{ color: 'var(--warm-gold)', borderColor: 'var(--warm-gold)' }}>Dining & Bar</Link>
            <Link to="/wellness" className="btn btn--outline" style={{ color: 'var(--warm-gold)', borderColor: 'var(--warm-gold)' }}>Wellness</Link>
            <Link to="/property-planner" className="btn btn--gold">Property Planner</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
