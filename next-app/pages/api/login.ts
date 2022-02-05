import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'
import { sessionOptions } from '../../lib/session'
import { LoginBody } from '../types'
import { Account } from './user'

export default withIronSessionApiRoute(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(400)
  } else {
    const body: LoginBody = req.body
    const accounts = process.env.ACCOUNTS?.split(',')?.map((a) => {
      const parts = a.split(':')
      return { account: parts[0], password: process.env[parts[1]], usernames: process.env[parts[2]]?.split(',') }
    })

    const ok = accounts?.find((a) => a.account === body.account && a.password === body.password)

    if (ok) {
      const usernames = ok.usernames ? ok.usernames : []
      const user = { isLoggedIn: true, login: body.account, usernames } as Account
      req.session.user = user
      await req.session.save()
    }

    res.status(ok ? 200 : 401).json({})
  }
},
sessionOptions)

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100kb',
    },
  },
}
