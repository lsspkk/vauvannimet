import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from 'lib/session'
import { NextApiRequest, NextApiResponse } from 'next'
import type { Account } from 'pages/api/user'

export default withIronSessionApiRoute(logoutRoute, sessionOptions)

function logoutRoute(req: NextApiRequest, res: NextApiResponse<Account>) {
  req.session.destroy()
  res.json({ isLoggedIn: false, login: '', usernames: [] })
}
