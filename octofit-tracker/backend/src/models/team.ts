import { Schema, model } from 'mongoose'

const teamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    memberCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Team = model('Team', teamSchema)