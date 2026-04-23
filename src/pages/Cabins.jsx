import { Link } from 'react-router-dom'
import './Cabins.css'

const cabinTypes = [
  {
    name: 'The Longleaf',
    sleeps: '4 guests',
    beds: '2 King Suites',
    sqft: '1,400 sq ft',
    price: 'From $500/night',
    features: ['Deep veranda porch', 'Full kitchen', 'Pine forest views', 'Private fire pit'],
  },
  {
    name: 'The Sandhills',
    sleeps: '6 guests',
    beds: '3 King Suites',
    sqft: '1,800 sq ft',
    price: 'From $850/night',
    features: ['Wraparound porch', 'Great room + kitchen', 'Outdoor shower', 'Golf cart included'],
  },
  {
    name: 'The Carolina',
    sleeps: '8 guests',
    beds: '4 King Suites',
    sqft: '2,400 sq ft',
    price: 'From $1,200/night',
    features: ['Grand plantation porch', 'Chef\'s kitchen', 'Hot tub', 'Premium clubhouse access'],
  },
]

export default function Cabins() {
  return (
    <div className="suites">
      <section
        className="suites-hero"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}renderings/cabin-front-porch.png)` }}
      >
        <div className="suites-hero__overlay" />
        <div className="suites-hero__content">
          <p className="section-label">03 &middot; The Cabins</p>
          <h1 className="suites-hero__title">The Cabin Experience</h1>
          <div className="gold-line" style={{ margin: '1rem auto' }} />
          <p className="suites-hero__sub">Eight luxury group cabins designed for the modern golfer's retreat</p>
        </div>
      </section>

      <section className="suites-intro">
        <div className="container">
          <div className="suites-intro__grid">
            <div>
              <p className="section-label">Design Direction</p>
              <h2 className="section-title">Architect-Designed Cabins for the Modern Golf Traveler</h2>
              <div className="gold-line" />
            </div>
            <div className="suites-intro__features">
              {[
                '8 private group cabins, each sleeping 4\u20138',
                'Plantation-inspired architecture + deep porches',
                'Open-plan living + full kitchen',
                'Ensuite baths with rainfall showers',
                'Views of the Sandhills pine forest',
                'Fire pit gathering areas between cabins',
              ].map(f => (
                <div key={f} className="exp-feature">
                  <span className="exp-feature__dash">&mdash;</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cabin-gallery">
        <div className="container">
          <div className="cabin-gallery__grid">
            <figure className="cabin-gallery__item">
              <img src={`${import.meta.env.BASE_URL}renderings/cabin-front-porch.png`} alt="Cabin front porch and exterior" loading="lazy" />
              <figcaption>The Front Porch &mdash; plantation-inspired verandas with ceiling fans and rocking chairs</figcaption>
            </figure>
            <figure className="cabin-gallery__item">
              <img src={`${import.meta.env.BASE_URL}renderings/cabin-hitting-bay.png`} alt="Private hitting bay inside cabin" loading="lazy" />
              <figcaption>The Private Hitting Bay &mdash; each cabin includes a simulator-equipped practice space</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="suites-cards">
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>Choose Your Cabin</p>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Three Floor Plans</h2>
          <div className="gold-line" style={{ margin: '1rem auto 3rem' }} />
          <div className="suites-cards__grid">
            {cabinTypes.map(cabin => (
              <div key={cabin.name} className="cabin-card">
                <div className="cabin-card__header">
                  <h3 className="cabin-card__name">{cabin.name}</h3>
                  <span className="cabin-card__price">{cabin.price}</span>
                </div>
                <div className="cabin-card__meta">
                  <div className="cabin-card__meta-item">
                    <span className="cabin-card__meta-label">Sleeps</span>
                    <span className="cabin-card__meta-value">{cabin.sleeps}</span>
                  </div>
                  <div className="cabin-card__meta-item">
                    <span className="cabin-card__meta-label">Bedrooms</span>
                    <span className="cabin-card__meta-value">{cabin.beds}</span>
                  </div>
                  <div className="cabin-card__meta-item">
                    <span className="cabin-card__meta-label">Size</span>
                    <span className="cabin-card__meta-value">{cabin.sqft}</span>
                  </div>
                </div>
                <div className="cabin-card__features">
                  {cabin.features.map(f => (
                    <div key={f} className="cabin-card__feature">
                      <span className="cabin-card__check">&#10003;</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button className="btn btn--primary cabin-card__btn">Inquire</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="exp-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ color: 'var(--cream)' }}>Design Your Property Layout</h2>
          <div className="gold-line" style={{ margin: '1rem auto 1.5rem' }} />
          <p style={{ color: 'rgba(245,240,232,0.8)', marginBottom: '2rem' }}>
            Place cabins, amenities, and golf features on your property map
          </p>
          <Link to="/property-planner" className="btn btn--gold">Open Property Planner</Link>
        </div>
      </section>
    </div>
  )
}
