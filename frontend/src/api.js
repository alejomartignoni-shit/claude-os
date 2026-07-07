const BASE = '/api'

async function req(path, opts = {}) {
  try {
    const res = await fetch(BASE + path, opts)
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  } catch (e) {
    console.warn('API error:', path, e.message)
    return null
  }
}

export const api = {
  getStats: () => req('/stats'),
  getMemoryFiles: () => req('/memory/files'),
  getMemoryGraph: () => req('/memory/graph'),
  getSkills: () => req('/skills'),
  getAgents: () => req('/agents'),
  getDreamLatest: () => req('/dream/latest'),
  runDream: () => req('/dream/run', { method: 'POST' }),
  getActivity: () => req('/activity'),
}
