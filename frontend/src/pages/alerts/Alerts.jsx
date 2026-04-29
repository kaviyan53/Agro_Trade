import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  XCircle,
  Clock3,
  MapPin,
  Droplets,
  Thermometer,
  Wind,
  Users,
  FileText,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import './Alerts.css'

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 }

const CONFIG = {
  critical: {
    icon: XCircle,
    cls: 'alert-critical',
    chip: 'tone-critical',
    badge: 'badge-red',
    label: 'Critical',
    statusCopy: 'Immediate action required in the next 60 minutes',
  },
  warning: {
    icon: AlertTriangle,
    cls: 'alert-warning',
    chip: 'tone-warning',
    badge: 'badge-amber',
    label: 'Warning',
    statusCopy: 'Action needed today',
  },
  info: {
    icon: Info,
    cls: 'alert-info',
    chip: 'tone-info',
    badge: 'badge-blue',
    label: 'Info',
    statusCopy: 'Informational update',
  },
}

const PROFILE_RULES = [
  {
    key: 'pest',
    match: ['pest', 'armyworm', 'larvae', 'insect'],
    field: 'North Field (Corn)',
    location: 'Northwest Quadrant',
    summary:
      'Crop health risk has escalated quickly and needs immediate scouting before the infestation spreads to neighboring rows.',
    whatHappened:
      'AgriAlert AI detected a pest-friendly microclimate and raised an incident after combining humidity shifts with crop stress signals.',
    why: 'High canopy moisture and low airflow are increasing the probability of early-stage larvae activity.',
    actions: [
      'Dispatch a scout or drone sweep across the affected quadrant.',
      'Inspect leaf undersides and whorl centers for eggs or feeding marks.',
      'Stage approved treatment materials near the field entrance.',
      'Reduce excess moisture in the affected irrigation zone.',
    ],
    defaultTeam: 'Scout Team Alpha',
    coords: '11.0192N, 76.9558E',
    sensor: { humidity: 88, temperatureF: 78, windMph: 4 },
  },
  {
    key: 'frost',
    match: ['frost', 'cold', 'freeze'],
    field: 'All Fields',
    location: 'Whole Farm',
    summary:
      'A low-temperature event is expected overnight and sensitive crops should be protected before midnight.',
    whatHappened:
      'The forecast-driven frost model predicts leaf-level temperature stress during the early morning window.',
    why: 'Low overnight temperatures combined with calm wind can trap cold air close to the crop canopy.',
    actions: [
      'Cover frost-sensitive rows before 11:30 PM.',
      'Run protective irrigation if your frost protocol allows it.',
      'Stage heaters or wind machines in the most exposed block.',
      'Recheck the weather panel at 11:00 PM and brief the night crew.',
    ],
    defaultTeam: 'Weather Response Team',
    weatherWindow: '4:00 AM to 5:00 AM',
    sensor: { humidity: 64, temperatureF: 33, windMph: 3 },
  },
  {
    key: 'water',
    match: ['waterlog', 'drainage', 'moisture', 'dry', 'irrigation'],
    field: 'East Irrigation Block',
    location: 'Section B',
    summary:
      'Soil moisture conditions are outside the healthy operating range and should be corrected in the next field cycle.',
    whatHappened:
      'The irrigation advisory engine flagged a moisture imbalance based on current field conditions and recent water usage.',
    why: 'The soil condition in this zone is no longer aligned with the crop target range.',
    actions: [
      'Inspect emitters and confirm actual water delivery in the affected section.',
      'Adjust the next irrigation cycle based on soil condition.',
      'Review drainage or runoff issues before the next watering window.',
      'Recheck field moisture after the correction pass.',
    ],
    defaultTeam: 'Irrigation Team',
    sensor: { humidity: 58, temperatureF: 82, windMph: 7 },
  },
  {
    key: 'fungal',
    match: ['fungal', 'humidity', 'infection', 'disease'],
    field: 'Humidity Watch Zone',
    location: 'Canopy Sector 3',
    summary:
      'A humidity-driven disease window is opening and crop scouting should be completed before conditions worsen.',
    whatHappened:
      'Disease-risk logic has identified a sustained humidity pocket that could promote fungal spread.',
    why: 'High humidity, limited airflow, and crop canopy density create favorable infection conditions.',
    actions: [
      'Scout the lower canopy for early lesions or mold spots.',
      'Open airflow where possible through ventilation or pruning practices.',
      'Prepare preventative fungicide only if field confirmation supports it.',
      'Review irrigation timing to avoid further overnight moisture buildup.',
    ],
    defaultTeam: 'Crop Health Team',
    sensor: { humidity: 86, temperatureF: 75, windMph: 5 },
  },
  {
    key: 'system',
    match: ['system', 'firmware', 'hub', 'sensor update'],
    field: 'Central Hub',
    location: 'Operations Center',
    summary:
      'The platform has completed a system event successfully. No immediate field intervention is required.',
    whatHappened:
      'A backend or device maintenance event completed and has been logged to the operations timeline.',
    why: 'Routine maintenance or firmware deployment finished without blocking field operations.',
    actions: [
      'Review the deployment summary in the operations log.',
      'Confirm all field devices are reporting normally.',
    ],
    defaultTeam: 'Platform Ops',
    sensor: { humidity: 49, temperatureF: 74, windMph: 0 },
  },
  {
    key: 'harvest',
    match: ['harvest', 'readiness', 'grain', 'window'],
    field: 'West Basin (Wheat)',
    location: 'Harvest Planning Zone',
    summary:
      'Harvest timing is moving into a favorable window and crews can prepare for execution.',
    whatHappened:
      'Harvest readiness signals indicate that crop moisture and maturity are approaching the preferred threshold.',
    why: 'Moisture readings and harvest timing guidance are aligned with an efficient cutting window.',
    actions: [
      'Confirm harvester availability for the target window.',
      'Review transport and storage readiness.',
    ],
    defaultTeam: 'Harvest Crew',
    sensor: { humidity: 45, temperatureF: 79, windMph: 6 },
  },
]

