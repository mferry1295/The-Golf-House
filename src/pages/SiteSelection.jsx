import { useState, useMemo } from 'react'
import coursesData from '../data/courses.json'
import './SiteSelection.css'

// Approximate lat/lng for major cities + state centers (for map positioning)
// Using simple albers-like projection converted to SVG coordinates (viewBox 0 0 960 600)
const STATE_COORDS = {
  AL: [650, 415], AK: [150, 560], AZ: [260, 410], AR: [570, 395], CA: [130, 310],
  CO: [365, 300], CT: [835, 210], DE: [800, 280], FL: [730, 495], GA: [695, 410],
  HI: [350, 560], ID: [255, 185], IL: [605, 275], IN: [640, 280], IA: [560, 245],
  KS: [500, 315], KY: [655, 325], LA: [575, 465], ME: [870, 150], MD: [790, 280],
  MA: [845, 200], MI: [650, 215], MN: [545, 175], MS: [605, 430], MO: [565, 320],
  MT: [315, 160], NE: [490, 255], NV: [205, 275], NH: [850, 185], NJ: [805, 255],
  NM: [355, 400], NY: [780, 210], NC: [755, 355], ND: [480, 155], OH: [680, 265],
  OK: [510, 390], OR: [165, 175], PA: [760, 250], RI: [850, 215], SC: [735, 390],
  SD: [485, 210], TN: [645, 360], TX: [495, 465], UT: [280, 290], VT: [830, 175],
  VA: [770, 310], WA: [195, 130], WV: [725, 290], WI: [590, 205], WY: [355, 225]
}

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
}

// Major golf regions / metropolitan clusters for site analysis
const REGIONS = [
  { name: 'Sandhills / Pinehurst', state: 'NC', cities: ['Pinehurst', 'Southern Pines', 'Aberdeen'], lat: 755, lng: 360 },
  { name: 'Monterey Peninsula', state: 'CA', cities: ['Pebble Beach', 'Carmel', 'Monterey'], lat: 115, lng: 315 },
  { name: 'Long Island', state: 'NY', cities: ['Southampton', 'East Hampton', 'Fishers Island', 'Baiting Hollow'], lat: 830, lng: 225 },
  { name: 'Philadelphia Main Line', state: 'PA', cities: ['Ardmore', 'Gladwyne', 'Haverford', 'Bryn Mawr'], lat: 780, lng: 265 },
  { name: 'Chicago North Shore', state: 'IL', cities: ['Wheaton', 'Lake Forest', 'Glenview', 'Highland Park'], lat: 610, lng: 265 },
  { name: 'Pittsburgh Metro', state: 'PA', cities: ['Oakmont', 'Pittsburgh', 'Fox Chapel'], lat: 735, lng: 260 },
  { name: 'Palm Beach / Jupiter', state: 'FL', cities: ['Juno Beach', 'Hobe Sound', 'Jupiter', 'West Palm Beach'], lat: 755, lng: 490 },
  { name: 'Bandon Coast', state: 'OR', cities: ['Bandon'], lat: 155, lng: 180 },
  { name: 'Scottsdale / Phoenix', state: 'AZ', cities: ['Scottsdale', 'Phoenix', 'Paradise Valley'], lat: 265, lng: 415 },
  { name: 'Coachella Valley', state: 'CA', cities: ['La Quinta', 'Palm Springs', 'Rancho Mirage', 'Indian Wells'], lat: 200, lng: 380 },
  { name: 'Hilton Head / Lowcountry', state: 'SC', cities: ['Hilton Head Island', 'Bluffton', 'Kiawah Island'], lat: 745, lng: 410 },
  { name: 'Napa / Sonoma', state: 'CA', cities: ['Napa', 'Sonoma', 'Santa Rosa'], lat: 115, lng: 290 },
  { name: 'Boston North Shore', state: 'MA', cities: ['Brookline', 'Newton', 'Manchester-by-the-Sea'], lat: 845, lng: 205 },
  { name: 'Westchester', state: 'NY', cities: ['Mamaroneck', 'Scarsdale', 'Rye', 'Purchase'], lat: 815, lng: 225 },
  { name: 'Hamptons East End', state: 'NY', cities: ['Montauk', 'Bridgehampton', 'Sagaponack'], lat: 860, lng: 220 },
  { name: 'Traverse City', state: 'MI', cities: ['Frankfort', 'Traverse City', 'Bellaire'], lat: 640, lng: 205 },
  { name: 'Austin / Hill Country', state: 'TX', cities: ['Austin', 'Horseshoe Bay', 'Spicewood'], lat: 490, lng: 455 },
  { name: 'Dallas–Fort Worth', state: 'TX', cities: ['Dallas', 'Fort Worth', 'Frisco'], lat: 510, lng: 435 },
  { name: 'Naples / Bonita Springs', state: 'FL', cities: ['Naples', 'Bonita Springs', 'Estero'], lat: 725, lng: 510 },
  { name: 'Atlanta Metro', state: 'GA', cities: ['Atlanta', 'Duluth', 'Johns Creek', 'Alpharetta'], lat: 680, lng: 405 }
]

