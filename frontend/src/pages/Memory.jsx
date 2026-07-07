import { useState, useEffect, useRef, useCallback } from 'react'
import { RefreshCw, FileText, Brain, User } from 'lucide-react'
import { api } from '../api.js'

const SOURCE_COLORS = {
  obsidian: '#f59e0b',
  claude: '#3b82f6',
  default: '#6b7280',
}

const MAX_NODES = 80

function getTopNodes(nodes, links) {
  const degree = {}
  nodes.forEach(n => { degree[n.id] = 0 })
  links.forEach(l => {
    if (degree[l.source] !== undefined) degree[l.source]++
    if (degree[l.target] !== undefined) degree[l.target]++
  })
  return [...nodes]
    .sort((a, b) => (degree[b.id] || 0) - (degree[a.id] || 0))
    .slice(0, MAX_NODES)
}

function ForceGraph({ nodes, links, filter, onNodeClick }) {
  const svgRef = useRef(null)
  const [positions, setPositions] = useState({})
  const [selected, setSelected] = useState(null)
  const animRef = useRef(null)
  const alphaRef = useRef(1.0)

  // Only show top connected nodes
  const allFiltered = filter === 'all' ? nodes : nodes.filter(n => n.source === filter)
  const filteredIds = new Set(allFiltered.map(n => n.id))
  const filteredLinks = links.filter(l => filteredIds.has(l.source) && filteredIds.has(l.target))
  const filtered = getTopNodes(allFiltered, filteredLinks)
  const visibleIds = new Set(filtered.map(n => n.id))
  const visibleLinks = filteredLinks.filter(l => visibleIds.has(l.source) && visibleIds.has(l.target))

  useEffect(() => {
    if (!filtered.length) return
    cancelAnimationFrame(animRef.current)
    alphaRef.current = 1.0

    const W = svgRef.current ? svgRef.current.clientWidth : 800
    const H = 480
    const pos = {}
    const vel = {}

    // Golden angle spiral initial positions — better convergence
    filtered.forEach((n, i) => {
      const angle = i * 2.399963  // golden angle in radians
      const r = 20 + Math.sqrt(i) * 28
      pos[n.id] = {
        x: W / 2 + Math.cos(angle) * r,
        y: H / 2 + Math.sin(angle) * r,
      }
      vel[n.id] = { vx: 0, vy: 0 }
    })

    const step = () => {
      const alpha = alphaRef.current
      if (alpha < 0.008) {
        setPositions({ ...pos })
        return
      }
      alphaRef.current *= 0.985  // cooling

      const REPEL = 700
      const LINK_DIST = 90
      const K = 0.06 * alpha
      const DAMP = 0.55
      const CENTER_PULL = 0.015 * alpha

      // Repulsion
      for (let i = 0; i < filtered.length; i++) {
        for (let j = i + 1; j < filtered.length; j++) {
          const a = filtered[i]; const b = filtered[j]
          const dx = pos[a.id].x - pos[b.id].x
          const dy = pos[a.id].y - pos[b.id].y
          const d2 = dx * dx + dy * dy
          if (d2 === 0) continue
          const d = Math.sqrt(d2)
          const f = (REPEL * alpha) / d2
          const fx = (dx / d) * f; const fy = (dy / d) * f
          vel[a.id].vx += fx; vel[a.id].vy += fy
          vel[b.id].vx -= fx; vel[b.id].vy -= fy
        }
      }

      // Link attraction
      visibleLinks.forEach(l => {
        const a = pos[l.source]; const b = pos[l.target]
        if (!a || !b) return
        const dx = b.x - a.x; const dy = b.y - a.y
        const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const f = (d - LINK_DIST) * K
        const fx = (dx / d) * f; const fy = (dy / d) * f
        vel[l.source].vx += fx; vel[l.source].vy += fy
        vel[l.target].vx -= fx; vel[l.target].vy -= fy
      })

      // Center gravity + integrate
      filtered.forEach(n => {
        vel[n.id].vx += (W / 2 - pos[n.id].x) * CENTER_PULL
        vel[n.id].vy += (H / 2 - pos[n.id].y) * CENTER_PULL
        vel[n.id].vx *= DAMP; vel[n.id].vy *= DAMP
        pos[n.id] = {
          x: Math.max(16, Math.min(W - 16, pos[n.id].x + vel[n.id].vx)),
          y: Math.max(16, Math.min(H - 16, pos[n.id].y + vel[n.id].vy)),
        }
      })

      setPositions({ ...pos })
      animRef.current = requestAnimationFrame(step)
    }

    setPositions({ ...pos })
    animRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animRef.current)
  }, [filter, allFiltered.length])

  const handleClick = useCallback(node => {
    setSelected(node)
    if (onNodeClick) onNodeClick(node)
  }, [onNodeClick])

  return (
    <div className="memory-graph-container">
      <svg ref={svgRef} className="memory-graph-canvas">
        <defs>
          <radialGradient id="bg-glow">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Background glow */}
        <ellipse cx="50%" cy="50%" rx="40%" ry="40%" fill="url(#bg-glow)" />

        {/* Links */}
        {visibleLinks.map((l, i) => {
          const a = positions[l.source]; const b = positions[l.target]
          if (!a || !b) return null
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
        })}

        {/* Nodes */}
        {filtered.map(n => {
          const p = positions[n.id]
          if (!p) return null
          const color = SOURCE_COLORS[n.source] || SOURCE_COLORS.default
          const r = Math.max(4, Math.min(10, (n.size || 1000) * 0.002 + 4))
          const isSel = selected && selected.id === n.id
          return (
            <g key={n.id} onClick={() => handleClick(n)} style={{ cursor: 'pointer' }}>
              {/* Glow halo */}
              <circle cx={p.x} cy={p.y} r={r + 8} fill={color} opacity={0.07} />
              {/* Main node */}
              <circle
                cx={p.x} cy={p.y} r={r}
                fill={color}
                opacity={isSel ? 1 : 0.8}
                stroke={isSel ? '#fff' : color}
                strokeWidth={isSel ? 2 : 0.5}
                strokeOpacity={isSel ? 1 : 0.3}
              />
            </g>
          )
        })}
      </svg>
      <div style={{
        position: 'absolute', bottom: 12, right: 16,
        fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)',
      }}>
        showing {filtered.length} of {allFiltered.length} nodes
      </div>
    </div>
  )
}

