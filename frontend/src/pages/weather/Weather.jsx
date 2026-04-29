import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Cloud,
  CloudRain,
  Clock3,
  Droplets,
  Eye,
  MapPin,
  Search,
  ShieldAlert,
  Sprout,
  SunMedium,
  Thermometer,
  Wind,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import './Weather.css'

const QUICK_CITIES = ['Coimbatore', 'Chennai', 'Madurai', 'Bengaluru']

const iconUrl = (code) => `https://openweathermap.org/img/wn/${code}@2x.png`

const formatTemp = (value) => `${value}${String.fromCharCode(176)}C`

const getDayLabel = (date, index) => {
  if (index === 0) return 'Today'
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short' })
}

const getHeroTone = (weather) => {
  if (!weather) return 'mild'
  if (weather.rain_expected) return 'rain'
  if (weather.temperature >= 35) return 'heat'
  if (weather.temperature <= 12) return 'cold'
  return 'mild'
}

const soilStatusLabel = {
  dry: 'Dry',
  moist: 'Moist',
  waterlogged: 'Waterlogged',
}

const cropKeywords = {
  rice: { ideal: [22, 34], rainBonus: 6 },
  paddy: { ideal: [22, 34], rainBonus: 6 },
  tomato: { ideal: [18, 30], rainBonus: -4 },
  cotton: { ideal: [22, 34], rainBonus: -3 },
  maize: { ideal: [20, 32], rainBonus: 2 },
  sugarcane: { ideal: [22, 36], rainBonus: 4 },
}

function getSuitability(field, weather) {
  if (!field || !weather) return { score: 72, label: 'Moderate', note: 'Select a field to personalize crop weather fitness.' }

  const crop = field.crop_type?.toLowerCase() || ''
  const config = Object.entries(cropKeywords).find(([key]) => crop.includes(key))?.[1]
  const [idealMin, idealMax] = config?.ideal || [20, 32]

  let score = 72

  if (weather.temperature >= idealMin && weather.temperature <= idealMax) score += 10
  else if (weather.temperature < idealMin - 4 || weather.temperature > idealMax + 4) score -= 12
  else score -= 4

  if (field.soil_condition === 'moist') score += 8
  if (field.soil_condition === 'dry') score -= 6
  if (field.soil_condition === 'waterlogged') score -= 10

  if (weather.rain_expected) score += config?.rainBonus || 0
  if (weather.wind_speed >= 25) score -= 8

  score = Math.max(38, Math.min(96, score))

  const label = score >= 85 ? 'Excellent' : score >= 72 ? 'Strong' : score >= 58 ? 'Moderate' : 'Caution'
  const note =
    label === 'Excellent'
      ? 'Weather is strongly aligned with the selected crop today.'
      : label === 'Strong'
      ? 'Conditions are supportive, but routine monitoring is still important.'
      : label === 'Moderate'
      ? 'Use normal field work with some crop protection adjustments.'
      : 'Weather can stress this crop. Prioritize protection and water planning.'

  return { score, label, note }
}

