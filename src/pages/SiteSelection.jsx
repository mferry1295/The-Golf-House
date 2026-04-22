import { useState, useMemo } from 'react'
import coursesData from '../data/courses.json'
import usStates from '../data/us-states.json'
import './SiteSelection.css'

// Real state centroids from d3 Albers USA projection (960x600 viewBox)
const STATE_COORDS = usStates.centroids
const STATE_PATHS = usStates.paths

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
// Coordinates derived from d3 Albers USA projection (960x600) with small city-specific offsets from state centroids
const REGIONS = [
  { name: 'Sandhills / Pinehurst', state: 'NC', cities: ['Pinehurst', 'Southern Pines', 'Aberdeen'] },
  { name: 'Monterey Peninsula', state: 'CA', cities: ['Pebble Beach', 'Carmel', 'Monterey'], dx: 20, dy: 40 },
  { name: 'Long Island', state: 'NY', cities: ['Southampton', 'East Hampton', 'Fishers Island', 'Baiting Hollow'], dx: 40, dy: 40 },
  { name: 'Philadelphia Main Line', state: 'PA', cities: ['Ardmore', 'Gladwyne', 'Haverford', 'Bryn Mawr'], dx: 30, dy: 15 },
  { name: 'Chicago North Shore', state: 'IL', cities: ['Wheaton', 'Lake Forest', 'Glenview', 'Highland Park'], dx: -15, dy: -25 },
  { name: 'Pittsburgh Metro', state: 'PA', cities: ['Oakmont', 'Pittsburgh', 'Fox Chapel'], dx: -25, dy: 0 },
  { name: 'Palm Beach / Jupiter', state: 'FL', cities: ['Juno Beach', 'Hobe Sound', 'Jupiter', 'West Palm Beach'], dx: 10, dy: 0 },
  { name: 'Bandon Coast', state: 'OR', cities: ['Bandon'], dx: -30, dy: 20 },
  { name: 'Scottsdale / Phoenix', state: 'AZ', cities: ['Scottsdale', 'Phoenix', 'Paradise Valley'] },
  { name: 'Coachella Valley', state: 'CA', cities: ['La Quinta', 'Palm Springs', 'Rancho Mirage', 'Indian Wells'], dx: 50, dy: 70 },
  { name: 'Hilton Head / Lowcountry', state: 'SC', cities: ['Hilton Head Island', 'Bluffton', 'Kiawah Island'], dx: 20, dy: 20 },
  { name: 'Napa / Sonoma', state: 'CA', cities: ['Napa', 'Sonoma', 'Santa Rosa'], dx: -15, dy: -30 },
  { name: 'Boston North Shore', state: 'MA', cities: ['Brookline', 'Newton', 'Manchester-by-the-Sea'] },
  { name: 'Westchester', state: 'NY', cities: ['Mamaroneck', 'Scarsdale', 'Rye', 'Purchase'], dx: 30, dy: 30 },
  { name: 'Hamptons East End', state: 'NY', cities: ['Montauk', 'Bridgehampton', 'Sagaponack'], dx: 55, dy: 35 },
  { name: 'Traverse City', state: 'MI', cities: ['Frankfort', 'Traverse City', 'Bellaire'], dx: -10, dy: -30 },
  { name: 'Austin / Hill Country', state: 'TX', cities: ['Austin', 'Horseshoe Bay', 'Spicewood'], dx: 15, dy: 30 },
  { name: 'Dallas–Fort Worth', state: 'TX', cities: ['Dallas', 'Fort Worth', 'Frisco'], dx: 20, dy: -10 },
  { name: 'Naples / Bonita Springs', state: 'FL', cities: ['Naples', 'Bonita Springs', 'Estero'], dx: -10, dy: 20 },
  { name: 'Atlanta Metro', state: 'GA', cities: ['Atlanta', 'Duluth', 'Johns Creek', 'Alpharetta'], dx: -5, dy: -10 }
].map(r => {
  const c = STATE_COORDS[r.state] || [480, 300]
  return { ...r, lat: c[0] + (r.dx || 0), lng: c[1] + (r.dy || 0) }
})

function fmt(n) {
  if (n == null) return '—'
  return n.toLocaleString()
}

const DEFAULT_WEIGHTS = { rounds: 40, top100: 25, top10: 20, count: 15 }

