import { Schema, model } from 'mongoose';
const workoutSuggestionSchema = new Schema({
    title: { type: String, required: true, trim: true },
    focus: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true },
    level: { type: String, required: true, trim: true },
}, { timestamps: true });
export const WorkoutSuggestion = model('WorkoutSuggestion', workoutSuggestionSchema);
//# sourceMappingURL=workoutSuggestion.js.map