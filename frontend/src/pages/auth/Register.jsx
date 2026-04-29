import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { Sprout, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import './Auth.css'

export default function Register() {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', full_name:'', farm_name:'', farm_location:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      await login(form.email, form.password)
      toast.success('Account created! Welcome to Agro Trade.')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card" style={{ maxWidth: 440 }}>
        <div className="auth-brand">
          <img src={logo} alt="Logo" style={{ height: '60px', marginBottom: '10px' }} />
          <h1>Create Account</h1>
          <p>Start managing your farm intelligently</p>
        </div>

        {error && <div className="auth-error"><AlertCircle size={14} /> {error}</div>}

        <form onSubmit={submit} className="auth-form">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="full_name" placeholder="John Deere"
                value={form.full_name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" placeholder="you@example.com"
                value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Farm Name</label>
              <input className="form-input" name="farm_name" placeholder="Green Valley Farm"
                value={form.farm_name} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Farm Location (City)</label>
              <input className="form-input" name="farm_location" placeholder="Chennai"
                value={form.farm_location} onChange={handle} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="Min 8 characters"
              value={form.password} onChange={handle} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  )
}
