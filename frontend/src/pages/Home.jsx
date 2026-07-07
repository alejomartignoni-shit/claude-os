import { useState, useEffect } from 'react'
import { Zap, Brain, Clock, Target } from 'lucide-react'
import { api } from '../api.js'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

function StatCard({ label, value, detail, icon: Icon, accent }) {
  const colors = { blue: 'var(--accent-blue)', gold: 'var(--accent-gold)', green: 'var(--accent-green)' }
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value != null ? value : '—'}</div>
      {detail && <div className="stat-card-detail">{detail}</div>}
      {Icon && (
        <div className="stat-card-trend">
          <Icon size={48} color={colors[accent] || colors.blue} />
        </div>
      )}
    </div>
  )
}

const SYSTEM_ROWS = [
  { label: 'Backend', value: 'FastAPI · Port 8082', ok: true },
  { label: 'Memory Source', value: 'Obsidian + Claude', ok: true },
  { label: 'Dream Engine', value: 'Claude CLI subprocess', ok: true },
  { label: 'Conversation History', value: 'Manual export (Activity)', ok: false },
]

function MissionControl() {
  const [mission, setMission] = useState(() => localStorage.getItem('claude-os-mission') || '')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(mission)

  const save = () => {
    setMission(draft)
    localStorage.setItem('claude-os-mission', draft)
    setEditing(false)
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <Target size={15} style={{ color: 'var(--accent-gold)' }} />
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)' }}>
          Mission Control
        </span>
        {mission && (
          <span style={{
            marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--font-mono)',
            color: 'var(--accent-green)', letterSpacing: '0.1em',
          }}>
            ● WATCHING
          </span>
        )}
      </div>
      <div style={{ padding: '20px 22px' }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
          Every hero needs a <em style={{ fontStyle: 'normal', color: 'var(--accent-gold)' }}>great goal.</em>
        </div>
        {editing ? (
          <div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="What's your mission? Be specific."
              rows={3}
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: 13,
                fontFamily: 'var(--font-sans)',
                padding: '10px 14px',
                resize: 'vertical',
                outline: 'none',
                lineHeight: 1.6,
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={save}>Save Mission</button>
              <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            {mission ? (
              <div style={{
                fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7,
                fontStyle: 'italic', marginBottom: 14,
                borderLeft: '2px solid var(--accent-gold)',
                paddingLeft: 14,
              }}>
                &ldquo;{mission}&rdquo;
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 14 }}>
                No mission set. Define what you&apos;re working toward.
              </div>
            )}
            <button className="btn" onClick={() => { setDraft(mission); setEditing(true) }}>
              {mission ? 'Edit Mission' : 'Set Mission'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const LIVE_AGENTS = [
  { name: 'claude-os', label: 'Claude OS', desc: 'IDE only · current session', live: true },
  { name: 'mars-bot', label: 'Mars Bot', desc: 'Telegram + hotkey agent', live: true },
  { name: 'memory-files', label: 'Memory Files', desc: '506 files · 2 workspaces', live: true },
  { name: 'integrations', label: 'Integrations', desc: 'Obsidian + Claude connected', live: true },
]

function LiveAgents() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {LIVE_AGENTS.map(a => (
        <div key={a.name} style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          transition: 'border-color 0.15s',
        }}>
          <span className="status-dot" style={a.live ? {} : { background: 'var(--text-dim)', boxShadow: 'none' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{a.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.desc}</div>
          </div>
          {a.live && (
            <span style={{
              marginLeft: 'auto', fontSize: 9, fontFamily: 'var(--font-mono)',
              background: 'var(--accent-green-dim)', color: 'var(--accent-green)',
              padding: '2px 6px', borderRadius: 3, letterSpacing: '0.06em',
            }}>LIVE</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    api.getStats().then(d => { setStats(d); setLoading(false) })
  }, [])

  return (
    <div>
      <div className="page-header">
        <div className="page-greeting">
          Good <em>{getGreeting()}</em>, Alejo.
        </div>
        <div className="page-subtitle">{today} &middot; Today at a glance.</div>
      </div>

      {loading ? (
        <div className="loading">Loading stats...</div>
      ) : (
        <div className="stats-grid">
          <StatCard
            label="Active Skills"
            value={stats ? stats.skills_count : 0}
            detail="in ~/.claude/skills/"
            icon={Zap}
            accent="gold"
          />
          <StatCard
            label="Memory Files"
            value={stats ? (stats.memory_files + stats.obsidian_files) : 0}
            detail={stats ? (stats.obsidian_files + ' Obsidian · ' + stats.memory_files + ' Claude') : ''}
            icon={Brain}
            accent="blue"
          />
          <StatCard
            label="Last Sync"
            value={stats && stats.last_sync ? new Date(stats.last_sync).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            detail="memory index"
            icon={Clock}
            accent="green"
          />
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <div className="section-title">System Status</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {SYSTEM_ROWS.map((row, i) => (
            <div key={i} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 13,
            }}>
              <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text)' }}>
                {row.value}
                <span
                  className="status-dot"
                  style={row.ok ? {} : { background: 'var(--text-dim)', boxShadow: 'none' }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      <MissionControl />

      <div className="section">
        <div className="section-header">
          <div className="section-title">Active Processes</div>
        </div>
        <LiveAgents />
      </div>
    </div>
  )
}
