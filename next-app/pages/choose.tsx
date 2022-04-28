import { InferGetServerSidePropsType } from 'next'
import { sessionOptions } from '../lib/session'
import { Account } from './api/user'
import { withIronSessionSsr } from 'iron-session/next'
import { Layout } from 'components/Layout'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { girls } from 'data/girls'
import { boys } from 'data/boys'
import { HeartIcon } from 'components/HeartIcon'
import { addHeart, setHearts, useStateValue } from 'components/state/state'
import { ButtonSmall } from 'components/Button'
import { WikiNameDialog } from 'components/WikiNameDialog'
import { HeartInterface } from 'lib/heart'

export interface PageState {
  page: number
  pageSize: number
  nameCount: number
  order?: 'count' | 'abc'
  direction?: 'asc' | 'desc'
  view: 'girls' | 'boys'
  showWikipedia: boolean
  wikipediaName: string
}
export interface Name {
  count: number
  name: string
}
const scoreRange = Array.from(Array(5), (x, i) => i + 1)

export default function ViewPage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [state, setState] = useState<PageState>({
    page: 0,
    pageSize: 100,
    nameCount: girls.length,
    order: 'count',
    direction: 'asc',
    view: 'girls',
    showWikipedia: false,
    wikipediaName: '',
  })

  const [data, setData] = useState<Name[]>([])
  const { page, pageSize, order, direction } = state

  function compareNames() {
    if (order === 'abc') {
      return (a: Name, b: Name) => {
        if (a.name < b.name) return direction === 'asc' ? -1 : 1
        if (a.name > b.name) return direction === 'asc' ? 1 : -1
        return 0
      }
    }
    return (a: Name, b: Name) =>
      direction === 'asc' ? b.count - a.count : a.count - b.count
  }

  function init() {
    if (state.view === 'girls') {
      setData(() => [...girls].sort(compareNames()))
      setState((prev) => ({ ...prev, nameCount: girls.length }))
    }
    if (state.view === 'boys') {
      setData(() => [...boys].sort(compareNames()))
      setState((prev) => ({ ...prev, nameCount: boys.length }))
    }
  }

  useEffect(() => {
    if (state.order && state.direction) init()
  }, [])
  useEffect(() => {
    if (state.order && state.direction) init()
  }, [state.order, state.direction, state.view])

  function showWikipedia(name: string) {
    setState((prev) => ({
      ...prev,
      wikipediaName: name,
      showWikipedia: true,
    }))
  }

  function closeWikipedia() {
    setState((prev) => ({
      ...prev,
      wikipediaName: '',
      showWikipedia: false,
    }))
  }

  return (
    <Layout {...{ user }}>
      <div className="mt-2 mb-2 md:mb-4 w-full flex justify-center text-xs sm:text-[1rem]">
        {state.showWikipedia && (
          <WikiNameDialog {...{ ...state, closeWikipedia }} />
        )}

        <ButtonSmall
          className="mx-2 md:mx-6 disabled:bg-pink-400 bg-pink-100 hover:bg-pink-400"
          disabled={state.view === 'girls'}
          onClick={() => setState((prev) => ({ ...prev, view: 'girls' }))}
        >
          Tytöt
        </ButtonSmall>
        <ButtonSmall
          className="mx-2 md:mx-6 disabled:bg-blue-400 bg-blue-100 hover:bg-blue-400"
          disabled={state.view === 'boys'}
          onClick={() => setState((prev) => ({ ...prev, view: 'boys' }))}
        >
          Pojat
        </ButtonSmall>
      </div>
      <div className="mt-2 mb-6 w-full flex justify-center text-xs sm:text-[1rem]">
        <div className="font-bold mr-2">Järjestys:</div>
        <SortRadio
          {...{
            state,
            setState,
            order: 'count',
            direction: 'asc',
            label: 'Yleisin',
          }}
        />
        <SortRadio
          {...{
            state,
            setState,
            order: 'count',
            direction: 'desc',
            label: 'Harvinaisin',
          }}
        />
        <SortRadio
          {...{ state, setState, order: 'abc', direction: 'asc', label: 'ABC' }}
        />
        <SortRadio
          {...{
            state,
            setState,
            order: 'abc',
            direction: 'desc',
            label: 'ÖÄÅ',
          }}
        />
      </div>
      {order && (
        <div>
          <Pager {...{ state, setState }} />

          <div className="flex flex-wrap mx-2 mb-12 ">
            {data.map((name, i) => {
              if (i < pageSize * page || i >= pageSize * (page + 1)) {
                return undefined
              }
              return (
                <GiveHeart
                  key={`givename.${name.name}`}
                  {...{ name, showWikipedia }}
                />
              )
            })}
          </div>

          <Pager {...{ state, setState }} />
        </div>
      )}
    </Layout>
  )
}

