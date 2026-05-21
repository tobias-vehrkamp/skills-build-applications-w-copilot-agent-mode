import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import logoUrl from '../../../docs/octofitapp-small.png'
import './App.css'

const fallbackOverview = {
  hero: {
    title: 'OctoFit Tracker',
    subtitle: 'Aktivitaeten, Teams und Motivation in einer kompakten Schulplattform.',
  },
  highlights: [
    { label: 'Aktive Schueler', value: '128' },
    { label: 'Teams', value: '12' },
    { label: 'Workouts diese Woche', value: '486' },
  ],
  users: [
    { id: 'u1', name: 'Avery Johnson', grade: '10', points: 1240, streakDays: 14 },
    { id: 'u2', name: 'Riley Kim', grade: '11', points: 1175, streakDays: 11 },
    { id: 'u3', name: 'Jordan Patel', grade: '9', points: 1090, streakDays: 9 },
  ],
  teams: [
    { id: 't1', name: 'Cardio Crew', memberCount: 18, score: 3620 },
    { id: 't2', name: 'Strength Squad', memberCount: 15, score: 3390 },
    { id: 't3', name: 'Motion Masters', memberCount: 20, score: 3275 },
  ],
  activities: [
    { id: 'a1', type: 'Running', durationMinutes: 35, intensity: 'High', points: 180 },
    { id: 'a2', type: 'Walking', durationMinutes: 50, intensity: 'Medium', points: 110 },
    { id: 'a3', type: 'Strength', durationMinutes: 40, intensity: 'High', points: 165 },
  ],
  leaderboard: [
    { id: 'l1', rank: 1, name: 'Avery Johnson', score: 1240, badge: 'Momentum' },
    { id: 'l2', rank: 2, name: 'Riley Kim', score: 1175, badge: 'Consistency' },
    { id: 'l3', rank: 3, name: 'Jordan Patel', score: 1090, badge: 'Power Push' },
  ],
  workouts: [
    { id: 'w1', title: 'Recovery Run', focus: 'Cardio', durationMinutes: 25, level: 'Beginner' },
    { id: 'w2', title: 'Core Builder', focus: 'Strength', durationMinutes: 30, level: 'Intermediate' },
    { id: 'w3', title: 'Mobility Reset', focus: 'Flexibility', durationMinutes: 20, level: 'All levels' },
  ],
}

function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.app.github.dev')) {
    return `https://${window.location.hostname.replace(/-\d+\.app\.github\.dev$/, '-8000.app.github.dev')}`
  }

  return 'http://localhost:8000'
}

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="section-header">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  )
}

