import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Chatbot from '../Chatbot'
import { useAuth } from '../../store/AuthContext'
import {
  LayoutDashboard, Cloud, Leaf, TrendingUp,
  Bell, BarChart2, LogOut, MoonStar, SunMedium, Map, Menu, X
} from 'lucide-react'
import logo from '../image.jpg'
import './Layout.css'
import { applyTheme, getInitialTheme, persistTheme } from '../../theme'

const nav = [
  { to: '/dashboard',            icon: LayoutDashboard, label: 'Dashboard',   exact: true },
  { to: '/dashboard/weather',     icon: Cloud,           label: 'Weather'      },
  { to: '/dashboard/crop-health', icon: Leaf,            label: 'Crop Health'  },
  { to: '/dashboard/field-map',   icon: Map,             label: 'Field Map'    },
  { to: '/dashboard/predictions', icon: TrendingUp,      label: 'Predictions'  },
  { to: '/dashboard/alerts',      icon: Bell,            label: 'Alerts'       },
  { to: '/dashboard/analytics',   icon: BarChart2,       label: 'Analytics'    },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [theme, setTheme] = useState(() => getInitialTheme())
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      persistTheme(next)
      return next
    })
  }

  useEffect(() => {
    applyTheme(theme)
    persistTheme(theme)
  }, [theme])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('nav-drawer-open', mobileNavOpen)
    return () => document.body.classList.remove('nav-drawer-open')
  }, [mobileNavOpen])

  const routeLabel = nav.find(({ to, exact }) => {
    if (exact) return location.pathname === to
    return location.pathname.startsWith(to)
  })?.label || 'Dashboard'

  const sidebarContent = (
    <>
      <div className="sidebar-brand">
        <img src={logo} alt="Logo" />
      </div>

      <nav className="sidebar-nav">
        {nav.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.full_name}</span>
            <span className="user-farm">{user?.farm_name || 'My Farm'}</span>
          </div>
        </div>
        <button className="btn btn-outline logout-btn" onClick={handleLogout}>
          <LogOut size={14} /> <span>Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="app-shell">
      <aside className="sidebar desktop-sidebar">
        {sidebarContent}
      </aside>

      <div
        className={`mobile-nav-backdrop ${mobileNavOpen ? 'is-open' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar mobile-sidebar ${mobileNavOpen ? 'is-open' : ''}`} aria-hidden={!mobileNavOpen}>
        <div className="sidebar-brand">
          <img src={logo} alt="Logo" />
          <button
            className="mobile-nav-close"
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {nav.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.full_name}</span>
              <span className="user-farm">{user?.farm_name || 'My Farm'}</span>
            </div>
          </div>
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>
            <LogOut size={14} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="dashboard-topbar">
          <button
            className="mobile-nav-toggle"
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileNavOpen}
          >
            <Menu size={18} />
          </button>
          <div className="dashboard-topbar__copy">
            <div className="dashboard-topbar__eyebrow">Vijay Agro Trade</div>
            <div className="dashboard-topbar__title">{routeLabel}</div>
          </div>

          <div className="dashboard-topbar__actions">
            <button
              id="theme-toggle"
              className="theme-toggle"
              onClick={toggleTheme}
              type="button"
            >
              {theme === 'dark' ? <SunMedium size={14} /> : <MoonStar size={14} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
        <Outlet />
      </main>
      <Chatbot />
    </div>
  )
}
