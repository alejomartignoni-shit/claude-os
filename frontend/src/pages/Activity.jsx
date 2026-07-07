import { useState, useEffect } from 'react'
import { api } from '../api.js'

const PLATFORMS = [
  { key: 'claude', label: 'Claude', icon: '🤖', color: '#f59e0b' },
  { key: 'grok', label: 'Grok / xAI', icon: '🔵', color: '#3b82f6' },
  { key: 'chatgpt', label: 'ChatGPT', icon: '💬', color: '#22c55e' },
  { key: 'antigravity', label: 'Antigravity IDE', icon: '⚡', color: '#8b5cf6' },
]

const SETUP_STEPS = {
  claude: [
    'Sessions logged in ~/.claude/ as transcript files automatically',
    'Memory files at ~/.claude/memory/ capture key context per conversation',
    'Backend indexes all session files on each refresh',
  ],
  grok: [
    'Export Grok conversations from x.ai Settings > Data',
    'Place exported JSON in C:/Users/Alejo/claude-os/conversations/grok/',
    'Backend indexes on next refresh',
  ],
  chatgpt: [
    'Go to ChatGPT Settings > Data Controls > Export data',
    'Extract conversations.json to C:/Users/Alejo/claude-os/conversations/chatgpt/',
    'Backend auto-indexes on next refresh',
  ],
  antigravity: [
    'Antigravity IDE sessions stored at ~/.antigravity-ide/',
    'Backend reads session logs from that directory automatically',
    'No manual export needed',
  ],
}

export default function ActivityPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSetup, setActiveSetup] = useState(null)

  useEffect(() => {
    api.getActivity().then(d => {
      if (d) setActivities(d)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div className="header-bar" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-title">Activity &amp; Conversations</div>
          <div className="page-subtitle" style={{ marginTop: 4 }}>
            Connect your AI platforms for full conversation context.
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-title">Conversation Sources</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {PLATFORMS.map(p => (
            <div
              key={p.key}
              className="agent-card"
              style={{
                cursor: 'pointer',
                borderColor: activeSetup === p.key ? 'var(--border-active)' : 'var(--border)',
              }}
              onClick={() => setActiveSetup(activeSetup === p.key ? null : p.key)}
            >
              <div className="agent-avatar" style={{ background: p.color + '22', fontSize: 20 }}>
                {p.icon}
              </div>
              <div className="agent-info">
                <div className="agent-name">{p.label}</div>
                <div className="agent-desc">Click for setup instructions</div>
                <div className="agent-tags">
                  <span className="tag tag-offline">MANUAL IMPORT</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeSetup && (
          <div className="inspector" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
              Setup: {PLATFORMS.find(p => p.key === activeSetup) && PLATFORMS.find(p => p.key === activeSetup).label}
            </div>
            {SETUP_STEPS[activeSetup].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', minWidth: 18 }}>{i + 1}.</span>
                <span style={{ color: 'var(--text-muted)' }}>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-title">Recent Sessions</div>
        </div>
        {loading ? (
          <div className="loading">Loading activity...</div>
        ) : activities.length > 0 ? (
          <div className="activity-list">
            {activities.map((a, i) => (
              <div key={i} className="activity-item">
                <span className="activity-time">
                  {new Date(a.time).toLocaleTimeString()}
                </span>
                <span className="activity-text">{a.text}</span>
                {a.platform && <span className="tag tag-tier">{a.platform}</span>}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>
            No recent activity. Connect AI platforms above to start tracking.
          </div>
        )}
      </div>
    </div>
  )
}