export const getServerSideProps = withIronSessionSsr(async function ({ req }) {
  const user = req.session.user
    ? req.session.user
    : ({ isLoggedIn: false, login: '', usernames: [] } as Account)

  // if (user === undefined) {
  //   res.setHeader('location', '/')
  //   res.statusCode = 302
  //   res.end()
  //   return {
  //     props: {
  //       user: { isLoggedIn: false, login: '' } as Account,
  //     },
  //   }
  // }

  return {
    props: { user },
  }
}, sessionOptions)

function GiveHeart({
  name,
  showWikipedia,
}: {
  name: Name
  showWikipedia(name: string): void
}) {
  const [{ username, hearts }, dispatch] = useStateValue()

  function handleScoreClicked(name: string, score: number) {
    const old = hearts.find((h) => h.name === name && h.username === username)
    if (old?.score === score) {
      const newHearts = !old.id
        ? hearts.filter((h) => h.name !== name || h.username !== username)
        : hearts.map((h) => {
            if (h.name !== name || h.username !== username) {
              return { ...h }
            }
            // name currently saved in database
            const onSave = h.onSave === 'delete' ? 'update' : 'delete'
            return { ...h, onSave } as HeartInterface
          })

      dispatch(setHearts(newHearts))
    } else if (!old) {
      dispatch(addHeart({ name, score, username, onSave: 'insert' }))
    } else {
      const newHearts = hearts.map((h) => {
        if (h.name !== name || h.username !== username) {
          return { ...h }
        }
        const onSave = !old.id ? 'insert' : 'update'
        return { ...h, score, onSave } as HeartInterface
      })
      dispatch(setHearts(newHearts))
    }
  }

  return (
    <div className="w-1/2 md:w-1/4 lg:w-1/6 h-20 border p-2 flex flex-col align-center align-items-center">
      <button className="m-auto" onClick={() => showWikipedia(name.name)}>
        {name.name} <span className="text-sm text-gray-400">{name.count} </span>
      </button>
      <div className="flex m-2 justify-center">
        {scoreRange.map((score) => (
          <HeartIcon
            key={`scoreRange.${name.name}.${score}`}
            className="h-6 w-6 mx-1"
            checked={
              hearts.find(
                (h) =>
                  h.name === name.name &&
                  h.username === username &&
                  h.score >= score &&
                  h.onSave !== 'delete'
              ) !== undefined
            }
            onClick={() => handleScoreClicked(name.name, score)}
          />
        ))}
      </div>
    </div>
  )
}

function Pager({
  state,
  setState,
}: {
  state: PageState
  setState: Dispatch<SetStateAction<PageState>>
}) {
  const { page, pageSize, nameCount } = state

  const pageCount = Math.ceil(nameCount / pageSize)

  const showNext = page + 1 < pageCount
  const showPrevious = page > 0

  return (
    <div className="w-full flex justify-center align-items-center items-center mb-8 text-xs sm:text-sm">
      <div>
        <div className="flex w-full justify-between">
          <div className="md:mx-8">Nimiä {nameCount}kpl</div>
          <div className="md:mx-8">
            Sivu {page + 1}/{pageCount}
          </div>
        </div>

        <div>
          <button
            className="w-8 h-8 border rounded-full shadow mx-2 align-super text-gray-400"
            disabled={!showPrevious}
            onClick={() =>
              setState((prev) => ({ ...prev, page: prev.page - 1 }))
            }
          >
            <div className="text-4xl " style={{ marginTop: '-0.2em' }}>
              -
            </div>
          </button>
          <input
            type="range"
            value={page}
            min="0"
            max={pageCount - 1}
            onChange={(e) => {
              const page = Number(e.target.value)
              setState((prev) => ({ ...prev, page }))
            }}
          ></input>
          <button
            className="w-8 h-8 border rounded-full shadow mx-2 align-super text-gray-400"
            disabled={!showNext}
            onClick={() =>
              setState((prev) => ({ ...prev, page: prev.page + 1 }))
            }
          >
            <div className="text-3xl " style={{ marginTop: '-0.2em' }}>
              +
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function SortRadio({
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
    <label className="mx-1 sm:mx-2">
      <input
        className="mr-1"
        type="radio"
        name={`${order}.${direction}`}
        value={`${order}.${direction}`}
        checked={state.order === order && state.direction === direction}
        onChange={() => setState((prev) => ({ ...prev, order, direction }))}
      />
      {label}
    </label>
  )
}
