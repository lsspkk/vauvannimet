import useSWR from 'swr'
import { HeartInterface } from './heart'

const fetcher = (input: RequestInfo, init: RequestInit) =>
  fetch(input, init).then((res) => res.json())

export interface TeamsData {
  hearts: HeartInterface[]
  isLoading: boolean
  isError: boolean
}

export function useHearts(): TeamsData {
  const { data, error } = useSWR('/api/hearts', fetcher)

  return {
    hearts: data,
    isLoading: !error && !data,
    isError: error,
  }
}
