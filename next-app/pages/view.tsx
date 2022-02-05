import { InferGetServerSidePropsType } from 'next'
import { sessionOptions } from '../lib/session'
import { Account } from './api/user'

import { withIronSessionSsr } from 'iron-session/next'
import { Layout } from 'components/Layout'
import { useStateValue, setUsername, loadHearts, setHearts } from 'components/state/state'
import { Title } from 'components/Title'
import { useEffect } from 'react'

export default function ViewPage({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [{ username, hearts }, dispatch] = useStateValue()

  useEffect(() => {
    if (user && hearts.length === 0) {
      loadHearts()
        .then((newHearts) => dispatch(setHearts(newHearts)))
        .catch((result) => console.log('error loading hearts', { result }))
    }
  }, [user])

  return (
    <Layout {...{ user }}>
      <div className='flex justify-between w-full'>
        <div className='w-2/8'>
          <div className='p-10 m-10 border rounded shadow-xl'>
            <div className='mb-5'>
              <div>
                Tervetuloa <i>{user?.login}</i> nimen etsimispuuhiin.
              </div>
              Kuka arvioi nimiä?
            </div>
            <div className='flex flex-col ml-4'>
              {user?.usernames.map((name) => (
                <label key={name}>
                  <input
                    className='mr-2'
                    type='radio'
                    name='username'
                    value='name'
                    checked={username === name}
                    onChange={() => dispatch(setUsername(name))}
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className='w-6/8 mt-10'>
          <Title className=''>Tykättyjä nimiä</Title>
          {hearts.map(({ name, score, username }, i) => (
            <div key={`heart.${i}`}>
              {name} - {score} - {username}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps = withIronSessionSsr(async function ({ req, res }) {
  const user = req.session.user

  if (user === undefined) {
    res.setHeader('location', '/')
    res.statusCode = 302
    res.end()
    return {
      props: {
        user: { isLoggedIn: false, login: '' } as Account,
      },
    }
  }

  return {
    props: { user: req.session.user },
  }
}, sessionOptions)
