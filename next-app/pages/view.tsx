import { InferGetServerSidePropsType } from 'next'
import { sessionOptions } from '../lib/session'
import { Account } from './api/user'

import { withIronSessionSsr } from 'iron-session/next'
import { Layout } from 'components/Layout'
import {
  useStateValue,
  loadHearts,
  setHearts,
  setRound,
  resetRoundSortList,
} from 'components/state/state'
import { Title } from 'components/Title'
import React, { useEffect, useState } from 'react'
import { HeartInterface } from 'lib/heart'
import { HeartIcon } from 'components/HeartIcon'
import { Button } from 'components/Button'
import { useRouter } from 'next/router'
import {
  ReviewerDialog,
  ExtensionRoundResults,
} from '../components/ExtensionRoundResults'
import { WikiNameDialog } from 'components/WikiNameDialog'
import { TykkaystenHallintaDialog } from 'components/TykkaystenHallintaDialog'

function maxRound(heart: HeartInterface[]) {
  const rounds = heart.map((h) =>
    !h.rounds || h.rounds.length === 0
      ? 0
      : Math.max(...h.rounds.map((r) => r.round))
  )
  return Math.max(...rounds)
}

interface PageState {
  loading: boolean
  showWikipedia: boolean
  wikipediaName: string
}

export default function ViewPage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [{ hearts, round }, dispatch] = useStateValue()
  const [state, setState] = useState<PageState>({
    loading: false,
    showWikipedia: false,
    wikipediaName: '',
  })

  useEffect(() => {
    if (user && user.isLoggedIn && hearts.length === 0) {
      setState((prev) => ({ ...prev, loading: true }))
      loadHearts()
        .then((newHearts) => dispatch(setHearts(newHearts)))
        .catch((result) => console.log('error loading hearts', { result }))
        .finally(() => setState((prev) => ({ ...prev, loading: false })))
    }
  }, [user])

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
    <Layout {...{ user, loadign: state.loading }}>
      <div className="flex justify-between items-center w-full flex-col">
        {user && <ReviewerDialog {...{ user }} />}
        {state.showWikipedia && (
          <WikiNameDialog {...{ ...state, closeWikipedia }} />
        )}
        <div className="mx-1 flex justify-between gap-4 lg:gap-12 items-center w-full">
          <div>
            <Title className="">Tykättyjä nimiä</Title>
            <span className="pl-1">
              {round === 0 ? 'Alkukierros' : `Jatkokierros ${round}`}
            </span>
          </div>
          <div className="flex items-center gap-4 lg:gap-12">
            <ChooseRoundMenu />
            <TykkaystenHallintaDialog />
          </div>
        </div>
        {round === 0 && <BasicResults {...{ showWikipedia }} />}
        {round > 0 && user && (
          <ExtensionRoundResults {...{ user, showWikipedia }} />
        )}
      </div>
    </Layout>
  )
}

function BasicResults({
  showWikipedia,
}: {
  showWikipedia(name: string): void
}) {
  const [{ username, hearts }] = useStateValue()
  const router = useRouter()

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
    <>
      {Array.from(results.keys()).map((key) => (
        <div key={key} className="w-full">
          <div className="py-2">
            <Title>
              <HeartIcon className="w-8 h-8 block float-left mr-2" />
              {key}
            </Title>
          </div>
          <div className="flex flex-wrap">
            {results
              .get(key)
              ?.sort(({ score: a, name: na }, { score: b, name: nb }) => {
                if (b - a) return b - a
                if (na < nb) return -1
                if (na > nb) return 1
                return 0
              })
              .map((heart, i) => (
                <div className="w-1/2 md:w-1/4" key={`heart.${i}.${username}`}>
                  <button onClick={() => showWikipedia(heart.name)}>
                    {heart.score}: {heart.name}
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
      {results.size === 0 && (
        <div className="mt-4">
          <p>Ette ole valinneet yhtään nimeä vielä.</p>
          <p>
            Valitse{' '}
            <a
              className="text-teal-600 hover:underline "
              onClick={() => router.push('/choose')}
            >
              Nimet
            </a>
          </p>
        </div>
      )}
    </>
  )
}

function ChooseRoundMenu() {
  const [{ round, hearts }, dispatch] = useStateValue()

  const max = maxRound(hearts)
  const rounds = max === 0 ? [1] : Array.of(max).map((e, i) => i + 1)
  return (
    <div className="flex items-center">
      {hearts.length > 0 && round === 0 && (
        <>
          <div className="text-xs m-2 font-bold">Jatkokierrokset</div>
          <div className="flex flex-col items-stretch">
            {/* { max+1 > round &&
      <Button onClick={() => dispatch(setRound(rounds.length === 0 ? 1: rounds.length))}>Uusi</Button>} */}
            {rounds
              .filter((r) => r !== round)
              .map((r) => (
                <Button
                  className={`rounded-full w-full ${
                    r === round ? 'bg-red-200' : ''
                  }`}
                  key={`chooseRound.${r}`}
                  disabled={r === round}
                  onClick={() => {
                    dispatch(setRound(r))
                    dispatch(resetRoundSortList())
                  }}
                >
                  {r}
                </Button>
              ))}
          </div>
        </>
      )}
      {round > 0 && (
        <Button
          className="rounded-full w-full"
          onClick={() => dispatch(setRound(0))}
        >
          X
        </Button>
      )}
    </div>
  )
}

export const getServerSideProps = withIronSessionSsr(async function ({ req }) {
  const user = req.session.user
    ? req.session.user
    : ({
        isLoggedIn: false,
        login: '',
        usernames: ['Tykkääjä 1', 'Tykkääjä 2'],
      } as Account)

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
