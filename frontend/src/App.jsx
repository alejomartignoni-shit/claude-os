import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Home, Brain, Zap, Bot, Moon, Activity, ChevronRight } from 'lucide-react'
import HomePage from './pages/Home.jsx'
import MemoryPage from './pages/Memory.jsx'
import SkillsPage from './pages/Skills.jsx'
import AgentsPage from './pages/Agents.jsx'
import DreamPage from './pages/Dream.jsx'
import ActivityPage from './pages/Activity.jsx'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/skills', icon: Zap, label: 'Skills' },
  { to: '/agents', icon: Bot, label: 'Agents' },
  { to: '/dream', icon: Moon, label: 'Dream' },
  { to: '/activity', icon: Activity, label: 'Activity' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-title">Claude OS</div>
        <div className="sidebar-brand-sub">Operator / local</div>
        <div className="sidebar-status">
          <span className="status-dot"></span>
          <span className="status-label">ONLINE</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Navigation</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          >
            <Icon className="nav-icon" />
            {label}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-agents">
        <div className="sidebar-section-title" style={{ marginBottom: 8 }}>Active Agents</div>
        <div className="agent-chip">
          <span className="status-dot"></span>
          <span>claude-sonnet-4-6</span>
        </div>
      </div>
    </aside>
  )
}

function Topbar() {
  const loc = useLocation()
  const found = NAV_ITEMS.find(n => n.to === loc.pathname)
  const label = found ? found.label : 'Home'
  return (
    <div className="topbar">
      <div className="breadcrumb">
        Operator <span className="breadcrumb-sep"><ChevronRight size={12} /></span> local
      </div>
      <div className="topbar-agent">
        <span className="status-dot" style={{ width: 6, height: 6 }}></span>
        claude-os <span style={{ color: 'var(--accent-green)', marginLeft: 4 }}>ONLINE</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Topbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/dream" element={<DreamPage />} />
            <Route path="/activity" element={<ActivityPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
