import { useState, useMemo } from 'react'
import coursesData from '../data/courses.json'
import usStates from '../data/us-states.json'
import zipCoords from '../data/zip-coords.json'
import './SiteSelection.css'

// Real state centroids from d3 Albers USA projection (960x600 viewBox)
const STATE_COORDS = usStates.centroids
const STATE_PATHS = usStates.paths
const STATE_BBOXES = usStates.bboxes || {}

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

const DEFAULT_WEIGHTS = { rounds: 30, count: 20, lodging: 20, build: 15, operate: 15 }

export default function SiteSelection() {
  const [accessFilter, setAccessFilter] = useState('All')
  const [stateFilter, setStateFilter] = useState('All')
  const [sortBy, setSortBy] = useState('totalRounds')
  const [selectedState, setSelectedState] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS)
  const [mapZoom, setMapZoom] = useState(1)
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 })

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
    const wSum = Math.max(1, weights.rounds + weights.count + weights.lodging + weights.build + weights.operate)
    const wRounds = weights.rounds / wSum
    const wCount = weights.count / wSum
    const wLodging = weights.lodging / wSum
    const wBuild = weights.build / wSum
    const wOperate = weights.operate / wSum

    // Pass 1: compute raw metrics for every region
    const rawRegions = REGIONS.map(r => {
      const matching = courses.filter(c => c.state === r.state && r.cities.some(city => c.city && c.city.toLowerCase().includes(city.toLowerCase())))
      const totalRounds = matching.reduce((s, c) => s + (c.totalRounds || 0), 0)
      const top10 = matching.filter(c => c.rank <= 10).length
      const top50 = matching.filter(c => c.rank <= 50).length
      const top100 = matching.filter(c => c.rank <= 100).length
      const avgLodging = matching.length ? Math.round(matching.reduce((s, c) => s + (c.lodgingRate || 0), 0) / matching.length) : 0
      const avgSeasonality = matching.length ? matching.reduce((s, c) => s + (c.seasonality || 0), 0) / matching.length : 0
      const avgYearOpened = matching.length ? Math.round(matching.reduce((s, c) => s + (c.yearOpened || 0), 0) / matching.length) : 0
      const avgAdditionalSpend = matching.length ? Math.round(matching.reduce((s, c) => s + (c.additionalSpend || 0), 0) / matching.length) : 0
      const avgBuildCost = matching.length ? Math.round((matching.reduce((s, c) => s + (c.buildCost || 0), 0) / matching.length) * 10) / 10 : 0
      const avgOperateCost = matching.length ? Math.round((matching.reduce((s, c) => s + (c.operateCost || 0), 0) / matching.length) * 10) / 10 : 0
      return { ...r, courses: matching, totalRounds, top10, top50, top100, avgLodging, avgSeasonality, avgYearOpened, avgAdditionalSpend, avgBuildCost, avgOperateCost }
    })

    // Pass 2: normalize each sub-score to 0–100 relative to the top region on that factor
    // (min-max with floor at 0 — "best in class" always = 100)
    const maxRounds = Math.max(1, ...rawRegions.map(r => r.totalRounds))
    const maxCount = Math.max(1, ...rawRegions.map(r => r.courses.length))
    const maxLodging = Math.max(1, ...rawRegions.map(r => r.avgLodging))
    // For cost factors: min-max with inversion (lower cost = higher score)
    const buildCosts = rawRegions.map(r => r.avgBuildCost).filter(v => v > 0)
    const operateCosts = rawRegions.map(r => r.avgOperateCost).filter(v => v > 0)
    const minBuild = Math.min(...buildCosts, 10), maxBuild = Math.max(...buildCosts, 1)
    const minOperate = Math.min(...operateCosts, 10), maxOperate = Math.max(...operateCosts, 1)
    const buildRange = Math.max(0.1, maxBuild - minBuild)
    const operateRange = Math.max(0.1, maxOperate - minOperate)

    const scored = rawRegions.map(r => {
      const roundsScore = (r.totalRounds / maxRounds) * 100
      const countScore = (r.courses.length / maxCount) * 100
      const lodgingScore = (r.avgLodging / maxLodging) * 100
      // Inverted cost scores: cheapest region = 100, most expensive = 0
      const buildScore = r.avgBuildCost > 0 ? ((maxBuild - r.avgBuildCost) / buildRange) * 100 : 0
      const operateScore = r.avgOperateCost > 0 ? ((maxOperate - r.avgOperateCost) / operateRange) * 100 : 0

      const siteScore = Math.round(
        roundsScore * wRounds +
        countScore * wCount +
        lodgingScore * wLodging +
        buildScore * wBuild +
        operateScore * wOperate
      )
      return {
        ...r,
        siteScore,
        subScores: {
          rounds: Math.round(roundsScore),
          count: Math.round(countScore),
          lodging: Math.round(lodgingScore),
          build: Math.round(buildScore),
          operate: Math.round(operateScore),
        }
      }
    })
    // Sort by site score and attach a stable rank
    const regions = scored
      .sort((a, b) => b.siteScore - a.siteScore)
      .map((r, i) => ({ ...r, rank: i + 1 }))

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
      if (sortBy === 'lodgingRate') return (b.lodgingRate || 0) - (a.lodgingRate || 0)
      if (sortBy === 'yearOpened') return (b.yearOpened || 0) - (a.yearOpened || 0)
      if (sortBy === 'yearOpenedAsc') return (a.yearOpened || 9999) - (b.yearOpened || 9999)
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
      <div className="site-selection__hero site-selection__hero--slim">
        <div className="site-selection__hero-inner">
          <h1 className="site-selection__label-heading">Site Selection Analysis</h1>
        </div>
      </div>

      {/* Combined: weights → cards → map, all on cream bg */}
      <section className="site-section">
        <div className="site-section__inner">
          <WeightPanel weights={weights} setWeights={setWeights} defaults={DEFAULT_WEIGHTS} />

          <div className="regions-grid">
            {filteredRegions.slice(0, 12).map(r => {
              const isExpanded = selectedRegion?.name === r.name
              return (
              <div key={r.name} className={`region-card ${r.rank <= 3 ? 'region-card--top' : ''} ${isExpanded ? 'region-card--expanded' : ''}`} onClick={() => setSelectedRegion(isExpanded ? null : r)}>
                <div className="region-card__head">
                  <div className="region-card__rank">#{r.rank}</div>
                  <div className="region-card__score">
                    <div className="region-card__score-value">{r.siteScore}</div>
                    <div className="region-card__score-label">SITE SCORE</div>
                  </div>
                </div>
                <h3 className="region-card__name">{r.name}</h3>
                <div className="region-card__state">{STATE_NAMES[r.state]}</div>

                {/* Score breakdown aligned to the 5 model inputs */}
                <div className="score-breakdown">
                  <div className="score-breakdown__title">SCORE BREAKDOWN</div>
                  {[
                    { key: 'rounds', label: 'Rounds', weight: weights.rounds },
                    { key: 'count', label: 'Top-300 Density', weight: weights.count },
                    { key: 'lodging', label: 'Lodging ADR', weight: weights.lodging },
                    { key: 'build', label: 'Build Cost', weight: weights.build },
                    { key: 'operate', label: 'Operate Cost', weight: weights.operate },
                  ].map(f => {
                    const sub = r.subScores[f.key]
                    const wSum = weights.rounds + weights.count + weights.lodging + weights.build + weights.operate
                    const wPct = wSum ? Math.round((f.weight / wSum) * 100) : 0
                    const contribution = Math.round((sub * f.weight) / (wSum || 1))
                    return (
                      <div key={f.key} className="score-row">
                        <span className="score-row__label">{f.label}</span>
                        <span className="score-row__weight">{wPct}%</span>
                        <div className="score-row__bar">
                          <div className="score-row__bar-fill" style={{ width: `${sub}%` }} />
                        </div>
                        <span className="score-row__value">{sub}</span>
                        <span className="score-row__contrib">+{contribution}</span>
                      </div>
                    )
                  })}
                </div>

                {isExpanded && (
                  <div className="region-card__expanded" onClick={e => e.stopPropagation()}>
                    <div className="region-card__metrics">
                      <div className="region-metric">
                        <div className="region-metric__label">Total Rounds</div>
                        <div className="region-metric__value">{fmt(r.totalRounds)}</div>
                        <div className="region-metric__sub">/ year</div>
                      </div>
                      <div className="region-metric">
                        <div className="region-metric__label">Courses</div>
                        <div className="region-metric__value">{r.courses.length}</div>
                        <div className="region-metric__sub">in top 300</div>
                      </div>
                      <div className="region-metric">
                        <div className="region-metric__label">Top 100</div>
                        <div className="region-metric__value">{r.top100}</div>
                        <div className="region-metric__sub">ranked courses</div>
                      </div>
                      <div className="region-metric">
                        <div className="region-metric__label">Avg Lodging</div>
                        <div className="region-metric__value">${fmt(r.avgLodging)}</div>
                        <div className="region-metric__sub">nightly ADR</div>
                      </div>
                      <div className="region-metric">
                        <div className="region-metric__label">Build Cost</div>
                        <div className="region-metric__value">${(r.avgBuildCost || 0).toFixed(1)}M</div>
                        <div className="region-metric__sub">per cabin</div>
                      </div>
                      <div className="region-metric">
                        <div className="region-metric__label">Operate Cost</div>
                        <div className="region-metric__value">{r.avgOperateCost}%</div>
                        <div className="region-metric__sub">of revenue</div>
                      </div>
                    </div>

                    <div className="region-card__courses">
                      <div className="region-card__courses-title">
                        CONTRIBUTING COURSES <span className="region-card__courses-count">({r.courses.length})</span>
                      </div>
                      <div className="region-card__course-list">
                        {r.courses
                          .slice()
                          .sort((a, b) => (a.rank || 9999) - (b.rank || 9999))
                          .map(c => (
                            <div key={`${c.rank}-${c.course}`} className="region-course-row">
                              <span className="region-course-row__rank">#{c.rank || '—'}</span>
                              <div className="region-course-row__name-col">
                                <div className="region-course-row__name">{c.course}</div>
                                <div className="region-course-row__designer">
                                  {[c.resort, c.designer].filter(Boolean).join(' · ')}
                                </div>
                              </div>
                              <div className="region-course-row__meta">
                                <span className={`region-course-row__access region-course-row__access--${(c.access || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                  {c.access || '—'}
                                </span>
                                <span className="region-course-row__rounds">{fmt(c.totalRounds)} rds/yr</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <button className="region-card__close" onClick={() => setSelectedRegion(null)}>
                      Collapse ×
                    </button>
                  </div>
                )}

              </div>
              )
            })}
          </div>

          {/* Heatmap follows directly below the cards */}
          {(() => {
            // Dynamic viewBox - state bbox + user manual zoom + user pan
            let baseX = 0, baseY = 0, baseW = 960, baseH = 600
            if (selectedState && STATE_BBOXES[selectedState]) {
              const bb = STATE_BBOXES[selectedState]
              const pad = Math.max(bb.w, bb.h) * 0.15
              baseX = Math.max(0, bb.x - pad)
              baseY = Math.max(0, bb.y - pad)
              baseW = Math.min(960 - baseX, bb.w + pad * 2)
              baseH = Math.min(600 - baseY, bb.h + pad * 2)
            }
            const zoomedW = baseW / mapZoom
            const zoomedH = baseH / mapZoom
            const cx = baseX + baseW / 2 + mapPan.x
            const cy = baseY + baseH / 2 + mapPan.y
            const vbX = cx - zoomedW / 2
            const vbY = cy - zoomedH / 2
            const vb = `${vbX} ${vbY} ${zoomedW} ${zoomedH}`
            const zoomScale = zoomedW / 960

            const coursesInState = selectedState
              ? courses.filter(c => c.state === selectedState && zipCoords[c.zipCode])
              : []

            // Cluster overlapping pins. Group pins within proximity threshold,
            // then spread them in a spiral so nothing overlaps.
            const clusterThreshold = Math.max(3, 7 * zoomScale)
            const pinRadius = Math.max(4, 6 * zoomScale)
            const clusters = []
            for (const c of coursesInState) {
              const [x, y] = zipCoords[c.zipCode]
              const existing = clusters.find(g => Math.hypot(g.anchorX - x, g.anchorY - y) < clusterThreshold)
              if (existing) {
                existing.items.push({ c, baseX: x, baseY: y })
              } else {
                clusters.push({ anchorX: x, anchorY: y, items: [{ c, baseX: x, baseY: y }] })
              }
            }
            // Compute final pin positions with spiral offset for multi-pin clusters
            const placedPins = []
            for (const cluster of clusters) {
              const n = cluster.items.length
              cluster.items.forEach((item, i) => {
                let px = item.baseX, py = item.baseY
                if (n > 1) {
                  const ringSpacing = pinRadius * 2.2
                  // Place in concentric rings, 6 per ring
                  const ring = Math.ceil((Math.sqrt(1 + 8 * (i + 1)) - 1) / 2) || 1
                  const perRing = ring * 6
                  const ringStart = ring === 1 ? 0 : 3 * ring * (ring - 1)
                  const posInRing = i - ringStart
                  const angle = (posInRing / perRing) * Math.PI * 2
                  const r = ring * ringSpacing
                  px = cluster.anchorX + Math.cos(angle) * r
                  py = cluster.anchorY + Math.sin(angle) * r
                }
                placedPins.push({ c: item.c, x: px, y: py, anchor: { x: cluster.anchorX, y: cluster.anchorY }, clustered: n > 1 })
              })
            }

            return (
              <div className="map-wrap">
                <svg viewBox={vb} className="us-map" preserveAspectRatio="xMidYMid meet" style={{ transition: 'all 0.5s ease' }}>
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
                          fillOpacity={isSelected ? 0.95 : selectedState ? 0.3 : 0.55}
                          stroke={isSelected ? '#C4A97D' : '#5a6b54'}
                          strokeWidth={(isSelected ? 1.5 : 0.6) * zoomScale}
                          style={{ cursor: hasData ? 'pointer' : 'default', transition: 'fill-opacity 0.3s' }}
                          onClick={() => {
                            if (!hasData) return
                            setSelectedState(selectedState === abbr ? null : abbr)
                            setSelectedCourse(null)
                            setMapZoom(1); setMapPan({ x: 0, y: 0 })
                          }}
                        />
                      )
                    })}
                  </g>

                  {/* Top-region rank pins (hidden when zoomed into a state) */}
                  {!selectedState && regionStats.slice(0, 10).map(r => {
                    const isSel = selectedRegion?.name === r.name
                    // First word of region name (e.g. "Sandhills / Pinehurst" -> "Sandhills")
                    const shortName = r.name.split(/[\/,–-]/)[0].trim()
                    const pinR = isSel ? 19 : 17
                    const top3 = r.rank <= 3
                    return (
                      <g key={r.name} onClick={() => setSelectedRegion(isSel ? null : r)} style={{ cursor: 'pointer' }}>
                        <circle cx={r.lat} cy={r.lng} r={pinR + 9} fill="url(#topRegionGlow)" opacity={top3 ? 0.9 : 0.5} />
                        <circle
                          cx={r.lat} cy={r.lng} r={pinR}
                          fill={top3 ? '#C4A97D' : '#4A6741'}
                          stroke={top3 ? '#F5F0E8' : '#C4A97D'}
                          strokeWidth="1.75"
                        />
                        <text
                          x={r.lat} y={r.lng}
                          textAnchor="middle" dominantBaseline="central"
                          fontSize="15" fontWeight="700"
                          fill={top3 ? '#2B3529' : '#F5F0E8'}
                          style={{ pointerEvents: 'none' }}
                        >
                          {r.rank}
                        </text>
                        <text
                          x={r.lat} y={r.lng + pinR + 12}
                          textAnchor="middle"
                          fontSize="9.5" fontWeight="600"
                          fill="#F5F0E8"
                          style={{ pointerEvents: 'none', paintOrder: 'stroke', stroke: '#2B3529', strokeWidth: 2.5, strokeLinejoin: 'round' }}
                        >
                          {shortName}
                        </text>
                      </g>
                    )
                  })}

                  {/* Connector lines from cluster anchor to each spread pin */}
                  {selectedState && placedPins.filter(p => p.clustered).map(p => (
                    <line
                      key={`line-${p.c.rank}`}
                      x1={p.anchor.x} y1={p.anchor.y}
                      x2={p.x} y2={p.y}
                      stroke="#C4A97D" strokeWidth={Math.max(0.4, 0.6 * zoomScale)}
                      opacity="0.25"
                    />
                  ))}

                  {/* Course pins */}
                  {selectedState && placedPins.map(p => {
                    const isSel = selectedCourse?.rank === p.c.rank
                    const r = isSel ? pinRadius * 1.4 : pinRadius
                    const glowR = r + Math.max(2, 3 * zoomScale)
                    return (
                      <g key={p.c.rank} onClick={(e) => { e.stopPropagation(); setSelectedCourse(isSel ? null : p.c) }} style={{ cursor: 'pointer' }}>
                        <circle cx={p.x} cy={p.y} r={glowR} fill="#C4A97D" opacity={isSel ? 0.5 : 0.22} />
                        <circle cx={p.x} cy={p.y} r={r} fill={isSel ? '#C4A97D' : '#4A6741'} stroke="#F5F0E8" strokeWidth={Math.max(1, 1.4 * zoomScale)} />
                      </g>
                    )
                  })}
                </svg>

                {/* Zoom-out button when a state is selected */}
                {selectedState && (
                  <button className="map-zoomout" onClick={() => {
                    setSelectedState(null); setSelectedCourse(null)
                    setMapZoom(1); setMapPan({ x: 0, y: 0 })
                  }}>
                    &#8592; Back to USA
                  </button>
                )}

                {/* Zoom in / out controls */}
                <div className="map-zoom-controls">
                  <button aria-label="Zoom in" onClick={() => setMapZoom(z => Math.min(8, z * 1.35))}>+</button>
                  <button aria-label="Reset zoom" onClick={() => { setMapZoom(1); setMapPan({ x: 0, y: 0 }) }}>
                    {mapZoom.toFixed(1)}×
                  </button>
                  <button aria-label="Zoom out" onClick={() => setMapZoom(z => Math.max(1, z / 1.35))}>−</button>
                </div>

                {/* Course detail popup */}
                {selectedCourse && (
                  <div className="course-popup">
                    <button className="course-popup__close" onClick={() => setSelectedCourse(null)}>&times;</button>
                    <div className="course-popup__rank">#{selectedCourse.rank}</div>
                    <h3 className="course-popup__name">{selectedCourse.course}</h3>
                    <div className="course-popup__loc">{selectedCourse.city}, {selectedCourse.state} {selectedCourse.zipCode}</div>
                    <div className="course-popup__grid">
                      <div><span>Access</span><strong>{selectedCourse.access}</strong></div>
                      <div><span>Designer</span><strong>{selectedCourse.designer || '—'}</strong></div>
                      <div><span>Year Opened</span><strong>{selectedCourse.yearOpened}</strong></div>
                      <div><span>Playable Days</span><strong>{selectedCourse.playableDays}</strong></div>
                      <div><span>Rounds / Yr</span><strong>{fmt(selectedCourse.totalRounds)}</strong></div>
                      <div><span>Lodging / Night</span><strong className="gold">${selectedCourse.lodgingRate}</strong></div>
                      <div><span>Build Cost</span><strong>{selectedCourse.buildCost}/10</strong></div>
                      <div><span>Operate Cost</span><strong>{selectedCourse.operateCost}/10</strong></div>
                    </div>
                  </div>
                )}

                <div className="map-legend">
                  {!selectedState && (<>
                    <div className="legend-row"><span className="legend-dot legend-dot--gold" /> Top 3 Regions</div>
                    <div className="legend-row"><span className="legend-dot" style={{ background: '#4A6741', border: '1.5px solid #C4A97D' }} /> #4–#10 Regions</div>
                    <div className="legend-row legend-row--hint">Click a state to drop course pins</div>
                  </>)}
                  {selectedState && (<>
                    <div className="legend-row"><span className="legend-dot" style={{ background: '#4A6741' }} /> Top Course ({coursesInState.length} in {STATE_NAMES[selectedState]})</div>
                    <div className="legend-row legend-row--hint">Click a pin for course details</div>
                  </>)}
                </div>
              </div>
            )
          })()}
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
                <option value="lodgingRate">Lodging Rate</option>
                <option value="yearOpened">Year Opened (Newest)</option>
                <option value="yearOpenedAsc">Year Opened (Oldest)</option>
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
                  <th>Designer</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Access</th>
                  <th className="num">Est.</th>
                  <th className="num">Days/Yr</th>
                  <th className="num">Rounds/Yr</th>
                  <th className="num">Lodging $/Nt</th>
                  <th className="num">Build</th>
                  <th className="num">Op.</th>
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
                    <td className="designer-cell">{c.designer || '—'}</td>
                    <td>{c.city}</td>
                    <td><span className="state-pill">{c.state}</span></td>
                    <td><span className={`access-pill access-pill--${c.access?.toLowerCase().replace('-', '')}`}>{c.access}</span></td>
                    <td className="num">{c.yearOpened}</td>
                    <td className="num">{c.playableDays}</td>
                    <td className="num rounds-cell">{fmt(c.totalRounds)}</td>
                    <td className="num lodging-cell">${c.lodgingRate}</td>
                    <td className="num cost-cell">{c.buildCost}</td>
                    <td className="num cost-cell">{c.operateCost}</td>
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
  const sum = weights.rounds + weights.count + weights.lodging + weights.build + weights.operate
  const factors = [
    { key: 'rounds', label: 'Rounds', tip: 'Annual rounds played across the metro. Higher rounds = more demand.' },
    { key: 'count', label: 'Top-300 Density', tip: 'Count of top-300 courses in the region. Richer cluster supports longer stays.' },
    { key: 'lodging', label: 'Lodging ADR', tip: 'Avg nightly lodging rate. Proxies pricing power.' },
    { key: 'build', label: 'Build Cost', tip: 'City-tier build cost — inverted so cheaper markets score higher.' },
    { key: 'operate', label: 'Op. Cost', tip: 'State-tier operating cost — inverted so cheaper markets score higher.' }
  ]

  const update = (key, value) => setWeights(prev => ({ ...prev, [key]: value }))
  const reset = () => setWeights(defaults)

  return (
    <div className="weight-panel weight-panel--inline">
      <div className="weight-panel__label">SCORING WEIGHTS</div>
      <div className="weight-row">
        {factors.map(f => {
          const val = weights[f.key]
          const dec = () => update(f.key, Math.max(0, val - 5))
          const inc = () => update(f.key, Math.min(100, val + 5))
          return (
            <div key={f.key} className="weight-chip" title={f.tip}>
              <div className="weight-chip__label">{f.label}</div>
              <div className="weight-chip__stepper">
                <button className="weight-stepper__btn" onClick={dec} disabled={val <= 0} aria-label="Decrease">&#9660;</button>
                <span className="weight-chip__value">{val}%</span>
                <button className="weight-stepper__btn" onClick={inc} disabled={val >= 100} aria-label="Increase">&#9650;</button>
              </div>
            </div>
          )
        })}
        <button className="weight-reset weight-reset--compact" onClick={reset}>Reset</button>
      </div>
    </div>
  )
}