function getPrimaryAlert(weather, selectedForecast) {
  if (!weather) return null

  const forecastRain = Boolean(selectedForecast?.rain)
  const rainRisk = weather.rain_expected || forecastRain

  if (rainRisk) {
    return {
      emoji: '🌧️',
      title: 'Rain Watch',
      hours: 4,
      tone: 'rain',
      bullets: [
        'Possible shower window can interrupt spray work and irrigation planning.',
        'Check drainage and keep harvested material away from open exposure.',
      ],
      action: 'Finish spraying and move exposed inputs or harvested produce within the next 4 hours.',
    }
  }

  if (weather.temperature >= 35) {
    return {
      emoji: '☀️',
      title: 'Heat Stress Alert',
      hours: 2,
      tone: 'heat',
      bullets: [
        `Field temperature is elevated at ${formatTemp(weather.temperature)}.`,
        'Tender crops and flowering stages may lose moisture quickly.',
      ],
      action: 'Irrigate in cooler hours and avoid midday spraying within the next 2 hours.',
    }
  }

  if (weather.wind_speed >= 20) {
    return {
      emoji: '💨',
      title: 'Spray Window Caution',
      hours: 3,
      tone: 'air',
      bullets: [
        `Wind speed is ${weather.wind_speed} km/h${weather.wind_direction ? ` heading ${weather.wind_direction}` : ''}.`,
        'Spray drift risk can increase as the day warms.',
      ],
      action: 'Complete spray work early or postpone it if winds continue rising in the next 3 hours.',
    }
  }

  if (weather.temperature <= 12) {
    return {
      emoji: '❄️',
      title: 'Cold Stress Watch',
      hours: 6,
      tone: 'cold',
      bullets: [
        `Cool conditions around ${formatTemp(weather.temperature)} can slow crop activity.`,
        'Young plants may need protection if night cooling continues.',
      ],
      action: 'Prepare covers or cold protection within the next 6 hours for sensitive crops.',
    }
  }

  return {
    emoji: '🌤️',
    title: 'Stable Field Window',
    hours: 6,
    tone: 'growth',
    bullets: [
      'No immediate severe weather threat is visible for the selected field.',
      'Conditions are suitable for regular monitoring and planned field work.',
    ],
    action: 'Use the next 6 hours for routine operations, scouting, and irrigation review.',
  }
}

function getFarmAction(weather, field, selectedForecast) {
  if (!weather) return 'Check your field weather first to get the best action recommendation.'

  const fieldName = field?.field_name || weather.city
  const rainRisk = weather.rain_expected || Boolean(selectedForecast?.rain)

  if (rainRisk) {
    return `Skip irrigation for **${fieldName}** until you check actual soil moisture after the rain window.`
  }

  if (weather.temperature >= 35) {
    return `Good time to irrigate **${fieldName}** in the early morning or evening and avoid midday spray activity.`
  }

  if (weather.wind_speed >= 20) {
    return `Field work is possible, but avoid spraying in **${fieldName}** until winds settle.`
  }

  return `Good working window for **${fieldName}** today. Continue scouting and keep your regular irrigation schedule.`
}

