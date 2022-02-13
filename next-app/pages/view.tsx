import { InferGetServerSidePropsType } from 'next'
import { sessionOptions } from '../lib/session'
import { Account } from './api/user'

import { withIronSessionSsr } from 'iron-session/next'
import { Layout } from 'components/Layout'
import {
  useStateValue,
  setUsername,
  loadHearts,
  setHearts,
  setRound,
} from 'components/state/state'
import { Title } from 'components/Title'
import React, { useEffect, useState } from 'react'
import { HeartInterface, RoundInterface, ScoreInterface } from 'lib/heart'
import { HeartIcon } from 'components/HeartIcon'
import { Button } from 'components/Button'
import { useRouter } from 'next/router'

function maxRound(heart: HeartInterface[]) {
  const rounds = heart.map((h) =>
    !h.rounds || h.rounds.length === 0
      ? 0
      : Math.max(...h.rounds.map((r) => r.round))
  )
  return Math.max(...rounds)
}

export default function ViewPage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [{ hearts, round }, dispatch] = useStateValue()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && user.isLoggedIn && hearts.length === 0) {
      setLoading(true)
      loadHearts()
        .then((newHearts) => dispatch(setHearts(newHearts)))
        .catch((result) => console.log('error loading hearts', { result }))
        .finally(() => setLoading(false))
    }
  }, [user])

  return (
    <Layout {...{ user, loading }}>
      <div className="flex justify-between items-center w-full flex-col">
        {user && <ReviewerDialog {...{ user }} />}
        <div className="mx-1 flex justify-between items-center w-full">
          <div>
            <Title className="">Tykättyjä nimiä</Title>
            <span className="pl-1">
              {round === 0 ? 'Alkukierros' : `Jatkokierros ${round}`}
            </span>
          </div>
          <ChooseRoundMenu />
        </div>
        {round === 0 && <BasicResults />}
        {round > 0 && user && <ExtensionRoundResults {...{ user }} />}
      </div>
    </Layout>
  )
}

