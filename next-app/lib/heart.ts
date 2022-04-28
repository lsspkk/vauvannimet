import mongoose, { Schema, model } from 'mongoose'
export interface HeartInterface {
  id?: string
  name: string
  score: number
  username: string
  account?: string
  rounds?: RoundInterface[]
  onSave?: 'update' | 'delete' | 'insert'
}

export const emptyHeart = {
  name: '',
  score: 0,
  username: '',
}
export interface ScoreInterface {
  id?: string
  username: string
  score: number
}
export interface RoundInterface {
  id?: string
  round: number
  scores?: ScoreInterface[]
}

const ScoreSchema = new Schema<ScoreInterface>({
  username: { type: String, required: true },
  score: { type: Number, required: true },
})
const RoundSchema = new Schema<RoundInterface>({
  round: { type: Number, required: true },
  scores: [ScoreSchema],
})

const HeartSchema = new Schema<HeartInterface>({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  username: { type: String, required: true },
  account: { type: String, required: true },
  rounds: [RoundSchema],
})

export const Score =
  mongoose.models?.Score || model<ScoreInterface>('Score', ScoreSchema)
export const Round =
  mongoose.models?.Round || model<RoundInterface>('Round', RoundSchema)
export const Heart =
  mongoose.models?.Heart || model<HeartInterface>('Heart', HeartSchema)

mongoose.set('toJSON', {
  virtuals: true,
})