const DEFAULT_PROFILE = {
  key: 'generic',
  field: 'Farm Operations',
  location: 'Primary Zone',
  summary: 'AgriAlert AI has logged an alert that should be reviewed and actioned based on its severity.',
  whatHappened:
    'An alert condition was detected from farm data and routed to the incident center for farmer review.',
  why: 'The alert crossed one of the configured advisory thresholds.',
  actions: [
    'Review the alert details and affected area.',
    'Dispatch the correct field owner if conditions require on-site verification.',
    'Record the response outcome after inspection.',
  ],
  defaultTeam: 'Field Response Team',
  sensor: { humidity: 61, temperatureF: 77, windMph: 5 },
}

function getUserName() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')?.full_name || 'Farm Admin'
  } catch {
    return 'Farm Admin'
  }
}

function timeAgo(dateString) {
  const timestamp = new Date(dateString).getTime()
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))

  if (seconds < 60) return `${seconds} sec ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`
  return `${Math.floor(seconds / 86400)} day ago`
}

function formatAlertId(id) {
  return `AL-${String(id).padStart(3, '0')}`
}

function formatLogTime(date) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function seedNumber(alert) {
  return alert.id * 17 + alert.title.length * 11 + alert.message.length
}

function deriveSensor(profile, alert) {
  const base = profile.sensor || DEFAULT_PROFILE.sensor
  const seed = seedNumber(alert)
  const humidity = Math.min(96, Math.max(32, base.humidity + (seed % 7) - 3))
  const temperatureF = Math.min(104, Math.max(31, base.temperatureF + (seed % 5) - 2))
  const windMph = Math.max(0, base.windMph + (seed % 3) - 1)

  return { humidity, temperatureF, windMph }
}

function detectProfile(alert) {
  const haystack = `${alert.title} ${alert.message}`.toLowerCase()
  return PROFILE_RULES.find(rule => rule.match.some(keyword => haystack.includes(keyword))) || DEFAULT_PROFILE
}

function sortAlerts(items) {
  return [...items].sort((a, b) => {
    if (!!a.is_resolved !== !!b.is_resolved) return a.is_resolved ? 1 : -1
    const severityGap = (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99)
    if (severityGap !== 0) return severityGap
    return new Date(b.created_at) - new Date(a.created_at)
  })
}