function BasicResults() {
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
                  <div>
                    {heart.score}: {heart.name}
                  </div>
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
    <div className="flex">
      {hearts.length > 0 && round === 0 && (
        <>
          <div className="text-xs m-2">Jatkokierrokset</div>
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
                  onClick={() => dispatch(setRound(r))}
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

function ExtensionRoundResults({ user }: { user: Account }) {
  const [{ round, hearts, username }] = useStateValue()

  const uniqueNames = new Set<string>(hearts.map((h) => h.name))
  const uniqueHearts = Array.from(uniqueNames)
    .map((name) => ({
      name,
      nameHearts: hearts.filter((h) => h.name === name),
    }))
    .sort((a, b) => {
      if (a.name > b.name) return 1
      if (a.name < b.name) return -1
      return 0
    })
  return (
    <table className="w-[100%] mt-8">
      <tr>
        <td className="w-40">
          <Title></Title>
        </td>
        {user?.usernames.map((name) => (
          <td key={`tuk.${round}.${name}`} className="align-center text-center">
            {name}
          </td>
        ))}
      </tr>
      {uniqueHearts.map((uh, i) => (
        <tr
          key={`chooseround.${round}.${uh.name}`}
          className={i % 2 === 0 ? 'bg-gray-100' : ' '}
        >
          <td className="w-1/4 pl-2">{uh.name}</td>
          {user?.usernames.map((name) => (
            <td key={`chooseround.like.${uh.name}.${name}`}>
              <ExtensionRoundName
                enabled={username === name}
                chooser={name}
                name={uh.name}
                hearts={uh.nameHearts}
              />
            </td>
          ))}
        </tr>
      ))}
    </table>
  )
}
function ExtensionRoundName({
  enabled,
  name,
  hearts: myHearts,
  chooser,
}: {
  chooser: string
  enabled: boolean
  name: string
  hearts: HeartInterface[]
}) {
  const [{ round, hearts, username }, dispatch] = useStateValue()
  const scoreRange = Array.from(Array(5), (x, i) => i + 1)

  if (myHearts.length < 1) {
    return <div />
  }
  const oldRounds = myHearts[0].rounds
  const oldRound = oldRounds?.find((r) => r.round === round)
  const myRound = oldRound ? oldRound : { round, scores: [] }
  const oldScore = myRound.scores?.find((s) => s.username === chooser)
  const myScore = oldScore ? oldScore : { score: 0, username }

  // each name/heart possibly has extension rounds and their scores
  function handleScoreClicked(score: number) {
    const newScore: ScoreInterface = { score, username }
    let rounds: RoundInterface[] = []
    if (oldScore && oldRounds) {
      // update existing name score
      updateExistingNameScore(newScore, oldRounds)
    } else if (oldRound && oldRounds) {
      // add new name and score to existing round
      addNameToExistingRound(newScore, oldRounds)
    } else if (oldRounds) {
      // add new extension ground to the rounds
      rounds = [...oldRounds, { round, scores: [newScore] }]
    } else {
      // init extension rounds
      rounds = [{ round, scores: [newScore] }]
    }
    const changedHearts: HeartInterface[] = hearts.map((h) =>
      h.name === name ? { ...h, rounds } : { ...h }
    )
    dispatch(setHearts(changedHearts))
  }

  function addNameToExistingRound(
    newScore: ScoreInterface,
    oldRounds: RoundInterface[]
  ) {
    return oldRounds.map((oldRound) =>
      oldRound.round === round && oldRound.scores
        ? {
            ...oldRound,
            scores: oldRound.scores
              ? [...oldRound.scores, newScore]
              : [newScore],
          }
        : { ...oldRound }
    )
  }

  function updateExistingNameScore(
    newScore: ScoreInterface,
    oldRounds: RoundInterface[]
  ) {
    return oldRounds.map((oldRound) =>
      oldRound.round === round && oldRound.scores
        ? {
            ...oldRound,
            round,
            scores: oldRound.scores.map((s) =>
              s.username !== username ? { ...s } : newScore
            ),
          }
        : { ...oldRound }
    )
  }

  return (
    <div className="flex flex-col sm:pl-4 pr-2 py-4">
      <div
        className={`flex ${
          !enabled ? 'flex-col md:flex-row' : ''
        } items-center align-items-center justify-center`}
      >
        {scoreRange.map((score) => (
          <HeartIcon
            key={`scoreRange.${username}.${name}.${score}`}
            className={`${
              enabled
                ? 'h-5 w-5 mx-1 `md:h-6 md:w-6'
                : 'h-2 w-2 mx-[2px] md:h-5 md:w-5 opacity-50'
            }`}
            checked={myScore.score >= score}
            onClick={() => enabled && handleScoreClicked(score)}
          />
        ))}
      </div>
    </div>
  )
}

function ReviewerDialog({ user }: { user: Account }) {
  const [{ username }, dispatch] = useStateValue()
  const [open, setOpen] = useState(username === '')

  useEffect(() => {
    if (username) setOpen(false)
  }, [username])

  return (
    <>
      <div className="flex h-10 w-full justify-between mt-2 mx-[-4rem]">
        <div></div>
        <Button disabled={open} onClick={() => setOpen(true)}>
          Hei {username}
        </Button>
      </div>

      {open && (
        <div className="absolute max-w-[40rem] p-4 sm:p-10 m-4 border rounded shadow-xl text-sm md:text-base top-20 bg-white z-10">
          <div className="mb-5">
            <div>
              Tervetuloa <i>{user?.login}</i> nimen etsimispuuhiin.
            </div>
            Kuka arvioi nimiä?
          </div>
          <div className="flex flex-col ml-4">
            {user?.usernames.map((name) => (
              <label key={name}>
                <input
                  className="mr-2"
                  type="radio"
                  name="username"
                  value="name"
                  checked={username === name}
                  onChange={() => {
                    dispatch(setUsername(name))
                    setOpen(false)
                  }}
                />
                {name}
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Sulje</Button>
          </div>
        </div>
      )}
    </>
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
