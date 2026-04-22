import { useState, useMemo } from 'react'
import './FinancialModel.css'

// Scenario presets
const SCENARIOS = {
  base: {
    cabins: 8, guestsPerCabin: 6, nightlyRate: 4300, occupancy: 60,
    fbPerGuest: 450, opCostPct: 58, buildCostPerCabin: 2.5, equityPct: 35,
    debtRate: 7.2, ltv: 65, mgmtFeePct: 6,
    eventsEnabled: true, venueRental: 15000, eventsPerYear: 20, cateringPerEvent: 8000,
    cabinBuyoutRate: 60, venueBuildCost: 1.5,
  },
  bear: {
    cabins: 8, guestsPerCabin: 6, nightlyRate: 3200, occupancy: 45,
    fbPerGuest: 325, opCostPct: 65, buildCostPerCabin: 2.8, equityPct: 35,
    debtRate: 7.2, ltv: 65, mgmtFeePct: 6,
    eventsEnabled: true, venueRental: 10000, eventsPerYear: 10, cateringPerEvent: 6000,
    cabinBuyoutRate: 30, venueBuildCost: 1.5,
  },
  bull: {
    cabins: 8, guestsPerCabin: 6, nightlyRate: 5500, occupancy: 75,
    fbPerGuest: 575, opCostPct: 52, buildCostPerCabin: 2.5, equityPct: 35,
    debtRate: 7.2, ltv: 65, mgmtFeePct: 6,
    eventsEnabled: true, venueRental: 22000, eventsPerYear: 30, cateringPerEvent: 10000,
    cabinBuyoutRate: 80, venueBuildCost: 1.5,
  }
}

const CABIN_OPTIONS = [4, 6, 8, 10, 12, 16]
const GUEST_OPTIONS = [2, 4, 6, 8]