function fmt(n) {
  if (n == null) return '—'
  return n.toLocaleString()
}

export default function SiteSelection() {
  const [accessFilter, setAccessFilter] = useState('All')
  const [stateFilter, setStateFilter] = useState('All')
  const [sortBy, setSortBy] = useState('totalRounds')
  const [selectedState, setSelectedState] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)

  const courses = coursesData

  // Aggregate metrics
  const { stateStats, regionStats, topStates, globalStats } = useMemo(() => {
    const byState = {}
    courses.forEach(c => {
      if (!byState[c.state]) byState[c.state] = { state: c.state, count: 0, totalRounds: 0, private: 0, resort: 0, public: 0, semi: 0, topRank: Infinity }
      byState[c.state].count++
      byState[c.state].totalRounds += c.totalRounds || 0
      byState[c.state].topRank = Math.min(byState[c.state].topRank, c.rank)
      if (c.access === 'Private') byState[c.state].private++
      else if (c.access === 'Resort') byState[c.state].resort++
      else if (c.access === 'Public') byState[c.state].public++
      else byState[c.state].semi++
    })

    const regions = REGIONS.map(r => {
      const matching = courses.filter(c => c.state === r.state && r.cities.some(city => c.city && c.city.toLowerCase().includes(city.toLowerCase())))
      const totalRounds = matching.reduce((s, c) => s + (c.totalRounds || 0), 0)
      const top10 = matching.filter(c => c.rank <= 10).length
      const top50 = matching.filter(c => c.rank <= 50).length
      const top100 = matching.filter(c => c.rank <= 100).length
      // Site score: weighted formula
      // 40% rounds concentration, 25% top-100 count, 20% top-10 presence, 15% course count
      const roundsScore = Math.min(100, totalRounds / 800)
      const top100Score = Math.min(100, top100 * 12)
      const top10Score = Math.min(100, top10 * 25)
      const countScore = Math.min(100, matching.length * 10)
      const siteScore = Math.round(roundsScore * 0.4 + top100Score * 0.25 + top10Score * 0.2 + countScore * 0.15)
      return { ...r, courses: matching, totalRounds, top10, top50, top100, siteScore }
    }).sort((a, b) => b.siteScore - a.siteScore)

    const top = Object.values(byState).sort((a, b) => b.totalRounds - a.totalRounds).slice(0, 10)

    const global = {
      totalCourses: courses.length,
      totalRounds: courses.reduce((s, c) => s + (c.totalRounds || 0), 0),
      avgRounds: Math.round(courses.reduce((s, c) => s + (c.totalRounds || 0), 0) / courses.length),
      states: Object.keys(byState).length,
      private: courses.filter(c => c.access === 'Private').length,
      resort: courses.filter(c => c.access === 'Resort').length,
      public: courses.filter(c => c.access === 'Public').length,
    }

    return { stateStats: byState, regionStats: regions, topStates: top, globalStats: global }
  }, [courses])

  // Filtered + sorted table
  const displayCourses = useMemo(() => {
    let list = [...courses]
    if (accessFilter !== 'All') list = list.filter(c => c.access === accessFilter)
    if (stateFilter !== 'All') list = list.filter(c => c.state === stateFilter)
    if (selectedState) list = list.filter(c => c.state === selectedState)
    list.sort((a, b) => {
      if (sortBy === 'totalRounds') return (b.totalRounds || 0) - (a.totalRounds || 0)
      if (sortBy === 'rank') return a.rank - b.rank
      if (sortBy === 'playableDays') return (b.playableDays || 0) - (a.playableDays || 0)
      return 0
    })
    return list.slice(0, 100)
  }, [courses, accessFilter, stateFilter, sortBy, selectedState])

  // Max values for heatmap
  const maxStateRounds = Math.max(...Object.values(stateStats).map(s => s.totalRounds))

  function getStateColor(state) {
    const s = stateStats[state]
    if (!s) return '#3d4a37'
    const intensity = s.totalRounds / maxStateRounds
    const r = Math.round(74 + (196 - 74) * intensity)
    const g = Math.round(103 + (169 - 103) * intensity)
    const b = Math.round(65 + (125 - 65) * intensity)
    return `rgb(${r},${g},${b})`
  }

  const filteredRegions = selectedRegion ? [selectedRegion] : regionStats

  return (
    <div className="site-selection">
      <div className="site-selection__hero">
        <div className="site-selection__hero-inner">
          <span className="site-selection__label">SITE SELECTION ANALYSIS</span>
          <h1 className="site-selection__title">Where Will The Next Golf House Open?</h1>
          <p className="site-selection__subtitle">
            Rounds concentration analysis across America's top 300 courses — identifying the strongest metropolitan clusters for the next Golf House property.
          </p>

          <div className="site-selection__stats">
            <div className="stat-card">
              <div className="stat-card__value">{fmt(globalStats.totalCourses)}</div>
              <div className="stat-card__label">Top Courses Analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{fmt(globalStats.totalRounds)}</div>
              <div className="stat-card__label">Total Rounds / Year</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{globalStats.states}</div>
              <div className="stat-card__label">States Represented</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{fmt(globalStats.avgRounds)}</div>
              <div className="stat-card__label">Avg Rounds / Course</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map + Top Regions */}
      <section className="site-section">
        <div className="site-section__inner">
          <div className="site-section__head">
            <span className="section-label">ROUNDS CONCENTRATION MAP</span>
            <h2 className="section-title">The Heatmap</h2>
            <div className="gold-line" />
            <p className="section-desc">
              Bubble size reflects total rounds per year at top-ranked courses in each state.
              Hover over a state to see details. Click to filter courses.
            </p>
          </div>

          <div className="map-wrap">
            <svg viewBox="0 0 960 600" className="us-map" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="bubbleGlow" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#C4A97D" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#C4A97D" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#C4A97D" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="topRegionGlow" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#C4A97D" stopOpacity="1" />
                  <stop offset="100%" stopColor="#C4A97D" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* State bubbles */}
              {Object.entries(stateStats).map(([state, s]) => {
                const coord = STATE_COORDS[state]
                if (!coord) return null
                const size = 5 + (s.totalRounds / maxStateRounds) * 35
                const isSelected = selectedState === state
                return (
                  <g key={state} className="map-state" onClick={() => setSelectedState(selectedState === state ? null : state)} style={{ cursor: 'pointer' }}>
                    <circle cx={coord[0]} cy={coord[1]} r={size + 8} fill="url(#bubbleGlow)" opacity={isSelected ? 1 : 0.6} />
                    <circle cx={coord[0]} cy={coord[1]} r={size} fill={isSelected ? '#C4A97D' : '#6B7F6A'} stroke="#C4A97D" strokeWidth={isSelected ? 2 : 1} opacity="0.85" />
                    <text x={coord[0]} y={coord[1]} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill="#F5F0E8" style={{ pointerEvents: 'none' }}>{state}</text>
                    <text x={coord[0]} y={coord[1] + size + 12} textAnchor="middle" fontSize="9" fill="#C4A97D" style={{ pointerEvents: 'none' }}>{s.count}</text>
                  </g>
                )
              })}

              {/* Top regions overlay (diamond markers) */}
              {regionStats.slice(0, 5).map((r, i) => (
                <g key={r.name} onClick={() => setSelectedRegion(selectedRegion?.name === r.name ? null : r)} style={{ cursor: 'pointer' }}>
                  <circle cx={r.lat} cy={r.lng} r="14" fill="url(#topRegionGlow)" />
                  <polygon points={`${r.lat},${r.lng - 8} ${r.lat + 8},${r.lng} ${r.lat},${r.lng + 8} ${r.lat - 8},${r.lng}`} fill="#C4A97D" stroke="#2B3529" strokeWidth="1.5" />
                  <text x={r.lat} y={r.lng - 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="#C4A97D">#{i + 1}</text>
                </g>
              ))}
            </svg>

            <div className="map-legend">
              <div className="legend-row"><span className="legend-dot" style={{ background: '#6B7F6A' }} /> State Course Cluster</div>
              <div className="legend-row"><span className="legend-diamond" /> Top 5 Target Regions</div>
              <div className="legend-scale">
                <span>Fewer rounds</span>
                <div className="scale-gradient" />
                <span>More rounds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Target Regions */}
      <section className="site-section site-section--dark">
        <div className="site-section__inner">
          <div className="site-section__head">
            <span className="section-label">TOP OPPORTUNITIES</span>
            <h2 className="section-title">Ranked Target Regions</h2>
            <div className="gold-line" />
            <p className="section-desc">
              Each region scored on rounds density, top-100 course count, flagship presence, and overall course count.
            </p>
          </div>

          <div className="regions-grid">
            {filteredRegions.slice(0, 12).map((r, i) => (
              <div key={r.name} className={`region-card ${i < 3 ? 'region-card--top' : ''}`} onClick={() => setSelectedRegion(selectedRegion?.name === r.name ? null : r)}>
                <div className="region-card__head">
                  <div className="region-card__rank">#{i + 1}</div>
                  <div className="region-card__score">
                    <div className="region-card__score-value">{r.siteScore}</div>
                    <div className="region-card__score-label">SITE SCORE</div>
                  </div>
                </div>
                <h3 className="region-card__name">{r.name}</h3>
                <div className="region-card__state">{STATE_NAMES[r.state]}</div>
                <div className="region-card__metrics">
                  <div className="region-metric">
                    <div className="region-metric__value">{r.courses.length}</div>
                    <div className="region-metric__label">Top Courses</div>
                  </div>
                  <div className="region-metric">
                    <div className="region-metric__value">{fmt(r.totalRounds)}</div>
                    <div className="region-metric__label">Rounds / Yr</div>
                  </div>
                  <div className="region-metric">
                    <div className="region-metric__value">{r.top100}</div>
                    <div className="region-metric__label">Top 100</div>
                  </div>
                  <div className="region-metric">
                    <div className="region-metric__value">{r.top10}</div>
                    <div className="region-metric__label">Top 10</div>
                  </div>
                </div>
                <div className="region-card__bar">
                  <div className="region-card__bar-fill" style={{ width: `${r.siteScore}%` }} />
                </div>
                <div className="region-card__cities">
                  {r.cities.slice(0, 4).map(c => <span key={c} className="city-chip">{c}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* State Rankings */}
      <section className="site-section">
        <div className="site-section__inner">
          <div className="site-section__head">
            <span className="section-label">BY STATE</span>
            <h2 className="section-title">Rounds Concentration by State</h2>
            <div className="gold-line" />
          </div>

          <div className="state-bars">
            {topStates.map((s, i) => (
              <div key={s.state} className="state-bar" onClick={() => setSelectedState(selectedState === s.state ? null : s.state)}>
                <div className="state-bar__rank">{i + 1}</div>
                <div className="state-bar__name">{STATE_NAMES[s.state]} <span className="state-bar__abbr">{s.state}</span></div>
                <div className="state-bar__track">
                  <div className="state-bar__fill" style={{ width: `${(s.totalRounds / topStates[0].totalRounds) * 100}%` }}>
                    <span className="state-bar__value">{fmt(s.totalRounds)} rounds/yr</span>
                  </div>
                </div>
                <div className="state-bar__meta">
                  <span>{s.count} courses</span>
                  <span className="state-bar__access">
                    <span title="Private" style={{ color: '#8B6F4E' }}>{s.private}P</span>
                    {' · '}
                    <span title="Resort" style={{ color: '#C4A97D' }}>{s.resort}R</span>
                    {' · '}
                    <span title="Public" style={{ color: '#6B7F6A' }}>{s.public + s.semi}Pb</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Table */}
      <section className="site-section site-section--dark">
        <div className="site-section__inner">
          <div className="site-section__head">
            <span className="section-label">COURSE EXPLORER</span>
            <h2 className="section-title">Filter & Explore</h2>
            <div className="gold-line" />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Access</label>
              <select value={accessFilter} onChange={e => setAccessFilter(e.target.value)}>
                <option>All</option>
                <option>Private</option>
                <option>Resort</option>
                <option>Public</option>
                <option>Semi-Private</option>
              </select>
            </div>
            <div className="filter-group">
              <label>State</label>
              <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
                <option>All</option>
                {Object.keys(stateStats).sort().map(s => <option key={s} value={s}>{s} — {STATE_NAMES[s]}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="totalRounds">Total Rounds / Yr</option>
                <option value="rank">Course Rank</option>
                <option value="playableDays">Playable Days / Yr</option>
              </select>
            </div>
            {(selectedState || selectedRegion) && (
              <button className="filter-reset" onClick={() => { setSelectedState(null); setSelectedRegion(null) }}>
                Clear Map Selection
              </button>
            )}
          </div>

          {selectedState && (
            <div className="filter-notice">
              Showing courses in <strong>{STATE_NAMES[selectedState]}</strong> — {stateStats[selectedState].count} courses,
              {' '}{fmt(stateStats[selectedState].totalRounds)} rounds/year
            </div>
          )}

          <div className="course-table-wrap">
            <table className="course-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Access</th>
                  <th className="num">Days/Yr</th>
                  <th className="num">Rounds/Yr</th>
                </tr>
              </thead>
              <tbody>
                {displayCourses.map(c => (
                  <tr key={c.rank}>
                    <td className="rank-cell">{c.rank}</td>
                    <td className="course-cell">
                      <div className="course-name">{c.course}</div>
                      {c.notes && <div className="course-note">{c.notes}</div>}
                    </td>
                    <td>{c.city}</td>
                    <td><span className="state-pill">{c.state}</span></td>
                    <td><span className={`access-pill access-pill--${c.access?.toLowerCase().replace('-', '')}`}>{c.access}</span></td>
                    <td className="num">{c.playableDays}</td>
                    <td className="num rounds-cell">{fmt(c.totalRounds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayCourses.length >= 100 && (
              <div className="table-footer">Showing top 100 of {courses.length} — narrow filters to see more.</div>
            )}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="site-section">
        <div className="site-section__inner methodology">
          <span className="section-label">METHODOLOGY</span>
          <h2 className="section-title">How Site Score Is Calculated</h2>
          <div className="gold-line" />
          <div className="methodology-grid">
            <div className="methodology-item">
              <div className="methodology-item__weight">40%</div>
              <h4>Rounds Concentration</h4>
              <p>Total annual rounds played across all top-300 courses in the metro cluster. Higher rounds = more golf demand to capture.</p>
            </div>
            <div className="methodology-item">
              <div className="methodology-item__weight">25%</div>
              <h4>Top-100 Presence</h4>
              <p>Number of top-100 ranked courses in the region. Flagship courses drive destination travel.</p>
            </div>
            <div className="methodology-item">
              <div className="methodology-item__weight">20%</div>
              <h4>Elite Anchors</h4>
              <p>Top-10 course presence signals that the region is a pilgrimage destination for serious golfers.</p>
            </div>
            <div className="methodology-item">
              <div className="methodology-item__weight">15%</div>
              <h4>Course Density</h4>
              <p>Total number of top-300 courses — a richer cluster supports longer stays and multi-course itineraries.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
