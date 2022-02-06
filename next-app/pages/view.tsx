import { InferGetServerSidePropsType } from 'next'
import { sessionOptions } from '../lib/session'
import { Account } from './api/user'

import { withIronSessionSsr } from 'iron-session/next'
import { Layout } from 'components/Layout'
import { useStateValue, setUsername, loadHearts, setHearts } from 'components/state/state'
import { Title } from 'components/Title'
import { useEffect, useState } from 'react'
import { HeartInterface } from 'lib/heart'
import { HeartIcon } from 'components/HeartIcon'

export default function ViewPage({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [{ username, hearts }, dispatch] = useStateValue()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && hearts.length === 0) {
      setLoading(true)
      loadHearts()
        .then((newHearts) => dispatch(setHearts(newHearts)))
        .catch((result) => console.log('error loading hearts', { result }))
        .finally(() => setLoading(false))
    }
  }, [user])

  const results = new Map<string, HeartInterface[]>()
  hearts.forEach((h) => {
    const arr = results.get(h.username)
    if (!arr) {
      results.set(h.username, [h])
      return
    }

    arr.push(h)
    arr.sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })
    results.set(h.username, arr)
  })

  return (
    <Layout {...{ user, loading }}>
      <div className='flex justify-between items-center w-full flex-col'>
        <div className='max-w-[40rem]'>
          <div className='p-4 sm:p-10 m-4 sm:m-10 border rounded shadow-xl'>
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
        <div className='w-full  mt-2'>
          <Title className=''>Tykättyjä nimiä</Title>
          {Array.from(results.keys()).map((key) => (
            <div key={key}>
              <div className='py-2'>
                <Title>
                  <HeartIcon className='w-8 h-8 block float-left mr-2' />
                  {key}
                </Title>
              </div>
              <div className='flex flex-wrap'>
                {results.get(key)?.map(({ id, name, score, username }, i) => (
                  <div className='w-1/2 md:w-1/4' key={`heart.${i}`}>
                    {name} - {score}
                  </div>
                ))}
              </div>
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
