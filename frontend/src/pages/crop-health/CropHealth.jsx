import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { Plus, Leaf, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import './CropHealth.css'

const soilColor = { dry: 'badge-amber', moist: 'badge-green', waterlogged: 'badge-red' }

export default function CropHealth() {
  const navigate = useNavigate()
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get('/fields/').then(r => setFields(r.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const deleteField = async id => {
    if (!confirm('Delete this field?')) return
    await api.delete(`/fields/${id}`)
    toast.success('Field deleted')
    load()
  }

  if (loading) return <div className="empty-state"><div className="spinner" style={{width:32,height:32}} /></div>

  return (
    <div className="crop-page">
      <div className="page-header">
        <div>
          <h1 className="section-title">Crop Health</h1>
          <p className="section-sub">Manage all your fields and soil conditions</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/crop-health/add')}>
          <Plus size={15} /> Add Field
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="card empty-state" style={{padding:64}}>
          <Leaf size={48} />
          <p>No fields added yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/crop-health/add')}>
            <Plus size={14} /> Add your first field
          </button>
        </div>
      ) : (
        <div className="fields-grid">
          {fields.map(f => (
            <div key={f.id} className="card field-card">
              <div className="field-card-header">
                <div>
                  <div className="field-card-name">{f.field_name}</div>
                  <div className="field-card-meta">{f.crop_type} · {f.location_city}</div>
                </div>
                <span className={`badge ${soilColor[f.soil_condition] || 'badge-gray'}`}>{f.soil_condition}</span>
              </div>

              <div className="field-card-stats">
                <div className="field-stat">
                  <span className="field-stat-label">Area</span>
                  <span className="field-stat-val">{f.area_acres ? `${f.area_acres} ac` : '—'}</span>
                </div>
                <div className="field-stat">
                  <span className="field-stat-label">Irrigation</span>
                  <span className="field-stat-val">{f.irrigation_type}</span>
                </div>
                <div className="field-stat">
                  <span className="field-stat-label">Every</span>
                  <span className="field-stat-val">{f.irrigation_frequency_days}d</span>
                </div>
              </div>

              {f.notes && <p className="field-notes">{f.notes}</p>}

              <div className="field-card-actions">
                <button className="btn btn-outline" style={{flex:1}}
                  onClick={() => navigate('/dashboard/predictions', { state: { fieldId: f.id, fieldName: f.field_name } })}>
                  Run Prediction
                </button>
                <button className="btn btn-outline icon-btn" onClick={() => navigate('/dashboard/crop-health/add', { state: f })}>
                  <Pencil size={13} />
                </button>
                <button className="btn btn-danger icon-btn" onClick={() => deleteField(f.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
