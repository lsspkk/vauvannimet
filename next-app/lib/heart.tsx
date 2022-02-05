import mongoose, { Schema, model } from 'mongoose'
export interface HeartInterface {
  id?: string
  name: string
  score: number
  username: string
  account?: string
}

export const emptyHeart = {
  name: '',
  score: 0,
  username: '',
}

const HeartSchema = new Schema<HeartInterface>({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  username: { type: String, required: true },
  account: { type: String, required: true },
})

mongoose.set('toJSON', {
  virtuals: true,
})

export const Heart = mongoose.models?.Heart || model<HeartInterface>('Heart', HeartSchema)
