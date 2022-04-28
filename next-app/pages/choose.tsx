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
  showFilterDialog: boolean
  syllabusFilter: number
  twoPartFilter: boolean
}
export interface Name {
  count: number
  name: string
}
const scoreRange = Array.from(Array(5), (x, i) => i + 1)

const vowels = 'aeiouyåäöAEIOUYÅÄÖ'
function syllabusOk(name: string, syllabusAmount: number) {
  let lastVowelIndex = -100
  let count = 0
  for (let i = 0; i < name.length; i++) {
    const c = name.charAt(i)
    if (vowels.includes(c) && lastVowelIndex + 1 !== i) {
      count++
      lastVowelIndex = i
    }
  }
  return count >= syllabusAmount
}

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
    twoPartFilter: false,
    syllabusFilter: 0,
    showFilterDialog: false,
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
    const newData = state.view === 'girls' ? [...girls] : [...boys]
    const filtered = newData
      .filter((g) => !state.twoPartFilter || !g.name.includes('-'))
      .filter(
        (g) => !state.syllabusFilter || syllabusOk(g.name, state.syllabusFilter)
      )
      .sort(compareNames())
    const nameCount = filtered.length
    const lastPage = Math.floor(nameCount / state.pageSize)
    const page = state.page <= lastPage ? state.page : lastPage
    setData(() => filtered)
    setState((prev) => ({ ...prev, nameCount, page }))
  }

  useEffect(() => {
    if (state.order && state.direction) init()
  }, [])
  useEffect(() => {
    if (state.order && state.direction) init()
  }, [
    state.order,
    state.direction,
    state.view,
    state.twoPartFilter,
    state.syllabusFilter,
  ])

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
  function toggleFilterDialog() {
    setState((prev) => ({
      ...prev,
      showFilterDialog: !prev.showFilterDialog,
    }))
  }

  return (
    <Layout {...{ user }}>
      <div className="mt-2 mb-2 md:mb-4 w-full flex justify-center text-xs sm:text-[1rem]">
        {state.showWikipedia && (
          <WikiNameDialog {...{ ...state, closeWikipedia }} />
        )}
        {state.showFilterDialog && <FilterDialog {...{ state, setState }} />}

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
        <ButtonSmall
          className="ml-4 md:ml-8 bg-cyan-200"
          onClick={toggleFilterDialog}
        >
          Suodattimet
        </ButtonSmall>
        {syllabusOk('Tuula', 2)}
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
function FilterDialog({
  state,
  setState,
}: {
  state: PageState
  setState: Dispatch<SetStateAction<PageState>>
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
        setState((prev) => ({ ...prev, showFilterDialog: false }))
      }
    }
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="absolute top-15 border border-gray-400 border-2 shadow-xl p-10 bg-gray-200 mt-10 z-6"
    >
      <div>
        <div className="text-lg mb-2">Moniosaiset nimet</div>

        <label className="mx-1 sm:mx-2">
          <input
            className="mr-1"
            type="radio"
            name="moniosaiset-kaytossa"
            value="true"
            checked={!state.twoPartFilter}
            onChange={() =>
              setState((prev) => ({ ...prev, twoPartFilter: false }))
            }
          />
          mukana
        </label>
        <label className="mx-1 sm:mx-2">
          <input
            className="mr-1"
            type="radio"
            name="moniosaiset-kaytossa"
            value="false"
            checked={state.twoPartFilter}
            onChange={() =>
              setState((prev) => ({ ...prev, twoPartFilter: true }))
            }
          />
          poissa
        </label>

        <div className="text-lg mb-1 mt-6">Tavujen määrä</div>
        <SyllabusRadio
          {...{ state, setState, label: 'Ei rajoitusta', value: 0 }}
        />
        <SyllabusRadio
          {...{ state, setState, label: 'vähintään 3', value: 3 }}
        />
        <SyllabusRadio
          {...{ state, setState, label: 'vähintään 4', value: 4 }}
        />
      </div>
    </div>
  )
}

function SyllabusRadio({
  state,
  setState,
  label,
  value,
}: {
  label: string
  value: number
  state: PageState
  setState: Dispatch<SetStateAction<PageState>>
}) {
  return (
    <div className="my-2 sm:my-2">
      <label>
        <input
          className="mr-2"
          type="radio"
          name="syllabysFilter"
          value={value}
          checked={state.syllabusFilter === value}
          onChange={() =>
            setState((prev) => ({ ...prev, syllabusFilter: value }))
          }
        />
        {label}
      </label>
    </div>
  )
}
