import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell
} from 'recharts'
import { BarChart2, Leaf, TrendingUp, Droplets, ShieldAlert, FileText, Search } from 'lucide-react'
import './Analytics.css'

const currentRange = 'Oct 01 - Oct 31, 2023'

const seasonalSummary = [
  { key: 'Seasonal Yield', value: 12450, unit: 'kg', delta: 14, trend: 'up', icon: Leaf, color: 'var(--green)' },
  { key: 'Avg Soil Health', value: 88, unit: '/ 100', delta: 3.2, trend: 'up', icon: ShieldAlert, color: 'var(--blue)' },
  { key: 'Water Usage', value: 2.4, unit: 'M Gal', delta: -8, trend: 'down', icon: Droplets, color: 'var(--amber)' },
  { key: 'Efficiency Score', value: 94.2, unit: '%', delta: 2.1, trend: 'up', icon: TrendingUp, color: 'var(--green)' },
]

const monthlyBenchmark = [
  { label: 'Yield', current: 12450, previous: 10921, unit: 'kg' },
  { label: 'Soil', current: 88.0, previous: 85.3, unit: '/100' },
  { label: 'Water', current: 2.4, previous: 2.6, unit: 'M Gal' },
  { label: 'Efficiency', current: 94.2, previous: 92.2, unit: '%' },
]

const yieldHistory = [
  { month: 'Jan', actual: 310, forecast: 300 },
  { month: 'Feb', actual: 340, forecast: 330 },
  { month: 'Mar', actual: 480, forecast: 460 },
  { month: 'Apr', actual: 720, forecast: 700 },
  { month: 'May', actual: 980, forecast: 950 },
  { month: 'Jun', actual: 1180, forecast: 1150 },
  { month: 'Jul', actual: 1210, forecast: 1200 },
]

const moistureSectors = [
  { sector: 'North Alpha', moisture: 87, status: 'Optimal', flag: false, note: 'Strong retention, no correction needed.' },
  { sector: 'East Beta', moisture: 61, status: 'Good', flag: false, note: 'Stable moisture band for current crop stage.' },
  { sector: 'West Delta', moisture: 94, status: 'Overwatered', flag: true, note: '⚠️ Reduce irrigation and inspect drainage.' },
  { sector: 'Sector 4', moisture: 74, status: 'Optimal', flag: false, note: 'Balanced and responsive to current schedule.' },
  { sector: 'Sector 5', moisture: 65, status: 'Good', flag: false, note: 'Slightly dry-leaning but within target range.' },
]

const reports = [
  { id: 'REP-2024-001', name: 'Seasonal Yield Audit Q1', type: 'PDF', size: '2.4MB', date: 'Oct 12, 2023', status: 'Generated', eta: '-' },
  { id: 'REP-2024-002', name: 'Soil Nutrient Distribution', type: 'CSV', size: '11MB', date: 'Oct 15, 2023', status: 'Generated', eta: '-' },
  { id: 'REP-2024-003', name: 'Irrigation Efficiency Log', type: 'PDF', size: '4.8MB', date: 'Oct 20, 2023', status: 'Archived', eta: '-' },
  { id: 'REP-2024-004', name: 'Pest Impact Assessment', type: 'PDF', size: '3.2MB', date: 'Oct 28, 2023', status: 'Generated', eta: '-' },
  { id: 'REP-2024-005', name: 'Field 4 Harvest Summary', type: 'CSV', size: '0.8MB', date: 'Nov 02, 2023', status: 'Processing', eta: '10-15 min' },
]

const statusClass = {
  Generated: 'badge-green',
  Archived: 'badge-gray',
  Processing: 'badge-amber',
}

const reportTypeLabel = {
  PDF: 'badge-blue',
  CSV: 'badge-gray',
}

const formatYield = (value) => new Intl.NumberFormat('en-US').format(value)