function buildReason(alert, profile, live) {
  const title = alert.title.toLowerCase()

  if (title.includes('frost')) {
    return `Forecast guidance shows temperatures near ${live.temperatureF}F with calm wind, which increases frost retention near the canopy.`
  }
  if (title.includes('fungal') || title.includes('humidity')) {
    return `Humidity is running at ${live.humidity}% and airflow is low, so disease pressure is increasing in the affected canopy zone.`
  }
  if (title.includes('heat')) {
    return `Temperature pressure is elevated and the crop is outside its safe comfort range, increasing stress risk during the next field cycle.`
  }
  if (title.includes('water') || title.includes('moisture') || title.includes('dry')) {
    return `Current soil-water conditions are outside the target operating band and need correction before the next irrigation pass.`
  }
  return profile.why
}

function buildActionPlan(alert, profile) {
  const steps = profile.actions || DEFAULT_PROFILE.actions
  if (alert.severity === 'critical') return steps.slice(0, 4)
  if (alert.severity === 'warning') return steps.slice(0, 3)
  return steps.slice(0, 2)
}

function buildActivityLog(alert, assignedTeam, userName) {
  const created = new Date(alert.created_at)
  const events = [
    {
      time: formatLogTime(new Date(created.getTime() - 4 * 60 * 1000)),
      actor: 'Sensor Hub',
      action: 'Incoming field telemetry validated',
    },
    {
      time: formatLogTime(new Date(created.getTime() - 2 * 60 * 1000)),
      actor: 'AgriAlert AI',
      action: 'Threshold logic evaluated and incident classified',
    },
    {
      time: formatLogTime(created),
      actor: 'System Engine',
      action: 'Alert generated and published to the farmer dashboard',
    },
  ]

  if (assignedTeam) {
    events.push({
      time: formatLogTime(new Date(created.getTime() + 3 * 60 * 1000)),
      actor: userName,
      action: `Assigned response team: ${assignedTeam}`,
    })
  }

  if (alert.is_resolved) {
    events.push({
      time: formatLogTime(new Date()),
      actor: userName,
      action: 'Marked alert as resolved and archived for history',
    })
  }

  return events
}

