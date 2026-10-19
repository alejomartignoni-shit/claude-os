import { useState, useEffect } from 'react'
import { api } from '../api.js'

const TIER_ORDER = { orchestrator: 0, specialist: 1, worker: 2 }
const TIER_EMOJI = { orchestrator: '🎯', specialist: '⚡', worker: '🔧', installed: '📦' }

export default function Agents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAgents().then(d => {
      if (d) {
        const sorted = [...d].sort((a, b) =>
          (TIER_ORDER[a.tier] != null ? TIER_ORDER[a.tier] : 3) -
          (TIER_ORDER[b.tier] != null ? TIER_ORDER[b.tier] : 3)
        )
        setAgents(sorted)
      }
      setLoading(false)
    })
  }, [])

  const tiers = [...new Set(agents.map(a => a.tier || 'worker'))]

  return (
    <div>
      <div className="header-bar">
        <div>
          <div className="page-title">Agent Hierarchy</div>
          <div className="page-subtitle" style={{ marginTop: 4 }}>
            {agents.length} agents registered &middot; ordered by tier
          </div>
        </div>
        <button className="btn">+ Add Persona</button>
      </div>

      {loading ? (
        <div className="loading">Loading agents...</div>
      ) : (
        tiers.map(tier => {
          const group = agents.filter(a => (a.tier || 'worker') === tier)
          return (
            <div key={tier} className="section">
              <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{TIER_EMOJI[tier] || '🤖'}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {tier === 'orchestrator' ? 'Top-level planning & coordination'
                       : tier === 'specialist' ? 'Domain expertise & analysis'
                       : tier === 'installed' ? 'Discovered in ~/.claude/agents'
                       : 'Execution & implementation'}
                    </div>
                  </div>
                </div>
                <span className="count-badge">{group.length}</span>
              </div>
              <div className="agents-list">
                {group.map(agent => (
                  <div key={agent.name} className="agent-card">
                    <div className="agent-avatar" style={{
                      background: tier === 'orchestrator'
                        ? 'linear-gradient(135deg, #f59e0b22, #f59e0b44)'
                        : tier === 'specialist'
                        ? 'linear-gradient(135deg, #3b82f622, #3b82f644)'
                        : 'linear-gradient(135deg, #6b728022, #6b728044)',
                      border: `1px solid ${tier === 'orchestrator' ? '#f59e0b33' : tier === 'specialist' ? '#3b82f633' : '#6b728033'}`,
                      fontSize: 16,
                    }}>
                      {TIER_EMOJI[agent.tier] || '🤖'}
                    </div>
                    <div className="agent-info">
                      <div className="agent-name">{agent.name}</div>
                      <div className="agent-desc">
                        {agent.description || 'No description.'}
                      </div>
                      <div className="agent-tags">
                        {agent.model && (
                          <span className="tag" style={{
                            background: agent.model.includes('opus')
                              ? 'rgba(245,158,11,0.12)'
                              : agent.model.includes('haiku')
                              ? 'rgba(34,197,94,0.12)'
                              : 'rgba(59,130,246,0.12)',
                            color: agent.model.includes('opus')
                              ? '#f59e0b'
                              : agent.model.includes('haiku')
                              ? '#22c55e'
                              : '#3b82f6',
                          }}>
                            {agent.model}
                          </span>
                        )}
                        {agent.tier && <span className="tag tag-tier">{agent.tier}</span>}
                        <span className={agent.status === 'online' ? 'tag tag-online' : 'tag tag-offline'}>
                          {agent.status === 'online' ? '● ONLINE' : '○ OFFLINE'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
