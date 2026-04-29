import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './store/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Weather from './pages/weather/Weather'
import CropHealth from './pages/crop-health/CropHealth'
import AddField from './pages/crop-health/AddField'
import Predictions from './pages/predictions/Predictions'
import Alerts from './pages/alerts/Alerts'
import Analytics from './pages/analytics/Analytics'
import FieldMap from './pages/field-map/FieldMap'
import HomePage from './pages/HomePage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner" style={{ width:32, height:32 }} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="weather" element={<Weather />} />
          <Route path="crop-health" element={<CropHealth />} />
          <Route path="crop-health/add" element={<AddField />} />
          <Route path="field-map" element={<FieldMap />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
