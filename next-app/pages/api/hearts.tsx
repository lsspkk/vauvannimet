import { withIronSessionApiRoute } from 'iron-session/next'
import dbConnect from 'lib/dbConnect'
import { HeartInterface, Heart } from 'lib/heart'
import { sessionOptions } from 'lib/session'
import { NextApiRequest, NextApiResponse } from 'next'

export default withIronSessionApiRoute(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (!req.session.user) {
      throw new Error('unauthorized')
    }
    const account = req.session.user.login

    await dbConnect()
    if (req.method === 'POST') {
      const hearts: HeartInterface[] = req.body

      const log = await Heart.bulkWrite(
        hearts.map((h) => {
          if (h.onSave === 'update')
            return {
              updateOne: {
                filter: { _id: h.id, account },
                update: h,
                upsert: true,
              },
            }

          if (h.onSave === 'insert')
            return {
              insertOne: {
                document: { ...h, account },
              },
            }

          return {
            deleteOne: {
              filter: { _id: h.id, account },
            },
          }
        })
      )
      console.log('bulkwrite log', log)
      const newHearts: Array<HeartInterface> = await Heart.find({
        account,
      }).exec()
      res.status(200).json(newHearts)
    }

    if (req.method === 'GET') {
      const hearts: Array<HeartInterface> = await Heart.find({ account }).exec()
      res.status(200).json(hearts)
    }
  } catch (error) {
    console.log({ error })
    res.status(500).json({ error })
  }
},
sessionOptions)

// export default withIronSessionApiRoute(async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ): Promise<void> {
//   try {
//     if (!req.session.user) {
//       throw new Error('unauthorized')
//     }
//     const account = req.session.user.login

//     await dbConnect()
//     if (req.method === 'POST') {
//       const hearts: HeartInterface[] = req.body

//       const newHearts: HeartInterface[] = []
//       for (const heart of hearts) {
//         if (heart.id) {
//           const h = await Heart.findById(heart.id).exec()
//           if (h) {
//             h.score = heart.score
//             h.account = account
//             if( heart.rounds ) {
//               console.log(1, heart.rounds)
//               h.rounds = heart.rounds
//             }
//             await h.save()
//             newHearts.push(h)
//           } else {
//             console.log('tried to find heart, could not find it', { heart })
//           }
//         } else {
//           const h = new Heart({ ...heart, account })
//           await h.save()
//           newHearts.push(h)
//         }
//       }
//       res.status(200).json(newHearts)
//     }

//     if (req.method === 'GET') {
//       const hearts: Array<HeartInterface> = await Heart.find({ account }).exec()
//       res.status(200).json(hearts)
//     }
//   } catch (error) {
//     console.log({ error })
//     res.status(500).json({ error })
//   }
// },
// sessionOptions)
