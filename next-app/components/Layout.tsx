import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Account } from 'pages/api/user'
import React, { ReactNode, useState } from 'react'
import { Button } from './Button'
import {
  saveHearts,
  setHearts,
  setUsername,
  useStateValue,
} from './state/state'

export function Layout({
  children,
  user,
  loading,
}: {
  children?: ReactNode
  user?: Account
  loading?: boolean
}) {
  const router = useRouter()

  const [{ hearts }, dispatch] = useStateValue()
  const [saving, setSaving] = useState(false)

  async function logout() {
    if (user?.isLoggedIn) {
      await fetch('/api/logout', { method: 'POST' })
    }
    dispatch(setHearts([]))
    dispatch(setUsername(''))
    router.push('/')
  }

  function save() {
    setSaving(true)
    saveHearts(hearts)
      .then((newHearts) => dispatch(setHearts(newHearts)))
      .catch((result) => console.log('error when saving hearts', { result }))
      .finally(() => setSaving(false))
  }

  return (
    <div className="v-full h-full text-gray-700">
      <Head>
        <title>Vauvannimet v2</title>
        <meta name="description" content="Helps you choose baby names" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="w-full flex flex-col justify-start items-center align-items-center">
        <div className="w-full h-20 flex justify-between items-center content-center bg-gray-200 shadow">
          <div className="flex content-center items-center">
            <div className="pl-2 md:pl-6 h-14 w-20 ">
              <Image src="/baby-tram.png" alt="Logo" height="60" width="60" />
            </div>
            {user && (
              <div className="md:mx-12">
                {router.pathname !== '/choose' && (
                  <Link href="/choose" passHref>
                    <Button
                      disabled={saving || loading}
                      className="mr:1 md:mr-8"
                    >
                      Nimet
                    </Button>
                  </Link>
                )}
                {router.pathname !== '/view' && (
                  <Link href="/view" passHref>
                    <Button
                      disabled={saving || loading}
                      className="rm:1 md:mr-8"
                    >
                      Tykkäykset
                    </Button>
                  </Link>
                )}
                {user?.isLoggedIn && hearts.length > 0 && (
                  <Button
                    disabled={saving || loading}
                    className="ml-4"
                    onClick={() => save()}
                  >
                    Tallenna
                  </Button>
                )}
              </div>
            )}
          </div>
          {user && (
            <div className="pr-4 justify-self-end">
              <Button onClick={() => logout()}>
                <span className="hidden md:inline">Kirjaudu ulos</span>
                <span className="md:hidden">X</span>
              </Button>
            </div>
          )}
        </div>

        <main className="pb-20 px-[3vw] w-full overflow-auto md:max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
