import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'

import { Activity } from './models/activity.js'
import { LeaderboardEntry } from './models/leaderboardEntry.js'
import { Team } from './models/team.js'
import { User } from './models/user.js'
import { WorkoutSuggestion } from './models/workoutSuggestion.js'

dotenv.config()

type UserRecord = {
  id: string
  name: string
  email: string
  grade: string
  points: number
  streakDays: number
}

type UserPayload = {
  name?: string
  email?: string
  grade?: string
  points?: number
  streakDays?: number
}

const app = express()
const port = Number(process.env.PORT ?? 8000)
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/octofit_db'
const codespaceName = process.env.CODESPACE_NAME
const baseUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000'

const sampleOverview = {
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

let fallbackUsers: UserRecord[] = [
  {
    id: 'u1',
    name: 'Avery Johnson',
    email: 'avery.johnson@octofit.local',
    grade: '10',
    points: 1240,
    streakDays: 14,
  },
  {
    id: 'u2',
    name: 'Riley Kim',
    email: 'riley.kim@octofit.local',
    grade: '11',
    points: 1175,
    streakDays: 11,
  },
  {
    id: 'u3',
    name: 'Jordan Patel',
    email: 'jordan.patel@octofit.local',
    grade: '9',
    points: 1090,
    streakDays: 9,
  },
]

app.use(
  cors({
    origin: true,
  }),
)
app.use(express.json())

async function connectToDatabase() {
  try {
    await mongoose.connect(mongoUri, {
      dbName: 'octofit_db',
      serverSelectionTimeoutMS: 1500,
    })
    console.log(`MongoDB connected at ${mongoUri}`)
  } catch (error) {
    console.warn('MongoDB unavailable, using fallback data.')
    if (error instanceof Error) {
      console.warn(error.message)
    }
  }
}

async function buildOverview() {
  if (mongoose.connection.readyState !== 1) {
    return sampleOverview
  }

  const [users, teams, activities, leaderboard, workouts] = await Promise.all([
    User.find().limit(6).lean(),
    Team.find().limit(6).lean(),
    Activity.find().limit(6).lean(),
    LeaderboardEntry.find().sort({ rank: 1 }).limit(6).lean(),
    WorkoutSuggestion.find().limit(6).lean(),
  ])

  if (!users.length && !teams.length && !activities.length && !leaderboard.length && !workouts.length) {
    return sampleOverview
  }

  return {
    hero: sampleOverview.hero,
    highlights: [
      { label: 'Aktive Schueler', value: String(users.length) },
      { label: 'Teams', value: String(teams.length) },
      { label: 'Workouts diese Woche', value: String(activities.length) },
    ],
    users: users.map((user) => ({
      id: String(user._id),
      name: user.name,
      grade: user.grade,
      points: user.points,
      streakDays: user.streakDays,
    })),
    teams: teams.map((team) => ({
      id: String(team._id),
      name: team.name,
      memberCount: team.memberCount,
      score: team.score,
    })),
    activities: activities.map((activity) => ({
      id: String(activity._id),
      type: activity.type,
      durationMinutes: activity.durationMinutes,
      intensity: activity.intensity,
      points: activity.points,
    })),
    leaderboard: leaderboard.map((entry) => ({
      id: String(entry._id),
      rank: entry.rank,
      name: entry.name,
      score: entry.score,
      badge: entry.badge,
    })),
    workouts: workouts.map((workout) => ({
      id: String(workout._id),
      title: workout.title,
      focus: workout.focus,
      durationMinutes: workout.durationMinutes,
      level: workout.level,
    })),
  }
}

function mapUserDocument(user: any): UserRecord {
  return {
    id: String(user._id),
    name: String(user.name),
    email: String(user.email ?? ''),
    grade: String(user.grade),
    points: Number(user.points ?? 0),
    streakDays: Number(user.streakDays ?? 0),
  }
}

function normalizeUserPayload(payload: UserPayload, partial = false) {
  const normalized = {
    name: payload.name?.trim(),
    email: payload.email?.trim().toLowerCase(),
    grade: payload.grade?.trim(),
    points: payload.points,
    streakDays: payload.streakDays,
  }

  if (!partial && (!normalized.name || !normalized.email || !normalized.grade)) {
    throw new Error('name, email and grade are required')
  }

  if (normalized.points !== undefined && Number.isNaN(Number(normalized.points))) {
    throw new Error('points must be a number')
  }

  if (normalized.streakDays !== undefined && Number.isNaN(Number(normalized.streakDays))) {
    throw new Error('streakDays must be a number')
  }

  return normalized
}

async function listUsers(): Promise<UserRecord[]> {
  if (mongoose.connection.readyState !== 1) {
    return fallbackUsers
  }

  const users = await User.find().sort({ points: -1, name: 1 }).lean()
  return users.map(mapUserDocument)
}

async function createUser(payload: UserPayload): Promise<UserRecord> {
  const normalized = normalizeUserPayload(payload)

  if (mongoose.connection.readyState !== 1) {
    const newUser: UserRecord = {
      id: `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: normalized.name as string,
      email: normalized.email as string,
      grade: normalized.grade as string,
      points: Number(normalized.points ?? 0),
      streakDays: Number(normalized.streakDays ?? 0),
    }
    fallbackUsers = [newUser, ...fallbackUsers]
    return newUser
  }

  const user = await User.create({
    name: normalized.name,
    email: normalized.email,
    grade: normalized.grade,
    points: Number(normalized.points ?? 0),
    streakDays: Number(normalized.streakDays ?? 0),
  })

  return mapUserDocument(user.toObject())
}

async function updateUser(id: string, payload: UserPayload): Promise<UserRecord | null> {
  const normalized = normalizeUserPayload(payload, true)

  if (mongoose.connection.readyState !== 1) {
    const existing = fallbackUsers.find((user) => user.id === id)

    if (!existing) {
      return null
    }

    const updated: UserRecord = {
      ...existing,
      ...(normalized.name ? { name: normalized.name } : {}),
      ...(normalized.email ? { email: normalized.email } : {}),
      ...(normalized.grade ? { grade: normalized.grade } : {}),
      ...(normalized.points !== undefined ? { points: Number(normalized.points) } : {}),
      ...(normalized.streakDays !== undefined ? { streakDays: Number(normalized.streakDays) } : {}),
    }

    fallbackUsers = fallbackUsers.map((user) => (user.id === id ? updated : user))
    return updated
  }

  const updated = await User.findByIdAndUpdate(
    id,
    {
      ...(normalized.name ? { name: normalized.name } : {}),
      ...(normalized.email ? { email: normalized.email } : {}),
      ...(normalized.grade ? { grade: normalized.grade } : {}),
      ...(normalized.points !== undefined ? { points: Number(normalized.points) } : {}),
      ...(normalized.streakDays !== undefined ? { streakDays: Number(normalized.streakDays) } : {}),
    },
    { new: true, runValidators: true },
  ).lean()

  return updated ? mapUserDocument(updated) : null
}

async function deleteUser(id: string): Promise<boolean> {
  if (mongoose.connection.readyState !== 1) {
    const before = fallbackUsers.length
    fallbackUsers = fallbackUsers.filter((user) => user.id !== id)
    return before !== fallbackUsers.length
  }

  const deleted = await User.findByIdAndDelete(id).lean()
  return Boolean(deleted)
}

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    baseUrl,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'fallback',
  })
})

app.get('/api/overview', async (_request, response, next) => {
  try {
    const overview = await buildOverview()
    response.json(overview)
  } catch (error) {
    next(error)
  }
})

app.get('/api/users', async (_request, response, next) => {
  try {
    response.json(await listUsers())
  } catch (error) {
    next(error)
  }
})

app.post('/api/users', async (request, response, next) => {
  try {
    const user = await createUser(request.body as UserPayload)
    response.status(201).json(user)
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({ message: error.message })
      return
    }
    next(error)
  }
})

app.put('/api/users/:id', async (request, response, next) => {
  try {
    const updated = await updateUser(request.params.id, request.body as UserPayload)

    if (!updated) {
      response.status(404).json({ message: 'User not found' })
      return
    }

    response.json(updated)
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({ message: error.message })
      return
    }
    next(error)
  }
})

app.delete('/api/users/:id', async (request, response, next) => {
  try {
    const removed = await deleteUser(request.params.id)

    if (!removed) {
      response.status(404).json({ message: 'User not found' })
      return
    }

    response.status(204).send()
  } catch (error) {
    next(error)
  }
})

app.get('/api/teams', async (_request, response, next) => {
  try {
    const overview = await buildOverview()
    response.json(overview.teams)
  } catch (error) {
    next(error)
  }
})

app.get('/api/activities', async (_request, response, next) => {
  try {
    const overview = await buildOverview()
    response.json(overview.activities)
  } catch (error) {
    next(error)
  }
})

app.get('/api/leaderboard', async (_request, response, next) => {
  try {
    const overview = await buildOverview()
    response.json(overview.leaderboard)
  } catch (error) {
    next(error)
  }
})

app.get('/api/workouts', async (_request, response, next) => {
  try {
    const overview = await buildOverview()
    response.json(overview.workouts)
  } catch (error) {
    next(error)
  }
})

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error)
  response.status(500).json({
    message: 'Internal server error',
  })
})

connectToDatabase().finally(() => {
  app.listen(port, () => {
    console.log(`OctoFit backend listening on ${baseUrl}`)
  })
})