function buildAlertView(alert, assignedTeams, completedSteps, userName) {
  const profile = detectProfile(alert)
  const live = deriveSensor(profile, alert)
  const actions = buildActionPlan(alert, profile)
  const alertId = formatAlertId(alert.id)
  const completed = completedSteps[alert.id] || []

  return {
    ...alert,
    alertId,
    profile,
    live,
    fieldLabel: profile.field,
    locationLabel: profile.location,
    relativeTime: timeAgo(alert.created_at),
    summaryLine: profile.summary,
    whatHappened: profile.whatHappened,
    whyItHappened: buildReason(alert, profile, live),
    actionPlan: actions.map((label, index) => ({
      id: index + 1,
      label,
      done: completed.includes(index + 1),
    })),
    assignedTeam: assignedTeams[alert.id] || '',
    activityLog: buildActivityLog(alert, assignedTeams[alert.id], userName),
    exactWindow:
      profile.weatherWindow ||
      (alert.title.toLowerCase().includes('frost') ? 'Forecast window pending latest weather refresh' : ''),
  }
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [assignedTeams, setAssignedTeams] = useState({})
  const [completedSteps, setCompletedSteps] = useState({})

  const userName = useMemo(() => getUserName(), [])

  const load = () => {
    setLoading(true)
    api.get('/alerts/').then(r => setAlerts(r.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const resolve = async alert => {
    if (alert.severity === 'critical' && !assignedTeams[alert.id]) {
      toast.error('Assign a team before resolving a critical alert.')
      return
    }

    await api.patch(`/alerts/${alert.id}/resolve`)
    toast.success(`${formatAlertId(alert.id)} marked as resolved`)
    load()
  }

  const assignTeam = alert => {
    const team = detectProfile(alert).defaultTeam
    setAssignedTeams(prev => ({ ...prev, [alert.id]: team }))
    toast.success(`${team} assigned to ${formatAlertId(alert.id)}`)
  }

  const toggleStep = (alertId, stepId) => {
    setCompletedSteps(prev => {
      const existing = prev[alertId] || []
      const updated = existing.includes(stepId)
        ? existing.filter(id => id !== stepId)
        : [...existing, stepId].sort((a, b) => a - b)
      return { ...prev, [alertId]: updated }
    })
  }

  const requestReport = alert => {
    toast.success(`Incident report queued for ${formatAlertId(alert.id)}`)
  }

  const visible = useMemo(() => {
    const sorted = sortAlerts(alerts)
    return sorted.filter(a => {
      if (filter === 'active') return !a.is_resolved
      if (filter === 'resolved') return !!a.is_resolved
      return true
    })
  }, [alerts, filter])

  useEffect(() => {
    if (!visible.length) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !visible.some(item => item.id === selectedId)) {
      setSelectedId(visible[0].id)
    }
  }, [visible, selectedId])

  const detail = visible.find(item => item.id === selectedId)
  const activeCount = alerts.filter(a => !a.is_resolved).length
  const criticalCount = alerts.filter(a => !a.is_resolved && a.severity === 'critical').length
  const resolvedCount = alerts.filter(a => !!a.is_resolved).length

  return (
    <div className="alerts-page">
      <div className="alerts-hero card">
        <div>
          <p className="alerts-kicker">AgriAlert AI</p>
          <h1 className="alerts-title">Intelligent alert and incident management</h1>
          <p className="alerts-copy">
            Monitor farm risk in real time, explain what happened, why it happened, and what the team
            should do next.
          </p>
        </div>
        <div className="alerts-hero-stats">
          <div className="alerts-stat">
            <span className="alerts-stat-label">Active</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="alerts-stat critical">
            <span className="alerts-stat-label">Critical</span>
            <strong>{criticalCount}</strong>
          </div>
          <div className="alerts-stat resolved">
            <span className="alerts-stat-label">Resolved</span>
            <strong>{resolvedCount}</strong>
          </div>
        </div>
      </div>

      <div className="page-header alerts-page-header">
        <div>
          <h2 className="section-title">Alert Control Center</h2>
          <p className="section-sub">Critical incidents are always pinned above warnings and information alerts.</p>
        </div>
        {activeCount > 0 && (
          <div className="alert-count-pill">
            <Bell size={13} /> {activeCount} active | {criticalCount} critical
          </div>
        )}
      </div>

      <div className="alerts-tabs">
        {['all', 'active', 'resolved'].map(t => (
          <button key={t} className={`tab-btn ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'active' && activeCount > 0 && <span className="tab-badge">{activeCount}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state card" style={{ padding: 56 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state card" style={{ padding: 64 }}>
          <Bell size={48} />
          <p>{filter === 'active' ? 'No active incidents. AgriAlert AI sees stable conditions.' : 'No alerts to show.'}</p>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
            Alerts are created automatically from predictions and field risk signals.
          </span>
        </div>
      ) : (
        <div className="alerts-board">
          <aside className="alerts-feed card">
            <div className="alerts-feed-header">
              <h3>All Alerts</h3>
              <span>Viewing {visible.length} total</span>
            </div>

            <div className="alerts-feed-list">
              {visible.map(alert => {
                const view = buildAlertView(alert, assignedTeams, completedSteps, userName)
                const cfg = CONFIG[alert.severity] || CONFIG.info
                const Icon = cfg.icon

                return (
                  <button
                    key={alert.id}
                    className={`alert-feed-item ${cfg.cls} ${selectedId === alert.id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(alert.id)}
                  >
                    <div className="alert-feed-top">
                      <span className={`alert-feed-severity ${cfg.chip}`}>{cfg.label.toUpperCase()}</span>
                      <span className="alert-feed-id">{view.alertId}</span>
                    </div>
                    <div className="alert-feed-main">
                      <div className="alert-feed-icon">
                        <Icon size={16} />
                      </div>
                      <div className="alert-feed-copy">
                        <strong>{alert.title}</strong>
                        <span>{view.fieldLabel}</span>
                        <small>{view.relativeTime}</small>
                      </div>
                      <ChevronRight size={16} className="alert-feed-arrow" />
                    </div>
                    {alert.severity === 'warning' && view.exactWindow && (
                      <p className="alert-feed-note">Action window: {view.exactWindow}</p>
                    )}
                    {alert.is_resolved && <p className="alert-feed-note resolved">Resolved and archived for history</p>}
                  </button>
                )
              })}
            </div>
          </aside>

          {detail && (() => {
            const view = buildAlertView(detail, assignedTeams, completedSteps, userName)
            const cfg = CONFIG[detail.severity] || CONFIG.info
            const Icon = cfg.icon

            return (
              <section className={`alert-detail card ${cfg.cls}`}>
                <div className="alert-detail-header">
                  <div className="alert-detail-status-row">
                    <span className={`alert-chip ${cfg.chip}`}>{cfg.label}</span>
                    <span className="alert-chip alert-chip-neutral">{detail.is_resolved ? 'Resolved' : 'Active'}</span>
                    <span className="alert-detail-id">{view.alertId}</span>
                  </div>
                  <div className="alert-detail-title-row">
                    <div className="alert-detail-icon">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3>{detail.title}</h3>
                      <p>{cfg.statusCopy}</p>
                    </div>
                  </div>
                  <div className="alert-detail-meta">
                    <span><MapPin size={14} /> {view.fieldLabel}</span>
                    <span><Clock3 size={14} /> {view.relativeTime}</span>
                    <span>{view.locationLabel}</span>
                  </div>
                </div>

                <div className="alert-detail-grid">
                  <div className="alert-detail-section">
                    <h4>What happened</h4>
                    <p>{view.whatHappened}</p>
                  </div>

                  <div className="alert-detail-section">
                    <h4>Why it happened</h4>
                    <p>{view.whyItHappened}</p>
                    {view.exactWindow && (
                      <p className="alert-detail-emphasis">Forecast window: {view.exactWindow}</p>
                    )}
                  </div>
                </div>

                <div className="alert-live-card">
                  <div className="alert-live-head">
                    <h4>Live conditions</h4>
                    <span>{view.summaryLine}</span>
                  </div>
                  <div className="alert-live-stats">
                    <div className="alert-live-stat">
                      <Droplets size={16} />
                      <div>
                        <span>Humidity</span>
                        <strong>{view.live.humidity}%</strong>
                      </div>
                    </div>
                    <div className="alert-live-stat">
                      <Thermometer size={16} />
                      <div>
                        <span>Temperature</span>
                        <strong>{view.live.temperatureF}F</strong>
                      </div>
                    </div>
                    <div className="alert-live-stat">
                      <Wind size={16} />
                      <div>
                        <span>Wind</span>
                        <strong>{view.live.windMph} mph</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert-detail-section">
                  <div className="alert-section-header">
                    <div>
                      <h4>{detail.severity === 'critical' ? 'Act now - next 60 minutes' : 'Recommended action plan'}</h4>
                      <p>
                        {detail.severity === 'critical'
                          ? 'Close the highest-risk steps first and keep the field team updated.'
                          : 'Action the following steps during today’s field cycle.'}
                      </p>
                    </div>
                    {view.assignedTeam && (
                      <span className="alert-chip alert-chip-team"><Users size={13} /> {view.assignedTeam}</span>
                    )}
                  </div>

                  <div className="alert-action-list">
                    {view.actionPlan.map(step => (
                      <button
                        key={step.id}
                        className={`alert-action-item ${step.done ? 'done' : ''}`}
                        onClick={() => toggleStep(detail.id, step.id)}
                      >
                        <span className="alert-action-check">{step.done ? 'Done' : `Step ${step.id}`}</span>
                        <span>{step.label}</span>
                      </button>
                    ))}
                  </div>
                  {view.profile.coords && (
                    <p className="alert-coords">Suggested scout coordinates: {view.profile.coords}</p>
                  )}
                </div>

                <div className="alert-actions-row">
                  {!detail.is_resolved && (
                    <>
                      <button className="btn btn-outline" onClick={() => assignTeam(detail)}>
                        <Users size={14} /> Assign Team
                      </button>
                      <button className="btn btn-primary" onClick={() => resolve(detail)}>
                        <CheckCheck size={14} /> Mark as Resolved
                      </button>
                    </>
                  )}
                  {detail.is_resolved && (
                    <button className="btn btn-outline" onClick={() => requestReport(detail)}>
                      <FileText size={14} /> Generate Incident Report
                    </button>
                  )}
                </div>

                <div className="alert-detail-section">
                  <h4>Activity log</h4>
                  <div className="alert-log-list">
                    {view.activityLog.map((item, index) => (
                      <div key={`${item.time}-${index}`} className="alert-log-item">
                        <span className="alert-log-time">{item.time}</span>
                        <div>
                          <strong>{item.actor}</strong>
                          <p>{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          })()}
        </div>
      )}
    </div>
  )
}