const formatBenchmark = (value, unit) => {
  if (unit === 'M Gal') return `${value.toFixed(2)} ${unit}`
  if (unit === '%') return `${value.toFixed(1)}${unit}`
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} ${unit}`
}

const deltaText = (delta) => `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta)}%`

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="analytics-tooltip">
      <div className="analytics-tooltip__label">{label}</div>
      {payload.map((item) => (
        <div key={item.name} className="analytics-tooltip__row" style={{ color: item.color }}>
          <span>{item.name}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [reportQuery, setReportQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const filteredReports = useMemo(() => {
    const normalized = reportQuery.trim().toLowerCase()

    return reports.filter((report) => {
      const matchesName = !normalized || report.name.toLowerCase().includes(normalized) || report.id.toLowerCase().includes(normalized)
      const matchesDate = !dateFilter || report.date === dateFilter
      return matchesName && matchesDate
    })
  }, [dateFilter, reportQuery])

  const readyReports = reports.filter((report) => report.status === 'Generated').length
  const insight = 'Yield is outperforming last month while water use is down 8%. Reduce irrigation in West Delta immediately and prioritize report review for pest impact planning.'

  return (
    <div className="analytics-page">
      <div className="page-header analytics-header">
        <div>
          <h1 className="section-title">AgriAnalytics AI</h1>
          <p className="section-sub">Farm performance intelligence and report automation for {currentRange}</p>
        </div>
        <div className="analytics-date-pill">{currentRange}</div>
      </div>

      <section className="analytics-hero card">
        <div className="analytics-hero__copy">
          <div className="analytics-hero__eyebrow">Key performance snapshot</div>
          <p className="analytics-hero__text">
            Your farm is running efficiently this season. Yield is rising, soil health is improving, and irrigation use is down versus last month.
          </p>
        </div>
        <div className="analytics-hero__stats">
          <div className="analytics-hero__stat">
            <span>Reports ready</span>
            <strong>{readyReports}</strong>
          </div>
          <div className="analytics-hero__stat">
            <span>Active sectors</span>
            <strong>{moistureSectors.length}</strong>
          </div>
          <div className="analytics-hero__stat">
            <span>Overwatered</span>
            <strong>{moistureSectors.filter((sector) => sector.flag).length}</strong>
          </div>
        </div>
      </section>

      <section className="analytics-kpis">
        {seasonalSummary.map((item) => {
          const Icon = item.icon
          return (
            <article key={item.key} className="card analytics-kpi">
              <div className="analytics-kpi__icon" style={{ color: item.color, background: `color-mix(in srgb, ${item.color} 12%, transparent)` }}>
                <Icon size={18} />
              </div>
              <div className="analytics-kpi__value">
                {item.key === 'Water Usage' ? `${item.value.toFixed(1)} ${item.unit}` : `${formatYield(item.value)} ${item.unit}`.trim()}
              </div>
              <div className="analytics-kpi__meta">
                <span>{item.key}</span>
                <strong className={item.trend === 'down' ? 'is-negative' : 'is-positive'}>
                  {deltaText(item.delta)}
                  {item.trend === 'down' ? ' efficient' : ''}
                </strong>
              </div>
            </article>
          )
        })}
      </section>

      <section className="analytics-grid">
        <article className="card analytics-panel">
          <div className="analytics-panel__head">
            <div>
              <h3 className="section-title">Actual vs AI Forecast</h3>
              <p className="section-sub">Historical yield comparison from Jan to Jul</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={yieldHistory} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Yield"
                stroke="var(--green)"
                strokeWidth={3}
                dot={{ fill: 'var(--green)', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="AI Forecast"
                stroke="var(--green-light)"
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={{ fill: 'var(--green-light)', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="analytics-panel__insight">
            ✅ Insight: Actual yield is consistently above the forecast by 0.8% to 4.3%, which confirms strong field execution.
          </p>
        </article>

        <article className="card analytics-panel">
          <div className="analytics-panel__head">
            <div>
              <h3 className="section-title">Current vs Last Month</h3>
              <p className="section-sub">Benchmark comparison across key farm metrics</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyBenchmark} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="current" name="Current" radius={[6, 6, 0, 0]} fill="var(--green)">
                {monthlyBenchmark.map((entry) => (
                  <Cell key={entry.label} fill="var(--green)" />
                ))}
              </Bar>
              <Bar dataKey="previous" name="Last Month" radius={[6, 6, 0, 0]} fill="var(--green-light)">
                {monthlyBenchmark.map((entry) => (
                  <Cell key={entry.label} fill="var(--green-light)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="analytics-benchmark">
            {monthlyBenchmark.map((item) => (
              <div key={item.label} className="analytics-benchmark__row">
                <span>{item.label}</span>
                <strong>{formatBenchmark(item.current, item.unit)}</strong>
                <span className="analytics-benchmark__muted">last month {formatBenchmark(item.previous, item.unit)}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="analytics-grid analytics-grid--two">
        <article className="card analytics-panel">
          <div className="analytics-panel__head">
            <div>
              <h3 className="section-title">Moisture Distribution</h3>
              <p className="section-sub">Live sector moisture readings and anomaly flags</p>
            </div>
          </div>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Sector</th>
                <th>Moisture</th>
                <th>Status</th>
                <th>Flag</th>
              </tr>
            </thead>
            <tbody>
              {moistureSectors.map((sector) => (
                <tr key={sector.sector} className={sector.flag ? 'is-alert' : ''}>
                  <td className="td-bold">{sector.sector}</td>
                  <td>
                    <div className="score-bar-wrap">
                      <div className={`analytics-score ${sector.flag ? 'is-alert' : ''}`} style={{ width: `${sector.moisture}%` }} />
                      <span>{sector.moisture}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${sector.flag ? 'badge-red' : sector.status === 'Optimal' ? 'badge-green' : 'badge-amber'}`}>
                      {sector.status}
                    </span>
                  </td>
                  <td>{sector.flag ? '⚠️ Overwatering risk' : 'Normal'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="analytics-panel__insight">
            ⚠️ West Delta is above the safe moisture range. Cut irrigation immediately and verify drainage before the next watering cycle.
          </p>
        </article>

        <article className="card analytics-panel">
          <div className="analytics-panel__head analytics-panel__head--stacked">
            <div>
              <h3 className="section-title">Report Generation</h3>
              <p className="section-sub">Search by report name, ID, or date before export</p>
            </div>
            <div className="analytics-filters">
              <div className="analytics-search">
                <Search size={15} />
                <input
                  className="form-input"
                  placeholder="Filter reports"
                  value={reportQuery}
                  onChange={(event) => setReportQuery(event.target.value)}
                />
              </div>
              <input
                className="form-input analytics-date-input"
                placeholder="Oct 12, 2023"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              />
            </div>
          </div>

          <div className="report-list">
            <div className="report-list__head">
              <span>ID</span>
              <span>Report</span>
              <span>Type</span>
              <span>Size</span>
              <span>Status</span>
            </div>
            {filteredReports.map((report) => (
              <div key={report.id} className="report-row">
                <span className="td-bold">{report.id}</span>
                <span>
                  <div className="report-row__name">{report.name}</div>
                  <div className="report-row__date">{report.date}</div>
                </span>
                <span><span className={`badge ${reportTypeLabel[report.type]}`}>{report.type}</span></span>
                <span>{report.size}</span>
                <span>
                  <span className={`badge ${statusClass[report.status]}`}>{report.status}</span>
                  {report.status === 'Processing' && <div className="report-row__eta">ETA {report.eta}</div>}
                </span>
              </div>
            ))}
          </div>
          <p className="analytics-panel__insight">
            ✅ Insight: Start with REP-2024-004 for pest planning, then export the soil nutrient CSV to support irrigation optimization.
          </p>
        </article>
      </section>

      <section className="card analytics-footer">
        <FileText size={18} />
        <div>
          <strong>Season summary</strong>
          <p>{insight}</p>
        </div>
      </section>
    </div>
  )
}
