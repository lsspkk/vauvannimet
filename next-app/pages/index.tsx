import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <div className='v-full h-full'>
      <Head>
        <title>Vauvannimet v2</title>
        <meta name='description' content='Helps you choose baby names' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Layout>
        <SelectUserDialog />
      </Layout>
    </div>
  )
}

export default Home

import { useRouter } from 'next/dist/client/router'
import React, { ChangeEvent, KeyboardEvent, ReactElement, useContext, useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { Title } from '../components/Title'
import { Layout } from 'components/Layout'

export function SelectUserDialog(): ReactElement {
  const [password, setPassword] = useState<string>('')
  const [account, setAccount] = useState<string>('')
  const [error, setError] = useState<string>('')
  const router = useRouter()

  async function confirmPassword() {
    if (password === '') {
      return
    }
    const res = await fetch(`/api/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account, password }),
    })
    if (res.ok) {
      localStorage.setItem('account', JSON.stringify(account))
      router.push('/view')
    } else {
      setError('virhe')
      setTimeout(() => setError(''), 10000)
    }
  }
  function cancel() {
    setPassword('')
    close()
  }
  return (
    <div className='bg-white p-6 border rounded shadow-xl'>
      <Title>Kirjaudu</Title>
      <div className='my-2'>Tunnus</div>
      <input
        className={`my-2 p-2 border`}
        type='text'
        name='username'
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setAccount(event.target.value)
          setError('')
        }}
        onKeyPress={(event: KeyboardEvent) => event.key === 'Enter' && confirmPassword()}
      ></input>

      <div className='my-2 mt-8'>Salasana</div>
      <input
        className={`my-2 p-2 border ${error && 'border-4 border-red-300 shadow'}`}
        type='password'
        name='password'
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setPassword(event.target.value)
          setError('')
        }}
        onKeyPress={(event: KeyboardEvent) => event.key === 'Enter' && confirmPassword()}
      ></input>
      {error && <div className='text-red-300'>Väärä tunnus/salasana</div>}
      <div className='flex my-2 w-full justify-between'>
        <Button onClick={() => confirmPassword()}>Kirjaudu</Button>
      </div>
    </div>
  )
}
