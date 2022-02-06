import mongoose from 'mongoose'

// const readyStates = {
//   disconnected: 0,
//   connected: 1,
//   connecting: 2,
//   disconnecting: 3,
// }

let pendingPromise: (void & Promise<typeof mongoose>) | null = null

const dbConnect = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return
  }
  if (pendingPromise) {
    await pendingPromise
    return
  }

  /* eslint-disable-next-line */
  pendingPromise = mongoose.connect(String(process.env.MONGODB_URI), {})
  try {
    await pendingPromise
  } finally {
    pendingPromise = null
  }
}

export default dbConnect
