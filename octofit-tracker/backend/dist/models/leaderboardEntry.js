import { Schema, model } from 'mongoose';
const leaderboardEntrySchema = new Schema({
    rank: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    score: { type: Number, required: true },
    badge: { type: String, required: true, trim: true },
}, { timestamps: true });
export const LeaderboardEntry = model('LeaderboardEntry', leaderboardEntrySchema);
//# sourceMappingURL=leaderboardEntry.js.map