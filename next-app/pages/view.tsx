import React from 'react'
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
import { useEffect, useState } from 'react'
import { HeartInterface, RoundInterface, ScoreInterface } from 'lib/heart'
import { HeartIcon } from 'components/HeartIcon'
import { Button } from 'components/Button'

function maxRound(h: HeartInterface[]) {
  const rounds = h.map((h) =>
    !h.rounds || h.rounds.length === 0
      ? 0
      : Math.max(...h.rounds.map((r) => r.round))
  )
  return Math.max(...rounds)
}

export default function ViewPage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [{ username, hearts, round }, dispatch] = useStateValue()
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
      <div className="flex justify-between items-center w-full flex-col">
        <div className="max-w-[40rem]">
          <div className="p-4 sm:p-10 m-4 sm:m-10 border rounded shadow-xl text-sm md:text-base">
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
                    onChange={() => dispatch(setUsername(name))}
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex justify-between items-center">
            <Title className="">Tykättyjä nimiä</Title>
            <div className="pr-[5rem]">
              {round === 0 ? 'Alkukierros' : `Jatkokierros ${round}`}
            </div>
            <RoundMenu />
          </div>
          {round === 0 &&
            Array.from(results.keys()).map((key) => (
              <div key={key}>
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
                      <div
                        className="w-1/2 md:w-1/4"
                        key={`heart.${i}.${username}`}
                      >
                        <div>
                          {heart.score}: {heart.name}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          {round > 0 && user && <ChooseWithRound {...{ user }} />}
        </div>
      </div>
    </Layout>
  )
}

function RoundMenu() {
  const [{ round, hearts }, dispatch] = useStateValue()

  const max = maxRound(hearts)
  const rounds = max === 0 ? [] : Array.of(max).map((e, i) => i + 1)
  return (
    <div>
      {hearts.length > 0 && (
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

function ChooseWithRound({ user }: { user: Account }) {
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
          <Title>...</Title>
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
              <ChooseNameRound
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
function ChooseNameRound({
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

  function handleScoreClicked(score: number) {
    const newScore: ScoreInterface = { score, username }
    let rounds: RoundInterface[] = []
    if (oldScore && oldRounds) {
      rounds = oldRounds.map((r) =>
        r.round === round && r.scores
          ? {
              ...r,
              round,
              scores: r.scores.map((s) =>
                s.username !== username ? { ...s } : newScore
              ),
            }
          : { ...r }
      )
    } else if (oldRound && oldRounds) {
      rounds = oldRounds.map((r) =>
        r.round === round && r.scores
          ? { ...r, scores: r.scores ? [...r.scores, newScore] : [newScore] }
          : { ...r }
      )
    } else if (oldRounds) {
      rounds = [...oldRounds, { round, scores: [newScore] }]
    } else {
      rounds = [{ round, scores: [newScore] }]
    }
    const changedHearts: HeartInterface[] = hearts.map((h) =>
      h.name === name ? { ...h, rounds } : { ...h }
    )
    dispatch(setHearts(changedHearts))
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

export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
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
},
sessionOptions)
