import React from 'react'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { StateProvider } from 'components/state/state'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StateProvider>
      <Component {...pageProps} />
    </StateProvider>
  )
}

export default MyApp
