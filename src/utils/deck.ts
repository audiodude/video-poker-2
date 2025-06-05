import { Card, Suit, Rank } from '@/types/card'

export function createCard(suit: Suit, rank: Rank): Card {
  const value = getRankValue(rank)
  const shortName = `${rank}${getSuitSymbol(suit)}`
  
  return {
    suit,
    rank,
    value,
    shortName
  }
}

export function getRankValue(rank: Rank): number {
  switch (rank) {
    case Rank.TWO: return 2
    case Rank.THREE: return 3
    case Rank.FOUR: return 4
    case Rank.FIVE: return 5
    case Rank.SIX: return 6
    case Rank.SEVEN: return 7
    case Rank.EIGHT: return 8
    case Rank.NINE: return 9
    case Rank.TEN: return 10
    case Rank.JACK: return 11
    case Rank.QUEEN: return 12
    case Rank.KING: return 13
    case Rank.ACE: return 14
  }
}

export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case Suit.HEARTS: return '♥'
    case Suit.DIAMONDS: return '♦'
    case Suit.CLUBS: return '♣'
    case Suit.SPADES: return '♠'
  }
}

export function createDeck(): Card[] {
  const deck: Card[] = []
  
  for (const suit of Object.values(Suit)) {
    for (const rank of Object.values(Rank)) {
      deck.push(createCard(suit, rank))
    }
  }
  
  return deck
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

export function dealCards(deck: Card[], count: number): { dealtCards: Card[], remainingDeck: Card[] } {
  const dealtCards = deck.slice(0, count)
  const remainingDeck = deck.slice(count)
  
  return { dealtCards, remainingDeck }
}

export function isHighCard(rank: Rank): boolean {
  return [Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE].includes(rank)
}