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

function Students({ overview }) {
  return (
    <section className="page-card">
      <SectionHeader
        eyebrow="Profiles"
        title="Schuelerprofile"
        text="Profile kombinieren Klasse, Punktestand und aktuelle Trainingsserie fuer schnelle Betreuung."
      />
      <div className="profile-grid">
        {overview.users.map((user) => (
          <article key={user.id} className="profile-card">
            <span className="profile-grade">Klasse {user.grade}</span>
            <h3>{user.name}</h3>
            <p>{user.points} Punkte</p>
            <strong>{user.streakDays} Tage Serie</strong>
          </article>
        ))}
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
