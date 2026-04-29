import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../services/api'
import { TrendingUp, Play, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import './Predictions.css'

const riskColor = { Low: 'badge-green', Medium: 'badge-amber', High: 'badge-red', Unknown: 'badge-gray' }
const severityIcon = { critical: '🔴', warning: '🟡', info: '🔵' }

export default function Predictions() {
  const location = useLocation()
  const preselect = location.state

  const [fields, setFields] = useState([])
  const [selectedId, setSelectedId] = useState(preselect?.fieldId || '')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [running, setRunning] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    api.get('/fields/').then(r => setFields(r.data))
    api.get('/predictions/history').then(r => setHistory(r.data)).finally(() => setLoadingHistory(false))
  }, [])

  const runPrediction = async () => {
    if (!selectedId) { toast.error('Please select a field first.'); return }
    setRunning(true)
    setResult(null)
    try {
      const { data } = await api.post(`/predictions/run/${selectedId}`)
      setResult(data)
      // refresh history
      api.get('/predictions/history').then(r => setHistory(r.data))
      toast.success('Prediction complete!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Prediction failed. Try again.')
    } finally {
      setRunning(false)
    }
  }

  const scoreColor = s => s >= 80 ? '#2a7a4b' : s >= 60 ? '#d97706' : '#dc2626'

  return (
    <div className="pred-page">
      <div className="page-header">
        <div>
          <h1 className="section-title">AI Predictions Center</h1>
          <p className="section-sub">Get smart crop advisory by combining your field data with live weather</p>
        </div>
      </div>

      {/* Run panel */}
      <div className="card pred-run-panel">
        <div className="pred-run-left">
          <TrendingUp size={20} color="#2a7a4b" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-800)' }}>Run New Prediction</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
              Select a field — we'll fetch live weather and generate advice
            </div>
          </div>
        </div>
        <div className="pred-run-right">
          <select
            className="form-input"
            style={{ minWidth: 220 }}
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">— Select a field —</option>
            {fields.map(f => (
              <option key={f.id} value={f.id}>
                {f.field_name} ({f.crop_type} · {f.location_city})
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={runPrediction} disabled={running || !selectedId}>
            {running ? <span className="spinner" /> : <><Play size={14} /> Run</>}
          </button>
        </div>
      </div>

      {/* Result */}
      {running && (
        <div className="card pred-loading">
          <div className="spinner" style={{ width: 28, height: 28 }} />
          <div>
            <div style={{ fontWeight: 600 }}>Analysing your field…</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Fetching live weather · Running AI advisory engine</div>
          </div>
        </div>
      )}

      {result && (
        <div className="pred-result-grid">
          {/* Score card */}
          <div className="card score-card">
            <div className="score-label">Crop Health Score</div>
            <div className="score-ring" style={{ '--score-color': scoreColor(result.health_score) }}>
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--gray-100)" strokeWidth="7" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke={scoreColor(result.health_score)} strokeWidth="7"
                  strokeDasharray={`${(result.health_score / 100) * 213.6} 213.6`}
                  strokeLinecap="round" transform="rotate(-90 40 40)"
                />
              </svg>
              <div className="score-num" style={{ color: scoreColor(result.health_score) }}>
                {result.health_score}
              </div>
            </div>
            <span className={`badge ${riskColor[result.risk_level]}`}>{result.risk_level} Risk</span>
            <div className="score-weather">
              <Info size={12} /> {result.weather_summary}
            </div>
          </div>

          {/* Advice card */}
          <div className="card advice-card">
            <div className="advice-title">
              <CheckCircle size={16} color="#2a7a4b" /> Advisory Report
            </div>
            <p className="advice-summary">{result.advice}</p>

            <div className="advice-items">
              {result.advice_items?.map((item, i) => (
                <div key={i} className="advice-item">{item}</div>
              ))}
            </div>

            <div className="advice-pills">
              <div className="advice-pill">
                <span className="pill-label">💧 Irrigation</span>
                <span className="pill-value">{result.irrigation_advice}</span>
              </div>
              <div className="advice-pill">
                <span className="pill-label">🌱 Fertilizer</span>
                <span className="pill-value">{result.fertilizer_advice}</span>
              </div>
            </div>
          </div>

          {/* Weather used */}
          {result.weather && (
            <div className="card weather-snap">
              <div className="advice-title">🌤 Weather Used for This Prediction</div>
              <div className="weather-snap-grid">
                {[
                  ['Temperature', `${result.weather.temperature}°C`],
                  ['Humidity', `${result.weather.humidity}%`],
                  ['Wind', `${result.weather.wind_speed} km/h`],
                  ['Rain Expected', result.weather.rain_expected ? 'Yes' : 'No'],
                ].map(([k, v]) => (
                  <div key={k} className="wsnap-item">
                    <span className="wsnap-key">{k}</span>
                    <span className="wsnap-val">{v}</span>
                  </div>
                ))}
              </div>
              {result.weather._demo && (
                <div style={{ fontSize: 11, color: 'var(--amber-500)', marginTop: 8 }}>
                  ⚠️ Demo weather data — add OpenWeather API key for live data
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div className="card pred-history">
        <h3 className="section-title" style={{ marginBottom: 14 }}>Prediction History</h3>
        {loadingHistory ? (
          <div className="empty-state" style={{ padding: 24 }}><div className="spinner" /></div>
        ) : history.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <TrendingUp size={36} />
            <p>No predictions yet. Run your first one above.</p>
          </div>
        ) : (
          <div className="history-table">
            <div className="history-header">
              <span>Date</span><span>Field</span><span>Score</span><span>Risk</span><span>Irrigation</span>
            </div>
            {history.map(h => {
              const field = fields.find(f => f.id === h.field_id)
              return (
                <div key={h.id} className="history-row">
                  <span className="history-date">{new Date(h.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' })}</span>
                  <span className="history-field">{field?.field_name || `Field #${h.field_id}`}</span>
                  <span style={{ fontWeight: 600, color: scoreColor(h.health_score) }}>{h.health_score ?? '—'}</span>
                  <span><span className={`badge ${riskColor[h.risk_level] || 'badge-gray'}`}>{h.risk_level || '—'}</span></span>
                  <span className="history-irr">{h.irrigation_advice?.slice(0, 40) || '—'}{h.irrigation_advice?.length > 40 ? '…' : ''}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
