import { Account } from '../pages/api/user'
import { useStateValue, setUsername, setHearts } from 'components/state/state'
import { Title } from 'components/Title'
import React, { useEffect, useState } from 'react'
import { HeartInterface, RoundInterface, ScoreInterface } from 'lib/heart'
import { HeartIcon } from 'components/HeartIcon'
import { Button } from 'components/Button'

export function ExtensionRoundResults({ user }: { user: Account }) {
  const [{ round, hearts, username, roundSortByScore }] = useStateValue()

  const uniqueNames = new Set<string>(hearts.map((h) => h.name))
  const uniqueHearts = Array.from(uniqueNames)
    .map((name) => {
      const nameHearts = hearts.filter((h) => h.name === name)
      const scores = nameHearts[0].rounds
        ?.find((r) => r.round === round)
        ?.scores?.map((s) => s.score)
      const score = !scores ? 0 : scores.reduce((p, c) => p + c, 0)
      const sortByScore = roundSortByScore && roundSortByScore.has(name)
      return { name, nameHearts, score, sortByScore }
    })
    .sort((a, b) => {
      if (a.sortByScore && !b.sortByScore) return -1
      if (!a.sortByScore && b.sortByScore) return 1
      if (a.sortByScore && b.sortByScore) {
        if (a.score > b.score) return -1
        if (a.score < b.score) return 1
      }
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
      rounds = updateExistingNameScore(newScore, oldRounds)
    } else if (oldRound && oldRounds) {
      // add new name and score to existing round
      rounds = addNameToExistingRound(newScore, oldRounds)
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
    return oldRounds.map((oldRound) => {
      if (oldRound.round !== round || !oldRound.scores) {
        return { ...oldRound }
      }
      if (oldRound.scores) {
        return {
          ...oldRound,
          scores: [...oldRound.scores, newScore],
        }
      }
      return {
        ...oldRound,
        scores: [newScore],
      }
    })
  }

  function updateExistingNameScore(
    newScore: ScoreInterface,
    oldRounds: RoundInterface[]
  ) {
    return oldRounds.map((oldRound) => {
      if (oldRound.round !== round || !oldRound.scores) {
        return { ...oldRound }
      }
      const scores = oldRound.scores.map((s) =>
        s.username !== username ? { ...s } : newScore
      )
      return {
        ...oldRound,
        round,
        scores,
      }
    })
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
export function ReviewerDialog({ user }: { user: Account }) {
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