function fmtM(n) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n).toLocaleString()}`
}
function fmtMDetail(n) {
  return fmtM(n)
}
function fmtPct(n) { return `${Math.round(n)}%` }
function fmt$(n) { return `$${Math.round(n).toLocaleString()}` }

export default function FinancialModel() {
  const [scenario, setScenario] = useState('base')
  const [m, setM] = useState(SCENARIOS.base)

  function applyScenario(key) {
    setScenario(key)
    setM(SCENARIOS[key])
  }
  function update(field, value) {
    setScenario('custom')
    setM(prev => ({ ...prev, [field]: value }))
  }

  const calc = useMemo(() => {
    const capacity = m.cabins * m.guestsPerCabin
    const maxNightly = m.cabins * m.nightlyRate * 2 // peak night illustrative
    const nightsPerYear = 365

    // Revenue streams
    const cabinRev = m.cabins * m.nightlyRate * nightsPerYear * (m.occupancy / 100)
    const fbRev = m.cabins * m.guestsPerCabin * nightsPerYear * (m.occupancy / 100) * m.fbPerGuest

    // Events
    const venueRentalRev = m.eventsEnabled ? m.eventsPerYear * m.venueRental : 0
    const cateringRev = m.eventsEnabled ? m.eventsPerYear * m.cateringPerEvent * 0.25 : 0 // 25% margin kept
    // Cabin buyout: some % of events buyout cabins @ nightlyRate for the weekend (2 nights)
    const buyoutRev = m.eventsEnabled
      ? m.eventsPerYear * (m.cabinBuyoutRate / 100) * m.cabins * m.nightlyRate * 2 * 0.8
      : 0
    const eventsRev = venueRentalRev + cateringRev + buyoutRev

    const grossRev = cabinRev + fbRev + eventsRev
    const opex = grossRev * (m.opCostPct / 100)
    const mgmtFee = grossRev * (m.mgmtFeePct / 100)
    const ebitda = grossRev - opex - mgmtFee
    const ebitdaMargin = (ebitda / grossRev) * 100

    // Capital stack
    const totalBuild = m.cabins * m.buildCostPerCabin * 1_000_000 + (m.eventsEnabled ? m.venueBuildCost * 1_000_000 : 0)
    const equity = totalBuild * (m.equityPct / 100)
    const debt = totalBuild * (1 - m.equityPct / 100)
    // Debt service (interest-only approximation + principal amortization 25-yr)
    const annualDebtService = debt * (m.debtRate / 100) + debt / 25
    const cashFlow = ebitda - annualDebtService
    const cashOnCash = (cashFlow / equity) * 100
    const paybackYears = cashFlow > 0 ? equity / cashFlow : 99

    // 5-year cumulative (ramping)
    const rampFactors = [0.55, 0.75, 0.9, 1.0, 1.05]
    let cumulative = -equity
    const yearlyCum = []
    rampFactors.forEach((r, i) => {
      const yrCash = cashFlow * r
      cumulative += yrCash
      yearlyCum.push(cumulative)
    })

    return {
      capacity, maxNightly,
      cabinRev, fbRev, eventsRev, grossRev,
      venueRentalRev, cateringRev, buyoutRev,
      opex, mgmtFee, ebitda, ebitdaMargin,
      totalBuild, equity, debt, annualDebtService, cashFlow,
      cashOnCash, paybackYears,
      yearlyCum
    }
  }, [m])

  // Chart helpers
  const revMax = Math.max(calc.cabinRev, calc.fbRev, calc.eventsRev, 1)
  const cumMax = Math.max(...calc.yearlyCum, 1_000_000)
  const cumMin = Math.min(...calc.yearlyCum, -1_000_000)

  return (
    <div className="fin-model">
      <div className="fin-model__hero">
        <div className="fin-model__hero-inner">
          <span className="fin-model__label">FINANCIAL MODELING TOOL</span>
          <h1 className="fin-model__title">Underwrite The Investment</h1>
          <p className="fin-model__subtitle">
            Interactive pro forma for a Golf House property — adjust cabins, rates, occupancy, and event mix to stress-test the business plan.
          </p>
        </div>
      </div>

      <div className="fin-model__body">
        {/* Scenario + Summary bar */}
        <div className="fin-card fin-top-bar">
          <div className="scenario-toggle">
            <button className={`scenario-btn ${scenario === 'base' ? 'scenario-btn--active' : ''}`} onClick={() => applyScenario('base')}>Base case</button>
            <button className={`scenario-btn ${scenario === 'bear' ? 'scenario-btn--active' : ''}`} onClick={() => applyScenario('bear')}>Bear case</button>
            <button className={`scenario-btn ${scenario === 'bull' ? 'scenario-btn--active' : ''}`} onClick={() => applyScenario('bull')}>Bull case</button>
            {scenario === 'custom' && <span className="scenario-btn scenario-btn--custom">Custom</span>}
          </div>
          <div className="top-bar__stats">
            <div className="top-bar__stat"><span>Capacity:</span> <strong>{calc.capacity} guests</strong></div>
            <div className="top-bar__stat"><span>Max nightly:</span> <strong>{fmt$(calc.maxNightly)}</strong></div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-card__label">ANNUAL REVENUE</div>
            <div className="kpi-card__value">{fmtM(calc.grossRev)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__label">EBITDA</div>
            <div className="kpi-card__value">{fmtM(calc.ebitda)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__label">EBITDA MARGIN</div>
            <div className="kpi-card__value">{fmtPct(calc.ebitdaMargin)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__label">CASH-ON-CASH</div>
            <div className="kpi-card__value">{fmtPct(calc.cashOnCash)}</div>
            <div className="kpi-card__sub">on {fmtM(calc.equity)} equity</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__label">PAYBACK PERIOD</div>
            <div className="kpi-card__value">{calc.paybackYears > 20 ? '20+' : calc.paybackYears.toFixed(1)} yrs</div>
          </div>
        </div>

        {/* Property Configuration */}
        <div className="fin-card">
          <div className="fin-card__header">PROPERTY CONFIGURATION</div>
          <div className="config-row">
            <span className="config-row__label">Number of cabins</span>
            <div className="pill-group">
              {CABIN_OPTIONS.map(n => (
                <button key={n} className={`pill ${m.cabins === n ? 'pill--active' : ''}`} onClick={() => update('cabins', n)}>{n}</button>
              ))}
            </div>
          </div>
          <div className="config-row">
            <span className="config-row__label">Guests per cabin</span>
            <div className="pill-group">
              {GUEST_OPTIONS.map(n => (
                <button key={n} className={`pill ${m.guestsPerCabin === n ? 'pill--active' : ''}`} onClick={() => update('guestsPerCabin', n)}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Wedding & Event Venue */}
        <div className="fin-card">
          <div className="fin-card__header">WEDDING & EVENT VENUE</div>
          <div className={`addon-card ${m.eventsEnabled ? '' : 'addon-card--off'}`}>
            <div className="addon-card__head">
              <div className="addon-card__title">
                <span>Barn / ballroom</span>
                <span className="addon-badge addon-badge--pink">Add-on</span>
                {m.eventsEnabled && <span className="addon-badge addon-badge--green">+{fmtM(calc.eventsRev)} / yr</span>}
              </div>
              <label className="toggle">
                <input type="checkbox" checked={m.eventsEnabled} onChange={e => update('eventsEnabled', e.target.checked)} />
                <span className="toggle__slider" />
              </label>
            </div>

            {m.eventsEnabled && (
              <>
                <Slider label="Venue rental / event" min={5000} max={40000} step={500} value={m.venueRental} onChange={v => update('venueRental', v)} format={fmt$} />
                <Slider label="Events per year" min={0} max={60} step={1} value={m.eventsPerYear} onChange={v => update('eventsPerYear', v)} format={v => `${v} events`} />
                <Slider label="Catering / bar per event" min={2000} max={20000} step={500} value={m.cateringPerEvent} onChange={v => update('cateringPerEvent', v)} format={fmt$} />
                <Slider label="Cabin buyout rate" min={0} max={100} step={5} value={m.cabinBuyoutRate} onChange={v => update('cabinBuyoutRate', v)} format={v => `${v}%`} />
                <Slider label="Venue build cost" min={0.5} max={4} step={0.1} value={m.venueBuildCost} onChange={v => update('venueBuildCost', parseFloat(v))} format={v => `$${v}M`} />

                <div className="addon-summary">
                  <div className="addon-summary__item"><span>Venue rental</span><strong>{fmtM(calc.venueRentalRev)}</strong></div>
                  <div className="addon-summary__item"><span>Catering & bar</span><strong>{fmtM(calc.cateringRev)}</strong></div>
                  <div className="addon-summary__item"><span>Cabin buyouts</span><strong>{fmtM(calc.buyoutRev)}</strong></div>
                  <div className="addon-summary__item addon-summary__item--total"><span>Total event revenue</span><strong>{fmtM(calc.eventsRev)}</strong></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Financial Assumptions */}
        <div className="fin-card">
          <div className="fin-card__header">FINANCIAL ASSUMPTIONS</div>
          <Slider label="Nightly rate / cabin" min={1500} max={8000} step={50} value={m.nightlyRate} onChange={v => update('nightlyRate', v)} format={fmt$} />
          <Slider label="Occupancy" min={30} max={90} step={1} value={m.occupancy} onChange={v => update('occupancy', v)} format={v => `${v}%`} />
          <Slider label="F&B / spa per guest night" min={100} max={1000} step={25} value={m.fbPerGuest} onChange={v => update('fbPerGuest', v)} format={fmt$} />
          <Slider label="Operating cost %" min={40} max={75} step={1} value={m.opCostPct} onChange={v => update('opCostPct', v)} format={v => `${v}%`} />
          <Slider label="Build cost / cabin ($M)" min={1.5} max={5} step={0.1} value={m.buildCostPerCabin} onChange={v => update('buildCostPerCabin', parseFloat(v))} format={v => `$${v.toFixed(1)}M`} />
          <Slider label="Equity invested" min={20} max={60} step={1} value={m.equityPct} onChange={v => update('equityPct', v)} format={v => `${v}%`} />
        </div>

        {/* Revenue Breakdown */}
        <div className="fin-card">
          <div className="fin-card__header">REVENUE BREAKDOWN</div>
          <RevenueBar label="Cabin revenue" value={calc.cabinRev} max={revMax} color="var(--carolina-green)" />
          <RevenueBar label="F&B / spa" value={calc.fbRev} max={revMax} color="var(--sage)" />
          <RevenueBar label="Events & weddings" value={calc.eventsRev} max={revMax} color="var(--tobacco)" />
        </div>

        {/* P&L Summary */}
        <div className="fin-card">
          <div className="fin-card__header">P&L SUMMARY</div>
          <div className="pl-table">
            <PLRow label="Golf & lodging revenue" value={calc.cabinRev + calc.fbRev} />
            <PLRow label={`Event / wedding revenue (${m.eventsEnabled ? m.eventsPerYear : 0} events)`} value={calc.eventsRev} />
            <PLRow label="Gross revenue" value={calc.grossRev} bold divider />
            <PLRow label={`Operating expenses (${m.opCostPct}%)`} value={-calc.opex} />
            <PLRow label={`Mgmt / brand fee (${m.mgmtFeePct}%)`} value={-calc.mgmtFee} />
            <PLRow label="EBITDA" value={calc.ebitda} bold highlight="green" />
            <PLRow label={`Debt service (${m.ltv}% LTV @ ${m.debtRate}%)`} value={-calc.annualDebtService} />
            <PLRow label="Cash flow to equity" value={calc.cashFlow} bold highlight={calc.cashFlow > 0 ? 'green' : 'red'} />
          </div>

          <div className={`insight-box insight-box--${calc.cashOnCash > 15 ? 'positive' : calc.cashOnCash > 0 ? 'neutral' : 'negative'}`}>
            {calc.cashOnCash > 20 && (
              <>Pencils well. {fmtPct(calc.cashOnCash)} cash-on-cash and {fmtPct(calc.ebitdaMargin)} EBITDA margin clears most institutional hurdles.
              {m.eventsEnabled && ` Wedding / event venue adds ${fmtM(calc.eventsRev)} in annual revenue at near-zero incremental fixed cost.`}</>
            )}
            {calc.cashOnCash > 10 && calc.cashOnCash <= 20 && (
              <>Solid returns. {fmtPct(calc.cashOnCash)} cash-on-cash meets typical hospitality underwriting minimums. Consider tightening operating cost or raising ADR to improve margin.</>
            )}
            {calc.cashOnCash > 0 && calc.cashOnCash <= 10 && (
              <>Tight. {fmtPct(calc.cashOnCash)} cash-on-cash likely below institutional hurdle. Review occupancy assumptions and event mix to lift returns.</>
            )}
            {calc.cashOnCash <= 0 && (
              <>Negative cash-on-cash. Property would not service debt under current assumptions. Increase rate, occupancy, or reduce build cost.</>
            )}
          </div>
        </div>

        {/* 5-Year Cumulative Cash Flow */}
        <div className="fin-card">
          <div className="fin-card__header">5-YEAR CUMULATIVE CASH FLOW</div>
          <div className="cash-chart">
            <div className="cash-chart__ylabels">
              {[cumMax, cumMax * 0.5, 0, cumMin * 0.5, cumMin].map((v, i) => (
                <div key={i} className="cash-chart__ylabel">{fmtM(v)}</div>
              ))}
            </div>
            <div className="cash-chart__plot">
              <div className="cash-chart__zero" style={{ top: `${(cumMax / (cumMax - cumMin)) * 100}%` }} />
              {calc.yearlyCum.map((v, i) => {
                const range = cumMax - cumMin
                const zeroPct = (cumMax / range) * 100
                const barPct = Math.abs(v / range) * 100
                const top = v >= 0 ? zeroPct - barPct : zeroPct
                return (
                  <div key={i} className="cash-chart__bar-wrap">
                    <div
                      className={`cash-chart__bar ${v >= 0 ? 'cash-chart__bar--pos' : 'cash-chart__bar--neg'}`}
                      style={{ top: `${top}%`, height: `${barPct}%` }}
                    >
                      <span className="cash-chart__bar-label">{fmtM(v)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="cash-chart__xlabels">
            {['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'].map(y => (
              <div key={y} className="cash-chart__xlabel">{y}</div>
            ))}
          </div>
        </div>

        {/* Capital Stack */}
        <div className="fin-card">
          <div className="fin-card__header">CAPITAL STACK</div>
          <div className="capital-stack">
            <div className="capital-row"><span>Total build cost</span><strong>{fmtM(calc.totalBuild)}</strong></div>
            <div className="capital-row"><span>Sponsor + LP equity ({m.equityPct}%)</span><strong>{fmtM(calc.equity)}</strong></div>
            <div className="capital-row"><span>Senior debt ({100 - m.equityPct}%)</span><strong>{fmtM(calc.debt)}</strong></div>
            <div className="capital-row capital-row--highlight"><span>Year-1 cash flow to equity</span><strong>{fmtM(calc.cashFlow)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Slider({ label, min, max, step, value, onChange, format }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="slider-row">
      <span className="slider-row__label">{label}</span>
      <div className="slider-row__control">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ '--pct': `${pct}%` }}
        />
      </div>
      <span className="slider-row__value">{format(value)}</span>
    </div>
  )
}

function RevenueBar({ label, value, max, color }) {
  const pct = (value / max) * 100
  return (
    <div className="rev-bar">
      <span className="rev-bar__label">{label}</span>
      <div className="rev-bar__track">
        <div className="rev-bar__fill" style={{ width: `${pct}%`, background: color }}>
          {pct > 15 && <span className="rev-bar__inner">{fmtM(value)}</span>}
        </div>
      </div>
      <span className="rev-bar__value">{fmtM(value)}</span>
    </div>
  )
}

function PLRow({ label, value, bold, divider, highlight }) {
  const cls = [
    'pl-row',
    bold && 'pl-row--bold',
    divider && 'pl-row--divider',
    highlight === 'green' && 'pl-row--green',
    highlight === 'red' && 'pl-row--red'
  ].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <span>{label}</span>
      <span>{value < 0 ? `-${fmtM(Math.abs(value))}` : fmtM(value)}</span>
    </div>
  )
}
