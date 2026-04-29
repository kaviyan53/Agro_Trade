import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import api from '../services/api'
import { Leaf, Bell, TrendingUp, BarChart2, Plus, ArrowRight } from 'lucide-react'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [fields, setFields] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/fields/'),
      api.get('/alerts/'),
    ]).then(([s, f, a]) => {
      setSummary(s.data)
      setFields(f.data.slice(0, 4))
      setAlerts(a.data.filter((x) => !x.is_resolved).slice(0, 3))
    }).finally(() => setLoading(false))
  }, [])

  const kpis = summary ? [
    { label: 'Total Fields', value: summary.total_fields, icon: Leaf, color: 'var(--green)' },
    { label: 'Predictions Run', value: summary.total_predictions, icon: TrendingUp, color: 'var(--blue)' },
    { label: 'Active Alerts', value: summary.active_alerts, icon: Bell, color: summary.active_alerts > 0 ? 'var(--amber)' : 'var(--green)' },
    { label: 'Avg Health Score', value: summary.avg_health_score ? `${summary.avg_health_score}` : '—', icon: BarChart2, color: 'var(--green)' },
  ] : []

  const severityBadge = (severity) => ({
    critical: 'badge-red',
    warning: 'badge-amber',
    info: 'badge-blue',
  }[severity] || 'badge-gray')

  if (loading) return <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /></div>

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="section-title">Welcome back, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p className="section-sub">
            {user?.farm_name || 'Your Farm'} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/crop-health/add')}>
          <Plus size={15} /> Add Field
        </button>
      </div>

      <div className="kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className={`card kpi-card kpi-${k.label.replace(/\s+/g, '-').toLowerCase()}`}>
            <div className="kpi-icon" style={{ background: `color-mix(in srgb, ${k.color} 12%, transparent)`, color: k.color }}>
              <k.icon size={18} />
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-two-col">
        <div className="card dash-section">
          <div className="dash-section-header">
            <span className="section-title" style={{ marginBottom: 0 }}>My Fields</span>
            <button className="btn btn-outline" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => navigate('/crop-health')}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {fields.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <Leaf size={32} />
              <p>No fields yet. <button className="link-btn" onClick={() => navigate('/crop-health/add')}>Add your first field</button></p>
            </div>
          ) : (
            <div className="field-list">
              {fields.map((f) => (
                <div key={f.id} className="field-row">
                  <div className="field-row-info">
                    <span className="field-name">{f.field_name}</span>
                    <span className="field-meta">{f.crop_type} · {f.location_city}</span>
                  </div>
                  <div className="field-row-right">
                    <span className={`badge ${f.soil_condition === 'dry' ? 'badge-amber' : f.soil_condition === 'waterlogged' ? 'badge-red' : 'badge-green'}`}>
                      {f.soil_condition}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card dash-section">
          <div className="dash-section-header">
            <span className="section-title" style={{ marginBottom: 0 }}>Recent Alerts</span>
            <button className="btn btn-outline" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => navigate('/alerts')}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {alerts.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <Bell size={32} />
              <p>No active alerts. All clear!</p>
            </div>
          ) : (
            <div className="alert-list">
              {alerts.map((a) => (
                <div key={a.id} className="alert-row">
                  <span className={`badge ${severityBadge(a.severity)}`}>{a.severity}</span>
                  <div className="alert-row-info">
                    <span className="alert-title">{a.title}</span>
                    <span className="alert-msg">{a.message.slice(0, 70)}…</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="quick-actions">
        {[
          { label: 'Check Weather', sub: 'Get real-time forecast', path: '/weather', icon: '🌤️' },
          { label: 'Run Prediction', sub: 'Get AI crop advice', path: '/predictions', icon: '🤖' },
          { label: 'View Analytics', sub: 'Health trends & charts', path: '/analytics', icon: '📊' },
        ].map((q) => (
          <button key={q.path} className="card quick-card" onClick={() => navigate(q.path)}>
            <span className="quick-icon">{q.icon}</span>
            <div>
              <div className="quick-label">{q.label}</div>
              <div className="quick-sub">{q.sub}</div>
            </div>
            <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }} />
          </button>
        ))}
      </div>
    </div>
  )
}
