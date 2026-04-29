import { useEffect, useMemo, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Crosshair,
  Droplets,
  FileSpreadsheet,
  Leaf,
  Map,
  MapPinned,
  Mountain,
  Search,
  ShieldAlert,
  Satellite,
  Waves,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import './FieldMap.css'

const STATUS_ORDER = { critical: 0, warning: 1, healthy: 2 }
const STATUS_COLOR = {
  healthy: '#16A34A',
  warning: '#D97706',
  critical: '#DC2626',
}
const STATUS_BADGE = {
  healthy: 'OK',
  warning: 'WARN',
  critical: 'ALERT',
}
const LAYER_COPY = {
  satellite:
    'Satellite view shows aerial field context and makes it easier to compare crop patterns across sectors.',
  terrain:
    'Terrain view highlights slope, elevation, and exposure so you can spot drainage pressure and wind-sensitive areas.',
  health:
    'Health Index adds score-based field rings so low-performing sectors stand out immediately on the map.',
  moisture:
    'Moisture Heatmap emphasizes wetter and drier zones using the latest soil moisture readings from each field.',
}

function normalizeEnvValue(value) {
  if (!value) return ''
  const normalized = String(value).trim()
  return normalized.startsWith('YOUR_') ? '' : normalized
}

function parseEnvNumber(value) {
  const normalized = normalizeEnvValue(value)
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const GOOGLE_MAPS_API_KEY = normalizeEnvValue(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
const GOOGLE_MAP_ID = normalizeEnvValue(import.meta.env.VITE_GOOGLE_MAP_ID)
const FARM_CENTER_LAT = parseEnvNumber(import.meta.env.VITE_FARM_CENTER_LAT)
const FARM_CENTER_LNG = parseEnvNumber(import.meta.env.VITE_FARM_CENTER_LNG)
const FARM_DEFAULT_ZOOM = parseEnvNumber(import.meta.env.VITE_FARM_DEFAULT_ZOOM) || 14
const FARM_CENTER = {
  lat: FARM_CENTER_LAT ?? 11.0168,
  lng: FARM_CENTER_LNG ?? 76.9558,
}
const HAS_MAP_CONFIG = Boolean(
  GOOGLE_MAPS_API_KEY && GOOGLE_MAP_ID && FARM_CENTER_LAT !== null && FARM_CENTER_LNG !== null
)

function sortFields(items) {
  return [...items].sort((a, b) => {
    const severityGap = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
    if (severityGap !== 0) return severityGap
    if (a.score !== b.score) return a.score - b.score
    return a.name.localeCompare(b.name)
  })
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function assignRecommendedTeam(field) {
  if (field.status === 'critical') return 'Rapid Response Team'
  if (field.crop.toLowerCase().includes('soy')) return 'Nutrient Ops Team'
  if (field.crop.toLowerCase().includes('wheat')) return 'Field Scout Unit'
  return 'Crop Care Team'
}

function buildFieldNarrative(field) {
  const coords = `${field.lat.toFixed(4)}, ${field.lng.toFixed(4)}`
  const issues = []

  if (field.moisture < 40) issues.push('dry patches')
  if (field.nitrogen < 50) issues.push('nitrogen deficiency')
  if (field.phosphorus < 55) issues.push('phosphorus weakness')

  const issueText = issues.length ? issues.join(', ') : 'balanced field indicators'

  if (field.status === 'critical') {
    return {
      heading: `CRITICAL - ${field.name}`,
      summary: `Satellite and field metrics show a high-risk sector near ${coords}. Current signals point to ${issueText}.`,
      insight:
        'Without intervention in the next 48 hours, this sector could lose an estimated 25-35% of yield potential.',
      actions: [
        'Dispatch a drone or scout team for visual confirmation today.',
        `Inspect the highest-risk zone near ${coords} and document crop stress.`,
        'Correct moisture and nutrient deficits in the next field cycle.',
        'Assign a response team and re-check the field again tomorrow morning.',
      ],
    }
  }

  if (field.status === 'warning') {
    return {
      heading: `WARNING - ${field.name}`,
      summary: `This field is outside the ideal operating range. The map points to ${issueText} that should be corrected today.`,
      insight:
        "Action today should keep this field from slipping into the critical band during the next irrigation or weather cycle.",
      actions: [
        'Review the affected sector during the next field round.',
        "Plan nutrient correction or scouting during today's farm work.",
        'Refresh this field after the next sensor sync to confirm recovery.',
      ],
    }
  }

  return {
    heading: `HEALTHY - ${field.name}`,
    summary: `This field is performing well on the map. Metrics remain stable with ${issueText} under control.`,
    insight:
      'Keep routine monitoring in place and use this sector as the baseline when comparing weaker blocks.',
    actions: [
      'Maintain the current irrigation and nutrient plan.',
      'Monitor wind exposure and canopy health during normal rounds.',
      'Export the layout report if you need a shareable field snapshot.',
    ],
  }
}

function buildMarkerContent(field) {
  const pin = document.createElement('div')
  pin.className = 'field-map-marker'
  pin.style.setProperty('--marker-color', STATUS_COLOR[field.status] || STATUS_COLOR.warning)
  pin.innerHTML = `
    <div class="field-map-marker__dot"></div>
    <span class="field-map-marker__label">${field.name}</span>
    <span class="field-map-marker__score">${field.score}</span>
  `
  return pin
}

function buildInfoWindowContent(field, onViewDetails, onAssignTeam) {
  const wrapper = document.createElement('div')
  wrapper.className = 'field-map-infowindow'
  wrapper.innerHTML = `
    <div class="field-map-infowindow__head">
      <strong>${field.name}</strong>
      <span style="background:${STATUS_COLOR[field.status]};">${field.score}/100</span>
    </div>
    <div class="field-map-infowindow__meta">
      <span>${STATUS_BADGE[field.status]} ${field.crop}</span>
      <span>${field.area}</span>
      <span>${field.updated}</span>
    </div>
    <div class="field-map-infowindow__stats">
      <div><small>Moisture</small><strong>${field.moisture}%</strong></div>
      <div><small>Nitrogen</small><strong>${field.nitrogen}</strong></div>
      <div><small>Phosphorus</small><strong>${field.phosphorus}</strong></div>
    </div>
    <p class="field-map-infowindow__copy">${field.info}</p>
    <div class="field-map-infowindow__actions">
      <button data-action="view">View Details</button>
      <button data-action="assign" class="secondary">Assign Team</button>
    </div>
  `

  wrapper.querySelector('[data-action="view"]')?.addEventListener('click', onViewDetails)
  wrapper.querySelector('[data-action="assign"]')?.addEventListener('click', onAssignTeam)
  return wrapper
}

export default function FieldMap() {
  const mapCanvasRef = useRef(null)
  const searchInputRef = useRef(null)
  const mapRuntimeRef = useRef(null)

  const [mapStatus, setMapStatus] = useState(HAS_MAP_CONFIG ? 'loading' : 'missing-config')
  const [mapError, setMapError] = useState('')
  const [dataLoading, setDataLoading] = useState(true)
  const [fields, setFields] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [mapType, setMapType] = useState('satellite')
  const [overlayEnabled, setOverlayEnabled] = useState(true)
  const [cropFilter, setCropFilter] = useState('All')
  const [lastSyncedAt, setLastSyncedAt] = useState(null)
  const [assignedTeams, setAssignedTeams] = useState({})
  const [statusFilters, setStatusFilters] = useState({
    healthy: true,
    warning: true,
    critical: true,
  })

  const loadFields = async () => {
    try {
      const response = await api.get('/fields/map')
      setFields(sortFields(response.data || []))
      setLastSyncedAt(new Date())
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to load field map data.')
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    loadFields()
    const timer = setInterval(loadFields, 120000)
    return () => clearInterval(timer)
  }, [])

  const cropFilters = useMemo(
    () => ['All', ...Array.from(new Set(fields.map(field => field.crop))).sort()],
    [fields]
  )

  const visibleFields = useMemo(() => {
    return sortFields(
      fields.filter(field => {
        if (!statusFilters[field.status]) return false
        if (cropFilter !== 'All' && field.crop !== cropFilter) return false
        return true
      })
    )
  }, [fields, cropFilter, statusFilters])

  useEffect(() => {
    if (!visibleFields.length) {
      setSelectedId(null)
      return
    }

    if (!selectedId || !visibleFields.some(field => field.field_id === selectedId)) {
      setSelectedId(visibleFields[0].field_id)
    }
  }, [visibleFields, selectedId])

  const selectedField =
    visibleFields.find(field => field.field_id === selectedId) || visibleFields[0] || null
  const selectedNarrative = selectedField ? buildFieldNarrative(selectedField) : null
  const layerDescription = LAYER_COPY[mapType]

  const criticalCount = fields.filter(field => field.status === 'critical').length
  const warningCount = fields.filter(field => field.status === 'warning').length
  const healthyCount = fields.filter(field => field.status === 'healthy').length

  const focusFieldOnMap = (field, zoom = 16) => {
    const runtime = mapRuntimeRef.current
    if (!runtime?.map) return
    runtime.map.panTo({ lat: field.lat, lng: field.lng })
    runtime.map.setZoom(zoom)
  }

  const assignTeam = (field) => {
    const team = assignRecommendedTeam(field)
    setAssignedTeams(current => ({ ...current, [field.field_id]: team }))
    toast.success(`${team} assigned to ${field.name}`)
  }

  const exportReport = (field) => {
    toast.success(`Layout report queued for ${field.name}`)
  }

  useEffect(() => {
    let cancelled = false

    if (!HAS_MAP_CONFIG) {
      setMapStatus('missing-config')
      return undefined
    }

    const initializeMap = async () => {
      try {
        if (!globalThis.google?.maps?.importLibrary) {
          setOptions({
            apiKey: GOOGLE_MAPS_API_KEY,
            version: 'weekly',
            mapIds: GOOGLE_MAP_ID ? [GOOGLE_MAP_ID] : undefined,
          })
        }

        await Promise.all([
          importLibrary('maps'),
          importLibrary('marker'),
          importLibrary('places'),
          importLibrary('geometry'),
          importLibrary('visualization'),
        ])

        if (cancelled || !mapCanvasRef.current) return

        const googleApi = globalThis.google
        const { Map: GoogleMap } = await googleApi.maps.importLibrary('maps')
        const { AdvancedMarkerElement } = await googleApi.maps.importLibrary('marker')

        if (cancelled) return

        const map = new GoogleMap(mapCanvasRef.current, {
          center: FARM_CENTER,
          zoom: FARM_DEFAULT_ZOOM,
          mapId: GOOGLE_MAP_ID,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        })

        mapRuntimeRef.current = {
          google: googleApi,
          map,
          AdvancedMarkerElement,
          markers: [],
          infoWindows: [],
          circles: [],
          heatmap: null,
          searchBox: null,
        }

        if (searchInputRef.current) {
          const searchBox = new googleApi.maps.places.SearchBox(searchInputRef.current)

          map.addListener('bounds_changed', () => {
            const bounds = map.getBounds()
            if (bounds) searchBox.setBounds(bounds)
          })

          searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces()
            if (!places?.length) return

            const bounds = new googleApi.maps.LatLngBounds()
            places.forEach(place => {
              if (place.geometry?.location) bounds.extend(place.geometry.location)
            })
            map.fitBounds(bounds)
          })

          mapRuntimeRef.current.searchBox = searchBox
        }

        setMapStatus('ready')
      } catch (error) {
        setMapError(error?.message || 'Google Maps failed to load.')
        setMapStatus('error')
      }
    }

    initializeMap()

    return () => {
      cancelled = true
      const runtime = mapRuntimeRef.current
      if (!runtime) return

      runtime.markers?.forEach(entry => {
        entry.marker.map = null
      })
      runtime.infoWindows?.forEach(windowRef => windowRef.close())
      runtime.circles?.forEach(circle => circle.setMap(null))
      runtime.heatmap?.setMap(null)
    }
  }, [])

  useEffect(() => {
    const runtime = mapRuntimeRef.current
    if (mapStatus !== 'ready' || !runtime?.map) return

    runtime.markers.forEach(entry => {
      entry.marker.map = null
    })
    runtime.infoWindows.forEach(infoWindow => infoWindow.close())
    runtime.circles.forEach(circle => circle.setMap(null))
    runtime.heatmap?.setMap(null)

    runtime.markers = []
    runtime.infoWindows = []
    runtime.circles = []
    runtime.heatmap = null

    runtime.map.setMapTypeId(mapType === 'terrain' ? 'terrain' : 'satellite')

    visibleFields.forEach(field => {
      const marker = new runtime.AdvancedMarkerElement({
        map: runtime.map,
        position: { lat: field.lat, lng: field.lng },
        content: buildMarkerContent(field),
        title: field.name,
      })

      const infoWindow = new runtime.google.maps.InfoWindow({
        content: buildInfoWindowContent(
          field,
          () => {
            setSelectedId(field.field_id)
            focusFieldOnMap(field)
          },
          () => assignTeam(field)
        ),
      })

      marker.addListener('click', () => {
        runtime.infoWindows.forEach(existing => existing.close())
        infoWindow.open({ map: runtime.map, anchor: marker })
        setSelectedId(field.field_id)
        focusFieldOnMap(field)
      })

      runtime.markers.push({ marker, field })
      runtime.infoWindows.push(infoWindow)
    })

    if (mapType === 'health' && overlayEnabled) {
      visibleFields.forEach(field => {
        const areaAcres = Number.parseFloat(field.area) || 8
        const radius = Math.max(90, Math.sqrt((areaAcres * 4046.86) / Math.PI) * 1.9)
        const circle = new runtime.google.maps.Circle({
          strokeColor: STATUS_COLOR[field.status],
          strokeOpacity: 0.85,
          strokeWeight: 2,
          fillColor: STATUS_COLOR[field.status],
          fillOpacity: 0.18,
          center: { lat: field.lat, lng: field.lng },
          radius,
          map: runtime.map,
        })
        runtime.circles.push(circle)
      })
    }

    if (mapType === 'moisture' && overlayEnabled) {
      runtime.heatmap = new runtime.google.maps.visualization.HeatmapLayer({
        data: visibleFields.map(field => ({
          location: new runtime.google.maps.LatLng(field.lat, field.lng),
          weight: field.moisture / 100,
        })),
        radius: 80,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
        ],
      })
      runtime.heatmap.setMap(runtime.map)
    }
  }, [mapStatus, mapType, overlayEnabled, visibleFields])

  useEffect(() => {
    const runtime = mapRuntimeRef.current
    if (!runtime?.map || !selectedField) return
    focusFieldOnMap(selectedField, runtime.map.getZoom() < 14 ? 14 : runtime.map.getZoom())
  }, [selectedField])

  const centerOnFarm = () => {
    const runtime = mapRuntimeRef.current
    if (!runtime?.map) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          runtime.map.panTo({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          runtime.map.setZoom(14)
        },
        () => {
          runtime.map.panTo(FARM_CENTER)
          runtime.map.setZoom(FARM_DEFAULT_ZOOM)
        }
      )
      return
    }

    runtime.map.panTo(FARM_CENTER)
    runtime.map.setZoom(FARM_DEFAULT_ZOOM)
  }

  return (
    <div className="field-map-page">
      <div className="field-map-hero card">
        <div>
          <p className="field-map-kicker">AgriFarmMap AI</p>
          <h1 className="field-map-title">Field mapping and spatial intelligence</h1>
          <p className="field-map-copy">
            Navigate farm sectors with satellite context, health overlays, moisture patterns, and live backend field
            metrics from Vijay Agro Trade.
          </p>
        </div>
        <div className="field-map-hero-stats">
          <div className="field-map-stat critical">
            <span>Critical</span>
            <strong>{criticalCount}</strong>
          </div>
          <div className="field-map-stat warning">
            <span>Warning</span>
            <strong>{warningCount}</strong>
          </div>
          <div className="field-map-stat healthy">
            <span>Healthy</span>
            <strong>{healthyCount}</strong>
          </div>
        </div>
      </div>

      <div className="field-map-toolbar">
        <div className="field-map-types">
          {[
            ['satellite', 'Satellite', Satellite],
            ['terrain', 'Terrain', Mountain],
            ['health', 'Health Index', Leaf],
            ['moisture', 'Moisture Heatmap', Waves],
          ].map(([value, label, Icon]) => (
            <button
              key={value}
              className={`field-map-type-btn ${mapType === value ? 'active' : ''}`}
              onClick={() => setMapType(value)}
              type="button"
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="field-map-search">
          <Search size={15} />
          <input
            ref={searchInputRef}
            className="field-map-search-input"
            placeholder="Search places, roads, or nearby landmarks"
          />
        </div>
      </div>

      <div className="field-map-grid">
        <section className="field-map-surface card">
          <div className="field-map-surface__top">
            <div>
              <h2>Map Canvas</h2>
              <p>{layerDescription}</p>
            </div>
            <div className="field-map-surface__controls">
              <button className="btn btn-outline" type="button" onClick={() => setOverlayEnabled(value => !value)}>
                <Map size={14} /> {overlayEnabled ? 'Overlay On' : 'Overlay Off'}
              </button>
              <button className="btn btn-outline" type="button" onClick={centerOnFarm}>
                <Crosshair size={14} /> My Location / Farm
              </button>
            </div>
          </div>

          <div className="field-map-chip-row">
            {['critical', 'warning', 'healthy'].map(status => (
              <button
                key={status}
                className={`field-map-chip ${statusFilters[status] ? 'active' : ''} ${status}`}
                onClick={() => setStatusFilters(current => ({ ...current, [status]: !current[status] }))}
                type="button"
              >
                <span>{STATUS_BADGE[status]}</span>
                <span>{status}</span>
              </button>
            ))}
          </div>

          <div className="field-map-canvas-wrap">
            {mapStatus === 'missing-config' ? (
              <div className="field-map-empty">
                <MapPinned size={42} />
                <h3>Google Maps configuration missing</h3>
                <p>
                  Create `frontend/.env` from `frontend/.env.example`, then add `VITE_GOOGLE_MAPS_API_KEY`,
                  `VITE_GOOGLE_MAP_ID`, `VITE_FARM_CENTER_LAT`, and `VITE_FARM_CENTER_LNG`.
                </p>
              </div>
            ) : mapStatus === 'error' ? (
              <div className="field-map-empty">
                <ShieldAlert size={42} />
                <h3>Map failed to load</h3>
                <p>{mapError || 'Google Maps could not be initialized with the current configuration.'}</p>
              </div>
            ) : (
              <>
                <div ref={mapCanvasRef} className="field-map-canvas" />
                {mapStatus === 'loading' && (
                  <div className="field-map-overlay-loading">
                    <div className="spinner" style={{ width: 30, height: 30 }} />
                    <span>Loading Google Maps...</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="field-map-footer">
            <span>
              Center: {FARM_CENTER.lat.toFixed(4)}, {FARM_CENTER.lng.toFixed(4)}
            </span>
            <span>View: {mapType}</span>
            <span>Last sync: {lastSyncedAt ? formatTimestamp(lastSyncedAt) : 'Waiting for data'}</span>
          </div>
        </section>

        <aside className="field-map-sidebar">
          <div className="field-map-sidebar-card card">
            <div className="field-map-sidebar-head">
              <div>
                <h3>Field Navigator</h3>
                <p>{visibleFields.length} field{visibleFields.length === 1 ? '' : 's'} visible</p>
              </div>
              {fields.some(field => field.status === 'critical') && (
                <div className="field-map-urgent-tag">
                  <AlertTriangle size={13} />
                  <span>Urgent: {fields.find(field => field.status === 'critical')?.name} is critical</span>
                </div>
              )}
            </div>

            <div className="field-map-crop-filters">
              {cropFilters.map(filter => (
                <button
                  key={filter}
                  className={`field-map-crop-pill ${cropFilter === filter ? 'active' : ''}`}
                  onClick={() => setCropFilter(filter)}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>

            {dataLoading ? (
              <div className="field-map-empty field-map-empty--compact">
                <div className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            ) : visibleFields.length === 0 ? (
              <div className="field-map-empty field-map-empty--compact">
                <Map size={34} />
                <p>No fields match the current crop and severity filters.</p>
              </div>
            ) : (
              <div className="field-map-list">
                {visibleFields.map(field => (
                  <button
                    key={field.field_id}
                    className={`field-map-list-item ${selectedField?.field_id === field.field_id ? 'selected' : ''} ${field.status}`}
                    onClick={() => {
                      setSelectedId(field.field_id)
                      focusFieldOnMap(field)
                    }}
                    type="button"
                  >
                    <div className="field-map-list-item__top">
                      <span>{STATUS_BADGE[field.status]}</span>
                      <strong>{field.name}</strong>
                      <span className="field-map-list-item__score">Score {field.score}</span>
                    </div>
                    <div className="field-map-list-item__meta">
                      <span>{field.crop}</span>
                      <span>{field.updated}</span>
                    </div>
                    <p>{field.info}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedField && selectedNarrative && (
            <div className={`field-map-detail card ${selectedField.status}`}>
              <div className="field-map-detail__header">
                <div>
                  <p className="field-map-detail__eyebrow">{selectedNarrative.heading}</p>
                  <h3>{selectedField.name}</h3>
                </div>
                <div className="field-map-detail__score">{selectedField.score}/100</div>
              </div>

              <div className="field-map-detail__meta">
                <span>
                  <Leaf size={13} /> {selectedField.crop}
                </span>
                <span>
                  <Clock3 size={13} /> {selectedField.updated}
                </span>
                <span>
                  <MapPinned size={13} /> {selectedField.lat.toFixed(4)}, {selectedField.lng.toFixed(4)}
                </span>
              </div>

              <div className="field-map-detail__section">
                <h4>Field analysis</h4>
                <p>{selectedNarrative.summary}</p>
              </div>

              <div className="field-map-live-grid">
                <div className="field-map-live-card">
                  <span>Health Index</span>
                  <strong>{selectedField.score}</strong>
                  <small>{selectedField.status}</small>
                </div>
                <div className="field-map-live-card">
                  <span>Soil Moisture</span>
                  <strong>{selectedField.moisture}%</strong>
                  <small>{selectedField.moisture < 40 ? 'Below threshold' : 'Stable'}</small>
                </div>
                <div className="field-map-live-card">
                  <span>
                    <Droplets size={12} /> Nitrogen
                  </span>
                  <strong>{selectedField.nitrogen}</strong>
                  <small>{selectedField.nitrogen < 50 ? 'Needs attention' : 'Within range'}</small>
                </div>
                <div className="field-map-live-card">
                  <span>Phosphorus</span>
                  <strong>{selectedField.phosphorus}</strong>
                  <small>{selectedField.phosphorus < 55 ? 'Monitor closely' : 'Within range'}</small>
                </div>
              </div>

              <div className="field-map-detail__section">
                <h4>{selectedField.status === 'critical' ? 'Recommended actions - next 48 hours' : 'Recommended actions'}</h4>
                <ol className="field-map-action-list">
                  {selectedNarrative.actions.map(action => (
                    <li key={action}>{action}</li>
                  ))}
                </ol>
              </div>

              <div className="field-map-detail__section">
                <h4>AI insight</h4>
                <p>{selectedNarrative.insight}</p>
                <p>
                  Last updated at {formatTimestamp(selectedField.updated_at)}. Sensors:{' '}
                  {selectedField.sensors.length ? selectedField.sensors.join(', ') : 'No sensors assigned yet'}.
                </p>
              </div>

              <div className="field-map-detail__actions">
                <button className="btn btn-outline" type="button" onClick={() => assignTeam(selectedField)}>
                  <CheckCircle2 size={14} /> {assignedTeams[selectedField.field_id] || 'Assign Team'}
                </button>
                <button className="btn btn-primary" type="button" onClick={() => exportReport(selectedField)}>
                  <FileSpreadsheet size={14} /> Export Layout Report
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
