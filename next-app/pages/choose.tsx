import { InferGetServerSidePropsType } from 'next'
import { sessionOptions } from '../lib/session'
import { Account } from './api/user'

import { withIronSessionSsr } from 'iron-session/next'
import { Layout } from 'components/Layout'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { girls } from 'data/girls'
import { boys } from 'data/boys'
import { HeartIcon } from 'components/HeartIcon'
import { addHeart, setHearts, useStateValue } from 'components/state/state'

export interface PageState {
  page: number
  pageSize: number
  nameCount: number
  order?: 'count' | 'abc'
  direction?: 'asc' | 'desc'
  view: 'girls' | 'boys'
}
export interface Name {
  count: number
  name: string
}
export default function ViewPage({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [{ username, hearts }, dispatch] = useStateValue()
  const [state, setState] = useState<PageState>({
    page: 0,
    pageSize: 100,
    nameCount: girls.length,
    order: undefined,
    direction: undefined,
    view: 'girls',
  })

  const [data, setData] = useState<Name[]>([])

  function compareNames(a: Name, b: Name) {
    if (state.order === 'abc') {
      if (a.name < b.name) return state.direction === 'asc' ? -1 : 1
      if (a.name > b.name) return state.direction === 'asc' ? 1 : -1
      return 0
    }
    if (a.count < b.count) return state.direction === 'desc' ? -1 : 1
    if (a.count > b.count) return state.direction === 'desc' ? 1 : -1
    return 0
  }
  function handleScoreClicked(name: string, score: number) {
    const old = hearts.find((h) => h.name === name && h.username === username)
    if (old?.score === score) return
    if (!old) {
      dispatch(addHeart({ name, score, username }))
    } else {
      const newHearts = hearts.map((h) =>
        h.name !== name || h.username !== username ? { ...h } : { name, username, score }
      )
      dispatch(setHearts(newHearts))
    }
  }

  useEffect(() => {
    if (state.view === 'girls') {
      setData(girls.sort(compareNames))
    }
    if (state.view === 'boys') {
      setData(boys.sort(compareNames))
    }
  }, [state.order, state.direction])

  const { page, pageSize, order } = state
  const scoreRange = Array.from(Array(5), (x, i) => i + 1)

  return (
    <Layout {...{ user }}>
      <div className='mt-2 mb-8 w-full flex justify-center'>
        <div className='font-bold mr-2'>Järjestys:</div>
        <RadioLabel {...{ state, setState, order: 'count', direction: 'asc', label: 'Yleisin' }} />
        <RadioLabel {...{ state, setState, order: 'count', direction: 'desc', label: 'Harvinaisin' }} />
        <RadioLabel {...{ state, setState, order: 'abc', direction: 'asc', label: 'ABC' }} />
        <RadioLabel {...{ state, setState, order: 'abc', direction: 'desc', label: 'ÖÄÅ' }} />
      </div>
      {order && (
        <div>
          <Pager {...{ state, setState }} />

          <div className='flex flex-wrap mx-2 lg:mx-40'>
            {data.map((name, i) => {
              if (i < pageSize * page || i >= pageSize * (page + 1)) {
                return undefined
              }
              return (
                <div className='w-1/5 h-20 border p-2' key={`aName.${name.name}`}>
                  <div>
                    {name.name} <span className='text-sm text-gray-400'>{name.count} </span>
                  </div>
                  <div className='flex m-2 justify-center'>
                    {scoreRange.map((score) => (
                      <HeartIcon
                        key={`scoreRange.${name.name}.${score}`}
                        className='h-6 w-6 mx-1'
                        checked={
                          hearts.find((h) => h.name === name.name && h.username === username && h.score >= score) !==
                          undefined
                        }
                        onClick={() => handleScoreClicked(name.name, score)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
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

function Pager({ state, setState }: { state: PageState; setState: Dispatch<SetStateAction<PageState>> }) {
  const { page, pageSize, nameCount } = state

  const pageCount = Math.ceil(nameCount / pageSize)

  const showNext = page + 1 < pageCount
  const showPrevious = page > 0

  return (
    <div className='w-full flex justify-center align-items-center items-center mb-8'>
      <div className='mx-8'>Nimiä {nameCount}kpl</div>
      <div className='mx-8'>
        Sivu {page + 1}/{pageCount}
      </div>
      <button
        className='w-8 h-8 border rounded-full shadow mx-2 align-super text-gray-400'
        disabled={!showPrevious}
        onClick={() => setState((prev) => ({ ...prev, page: prev.page - 1 }))}
      >
        <div className='text-4xl ' style={{ marginTop: '-0.2em' }}>
          -
        </div>
      </button>
      <input
        type='range'
        value={page}
        min='0'
        max={pageCount - 1}
        onChange={(e) => {
          const page = Number(e.target.value)
          setState((prev) => ({ ...prev, page }))
        }}
      ></input>
      <button
        className='w-8 h-8 border rounded-full shadow mx-2 align-super text-gray-400'
        disabled={!showNext}
        onClick={() => setState((prev) => ({ ...prev, page: prev.page + 1 }))}
      >
        <div className='text-3xl ' style={{ marginTop: '-0.2em' }}>
          +
        </div>
      </button>
    </div>
  )
}

function RadioLabel({
  label,
  order,
  direction,
  state,
  setState,
}: {
  label: string
  order: 'count' | 'abc'
  direction: 'asc' | 'desc'
  state: PageState
  setState: Dispatch<SetStateAction<PageState>>
}) {
  return (
    <label className='mx-2'>
      <input
        className='mr-1'
        type='radio'
        name={`${order}.${direction}`}
        value={`${order}.${direction}`}
        checked={state.order === order && state.direction === direction}
        onChange={() => setState((prev) => ({ ...prev, order, direction }))}
      />
      {label}
    </label>
  )
}
