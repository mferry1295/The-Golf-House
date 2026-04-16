import { Link } from 'react-router-dom'
import './Wellness.css'

export default function Wellness() {
  return (
    <div className="wellness">
      <section className="well-hero">
        <div className="well-hero__overlay" />
        <div className="well-hero__content">
          <p className="section-label">06 &middot; Wellness & Recovery</p>
          <h1 className="well-hero__title">Wellness & Recovery</h1>
          <div className="gold-line" style={{ margin: '1rem auto' }} />
          <p className="well-hero__sub">Cold plunge, sauna, and fitness designed for the active traveler</p>
        </div>
      </section>

      <section className="well-section">
        <div className="container">
          <div className="well-grid">
            <div className="well-grid__text">
              <p className="section-label">Recovery Center</p>
              <h2 className="section-title">Built for Recovery</h2>
              <div className="gold-line" />
              <p className="section-subtitle">Body and mind after 36 holes</p>
              <div className="well-features">
                {[
                  'Indoor/outdoor cold plunge pools',
                  'Finnish dry sauna with pine views',
                  'Full fitness center with Peloton + free weights',
                  'Vaulted shiplap ceilings + natural light',
                  'Outdoor chaise lounges + heated pool deck',
                  'Yoga + stretch studio space',
                  'Longleaf pine forest setting',
                ].map(f => (
                  <div key={f} className="exp-feature">
                    <span className="exp-feature__dash">&mdash;</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="well-grid__cards">
              <div className="well-card well-card--plunge">
                <span className="well-card__icon">&#10052;</span>
                <h3>Cold Plunge</h3>
                <p>Indoor and outdoor cold plunge pools for post-round recovery and morning ritual</p>
              </div>
              <div className="well-card well-card--sauna">
                <span className="well-card__icon">&#9832;</span>
                <h3>Finnish Sauna</h3>
                <p>Dry sauna with views of the longleaf pine forest through floor-to-ceiling glass</p>
              </div>
              <div className="well-card well-card--fitness">
                <span className="well-card__icon">&#127947;</span>
                <h3>Fitness Center</h3>
                <p>Full gym with Peloton bikes, free weights, and stretch zones under vaulted ceilings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wellness Journey */}
      <section className="well-journey">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="section-label">Daily Ritual</p>
            <h2 className="section-title" style={{ color: 'var(--cream)' }}>A Day at The Golf House</h2>
            <div className="gold-line" style={{ margin: '1rem auto' }} />
          </div>
          <div className="journey-grid">
            {[
              { time: '6:00 AM', title: 'Morning Plunge', desc: 'Start with a cold plunge and Finnish sauna session' },
              { time: '7:30 AM', title: 'Breakfast', desc: 'Farm-fresh breakfast at the clubhouse' },
              { time: '9:00 AM', title: 'Tee Time', desc: '18 holes at one of Pinehurst\'s world-class courses' },
              { time: '2:00 PM', title: 'Recovery', desc: 'Post-round fitness, stretch, and cold plunge' },
              { time: '4:00 PM', title: 'Short Game', desc: 'Putting competitions on the communal greens' },
              { time: '6:00 PM', title: 'The 19th Hole', desc: 'Craft cocktails and sharing plates at the bar' },
              { time: '8:00 PM', title: 'Fire Pit', desc: 'Evening gathering under the Carolina stars' },
            ].map((item, i) => (
              <div key={i} className="journey-item">
                <span className="journey-item__time">{item.time}</span>
                <div className="journey-item__dot" />
                <div className="journey-item__content">
                  <h4 className="journey-item__title">{item.title}</h4>
                  <p className="journey-item__desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="exp-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ color: 'var(--cream)' }}>Plan Your Property</h2>
          <div className="gold-line" style={{ margin: '1rem auto 2rem' }} />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/experience" className="btn btn--outline" style={{ color: 'var(--warm-gold)', borderColor: 'var(--warm-gold)' }}>The Experience</Link>
            <Link to="/suites" className="btn btn--outline" style={{ color: 'var(--warm-gold)', borderColor: 'var(--warm-gold)' }}>Suites</Link>
            <Link to="/property-planner" className="btn btn--gold">Property Planner</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