function MemoryCard({ title, icon: Icon, files, color }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <Icon size={15} style={{ color }} />
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)' }}>
          {title}
        </span>
        <span className="count-badge" style={{ marginLeft: 'auto' }}>{files.length}</span>
      </div>

      {/* File list */}
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {files.slice(0, 20).map((f, i) => (
          <div
            key={i}
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              padding: '10px 18px',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              background: expanded === i ? 'var(--bg-elevated)' : 'transparent',
              transition: 'background 0.1s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: color, flexShrink: 0, opacity: 0.8,
              }} />
              <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                {f.name}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {f.size ? Math.round(f.size / 1024) + 'k' : ''}
              </span>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <div style={{ padding: '24px 18px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            No files found
          </div>
        )}
      </div>
    </div>
  )
}

export default function Memory() {
  const [graph, setGraph] = useState({ nodes: [], links: [] })
  const [files, setFiles] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const load = async () => {
    setLoading(true)
    const [g, f, s] = await Promise.all([
      api.getMemoryGraph(),
      api.getMemoryFiles(),
      api.getStats(),
    ])
    if (g) setGraph(g)
    if (f) setFiles(f)
    if (s) setStats(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSync = async () => {
    setSyncing(true)
    await load()
    setSyncing(false)
  }

  const total = graph.nodes.length
  const obsidianNodes = graph.nodes.filter(n => n.source === 'obsidian')
  const claudeNodes = graph.nodes.filter(n => n.source === 'claude')
  const obsidianFiles = files.filter(f => f.source === 'obsidian')
  const claudeFiles = files.filter(f => f.source === 'claude')

  const FILTERS = [
    { key: 'all', label: 'All', color: '#6b7280' },
    { key: 'obsidian', label: 'Obsidian', color: SOURCE_COLORS.obsidian },
    { key: 'claude', label: 'Local Claude', color: SOURCE_COLORS.claude },
  ]

  return (
    <div>
      <div className="header-bar">
        <div>
          <div className="page-title">Memory Graph</div>
          <div className="page-subtitle" style={{ marginTop: 4 }}>
            Hover a node to trace links. Click to inspect. Map clusters by workspace.
          </div>
        </div>
        <button className="btn" onClick={handleSync} disabled={syncing}>
          <RefreshCw size={14} className={syncing ? 'spin' : ''} />
          {syncing ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {/* Count + filters */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 52, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text)', lineHeight: 1 }}>
            {loading ? '...' : total}
          </div>
          <div style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 4 }}>files indexed</div>
        </div>
        <div className="filter-pills">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={'filter-pill' + (filter === f.key ? ' active' : '')}
              onClick={() => setFilter(f.key)}
            >
              <span className="dot" style={{ background: f.color }} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Graph */}
      {loading ? (
        <div className="loading">Indexing memory files...</div>
      ) : (
        <div style={{ position: 'relative' }}>
          <ForceGraph
            nodes={graph.nodes}
            links={graph.links}
            filter={filter}
            onNodeClick={setSelected}
          />
        </div>
      )}

      {/* Stats row */}
      <div className="memory-stats-row">
        <div className="memory-stat">
          <div className="memory-stat-label">Total</div>
          <div className="memory-stat-value">{total}</div>
        </div>
        <div className="memory-stat">
          <div className="memory-stat-label">Obsidian</div>
          <div className="memory-stat-value" style={{ color: 'var(--accent-gold)' }}>{obsidianNodes.length}</div>
        </div>
        <div className="memory-stat">
          <div className="memory-stat-label">Claude Memory</div>
          <div className="memory-stat-value" style={{ color: 'var(--accent-blue)' }}>{claudeNodes.length}</div>
        </div>
        <div className="memory-stat">
          <div className="memory-stat-label">WikiLinks</div>
          <div className="memory-stat-value">{graph.links.length}</div>
        </div>
      </div>

      {/* Inspector */}
      {selected && (
        <div className="inspector">
          <strong>{selected.name}</strong>
          <span style={{ color: 'var(--text-dim)', marginLeft: 12 }}>
            source: {selected.source} &middot; {selected.size != null ? Math.round(selected.size / 1024) + 'k' : '?'}
          </span>
        </div>
      )}

      {/* Memory cards — Agent Memory & Obsidian Vault */}
      {!loading && (
        <div style={{ marginTop: 32 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title">Memory Sources</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <MemoryCard
              title="Agent Memory"
              icon={Brain}
              files={claudeFiles}
              color={SOURCE_COLORS.claude}
            />
            <MemoryCard
              title="Obsidian Vault"
              icon={FileText}
              files={obsidianFiles}
              color={SOURCE_COLORS.obsidian}
            />
          </div>
        </div>
      )}
    </div>
  )
}
