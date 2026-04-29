import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { Sprout, Mail, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import logo from '../../components/image.jpg'
import './Auth.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-brand">
          <img src={logo} alt="Logo" style={{ height: '60px', marginBottom: '10px' }} />
          <p>Sign in to your farm dashboard</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email address</label>
            <div className="input-icon-wrap">
              <Mail size={14} className="input-icon" />
              <input className="form-input with-icon" type="email" name="email"
                placeholder="farmer@example.com" value={form.email} onChange={handle} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={14} className="input-icon" />
              <input className="form-input with-icon" type="password" name="password"
                placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        <div className="auth-demo">
          <strong>Demo credentials:</strong> demo@agrotrade.com / demo1234
        </div>
      </div>
    </div>
  )
}
