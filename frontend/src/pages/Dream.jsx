import { useState, useEffect } from 'react'
import { Moon, Play, RefreshCw } from 'lucide-react'
import { api } from '../api.js'

export default function Dream() {
  const [dream, setDream] = useState(null)
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDreamLatest().then(d => {
      setDream(d)
      setLoading(false)
    })
  }, [])

  const runDream = async () => {
    setRunning(true)
    const result = await api.runDream()
    if (result) setDream(result)
    setRunning(false)
  }

  const dreamDate = dream && dream.generated_at
    ? new Date(dream.generated_at).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : null

  return (
    <div>
      <div className="dream-header">
        <Moon size={28} style={{ color: 'var(--accent-gold)', marginTop: 6, flexShrink: 0 }} />
        <div>
          <div className="dream-title">Dreaming</div>
          <div className="dream-subtitle">
            Every night, the agent re-reads the week, finds patterns, and writes the suggestions it thinks you should chase tomorrow.
          </div>
        </div>
      </div>

      <div className="header-bar" style={{ marginBottom: 24 }}>
        <div>
          {dreamDate ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Last dream: <strong style={{ color: 'var(--text)' }}>{dreamDate}</strong>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No dream generated yet.</div>
          )}
        </div>
        <button className="btn btn-gold" onClick={runDream} disabled={running}>
          {running ? <RefreshCw size={14} className="spin" /> : <Play size={14} />}
          {running ? 'Dreaming...' : 'Run Dream Now'}
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <Moon size={20} /> Loading dream analysis...
        </div>
      ) : running ? (
        <div className="loading">
          <Moon size={20} style={{ color: 'var(--accent-gold)' }} />
          Analyzing memory patterns... This may take a minute.
        </div>
      ) : dream && dream.patterns && dream.patterns.length > 0 ? (
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            {dream.improvements_found || dream.patterns.length} improvements found overnight
          </div>
          {dreamDate && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
              Pattern analysis across 7 days &middot; generated {dreamDate}
            </div>
          )}
          <div className="dream-cards">
            {dream.patterns.map((p, i) => (
              <div key={i} className="dream-card">
                <div className="dream-card-badge">
                  {p.type || 'INSIGHT'} &middot; {i + 1}/{dream.patterns.length}
                </div>
                <div className="dream-card-title">{p.title}</div>
                <div className="dream-card-body">{p.description}</div>
                {p.why && (
                  <div className="dream-card-why">
                    <strong>Why we&apos;re suggesting this</strong>
                    <div style={{ marginTop: 6 }}>{p.why}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '80px 40px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <Moon size={48} style={{ color: 'var(--text-dim)', marginBottom: 16 }} />
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
            No dream analysis yet
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Run your first dream to get overnight suggestions based on your Obsidian notes and memory files.
          </div>
          <button className="btn btn-gold" onClick={runDream} disabled={running}>
            <Moon size={14} /> Run First Dream
          </button>
        </div>
      )}
    </div>
  )
}
