import { useState, useMemo } from 'react'
import './FinancialModel.css'

const DEFAULT_INPUTS = {
  cabins: 8, guestsPerCabin: 6, nightlyRate: 4300, occupancy: 60,
  fbPerGuest: 450, opCostPct: 58, buildCostPerCabin: 2.5, equityPct: 35,
  debtRate: 7.2, amortYears: 25, mgmtFeePct: 6, numInvestors: 6, lpPrefReturn: 8, gpCarry: 20,
  eventsEnabled: true, venueRental: 15000, eventsPerYear: 20, cateringPerEvent: 8000,
  cabinBuyoutRate: 60, venueBuildCost: 1.5,
}

const CABIN_OPTIONS = [4, 6, 8, 10, 12, 16]
const GUEST_OPTIONS = [2, 4, 6, 8]

function fmtM(n) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n).toLocaleString()}`
}
function fmtPct(n) { return `${Math.round(n)}%` }
function fmt$(n) { return `$${Math.round(n).toLocaleString()}` }

export default function FinancialModel() {
  const [m, setM] = useState(DEFAULT_INPUTS)
  const [view, setView] = useState('income')
  const [openSections, setOpenSections] = useState({
    lodging: true,
    fb: false,
    events: false,
    build: false,
    capital: false,
    financing: false,
  })

  function toggleSection(key) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }
  function update(field, value) {
    setM(prev => ({ ...prev, [field]: value }))
  }

  const calc = useMemo(() => {
    const capacity = m.cabins * m.guestsPerCabin
    const maxNightly = m.cabins * m.nightlyRate * 2
    const nightsPerYear = 365

    const cabinRev = m.cabins * m.nightlyRate * nightsPerYear * (m.occupancy / 100)
    const fbRev = m.cabins * m.guestsPerCabin * nightsPerYear * (m.occupancy / 100) * m.fbPerGuest

    const venueRentalRev = m.eventsEnabled ? m.eventsPerYear * m.venueRental : 0
    const cateringRev = m.eventsEnabled ? m.eventsPerYear * m.cateringPerEvent * 0.25 : 0
    const buyoutRev = m.eventsEnabled
      ? m.eventsPerYear * (m.cabinBuyoutRate / 100) * m.cabins * m.nightlyRate * 2 * 0.8
      : 0
    const eventsRev = venueRentalRev + cateringRev + buyoutRev

    const grossRev = cabinRev + fbRev + eventsRev
    const opex = grossRev * (m.opCostPct / 100)
    const mgmtFee = grossRev * (m.mgmtFeePct / 100)
    const ebitda = grossRev - opex - mgmtFee
    const ebitdaMargin = (ebitda / grossRev) * 100

    const fbCOGS = fbRev * 0.32
    const cateringCOGS = cateringRev * 3 * 0.55 / 3
    const lodgingConsumables = cabinRev * 0.06
    const totalCOGS = fbCOGS + cateringCOGS + lodgingConsumables
    const grossProfit = grossRev - totalCOGS
    const grossMargin = (grossProfit / grossRev) * 100

    const laborExp = grossRev * Math.min(0.35, m.opCostPct / 100 * 0.6)
    const marketingExp = grossRev * 0.06
    const utilitiesExp = grossRev * 0.03
    const propertyTax = grossRev * 0.025
    const insuranceExp = grossRev * 0.015
    const maintenanceExp = grossRev * 0.025
    const gaExp = grossRev * 0.02
    const otherOpex = Math.max(0, opex - (laborExp + marketingExp + utilitiesExp + propertyTax + insuranceExp + maintenanceExp + gaExp))

    const totalBuild = m.cabins * m.buildCostPerCabin * 1_000_000 + (m.eventsEnabled ? m.venueBuildCost * 1_000_000 : 0)
    const equity = totalBuild * (m.equityPct / 100)
    const debt = totalBuild * (1 - m.equityPct / 100)

    const depreciation = totalBuild * 0.04
    const ebit = ebitda - depreciation
    const interestExp = debt * (m.debtRate / 100)
    const principalPayment = debt / (m.amortYears || 25)
    const annualDebtService = interestExp + principalPayment
    const preTaxIncome = ebit - interestExp
    const taxExpense = Math.max(0, preTaxIncome * 0.25)
    const netIncome = preTaxIncome - taxExpense

    const cashFlow = ebitda - annualDebtService
    const cashOnCash = (cashFlow / equity) * 100
    const paybackYears = cashFlow > 0 ? equity / cashFlow : 99

    const equityPerInvestor = equity / Math.max(1, m.numInvestors || 1)
    const lpPrefDollars = equity * ((m.lpPrefReturn || 0) / 100)

    const rampFactors = [0.55, 0.75, 0.9, 1.0, 1.05]
    let cumulative = -equity
    const yearlyCum = []
    rampFactors.forEach((r) => {
      const yrCash = cashFlow * r
      cumulative += yrCash
      yearlyCum.push(cumulative)
    })

    return {
      capacity, maxNightly,
      cabinRev, fbRev, eventsRev, grossRev,
      venueRentalRev, cateringRev, buyoutRev,
      fbCOGS, cateringCOGS, lodgingConsumables, totalCOGS, grossProfit, grossMargin,
      laborExp, marketingExp, utilitiesExp, propertyTax, insuranceExp,
      maintenanceExp, gaExp, otherOpex,
      opex, mgmtFee, ebitda, ebitdaMargin,
      depreciation, ebit, interestExp, principalPayment,
      preTaxIncome, taxExpense, netIncome,
      totalBuild, equity, debt, annualDebtService, cashFlow,
      cashOnCash, paybackYears,
      equityPerInvestor, lpPrefDollars,
      yearlyCum
    }
  }, [m])

  const revMax = Math.max(calc.cabinRev, calc.fbRev, calc.eventsRev, 1)
  const cumMax = Math.max(...calc.yearlyCum, 1_000_000)
  const cumMin = Math.min(...calc.yearlyCum, -1_000_000)

  return (
    <div className="fin-model">
      <div className="fin-model__hero fin-model__hero--slim">
        <div className="fin-model__hero-inner">
          <h1 className="fin-model__label-heading">Financial Modeling Tool</h1>
        </div>
      </div>

      <div className="fin-model__layout">
        {/* SIDEBAR — INPUTS */}
        <aside className="fin-sidebar">
          <div className="fin-sidebar__head">
            <span className="fin-sidebar__title">Inputs</span>
            <button className="fin-sidebar__reset" onClick={() => setM(DEFAULT_INPUTS)}>Reset</button>
          </div>

          <div className="fin-sidebar__capacity">
            <div className="fin-sidebar__cap-item">
              <span>Capacity</span>
              <strong>{calc.capacity} guests</strong>
            </div>
            <div className="fin-sidebar__cap-item">
              <span>Max nightly</span>
              <strong>{fmt$(calc.maxNightly)}</strong>
            </div>
          </div>

          <SidebarSection
            label="Lodging"
            badge={`${fmtM(calc.cabinRev)} / yr`}
            badgeColor="green"
            open={openSections.lodging}
            onToggle={() => toggleSection('lodging')}
          >
            <div className="sb-config">
              <div className="config-item">
                <label className="config-item__label">Number of cabins</label>
                <select className="config-select" value={m.cabins} onChange={e => update('cabins', parseInt(e.target.value))}>
                  {CABIN_OPTIONS.map(n => <option key={n} value={n}>{n} cabins</option>)}
                </select>
              </div>
              <div className="config-item">
                <label className="config-item__label">Guests per cabin</label>
                <select className="config-select" value={m.guestsPerCabin} onChange={e => update('guestsPerCabin', parseInt(e.target.value))}>
                  {GUEST_OPTIONS.map(n => <option key={n} value={n}>{n} guests</option>)}
                </select>
              </div>
            </div>
            <div className="sb-sliders">
              <Slider label="Nightly rate / cabin" min={1500} max={8000} step={50} value={m.nightlyRate} onChange={v => update('nightlyRate', v)} format={fmt$} />
              <Slider label="Occupancy" min={30} max={90} step={1} value={m.occupancy} onChange={v => update('occupancy', v)} format={v => `${v}%`} />
            </div>
          </SidebarSection>

          <SidebarSection
            label="F&B, Spa & Pro Shop"
            badge={`${fmtM(calc.fbRev)} / yr`}
            badgeColor="sage"
            open={openSections.fb}
            onToggle={() => toggleSection('fb')}
          >
            <div className="sb-sliders">
              <Slider label="Ancillary spend / guest / night" min={100} max={1000} step={25} value={m.fbPerGuest} onChange={v => update('fbPerGuest', v)} format={fmt$} />
            </div>
            <div className="sb-note">
              Restaurant &amp; bar, spa treatments, pro shop retail, and activity fees combined per guest per night.
            </div>
          </SidebarSection>

          <SidebarSection
            label="Events & Weddings"
            badge={m.eventsEnabled ? `${fmtM(calc.eventsRev)} / yr` : 'Off'}
            badgeColor="tobacco"
            open={openSections.events}
            onToggle={() => toggleSection('events')}
            extra={
              <label className="toggle toggle--inline" onClick={e => e.stopPropagation()}>
                <input type="checkbox" checked={m.eventsEnabled} onChange={e => update('eventsEnabled', e.target.checked)} />
                <span className="toggle__slider" />
              </label>
            }
          >
            {m.eventsEnabled ? (
              <>
                <div className="sb-sliders">
                  <Slider label="Venue rental / event" min={5000} max={40000} step={500} value={m.venueRental} onChange={v => update('venueRental', v)} format={fmt$} />
                  <Slider label="Events per year" min={0} max={60} step={1} value={m.eventsPerYear} onChange={v => update('eventsPerYear', v)} format={v => `${v} events`} />
                  <Slider label="Catering / bar per event" min={2000} max={20000} step={500} value={m.cateringPerEvent} onChange={v => update('cateringPerEvent', v)} format={fmt$} />
                  <Slider label="Cabin buyout rate" min={0} max={100} step={5} value={m.cabinBuyoutRate} onChange={v => update('cabinBuyoutRate', v)} format={v => `${v}%`} />
                </div>
                <div className="sb-mini-grid">
                  <div className="sb-mini"><span>Venue</span><strong>{fmtM(calc.venueRentalRev)}</strong></div>
                  <div className="sb-mini"><span>Catering</span><strong>{fmtM(calc.cateringRev)}</strong></div>
                  <div className="sb-mini"><span>Buyouts</span><strong>{fmtM(calc.buyoutRev)}</strong></div>
                </div>
              </>
            ) : (
              <div className="sb-note">Toggle on to model wedding &amp; event revenue.</div>
            )}
          </SidebarSection>

          <SidebarSection
            label="Development Cost"
            badge={`${fmtM(calc.totalBuild)} total`}
            badgeColor="tobacco"
            open={openSections.build}
            onToggle={() => toggleSection('build')}
          >
            <div className="sb-sliders">
              <Slider label="Build cost / cabin ($M)" min={1.5} max={5} step={0.1} value={m.buildCostPerCabin} onChange={v => update('buildCostPerCabin', parseFloat(v))} format={v => `$${v.toFixed(1)}M`} />
              {m.eventsEnabled && (
                <Slider label="Venue build cost ($M)" min={0.5} max={4} step={0.1} value={m.venueBuildCost} onChange={v => update('venueBuildCost', parseFloat(v))} format={v => `$${v}M`} />
              )}
            </div>
          </SidebarSection>

          <SidebarSection
            label="Capital Stack"
            badge={`${m.equityPct}% / ${100 - m.equityPct}%`}
            badgeColor="green"
            open={openSections.capital}
            onToggle={() => toggleSection('capital')}
          >
            <div className="sb-sliders">
              <Slider label="Equity share" min={20} max={60} step={1} value={m.equityPct} onChange={v => update('equityPct', v)} format={v => `${v}%`} />
              <Slider label="Operating cost %" min={40} max={75} step={1} value={m.opCostPct} onChange={v => update('opCostPct', v)} format={v => `${v}%`} />
            </div>
            <div className="sb-mini-grid">
              <div className="sb-mini"><span>Equity</span><strong>{fmtM(calc.equity)}</strong></div>
              <div className="sb-mini"><span>Debt</span><strong>{fmtM(calc.debt)}</strong></div>
              <div className="sb-mini"><span>Per LP</span><strong>{fmtM(calc.equityPerInvestor)}</strong></div>
            </div>
          </SidebarSection>

          <SidebarSection
            label="Financing Terms"
            badge={`${fmtM(calc.annualDebtService)} / yr`}
            badgeColor="tobacco"
            open={openSections.financing}
            onToggle={() => toggleSection('financing')}
          >
            <div className="sb-sliders">
              <Slider label="Debt interest rate" min={4} max={12} step={0.1} value={m.debtRate} onChange={v => update('debtRate', parseFloat(v))} format={v => `${v.toFixed(1)}%`} />
              <Slider label="Amortization period" min={10} max={30} step={1} value={m.amortYears} onChange={v => update('amortYears', v)} format={v => `${v} yrs`} />
              <Slider label="Number of LP investors" min={1} max={20} step={1} value={m.numInvestors} onChange={v => update('numInvestors', v)} format={v => `${v}`} />
              <Slider label="LP preferred return" min={0} max={15} step={0.5} value={m.lpPrefReturn} onChange={v => update('lpPrefReturn', parseFloat(v))} format={v => `${v.toFixed(1)}%`} />
              <Slider label="GP promote / carry" min={0} max={30} step={1} value={m.gpCarry} onChange={v => update('gpCarry', v)} format={v => `${v}%`} />
              <Slider label="Mgmt / brand fee" min={0} max={10} step={0.5} value={m.mgmtFeePct} onChange={v => update('mgmtFeePct', parseFloat(v))} format={v => `${v.toFixed(1)}%`} />
            </div>
          </SidebarSection>
        </aside>

        {/* MAIN — OUTPUTS */}
        <main className="fin-content">
          {/* View switcher */}
          <div className="view-bar">
            <span className="view-bar__label">VIEW</span>
            <div className="view-bar__tabs">
              <button className={`view-bar__btn ${view === 'income' ? 'view-bar__btn--active' : ''}`} onClick={() => setView('income')}>Income Statement</button>
              <button className={`view-bar__btn ${view === 'cashflow' ? 'view-bar__btn--active' : ''}`} onClick={() => setView('cashflow')}>Cash Flow &amp; Returns</button>
              <button className={`view-bar__btn ${view === 'exit' ? 'view-bar__btn--active' : ''}`} onClick={() => setView('exit')}>Exit Scenarios</button>
            </div>
          </div>

          {/* KPI summary always visible */}
          <div className="kpi-grid kpi-grid--compact">
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
              <div className="kpi-card__label">PAYBACK</div>
              <div className="kpi-card__value">{calc.paybackYears > 20 ? '20+' : calc.paybackYears.toFixed(1)} yrs</div>
            </div>
          </div>

          {view === 'income' && <IncomeStatement calc={calc} m={m} />}

          {view === 'cashflow' && <>
            <div className="fin-card">
              <div className="fin-card__header">REVENUE BREAKDOWN</div>
              <RevenueBar label="Cabin revenue" value={calc.cabinRev} max={revMax} color="var(--carolina-green)" />
              <RevenueBar label="F&B / spa" value={calc.fbRev} max={revMax} color="var(--sage)" />
              <RevenueBar label="Events & weddings" value={calc.eventsRev} max={revMax} color="var(--tobacco)" />
            </div>

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

            <div className="fin-card">
              <div className="fin-card__header">CAPITAL STACK &amp; ANNUAL RETURNS</div>
              <div className="capital-stack">
                <div className="capital-row"><span>Total build cost</span><strong>{fmtM(calc.totalBuild)}</strong></div>
                <div className="capital-row"><span>Sponsor + LP equity ({m.equityPct}%)</span><strong>{fmtM(calc.equity)}</strong></div>
                <div className="capital-row"><span>Senior debt ({100 - m.equityPct}%)</span><strong>{fmtM(calc.debt)}</strong></div>
                <div className="capital-row"><span>Annual EBITDA ({fmtPct(calc.ebitdaMargin)} margin)</span><strong>{fmtM(calc.ebitda)}</strong></div>
                <div className="capital-row"><span>Debt service ({m.debtRate}% rate, {m.amortYears}-yr amort)</span><strong>{fmtM(calc.annualDebtService)}</strong></div>
                <div className="capital-row capital-row--highlight"><span>Year-1 cash flow to equity ({fmtPct(calc.cashOnCash)} CoC)</span><strong>{fmtM(calc.cashFlow)}</strong></div>
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
          </>}

          {view === 'exit' && <ExitScenarios calc={calc} m={m} />}
        </main>
      </div>
    </div>
  )
}

function SidebarSection({ label, badge, badgeColor, open, onToggle, extra, children }) {
  return (
    <div className={`sb-section ${open ? 'sb-section--open' : ''}`}>
      <div
        className="sb-section__head"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }}
      >
        <span className="sb-section__label">{label}</span>
        <span className="sb-section__meta">
          {badge && <span className={`sb-section__badge sb-section__badge--${badgeColor}`}>{badge}</span>}
          {extra && <span className="sb-section__extra">{extra}</span>}
          <span className="sb-section__caret" aria-hidden>{open ? '−' : '+'}</span>
        </span>
      </div>
      {open && <div className="sb-section__body">{children}</div>}
    </div>
  )
}

function IncomeStatement({ calc, m }) {
  return (
    <div className="fin-card income-statement">
      <div className="income-statement__header">
        <div>
          <div className="fin-card__header">DETAILED INCOME STATEMENT</div>
          <div className="income-statement__sub">Projected annual P&amp;L at stabilized operations (Year 3)</div>
        </div>
        <div className="income-statement__headline">
          <div className="income-statement__headline-item">
            <span>Revenue</span>
            <strong>{fmtM(calc.grossRev)}</strong>
          </div>
          <div className="income-statement__headline-item">
            <span>EBITDA</span>
            <strong>{fmtM(calc.ebitda)}</strong>
          </div>
          <div className="income-statement__headline-item">
            <span>Net Income</span>
            <strong>{fmtM(calc.netIncome)}</strong>
          </div>
        </div>
      </div>

      <div className="is-table">
        <ISSectionHead title="Revenue" />
        <ISRow label="Cabin / lodging revenue" value={calc.cabinRev} />
        <ISRow label="F&B, spa, pro shop (ancillary)" value={calc.fbRev} />
        {m.eventsEnabled && <>
          <ISRow label="Events — venue rental" value={calc.venueRentalRev} indent />
          <ISRow label="Events — catering margin" value={calc.cateringRev} indent />
          <ISRow label="Events — cabin buyouts" value={calc.buyoutRev} indent />
        </>}
        <ISRow label="Total revenue" value={calc.grossRev} bold divider />

        <ISSectionHead title="Cost of Sales" />
        <ISRow label="F&B direct costs (32% of F&B rev)" value={-calc.fbCOGS} />
        <ISRow label="Catering direct costs" value={-calc.cateringCOGS} />
        <ISRow label="Lodging consumables & supplies" value={-calc.lodgingConsumables} />
        <ISRow label="Total cost of sales" value={-calc.totalCOGS} bold />
        <ISRow label={`Gross profit (${fmtPct(calc.grossMargin)} margin)`} value={calc.grossProfit} bold highlight="green" divider />

        <ISSectionHead title="Operating Expenses" />
        <ISRow label="Labor & wages" value={-calc.laborExp} pct={-calc.laborExp / calc.grossRev * 100} />
        <ISRow label="Marketing & sales" value={-calc.marketingExp} pct={-calc.marketingExp / calc.grossRev * 100} />
        <ISRow label="Utilities" value={-calc.utilitiesExp} pct={-calc.utilitiesExp / calc.grossRev * 100} />
        <ISRow label="Property tax" value={-calc.propertyTax} pct={-calc.propertyTax / calc.grossRev * 100} />
        <ISRow label="Insurance" value={-calc.insuranceExp} pct={-calc.insuranceExp / calc.grossRev * 100} />
        <ISRow label="Repairs & maintenance" value={-calc.maintenanceExp} pct={-calc.maintenanceExp / calc.grossRev * 100} />
        <ISRow label="General & administrative" value={-calc.gaExp} pct={-calc.gaExp / calc.grossRev * 100} />
        {calc.otherOpex > 1000 && <ISRow label="Other operating expense" value={-calc.otherOpex} pct={-calc.otherOpex / calc.grossRev * 100} />}
        <ISRow label={`Total operating expenses (${m.opCostPct}%)`} value={-calc.opex} bold />
        <ISRow label={`Mgmt / brand fee (${m.mgmtFeePct}%)`} value={-calc.mgmtFee} />
        <ISRow label={`EBITDA (${fmtPct(calc.ebitdaMargin)} margin)`} value={calc.ebitda} bold highlight="green" divider />

        <ISSectionHead title="Below EBITDA" />
        <ISRow label="Depreciation & amortization" value={-calc.depreciation} />
        <ISRow label="EBIT (operating income)" value={calc.ebit} bold divider />
        <ISRow label={`Interest expense (${m.debtRate}% on ${fmtM(calc.debt)})`} value={-calc.interestExp} />
        <ISRow label="Pre-tax income" value={calc.preTaxIncome} bold />
        <ISRow label="Income taxes (25%)" value={-calc.taxExpense} />
        <ISRow label="Net income" value={calc.netIncome} bold highlight={calc.netIncome > 0 ? 'green' : 'red'} divider />

        <ISSectionHead title="Cash Flow to Equity" />
        <ISRow label="EBITDA" value={calc.ebitda} />
        <ISRow label={`Less: debt service (interest + principal, ${m.amortYears}-yr amort)`} value={-calc.annualDebtService} />
        <ISRow label="Free cash flow to equity" value={calc.cashFlow} bold highlight={calc.cashFlow > 0 ? 'green' : 'red'} />
        <ISRow label={`Cash-on-cash yield (on ${fmtM(calc.equity)} equity)`} value={null} pctOverride={fmtPct(calc.cashOnCash)} highlight={calc.cashOnCash > 10 ? 'green' : calc.cashOnCash > 0 ? 'neutral' : 'red'} />
      </div>

      <div className={`insight-box insight-box--${calc.cashOnCash > 15 ? 'positive' : calc.cashOnCash > 0 ? 'neutral' : 'negative'}`}>
        {calc.netIncome > 0
          ? <>Net income of {fmtM(calc.netIncome)} translates to {fmtPct(calc.cashOnCash)} cash-on-cash after debt service. LP preferred return target is {fmtM(calc.lpPrefDollars)} / yr &mdash; {calc.cashFlow >= calc.lpPrefDollars ? 'covered' : 'short by ' + fmtM(calc.lpPrefDollars - calc.cashFlow)}.</>
          : <>Negative net income under these assumptions. Raise ADR, occupancy, or reduce operating cost to break through.</>
        }
      </div>
    </div>
  )
}

function ISSectionHead({ title }) {
  return <div className="is-section-head">{title}</div>
}

function ISRow({ label, value, bold, divider, highlight, pct, pctOverride, indent }) {
  const cls = [
    'is-row',
    bold && 'is-row--bold',
    divider && 'is-row--divider',
    highlight === 'green' && 'is-row--green',
    highlight === 'red' && 'is-row--red',
    highlight === 'neutral' && 'is-row--neutral',
    indent && 'is-row--indent'
  ].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <span>{label}</span>
      <div className="is-row__values">
        {(pct !== undefined && pct !== null) && <span className="is-row__pct">{fmtPct(Math.abs(pct))}</span>}
        {pctOverride && <span className="is-row__value">{pctOverride}</span>}
        {value !== null && value !== undefined && (
          <span className="is-row__value">
            {value < 0 ? `(${fmtM(Math.abs(value))})` : fmtM(value)}
          </span>
        )}
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

function ExitScenarios({ calc, m }) {
  function irr(cfs) {
    let lo = -0.5, hi = 1.5
    const npv = rate => cfs.reduce((s, cf, t) => s + cf / Math.pow(1 + rate, t), 0)
    if (npv(lo) * npv(hi) > 0) return null
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2
      const v = npv(mid)
      if (Math.abs(v) < 1) return mid
      if (npv(lo) * v < 0) hi = mid; else lo = mid
    }
    return (lo + hi) / 2
  }

  const rampFactors = [0.55, 0.75, 0.90, 1.00, 1.05, 1.08, 1.10, 1.12, 1.14, 1.16]
  const annualCashFlows = rampFactors.map(r => calc.cashFlow * r)

  const EXIT_SCENARIOS = [
    { label: 'Year 5', hold: 5, capRate: 7.5 },
    { label: 'Year 7', hold: 7, capRate: 7.0 },
    { label: 'Year 10', hold: 10, capRate: 6.5 },
  ]

  const scenarios = EXIT_SCENARIOS.map(s => {
    const exitYearNOI = calc.ebitda * rampFactors[s.hold - 1]
    const grossSalePrice = exitYearNOI / (s.capRate / 100)
    const remainingDebt = Math.max(0, calc.debt - calc.principalPayment * s.hold)
    const netExitProceeds = grossSalePrice - remainingDebt
    const cfs = [-calc.equity]
    for (let i = 0; i < s.hold; i++) {
      const yrCf = annualCashFlows[i] || calc.cashFlow
      cfs.push(i === s.hold - 1 ? yrCf + netExitProceeds : yrCf)
    }
    const totalDistributions = cfs.slice(1).reduce((a, b) => a + b, 0)
    const equityMultiple = totalDistributions / calc.equity
    const computedIrr = irr(cfs)
    const lpPref = calc.lpPrefDollars * s.hold
    const gpCarryDollars = Math.max(0, (totalDistributions - calc.equity - lpPref) * (m.gpCarry / 100))

    return {
      ...s,
      exitYearNOI,
      grossSalePrice,
      remainingDebt,
      netExitProceeds,
      totalDistributions,
      equityMultiple,
      irr: computedIrr,
      lpPref,
      gpCarryDollars,
      cfs,
    }
  })

  return (
    <div className="fin-card exit-scenarios">
      <div className="fin-card__header">EXIT SCENARIOS &amp; INVESTOR RETURNS</div>
      <div className="exit-scenarios__intro">
        Simulated hold-and-sell outcomes at different cap rates. Assumes ramping NOI
        (55% Year 1 &rarr; 116% Year 10 of stabilized) and that debt amortizes at the
        selected {m.amortYears}-year schedule.
      </div>

      <div className="exit-grid">
        {scenarios.map(s => (
          <div key={s.label} className={`exit-card ${s.label === 'Year 7' ? 'exit-card--featured' : ''}`}>
            <div className="exit-card__head">
              <div className="exit-card__title">{s.label} Exit</div>
              <div className="exit-card__cap">Cap rate {s.capRate}%</div>
            </div>
            <div className="exit-card__hero">
              <div className="exit-card__hero-item">
                <span>IRR</span>
                <strong>{s.irr !== null ? `${(s.irr * 100).toFixed(1)}%` : '—'}</strong>
              </div>
              <div className="exit-card__hero-item">
                <span>Equity Multiple</span>
                <strong>{s.equityMultiple.toFixed(2)}x</strong>
              </div>
            </div>
            <div className="exit-card__rows">
              <div className="exit-row"><span>Exit year NOI</span><strong>{fmtM(s.exitYearNOI)}</strong></div>
              <div className="exit-row"><span>Gross sale price</span><strong>{fmtM(s.grossSalePrice)}</strong></div>
              <div className="exit-row"><span>Remaining debt</span><strong>({fmtM(s.remainingDebt)})</strong></div>
              <div className="exit-row exit-row--total"><span>Net exit proceeds</span><strong>{fmtM(s.netExitProceeds)}</strong></div>
              <div className="exit-row exit-row--divider"><span>Total distributions</span><strong>{fmtM(s.totalDistributions)}</strong></div>
              <div className="exit-row"><span>LP pref owed ({m.lpPrefReturn}% × {s.hold}y)</span><strong>{fmtM(s.lpPref)}</strong></div>
              <div className="exit-row"><span>Est. GP carry ({m.gpCarry}%)</span><strong>{fmtM(s.gpCarryDollars)}</strong></div>
            </div>
          </div>
        ))}
      </div>

      <div className="exit-cashflow-table">
        <div className="exit-cashflow-table__title">CASH FLOW SCHEDULE — YEAR 7 EXIT</div>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th className="num">Cash Flow</th>
              <th className="num">Cumulative</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const sc = scenarios.find(s => s.label === 'Year 7')
              let cum = 0
              return sc.cfs.map((cf, i) => {
                cum += cf
                return (
                  <tr key={i} className={cf >= 0 ? 'pos' : 'neg'}>
                    <td>{i === 0 ? 'Close' : `Year ${i}`}</td>
                    <td className="num">{cf < 0 ? `(${fmtM(Math.abs(cf))})` : fmtM(cf)}</td>
                    <td className="num">{cum < 0 ? `(${fmtM(Math.abs(cum))})` : fmtM(cum)}</td>
                    <td>{i === 0 ? 'Equity invested' : i === sc.hold ? 'Ops cash flow + exit proceeds' : 'Operating cash flow'}</td>
                  </tr>
                )
              })
            })()}
          </tbody>
        </table>
      </div>

      <div className="insight-box insight-box--positive">
        A Year 7 exit at a 7.0% cap rate targets approximately{' '}
        <strong>{scenarios[1].irr !== null ? `${(scenarios[1].irr * 100).toFixed(1)}%` : '—'} IRR</strong>
        {' '}and a <strong>{scenarios[1].equityMultiple.toFixed(2)}x equity multiple</strong> on {fmtM(calc.equity)} of LP equity &mdash; assuming NOI ramps to {fmtM(scenarios[1].exitYearNOI)} and cap rates compress into the mid-7s.
      </div>
    </div>
  )
}
