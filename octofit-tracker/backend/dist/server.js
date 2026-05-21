import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { Activity } from './models/activity.js';
import { LeaderboardEntry } from './models/leaderboardEntry.js';
import { Team } from './models/team.js';
import { User } from './models/user.js';
import { WorkoutSuggestion } from './models/workoutSuggestion.js';
dotenv.config();
const app = express();
const port = Number(process.env.PORT ?? 8000);
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/octofit_db';
const codespaceName = process.env.CODESPACE_NAME;
const baseUrl = codespaceName
    ? `https://${codespaceName}-8000.app.github.dev`
    : 'http://localhost:8000';
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
};
app.use(cors({
    origin: true,
}));
app.use(express.json());
async function connectToDatabase() {
    try {
        await mongoose.connect(mongoUri, {
            dbName: 'octofit_db',
            serverSelectionTimeoutMS: 1500,
        });
        console.log(`MongoDB connected at ${mongoUri}`);
    }
    catch (error) {
        console.warn('MongoDB unavailable, using fallback data.');
        if (error instanceof Error) {
            console.warn(error.message);
        }
    }
}
async function buildOverview() {
    if (mongoose.connection.readyState !== 1) {
        return sampleOverview;
    }
    const [users, teams, activities, leaderboard, workouts] = await Promise.all([
        User.find().limit(6).lean(),
        Team.find().limit(6).lean(),
        Activity.find().limit(6).lean(),
        LeaderboardEntry.find().sort({ rank: 1 }).limit(6).lean(),
        WorkoutSuggestion.find().limit(6).lean(),
    ]);
    if (!users.length && !teams.length && !activities.length && !leaderboard.length && !workouts.length) {
        return sampleOverview;
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
    };
}
app.get('/api/health', (_request, response) => {
    response.json({
        status: 'ok',
        baseUrl,
        database: mongoose.connection.readyState === 1 ? 'connected' : 'fallback',
    });
});
app.get('/api/overview', async (_request, response, next) => {
    try {
        const overview = await buildOverview();
        response.json(overview);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/users', async (_request, response, next) => {
    try {
        const overview = await buildOverview();
        response.json(overview.users);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/teams', async (_request, response, next) => {
    try {
        const overview = await buildOverview();
        response.json(overview.teams);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/activities', async (_request, response, next) => {
    try {
        const overview = await buildOverview();
        response.json(overview.activities);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/leaderboard', async (_request, response, next) => {
    try {
        const overview = await buildOverview();
        response.json(overview.leaderboard);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/workouts', async (_request, response, next) => {
    try {
        const overview = await buildOverview();
        response.json(overview.workouts);
    }
    catch (error) {
        next(error);
    }
});
app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({
        message: 'Internal server error',
    });
});
connectToDatabase().finally(() => {
    app.listen(port, () => {
        console.log(`OctoFit backend listening on ${baseUrl}`);
    });
});
//# sourceMappingURL=server.js.map