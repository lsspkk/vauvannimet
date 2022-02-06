import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Account } from 'pages/api/user'
import { ReactNode } from 'react'
import { Button } from './Button'
import { saveHearts, setHearts, useStateValue } from './state/state'

export function Layout({ children, user }: { children?: ReactNode; user?: Account }) {
  const router = useRouter()

  const [{ hearts }, dispatch] = useStateValue()
  function logout() {
    fetch('/api/logout').then(() => router.push('/'))
  }

  function save() {
    saveHearts(hearts)
      .then((newHearts) => dispatch(setHearts(newHearts)))
      .catch((result) => console.log('error when saving hearts', { result }))
  }

  return (
    <div className='v-full h-full text-gray-700'>
      <Head>
        <title>Vauvannimet v2</title>
        <meta name='description' content='Helps you choose baby names' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='h-screen flex flex-col justify-start items-center align-items-center'>
        <div className='w-screen h-20 flex justify-between items-center content-center bg-gray-200 shadow'>
          <div className='w-7/8 flex content-center items-center'>
            <div className='pl-6 h-14 w-20 '>
              <Image src='/baby-tram.png' alt='Logo' height='60' width='60' />
            </div>

            {user && (
              <div className='mx-12'>
                {router.pathname !== '/choose' && (
                  <Link href='/choose' passHref>
                    <Button className='mr-8'>Valitse</Button>
                  </Link>
                )}
                {router.pathname !== '/view' && (
                  <Link href='/view' passHref>
                    <Button className='mr-8'>Katso</Button>
                  </Link>
                )}
                {hearts.length > 0 && (
                  <Button className='ml-4' onClick={() => save()}>
                    Tallenna
                  </Button>
                )}
              </div>
            )}
          </div>
          {user && (
            <div className='pr-4 justify-self-end'>
              <Button onClick={() => logout()}>Kirjaudu ulos</Button>
            </div>
          )}
        </div>

        <main className='pb-20'>{children}</main>
      </div>
    </div>
  )
}
