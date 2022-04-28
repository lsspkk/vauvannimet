import React, { useState, useEffect } from 'react'
import { ButtonSmall } from './Button'
import { Title } from './Title'

interface WikiExtractPage {
  title: string
  pageid: number
  extract: string
  missing?: boolean
}
interface WikiExtractResponse {
  query: {
    pages?: WikiExtractPage[]
  }
}

export function useWikiExtractPage(name: string) {
  const [extract, setExtract] = useState<WikiExtractPage | undefined>()
  useEffect(() => void getWikiExtract(), [name])

  async function getWikiExtract() {
    setExtract(undefined)
    const url = `https://fi.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${name}&formatversion=2&exsentences=10&exlimit=1&explaintext=1&origin=*`
    const response = await fetch(url, { mode: 'cors' })
    if (!response) return
    const {
      query: { pages },
    } = (await response.json()) as WikiExtractResponse
    if (pages === undefined || pages.length === 0) return
    setExtract(pages[0])
  }

  return [extract]
}

export function WikiNameDialog({
  wikipediaName,
  closeWikipedia,
}: {
  wikipediaName: string
  closeWikipedia: () => void
}) {
  const [wikiExtractPage] = useWikiExtractPage(wikipediaName)

  return (
    <div className="fixed max-w-[40rem] p-4 py-10 m-4 border rounded shadow-xl text-sm md:text-base top-20 bottom-20 bg-white z-10 max-h-[90vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <Title>Wikipedia: {wikipediaName}</Title>
        <ButtonSmall
          className="border-gray-500 border-2 border-gray-400 shadow hover:bg-gray-100 ml-12"
          onClick={closeWikipedia}
        >
          Sulje
        </ButtonSmall>
      </div>
      <div className="m-4">
        {wikiExtractPage === undefined ||
          (wikiExtractPage.missing && (
            <p className="mb-12">Haulla ei löydy tuloksia</p>
          ))}
        {wikiExtractPage && (
          <p className="whitespace-pre-line">{wikiExtractPage.extract}</p>
        )}
      </div>
      <div className="flex justify-between md:justify-end">
        {wikiExtractPage !== undefined && (
          <a
            target={'_blank'}
            href={`https://fi.wikipedia.com/?curid=${wikiExtractPage.pageid}`}
            rel="noreferrer"
          >
            <ButtonSmall className="bg-cyan-200 md:mr-12 shadow">
              Avaa Wikipedia
            </ButtonSmall>
          </a>
        )}
        <ButtonSmall
          className="border-gray-500 border-2 border-gray-400 shadow hover:bg-gray-100"
          onClick={closeWikipedia}
        >
          Sulje
        </ButtonSmall>
      </div>
    </div>
  )
}
