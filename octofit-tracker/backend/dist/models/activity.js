import { Schema, model } from 'mongoose';
const activitySchema = new Schema({
    type: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true },
    intensity: { type: String, required: true },
    points: { type: Number, required: true },
}, { timestamps: true });
export const Activity = model('Activity', activitySchema);
//# sourceMappingURL=activity.js.map