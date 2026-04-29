import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../services/api'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import './CropHealth.css'

const CROPS = ['Corn','Wheat','Soybeans','Rice','Barley','Cotton','Sugarcane','Other']
const SOIL = ['dry','moist','waterlogged']
const IRRIGATION = ['drip','sprinkler','flood','none']

export default function AddField() {
  const navigate = useNavigate()
  const location = useLocation()
  const existing = location.state  // if editing

  const [form, setForm] = useState({
    field_name: existing?.field_name || '',
    crop_type: existing?.crop_type || 'Corn',
    location_city: existing?.location_city || '',
    area_acres: existing?.area_acres || '',
    soil_condition: existing?.soil_condition || 'moist',
    irrigation_type: existing?.irrigation_type || 'drip',
    irrigation_frequency_days: existing?.irrigation_frequency_days || 3,
    notes: existing?.notes || '',
    latitude: existing?.latitude || '',
    longitude: existing?.longitude || '',
    moisture: existing?.moisture || '',
    nitrogen: existing?.nitrogen || '',
    phosphorus: existing?.phosphorus || '',
    sensor_ids: existing?.sensor_ids || '',
  })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...form,
      area_acres: form.area_acres ? parseFloat(form.area_acres) : null,
      irrigation_frequency_days: parseInt(form.irrigation_frequency_days),
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      moisture: form.moisture ? parseFloat(form.moisture) : null,
      nitrogen: form.nitrogen ? parseFloat(form.nitrogen) : null,
      phosphorus: form.phosphorus ? parseFloat(form.phosphorus) : null,
      sensor_ids: form.sensor_ids.trim() || null,
    }
    try {
      if (existing?.id) {
        await api.put(`/fields/${existing.id}`, payload)
        toast.success('Field updated!')
      } else {
        await api.post('/fields/', payload)
        toast.success('Field added!')
      }
      navigate('/dashboard/crop-health')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save field.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="crop-page">
      <div className="page-header">
        <div>
          <h1 className="section-title">{existing?.id ? 'Edit Field' : 'Add New Field'}</h1>
          <p className="section-sub">Enter your field's crop and soil details manually</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/dashboard/crop-health')}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="card" style={{padding: 28, maxWidth: 680}}>
        <form onSubmit={submit} className="add-field-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Field Name *</label>
              <input className="form-input" name="field_name" placeholder="e.g. North Acre Plot A"
                value={form.field_name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Location (City) *</label>
              <input className="form-input" name="location_city" placeholder="e.g. Chennai"
                value={form.location_city} onChange={handle} required />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input className="form-input" type="number" step="0.0001" name="latitude"
                placeholder="e.g. 11.0168" value={form.latitude} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input className="form-input" type="number" step="0.0001" name="longitude"
                placeholder="e.g. 76.9558" value={form.longitude} onChange={handle} />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Crop Type *</label>
              <select className="form-input" name="crop_type" value={form.crop_type} onChange={handle}>
                {CROPS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Area (acres)</label>
              <input className="form-input" type="number" step="0.1" name="area_acres"
                placeholder="e.g. 5.5" value={form.area_acres} onChange={handle} />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Soil Condition *</label>
              <select className="form-input" name="soil_condition" value={form.soil_condition} onChange={handle}>
                {SOIL.map(s => <option key={s}>{s}</option>)}
              </select>
              <span style={{fontSize:11, color:'var(--gray-400)', marginTop:2}}>
                {form.soil_condition === 'dry' ? '⚠️ Needs irrigation soon' : form.soil_condition === 'waterlogged' ? '⚠️ Risk of root rot' : '✅ Good moisture level'}
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Irrigation Type *</label>
              <select className="form-input" name="irrigation_type" value={form.irrigation_type} onChange={handle}>
                {IRRIGATION.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Moisture (%)</label>
              <input className="form-input" type="number" min="0" max="100" step="0.1" name="moisture"
                placeholder="e.g. 68" value={form.moisture} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Nitrogen</label>
              <input className="form-input" type="number" min="0" max="100" step="0.1" name="nitrogen"
                placeholder="e.g. 82" value={form.nitrogen} onChange={handle} />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Phosphorus</label>
              <input className="form-input" type="number" min="0" max="100" step="0.1" name="phosphorus"
                placeholder="e.g. 74" value={form.phosphorus} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Sensor IDs</label>
              <input className="form-input" name="sensor_ids"
                placeholder="e.g. S-001, S-002, S-003"
                value={form.sensor_ids} onChange={handle} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Irrigation Frequency (days)</label>
            <input className="form-input" type="number" min="1" max="30" name="irrigation_frequency_days"
              value={form.irrigation_frequency_days} onChange={handle} style={{maxWidth:180}} />
          </div>

          <div className="form-group">
            <label className="form-label">Field Notes (optional)</label>
            <textarea className="form-input" name="notes" rows={3}
              placeholder="e.g. Early signs of nitrogen deficiency in north section…"
              value={form.notes} onChange={handle} style={{resize:'vertical'}} />
          </div>

          <div style={{display:'flex', gap:10, marginTop:4}}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><Save size={14} /> Save Field</>}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard/crop-health')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
