import { HeartInterface } from 'lib/heart'
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react'

const initialState: State = { username: '', hearts: [] }
const StateContext = createContext<[State, React.Dispatch<Action>]>([initialState, () => null])

export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const username = localStorage.getItem('vauva.username')
    if (username) {
      dispatch(setUsername(username))
    }
  }, [])

  return <StateContext.Provider value={[state, dispatch]}> {children}</StateContext.Provider>
}

export const useStateValue = () => useContext(StateContext)

export interface State {
  username: string
  hearts: HeartInterface[]
}

export type Action =
  | {
      type: 'SET_USERNAME'
      payload: { username: string }
    }
  | {
      type: 'ADD_HEART'
      payload: HeartInterface
    }
  | {
      type: 'SET_HEARTS'
      payload: { hearts: HeartInterface[] }
    }

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_USERNAME':
      localStorage.setItem('vauva.username', action.payload.username)
    case 'SET_HEARTS':
      return {
        ...state,
        ...action.payload,
      }
    case 'ADD_HEART':
      return {
        ...state,
        hearts: [...state.hearts, action.payload],
      }
    default:
      return state
  }
}

export async function saveHearts(hearts: HeartInterface[]): Promise<HeartInterface[]> {
  const res = await fetch(`/api/hearts`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(hearts),
  })
  if (!res.ok) {
    throw res
  }
  return res.json()
}
export async function loadHearts(): Promise<HeartInterface[]> {
  const res = await fetch('/api/hearts')
  if (!res.ok) {
    throw res
  }
  return res.json()
}

export const setUsername = (username: string): Action => ({
  type: 'SET_USERNAME',
  payload: { username },
})
export const setHearts = (hearts: HeartInterface[]): Action => ({
  type: 'SET_HEARTS',
  payload: { hearts },
})
export const addHeart = (heart: HeartInterface): Action => ({
  type: 'ADD_HEART',
  payload: heart,
})
