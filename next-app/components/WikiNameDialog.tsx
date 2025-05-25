import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { Title } from './Title'
import { Dialog } from './Dialog'

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
    <Dialog open={true} onClose={closeWikipedia}>
      <div className="font-bold mb-4 text-lg">
        Wikipedia: {wikipediaName} hakutulos
      </div>
      <div className="flex justify-between items-center mb-4">
        <Title>{wikipediaName}</Title>
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
      <div className="flex gap-4 lg:gap-12 justify-between md:justify-end">
        {wikiExtractPage !== undefined && (
          <a
            target={'_blank'}
            href={`https://fi.wikipedia.com/?curid=${wikiExtractPage.pageid}`}
            rel="noreferrer"
          >
            <Button className="shadow">Avaa Wikipedia</Button>
          </a>
        )}
        <Button className="bg-gray-300" onClick={closeWikipedia}>
          Sulje
        </Button>
      </div>
    </Dialog>
  )
}
