import { useEffect, useState } from 'react'

export type ICard = {
  title: string
  subtitle: string
  tooltip: string
  externalLink: string
  url?: string
  component: string
  appType: 'external' | 'popUp' | 'internalPage'
}

export const useCards = () => {
  const [cards, setCards] = useState<ICard[]>()

  useEffect(() => {
    const fetchCards = async () => {
      const manifest = await fetch(`./manifest.json`).then((res) => res.json())
      const { cards } = manifest

      setCards(cards)
    }

    fetchCards()
  }, [])

  return cards
}