function Dashboard({ overview, status }) {
  return (
    <>
      <section className="hero-shell">
        <div className="hero-copy">
          <span className="hero-pill">PE dashboard for Mergington High</span>
          <h1>{overview.hero.title}</h1>
          <p>{overview.hero.subtitle}</p>
          <div className="hero-status">
            <span className={`status-dot ${status}`} />
            Datenquelle: {status === 'live' ? 'API verbunden' : 'Demo-Modus'}
          </div>
        </div>
        <div className="hero-panel">
          <img src={logoUrl} alt="OctoFit Logo" className="hero-logo" />
          <div className="metric-grid">
            {overview.highlights.map((item) => (
              <MetricCard key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="content-card wide-card">
          <SectionHeader
            eyebrow="Momentum"
            title="Leaderboard"
            text="Schueler sehen Fortschritt, Platzierung und motivierende Badges auf einen Blick."
          />
          <div className="leaderboard-list">
            {overview.leaderboard.map((entry) => (
              <article key={entry.id} className="leaderboard-row">
                <div>
                  <span className="rank-badge">#{entry.rank}</span>
                  <strong>{entry.name}</strong>
                </div>
                <div className="leaderboard-meta">
                  <span>{entry.badge}</span>
                  <strong>{entry.score} pts</strong>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="content-card">
          <SectionHeader
            eyebrow="Teams"
            title="Aktive Gruppen"
            text="Wettbewerbe zwischen Teams sorgen fuer freundlichen Druck statt stiller Passivitaet."
          />
          <div className="stack-list">
            {overview.teams.map((team) => (
              <article key={team.id} className="stack-row">
                <div>
                  <strong>{team.name}</strong>
                  <span>{team.memberCount} Mitglieder</span>
                </div>
                <strong>{team.score}</strong>
              </article>
            ))}
          </div>
        </div>

        <div className="content-card">
          <SectionHeader
            eyebrow="Aktivitaeten"
            title="Aktuelle Logs"
            text="Schnelle Erfassung fuer Laufen, Gehen und Krafttraining mit Punkten pro Eintrag."
          />
          <div className="stack-list">
            {overview.activities.map((activity) => (
              <article key={activity.id} className="stack-row">
                <div>
                  <strong>{activity.type}</strong>
                  <span>{activity.durationMinutes} min · {activity.intensity}</span>
                </div>
                <strong>{activity.points} pts</strong>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function emptyUserForm() {
  return {
    name: '',
    email: '',
    grade: '',
    points: 0,
    streakDays: 0,
  }
}

function Students({ overview }) {
  const [users, setUsers] = useState(overview.users)
  const [formState, setFormState] = useState(emptyUserForm())
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setUsers(overview.users)
  }, [overview.users])

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/users`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Users request failed')
        }

        setUsers(await response.json())
      } catch {
        setError('Nutzer konnten nicht frisch geladen werden. Demo-Daten bleiben sichtbar.')
      }
    }

    loadUsers()

    return () => controller.abort()
  }, [])

  function resetForm() {
    setFormState(emptyUserForm())
    setEditingId(null)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setFormState((current) => ({
      ...current,
      [name]: name === 'points' || name === 'streakDays' ? Number(value) : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const method = editingId ? 'PUT' : 'POST'
    const url = editingId
      ? `${getApiBaseUrl()}/api/users/${editingId}`
      : `${getApiBaseUrl()}/api/users`

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      })

      const payload = response.status === 204 ? null : await response.json()

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Speichern fehlgeschlagen')
      }

      if (editingId) {
        setUsers((current) => current.map((user) => (user.id === editingId ? payload : user)))
        setMessage('Profil aktualisiert.')
      } else {
        setUsers((current) => [payload, ...current])
        setMessage('Profil angelegt.')
      }

      resetForm()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Speichern fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/users/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload?.message ?? 'Loeschen fehlgeschlagen')
      }

      setUsers((current) => current.filter((user) => user.id !== id))
      if (editingId === id) {
        resetForm()
      }
      setMessage('Profil geloescht.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Loeschen fehlgeschlagen')
    }
  }

  function startEdit(user) {
    setEditingId(user.id)
    setFormState({
      name: user.name,
      email: user.email ?? '',
      grade: user.grade,
      points: user.points,
      streakDays: user.streakDays,
    })
    setMessage('')
    setError('')
  }

  return (
    <section className="page-card">
      <SectionHeader
        eyebrow="Profiles"
        title="Schuelerprofile"
        text="Profile kombinieren Klasse, Punktestand und aktuelle Trainingsserie fuer schnelle Betreuung."
      />
      <div className="row g-4 align-items-start">
        <div className="col-12 col-xl-4">
          <form className="card border-0 shadow-sm" onSubmit={handleSubmit}>
            <div className="card-body d-grid gap-3 text-start">
              <h3 className="h5 mb-0">{editingId ? 'Profil bearbeiten' : 'Neues Profil'}</h3>
              <div>
                <label className="form-label" htmlFor="name">Name</label>
                <input id="name" name="name" className="form-control" value={formState.name} onChange={handleChange} required />
              </div>
              <div>
                <label className="form-label" htmlFor="email">E-Mail</label>
                <input id="email" name="email" type="email" className="form-control" value={formState.email} onChange={handleChange} required />
              </div>
              <div>
                <label className="form-label" htmlFor="grade">Klasse</label>
                <input id="grade" name="grade" className="form-control" value={formState.grade} onChange={handleChange} required />
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label" htmlFor="points">Punkte</label>
                  <input id="points" name="points" type="number" min="0" className="form-control" value={formState.points} onChange={handleChange} />
                </div>
                <div className="col-6">
                  <label className="form-label" htmlFor="streakDays">Serie</label>
                  <input id="streakDays" name="streakDays" type="number" min="0" className="form-control" value={formState.streakDays} onChange={handleChange} />
                </div>
              </div>
              {message ? <div className="alert alert-success mb-0 py-2">{message}</div> : null}
              {error ? <div className="alert alert-warning mb-0 py-2">{error}</div> : null}
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-dark" disabled={saving}>
                  {saving ? 'Speichert...' : editingId ? 'Profil speichern' : 'Profil anlegen'}
                </button>
                {editingId ? (
                  <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                    Abbrechen
                  </button>
                ) : null}
              </div>
            </div>
          </form>
        </div>
        <div className="col-12 col-xl-8">
          <div className="profile-grid">
            {users.map((user) => (
              <article key={user.id} className="profile-card">
                <span className="profile-grade">Klasse {user.grade}</span>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <p>{user.points} Punkte</p>
                <strong>{user.streakDays} Tage Serie</strong>
                <div className="d-flex gap-2 mt-2">
                  <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => startEdit(user)}>
                    Bearbeiten
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(user.id)}>
                    Loeschen
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Suggestions({ overview }) {
  return (
    <section className="page-card">
      <SectionHeader
        eyebrow="Coach Assist"
        title="Workout-Vorschlaege"
        text="Personalisierte Empfehlungen helfen bei naechsten Schritten statt nur vergangene Daten zu zeigen."
      />
      <div className="profile-grid">
        {overview.workouts.map((workout) => (
          <article key={workout.id} className="profile-card">
            <span className="profile-grade">{workout.level}</span>
            <h3>{workout.title}</h3>
            <p>{workout.focus}</p>
            <strong>{workout.durationMinutes} Minuten</strong>
          </article>
        ))}
      </div>
    </section>
  )
}

function AppShell() {
  const [overview, setOverview] = useState(fallbackOverview)
  const [status, setStatus] = useState('demo')

  useEffect(() => {
    const controller = new AbortController()

    async function loadOverview() {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/overview`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('API request failed')
        }

        const data = await response.json()
        setOverview(data)
        setStatus('live')
      } catch {
        setStatus('demo')
      }
    }

    loadOverview()

    return () => controller.abort()
  }, [])

  const navItems = useMemo(
    () => [
      { to: '/', label: 'Dashboard' },
      { to: '/students', label: 'Profile' },
      { to: '/suggestions', label: 'Workouts' },
    ],
    [],
  )

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <NavLink to="/" className="brand-mark">
            <img src={logoUrl} alt="OctoFit" />
            <div>
              <strong>OctoFit Tracker</strong>
              <span>School fitness operations</span>
            </div>
          </NavLink>
          <nav className="nav-links">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="nav-link-item">
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Dashboard overview={overview} status={status} />} />
            <Route path="/students" element={<Students overview={overview} />} />
            <Route path="/suggestions" element={<Suggestions overview={overview} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default AppShell