export default function SiteSelection() {
  const [accessFilter, setAccessFilter] = useState('All')
  const [stateFilter, setStateFilter] = useState('All')
  const [sortBy, setSortBy] = useState('totalRounds')
  const [selectedState, setSelectedState] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS)

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

    // Normalize weights so they sum to 1 (handles user-entered values that don't total 100)
    const wSum = Math.max(1, weights.rounds + weights.top100 + weights.top10 + weights.count)
    const wRounds = weights.rounds / wSum
    const wTop100 = weights.top100 / wSum
    const wTop10 = weights.top10 / wSum
    const wCount = weights.count / wSum

    const regions = REGIONS.map(r => {
      const matching = courses.filter(c => c.state === r.state && r.cities.some(city => c.city && c.city.toLowerCase().includes(city.toLowerCase())))
      const totalRounds = matching.reduce((s, c) => s + (c.totalRounds || 0), 0)
      const top10 = matching.filter(c => c.rank <= 10).length
      const top50 = matching.filter(c => c.rank <= 50).length
      const top100 = matching.filter(c => c.rank <= 100).length
      // Each sub-score normalized to 0-100
      const roundsScore = Math.min(100, totalRounds / 800)
      const top100Score = Math.min(100, top100 * 12)
      const top10Score = Math.min(100, top10 * 25)
      const countScore = Math.min(100, matching.length * 10)
      const siteScore = Math.round(roundsScore * wRounds + top100Score * wTop100 + top10Score * wTop10 + countScore * wCount)
      return { ...r, courses: matching, totalRounds, top10, top50, top100, siteScore, subScores: { rounds: Math.round(roundsScore), top100: Math.round(top100Score), top10: Math.round(top10Score), count: Math.round(countScore) } }
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
  }, [courses, weights])

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
          <h1 className="site-selection__title">Where Will The Next Albatross Club Open?</h1>
          <p className="site-selection__subtitle">
            Rounds concentration analysis across America's top 300 courses — identifying the strongest metropolitan clusters for the next Albatross Club property.
          </p>
        </div>
      </div>

      {/* Model Inputs — adjust weights to re-run scoring */}
      <section className="site-section">
        <div className="site-section__inner">
          <div className="site-section__head">
            <span className="section-label">MODEL INPUTS</span>
            <h2 className="section-title">Tune The Scoring Model</h2>
            <div className="gold-line" />
            <p className="section-desc">
              Adjust the weight of each factor below to re-rank target regions based on your investment thesis.
            </p>
          </div>
          <WeightPanel weights={weights} setWeights={setWeights} defaults={DEFAULT_WEIGHTS} />
        </div>
      </section>

      {/* Top Target Regions — reacts to weight changes */}
      <section className="site-section site-section--dark">
        <div className="site-section__inner">
          <div className="site-section__head">
            <span className="section-label">TOP OPPORTUNITIES</span>
            <h2 className="section-title">Ranked Target Regions</h2>
            <div className="gold-line" />
            <p className="section-desc">
              Live ranking based on your weights above. Higher score = stronger fit for the next Albatross Club.
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

      {/* Heatmap — second */}
      <section className="site-section">
        <div className="site-section__inner">
          <div className="site-section__head">
            <span className="section-label">ROUNDS CONCENTRATION MAP</span>
            <h2 className="section-title">The Heatmap</h2>
            <div className="gold-line" />
            <p className="section-desc">
              Bubble size reflects total rounds per year at top-ranked courses in each state.
              Click a state on the map to filter the course list below.
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

              {/* US state outlines */}
              <g className="us-map__states">
                {Object.entries(STATE_PATHS).map(([abbr, d]) => {
                  const hasData = stateStats[abbr]
                  const isSelected = selectedState === abbr
                  const fill = hasData ? getStateColor(abbr) : '#3a473a'
                  return (
                    <path
                      key={abbr}
                      d={d}
                      fill={fill}
                      fillOpacity={isSelected ? 0.85 : 0.55}
                      stroke="#5a6b54"
                      strokeWidth={isSelected ? 1.5 : 0.6}
                      style={{ cursor: hasData ? 'pointer' : 'default', transition: 'fill-opacity 0.2s' }}
                      onClick={() => hasData && setSelectedState(selectedState === abbr ? null : abbr)}
                    />
                  )
                })}
              </g>

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

      {/* Filter & Explore — driven by map selection */}
      <section className="site-section site-section--dark">
        <div className="site-section__inner">
          <div className="site-section__head">
            <span className="section-label">COURSE EXPLORER</span>
            <h2 className="section-title">Filter & Explore</h2>
            <div className="gold-line" />
            <p className="section-desc">
              {selectedState
                ? `Showing top courses in ${STATE_NAMES[selectedState]}.`
                : 'Click a state on the map above to narrow the list, or filter manually below.'}
            </p>
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

    </div>
  )
}

function WeightPanel({ weights, setWeights, defaults }) {
  const sum = weights.rounds + weights.top100 + weights.top10 + weights.count
  const factors = [
    { key: 'rounds', label: 'Rounds Concentration', desc: 'Annual rounds played across the metro. Higher rounds = more demand to capture.' },
    { key: 'top100', label: 'Top-100 Presence', desc: 'Number of top-100 courses. Flagship courses drive destination travel.' },
    { key: 'top10', label: 'Elite Anchors', desc: 'Top-10 course presence. Signals a pilgrimage destination.' },
    { key: 'count', label: 'Course Density', desc: 'Total top-300 courses. Richer cluster supports longer stays.' }
  ]

  const update = (key, value) => setWeights(prev => ({ ...prev, [key]: value }))
  const reset = () => setWeights(defaults)

  return (
    <div className="weight-panel">
      <div className="weight-grid">
        {factors.map(f => {
          const pct = sum > 0 ? Math.round((weights[f.key] / sum) * 100) : 0
          return (
            <div key={f.key} className="weight-card">
              <div className="weight-card__head">
                <div>
                  <div className="weight-card__label">{f.label}</div>
                  <p className="weight-card__desc">{f.desc}</p>
                </div>
                <div className="weight-card__value">{pct}%</div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={weights[f.key]}
                onChange={e => update(f.key, parseInt(e.target.value))}
                className="weight-slider"
                style={{ '--pct': `${weights[f.key]}%` }}
              />
            </div>
          )
        })}
      </div>

      <div className="weight-footer">
        <div className="weight-footer__total">
          Raw total: <strong>{sum}</strong>
          <span className="weight-footer__note">{sum === 100 ? 'Balanced' : 'Auto-normalized to 100%'}</span>
        </div>
        <button className="weight-reset" onClick={reset}>Reset to defaults</button>
      </div>
    </div>
  )
}