export default function Weather() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [fields, setFields] = useState([])
  const [selectedFieldId, setSelectedFieldId] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedForecastIndex, setSelectedForecastIndex] = useState(0)
  const [activeQuickCity, setActiveQuickCity] = useState('')

  useEffect(() => {
    api.get('/fields/')
      .then((response) => {
        const nextFields = response.data || []
        setFields(nextFields)

        if (nextFields.length > 0) {
          const firstField = nextFields[0]
          setSelectedFieldId(String(firstField.id))
          setCity(firstField.location_city)
          setActiveQuickCity(firstField.location_city)
          loadWeather(firstField.location_city)
        }
      })
      .catch(() => {
        setFields([])
      })
  }, [])

  const selectedField = useMemo(
    () => fields.find((field) => String(field.id) === String(selectedFieldId)) || null,
    [fields, selectedFieldId]
  )

  const loadWeather = async (targetCity) => {
    const nextCity = targetCity.trim()
    if (!nextCity) return

    setLoading(true)
    setCity(nextCity)
    setActiveQuickCity(nextCity)

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        api.get(`/weather/current?city=${encodeURIComponent(nextCity)}`),
        api.get(`/weather/forecast?city=${encodeURIComponent(nextCity)}`),
      ])
      setWeather(currentResponse.data)
      setForecast(forecastResponse.data)
      setSelectedForecastIndex(0)
    } catch {
      toast.error('Could not fetch weather. Check the city name.')
    } finally {
      setLoading(false)
    }
  }

  const search = async (event) => {
    event.preventDefault()
    await loadWeather(city)
  }

  const handleFieldChange = async (event) => {
    const nextId = event.target.value
    setSelectedFieldId(nextId)
    const nextField = fields.find((field) => String(field.id) === String(nextId))
    if (nextField?.location_city) {
      await loadWeather(nextField.location_city)
    }
  }

  const selectedForecast = forecast[selectedForecastIndex] || forecast[0] || null
  const suitability = useMemo(() => getSuitability(selectedField, weather), [selectedField, weather])
  const primaryAlert = useMemo(() => getPrimaryAlert(weather, selectedForecast), [selectedForecast, weather])
  const farmAction = useMemo(() => getFarmAction(weather, selectedField, selectedForecast), [selectedField, selectedForecast, weather])

  const farmImpactCards = useMemo(() => {
    if (!weather) return []

    return [
      { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%`, tone: 'fresh' },
      {
        icon: Wind,
        label: 'Wind',
        value: `${weather.wind_speed} km/h${weather.wind_direction ? ` ${weather.wind_direction}` : ''}`,
        tone: 'air',
      },
      {
        icon: SunMedium,
        label: 'UV Index',
        value: weather.uv_index == null ? 'Check manually' : `${weather.uv_index}`,
        tone: 'warm',
      },
      {
        icon: Thermometer,
        label: 'Soil Status',
        value: selectedField ? soilStatusLabel[selectedField.soil_condition] || selectedField.soil_condition : 'No field',
        tone: 'growth',
      },
    ]
  }, [selectedField, weather])

  return (
    <div className="weather-page">
      <div className="page-header weather-header">
        <div>
          <h1 className="section-title">AgriWeather AI</h1>
          <p className="section-sub">Field-aware weather intelligence with crop impact and action timing</p>
        </div>
      </div>

      <form className="card weather-search-panel" onSubmit={search}>
        <div className="weather-search-row">
          <div className="form-group weather-field-group">
            <label className="form-label">Field Sector</label>
            <select className="form-input" value={selectedFieldId} onChange={handleFieldChange}>
              <option value="">Select field</option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.field_name} · {field.crop_type}
                </option>
              ))}
            </select>
          </div>

          <div className="weather-search-input">
            <Search size={16} />
            <input
              className="city-input"
              placeholder="Search your field city (for example Chennai, Coimbatore, Madurai)"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary weather-search-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Get Weather'}
          </button>
        </div>

        <div className="weather-chip-row">
          {QUICK_CITIES.map((quickCity) => (
            <button
              key={quickCity}
              type="button"
              className={`weather-chip ${activeQuickCity === quickCity ? 'is-active' : ''}`}
              onClick={() => loadWeather(quickCity)}
            >
              <MapPin size={13} />
              <span>{quickCity}</span>
            </button>
          ))}
        </div>
      </form>

      {weather?._demo && (
        <div className="demo-banner">
          Showing demo data. Add your OpenWeather API key in <code>backend/.env</code> for live weather.
        </div>
      )}

      {loading && (
        <div className="card weather-loading-card">
          <span className="spinner" />
          <div>
            <div className="weather-loading-title">Pulling field weather intelligence...</div>
            <div className="weather-loading-sub">Fetching current conditions and 7-day forecast in parallel.</div>
          </div>
        </div>
      )}

      {!weather && !loading && (
        <div className="card weather-empty-card">
          <Cloud size={42} />
          <div className="weather-empty-title">Search a field city to open AgriWeather AI</div>
          <p>Select a field sector or search a city to view weather impact, crop suitability, and recommended farm action.</p>
        </div>
      )}

      {weather && !loading && (
        <>
          <section className={`card weather-hero weather-hero--${getHeroTone(weather)}`}>
            <div className="weather-hero-main">
              <div className="weather-hero-copy">
                <div className="weather-hero-kicker">
                  📍 {selectedField?.field_name || 'General field'} — {weather.updated_at || 'Updated just now'}
                </div>
                <div className="weather-hero-location">
                  <MapPin size={16} />
                  <span>{weather.city}, {weather.country}</span>
                </div>
                <div className="weather-hero-condition">{weather.description}</div>
                <div className="weather-hero-temp">{formatTemp(weather.temperature)}</div>
                <div className="weather-hero-feels">Feels like {formatTemp(weather.feels_like)}</div>
                <div className="weather-hero-badges">
                  <span className="weather-hero-badge">
                    <SunMedium size={13} />
                    <span>🌅 {weather.sunrise || '—'} | 🌇 {weather.sunset || '—'}</span>
                  </span>
                  <span className={`weather-hero-badge ${weather.rain_expected ? 'is-rain' : ''}`}>
                    <CalendarDays size={13} />
                    <span>⏱️ Daylight {weather.daylight || '—'}</span>
                  </span>
                </div>
              </div>

              {weather.icon && (
                <div className="weather-hero-visual">
                  <img src={iconUrl(weather.icon)} alt={weather.description} className="weather-icon-img" />
                </div>
              )}
            </div>

            <div className="weather-status-strip">
              <div className="weather-status-item">
                <span className="weather-status-label">Crop</span>
                <span className="weather-status-value">{selectedField?.crop_type || 'Not selected'}</span>
              </div>
              <div className="weather-status-item">
                <span className="weather-status-label">Soil Condition</span>
                <span className="weather-status-value">
                  {selectedField ? soilStatusLabel[selectedField.soil_condition] || selectedField.soil_condition : 'No field selected'}
                </span>
              </div>
              <div className="weather-status-item">
                <span className="weather-status-label">Suitability</span>
                <span className="weather-status-value">{suitability.score}/100 · {suitability.label}</span>
              </div>
              <div className="weather-status-item">
                <span className="weather-status-label">Weather Mode</span>
                <span className="weather-status-value">{weather._demo ? 'Demo weather' : 'Live weather'}</span>
              </div>
            </div>
          </section>

          <section className="weather-impact-grid">
            {farmImpactCards.map((card) => (
              <article key={card.label} className={`card weather-impact-card weather-impact-card--${card.tone}`}>
                <div className="weather-impact-icon">
                  <card.icon size={18} />
                </div>
                <div className="weather-impact-value">{card.value}</div>
                <div className="weather-impact-label">{card.label}</div>
              </article>
            ))}
          </section>

          <section className={`card weather-alert-banner weather-alert-banner--${primaryAlert?.tone || 'growth'}`}>
            <div className="weather-alert-head">
              <div className="weather-alert-title">
                <AlertTriangle size={18} />
                <span>{primaryAlert?.emoji} {primaryAlert?.title || 'Field Alert'}</span>
              </div>
              <div className="weather-alert-deadline">
                <Clock3 size={14} />
                <span>Act within {primaryAlert?.hours || 6} hours</span>
              </div>
            </div>

            <div className="weather-alert-body">
              <div className="weather-alert-points">
                {(primaryAlert?.bullets || []).map((item) => (
                  <div key={item} className="weather-alert-point">{item}</div>
                ))}
              </div>
              <div className="weather-alert-action">✅ Farm Action: {primaryAlert?.action}</div>
            </div>
          </section>

          <section className="weather-advisory-block">
            <div className="weather-section-heading">
              <div>
                <h3 className="section-title">Field Intelligence</h3>
                <p className="section-sub">Crop impact and planning guidance based on the selected field and weather.</p>
              </div>
            </div>

            <div className="weather-advisory-grid">
              <article className="card weather-advisory-card weather-advisory-card--growth">
                <div className="weather-advisory-head">
                  <div className="weather-advisory-icon">
                    <Sprout size={18} />
                  </div>
                  <div className="weather-advisory-title">Crop suitability</div>
                </div>
                <p className="weather-advisory-text">{suitability.note}</p>
                <div className="weather-advisory-tag">{suitability.score}/100 score for {selectedField?.crop_type || 'selected crop'}</div>
              </article>

              <article className="card weather-advisory-card weather-advisory-card--water">
                <div className="weather-advisory-head">
                  <div className="weather-advisory-icon">
                    <Droplets size={18} />
                  </div>
                  <div className="weather-advisory-title">Moisture and irrigation</div>
                </div>
                <p className="weather-advisory-text">
                  {weather.rain_expected
                    ? 'Rain chance is active, so use actual field moisture checks before irrigating again.'
                    : selectedField?.soil_condition === 'dry'
                    ? 'This field is already marked dry, so early irrigation is the safer choice if surface moisture remains low.'
                    : 'Current soil condition does not show immediate water stress, but keep irrigation aligned with crop stage.'}
                </p>
              </article>

              <article className="card weather-advisory-card weather-advisory-card--alert">
                <div className="weather-advisory-head">
                  <div className="weather-advisory-icon">
                    <ShieldAlert size={18} />
                  </div>
                  <div className="weather-advisory-title">Spray and disease watch</div>
                </div>
                <p className="weather-advisory-text">
                  {(weather.rain_expected || Boolean(selectedForecast?.rain))
                    ? 'Wet conditions can reduce spray effectiveness and increase fungal pressure. Inspect leaves after rain and avoid spraying in unstable weather.'
                    : weather.wind_speed >= 20
                    ? 'Wind can increase spray drift. Wait for calmer conditions before foliar application.'
                    : 'This looks like a workable spray window, but still confirm local wind and crop stage before treatment.'}
                </p>
              </article>
            </div>
          </section>

          {forecast.length > 0 && (
            <section className="card weather-forecast-workspace">
              <div className="weather-section-heading">
                <div>
                  <h3 className="section-title">7-Day Forecast — {selectedField?.field_name || weather.city}</h3>
                  <p className="section-sub">Select a day to check the best harvest, irrigation, or spray window.</p>
                </div>
              </div>

              <div className="weather-forecast-layout">
                <div className="forecast-grid">
                  {forecast.map((day, index) => (
                    <button
                      key={day.date}
                      type="button"
                      className={`forecast-day ${selectedForecastIndex === index ? 'is-selected' : ''} ${index === 0 ? 'today' : ''}`}
                      onClick={() => setSelectedForecastIndex(index)}
                    >
                      <div className="forecast-date">{getDayLabel(day.date, index)}</div>
                      {day.icon && <img src={iconUrl(day.icon)} alt={day.description} className="forecast-icon" />}
                      <div className="forecast-desc">{day.description}</div>
                      <div className="forecast-temps">
                        <span className="t-high">{formatTemp(day.temp_max)}</span>
                        <span className="t-low">{formatTemp(day.temp_min)}</span>
                      </div>
                      <div className={`forecast-flag ${day.rain ? 'is-rain' : ''}`}>
                        {day.rain ? '🌧️ Hold spraying' : '🌤️ Open window'}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedForecast && (
                  <aside className="weather-forecast-detail">
                    <div className="weather-forecast-detail-top">
                      <div>
                        <div className="weather-forecast-detail-label">
                          📍 {selectedField?.field_name || weather.city} — Selected forecast
                        </div>
                        <div className="weather-forecast-detail-title">
                          {getDayLabel(selectedForecast.date, selectedForecastIndex)}
                        </div>
                        <div className="weather-forecast-detail-date">
                          {new Date(`${selectedForecast.date}T12:00:00`).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      {selectedForecast.icon && (
                        <img src={iconUrl(selectedForecast.icon)} alt={selectedForecast.description} className="forecast-detail-icon" />
                      )}
                    </div>

                    <div className="weather-forecast-detail-grid">
                      <div className="weather-detail-stat">
                        <span>Condition</span>
                        <strong>{selectedForecast.description}</strong>
                      </div>
                      <div className="weather-detail-stat">
                        <span>High</span>
                        <strong>{formatTemp(selectedForecast.temp_max)}</strong>
                      </div>
                      <div className="weather-detail-stat">
                        <span>Low</span>
                        <strong>{formatTemp(selectedForecast.temp_min)}</strong>
                      </div>
                      <div className="weather-detail-stat">
                        <span>Rain</span>
                        <strong>{selectedForecast.rain ? 'Possible' : 'Low chance'}</strong>
                      </div>
                    </div>

                    <div className="weather-detail-note">
                      ✅ Farm Action: {farmAction}
                    </div>
                  </aside>
                )}
              </div>
            </section>
          )}

          <section className="card weather-action-footer">
            <div className="weather-action-footer-icon">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="weather-action-footer-label">Final recommendation</div>
              <div className="weather-action-footer-text">✅ Farm Action: {farmAction}</div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
