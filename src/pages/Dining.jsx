import { Link } from 'react-router-dom'
import './Dining.css'

export default function Dining() {
  return (
    <div className="dining">
      <section className="dining-hero">
        <div className="dining-hero__overlay" />
        <div className="dining-hero__content">
          <p className="section-label">05 &middot; The Bar</p>
          <h1 className="dining-hero__title">The 19th Hole</h1>
          <div className="gold-line" style={{ margin: '1rem auto' }} />
          <p className="dining-hero__sub">Where the round lives on</p>
        </div>
      </section>

      {/* Bar Section */}
      <section className="dining-section">
        <div className="container">
          <div className="dining-grid">
            <div className="dining-grid__text">
              <p className="section-label">The Bar</p>
              <h2 className="section-title">Full-Service Craft Cocktail Bar</h2>
              <div className="gold-line" />
              <div className="dining-features">
                {[
                  'Carolina-inspired gastropub menu',
                  'Covered veranda dining + bar seating',
                  'Post-round sharing plates + boards',
                  'Live music weekends + whiskey tastings',
                  'Overlooking the short game greens',
                ].map(f => (
                  <div key={f} className="exp-feature">
                    <span className="exp-feature__dash">&mdash;</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="dining-grid__cards">
              <div className="dining-card dining-card--dark">
                <h3 className="dining-card__label">Signature Offerings</h3>
                <div className="gold-line" style={{ width: '50px' }} />
                <ul className="dining-card__list">
                  <li>NC craft beer + local distillery spirits</li>
                  <li>Smoked meats + Southern charcuterie</li>
                  <li>Wood-fired pizza + seasonal small plates</li>
                  <li>Breakfast service for cabin guests</li>
                </ul>
              </div>
              <div className="dining-card dining-card--tobacco">
                <h3 className="dining-card__label">Atmosphere</h3>
                <div className="gold-line" style={{ width: '50px' }} />
                <ul className="dining-card__list">
                  <li>Warm wood + leather banquette seating</li>
                  <li>Brass fixtures + vintage golf memorabilia</li>
                  <li>Fireplace lounge for evening gatherings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dining Room Section */}
      <section className="dining-section dining-section--alt">
        <div className="container">
          <div className="dining-grid dining-grid--reverse">
            <div className="dining-grid__cards">
              <div className="dining-visual">
                <span className="dining-visual__icon">&#127860;</span>
                <h3>The Dining Room</h3>
                <p>Elegant yet relaxed dining experience with views of the grounds and putting greens through floor-to-ceiling windows</p>
              </div>
              <div className="dining-visual dining-visual--sage">
                <span className="dining-visual__icon">&#127815;</span>
                <h3>Farm to Table</h3>
                <p>Seasonal menus featuring locally sourced ingredients from North Carolina farms and purveyors</p>
              </div>
            </div>
            <div className="dining-grid__text">
              <p className="section-label">The Dining Room</p>
              <h2 className="section-title">Carolina-Inspired Cuisine</h2>
              <div className="gold-line" />
              <p className="section-subtitle">Southern tradition meets modern sophistication</p>
              <p className="dining-body">
                The dining room anchors the communal experience at The Golf House.
                With arched doorways opening to views of the short game greens,
                every meal feels connected to the property's golf heritage.
                Seasonal menus celebrate North Carolina's rich culinary traditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section className="dining-menu">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="section-label">Sample Menu</p>
            <h2 className="section-title" style={{ color: 'var(--cream)' }}>A Taste of The Golf House</h2>
            <div className="gold-line" style={{ margin: '1rem auto' }} />
          </div>
          <div className="menu-grid">
            <div className="menu-col">
              <h3 className="menu-col__title">Morning</h3>
              <div className="menu-item">
                <span className="menu-item__name">Sandhills Breakfast Board</span>
                <span className="menu-item__desc">Local eggs, country ham, grits, biscuits</span>
              </div>
              <div className="menu-item">
                <span className="menu-item__name">Avocado Toast</span>
                <span className="menu-item__desc">Sourdough, poached egg, microgreens</span>
              </div>
              <div className="menu-item">
                <span className="menu-item__name">Protein Smoothie Bowl</span>
                <span className="menu-item__desc">Acai, granola, NC honey</span>
              </div>
            </div>
            <div className="menu-col">
              <h3 className="menu-col__title">Midday</h3>
              <div className="menu-item">
                <span className="menu-item__name">Smoked Pork Sandwich</span>
                <span className="menu-item__desc">12-hour smoke, slaw, pickles</span>
              </div>
              <div className="menu-item">
                <span className="menu-item__name">Shrimp & Grits</span>
                <span className="menu-item__desc">NC shrimp, stone-ground grits, tasso</span>
              </div>
              <div className="menu-item">
                <span className="menu-item__name">Wood-Fired Margherita</span>
                <span className="menu-item__desc">San Marzano, mozzarella, basil</span>
              </div>
            </div>
            <div className="menu-col">
              <h3 className="menu-col__title">Evening</h3>
              <div className="menu-item">
                <span className="menu-item__name">Southern Charcuterie</span>
                <span className="menu-item__desc">Cured meats, cheeses, preserves</span>
              </div>
              <div className="menu-item">
                <span className="menu-item__name">Ribeye</span>
                <span className="menu-item__desc">Local 16oz, roasted vegetables</span>
              </div>
              <div className="menu-item">
                <span className="menu-item__name">NC Trout</span>
                <span className="menu-item__desc">Pan-seared, brown butter, almonds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="exp-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ color: 'var(--cream)' }}>Continue Exploring</h2>
          <div className="gold-line" style={{ margin: '1rem auto 2rem' }} />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/suites" className="btn btn--outline" style={{ color: 'var(--warm-gold)', borderColor: 'var(--warm-gold)' }}>The Suites</Link>
            <Link to="/wellness" className="btn btn--outline" style={{ color: 'var(--warm-gold)', borderColor: 'var(--warm-gold)' }}>Wellness</Link>
            <Link to="/property-planner" className="btn btn--gold">Property Planner</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
