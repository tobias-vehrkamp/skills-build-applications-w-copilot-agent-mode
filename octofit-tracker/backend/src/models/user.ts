import { Schema, model } from 'mongoose'

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    grade: { type: String, required: true },
    points: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const User = model('User', userSchema)