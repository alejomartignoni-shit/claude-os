import { useState, useEffect } from 'react'
import { api } from '../api.js'

const CATEGORY_COLORS = {
  agents: '#f59e0b',
  ai: '#8b5cf6',
  frontend: '#3b82f6',
  backend: '#22c55e',
  research: '#06b6d4',
  content: '#ec4899',
  quality: '#f87171',
  general: '#6b7280',
}

export default function Skills() {
  const [skills, setSkills] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [catFilter, setCatFilter] = useState('all')

  useEffect(() => {
    api.getSkills().then(d => {
      if (d) setSkills(d)
      setLoading(false)
    })
  }, [])

  const categories = ['all', ...new Set(skills.map(s => s.category).filter(Boolean))]

  const filtered = skills.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || s.category === catFilter
    return matchSearch && matchCat
  })

  return (
    <div>
      <div className="header-bar">
        <div>
          <div className="page-title">Skills Library</div>
          <div className="page-subtitle" style={{ marginTop: 4 }}>
            {skills.length} skills loaded from ~/.claude/skills/
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            className="search-input"
            placeholder="Search skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="count-badge">{filtered.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading skills...</div>
      ) : (
        <>
          <div className="filter-pills" style={{ marginBottom: 16 }}>
            {categories.slice(0, 9).map(cat => (
              <button
                key={cat}
                className={'filter-pill' + (catFilter === cat ? ' active' : '')}
                onClick={() => setCatFilter(cat)}
                style={catFilter === cat ? {
                  borderColor: CATEGORY_COLORS[cat] || '#3b82f6',
                  color: CATEGORY_COLORS[cat] || '#3b82f6',
                  background: (CATEGORY_COLORS[cat] || '#3b82f6') + '18',
                } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="skills-grid">
            {filtered.map((skill, i) => (
              <div
                key={skill.name}
                className="skill-card"
                style={{ borderLeft: `3px solid ${(CATEGORY_COLORS[skill.category] || '#6b7280')}44` }}
              >
                <div className="skill-number">{String(i + 1).padStart(2, '0')}</div>
                <div className="skill-name">{skill.name}</div>
                <div className="skill-desc">
                  {skill.description || 'No description available.'}
                </div>
                {skill.category && (
                  <div className="skill-badge" style={{
                    color: CATEGORY_COLORS[skill.category] || 'var(--text-dim)',
                    background: (CATEGORY_COLORS[skill.category] || '#6b7280') + '18',
                  }}>
                    {skill.category}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center' }}>
                No skills match &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
