import { Card, HandType, HandResult, Rank } from '@/types/card'
import { isHighCard } from './deck'

export function evaluateHand(cards: Card[], bet: number): HandResult {
  if (cards.length !== 5) {
    throw new Error('Hand must contain exactly 5 cards')
  }

  const sortedCards = [...cards].sort((a, b) => a.value - b.value)
  
  if (isRoyalFlush(sortedCards)) {
    return { handType: HandType.ROYAL_FLUSH, payout: calculatePayout(HandType.ROYAL_FLUSH, bet) }
  }
  
  if (isStraightFlush(sortedCards)) {
    return { handType: HandType.STRAIGHT_FLUSH, payout: calculatePayout(HandType.STRAIGHT_FLUSH, bet) }
  }
  
  const fourOfAKindCards = getFourOfAKind(sortedCards)
  if (fourOfAKindCards.length > 0) {
    return { handType: HandType.FOUR_OF_A_KIND, payout: calculatePayout(HandType.FOUR_OF_A_KIND, bet), winningCards: fourOfAKindCards }
  }
  
  const fullHouseCards = getFullHouse(sortedCards)
  if (fullHouseCards.length > 0) {
    return { handType: HandType.FULL_HOUSE, payout: calculatePayout(HandType.FULL_HOUSE, bet), winningCards: fullHouseCards }
  }
  
  if (isFlush(sortedCards)) {
    return { handType: HandType.FLUSH, payout: calculatePayout(HandType.FLUSH, bet) }
  }
  
  if (isStraight(sortedCards)) {
    return { handType: HandType.STRAIGHT, payout: calculatePayout(HandType.STRAIGHT, bet) }
  }
  
  const threeOfAKindCards = getThreeOfAKind(sortedCards)
  if (threeOfAKindCards.length > 0) {
    return { handType: HandType.THREE_OF_A_KIND, payout: calculatePayout(HandType.THREE_OF_A_KIND, bet), winningCards: threeOfAKindCards }
  }
  
  const twoPairCards = getTwoPair(sortedCards)
  if (twoPairCards.length > 0) {
    return { handType: HandType.TWO_PAIR, payout: calculatePayout(HandType.TWO_PAIR, bet), winningCards: twoPairCards }
  }
  
  const jacksOrBetterCards = getJacksOrBetter(sortedCards)
  if (jacksOrBetterCards.length > 0) {
    return { handType: HandType.JACKS_OR_BETTER, payout: calculatePayout(HandType.JACKS_OR_BETTER, bet), winningCards: jacksOrBetterCards }
  }
  
  return { handType: HandType.HIGH_CARD, payout: 0 }
}

function isRoyalFlush(cards: Card[]): boolean {
  if (!isFlush(cards)) return false
  
  const ranks = cards.map(card => card.rank)
  const royalRanks = [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE]
  
  return royalRanks.every(rank => ranks.includes(rank))
}

function isStraightFlush(cards: Card[]): boolean {
  return isFlush(cards) && isStraight(cards)
}

function isFlush(cards: Card[]): boolean {
  const suit = cards[0].suit
  return cards.every(card => card.suit === suit)
}

function isStraight(cards: Card[]): boolean {
  const values = cards.map(card => card.value).sort((a, b) => a - b)
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1] + 1) {
      if (values[0] === 2 && values[4] === 14 && values[1] === 3 && values[2] === 4 && values[3] === 5) {
        return true
      }
      return false
    }
  }
  
  return true
}

function getRankCounts(cards: Card[]): Map<Rank, Card[]> {
  const counts = new Map<Rank, Card[]>()
  
  for (const card of cards) {
    if (!counts.has(card.rank)) {
      counts.set(card.rank, [])
    }
    counts.get(card.rank)!.push(card)
  }
  
  return counts
}

function getFourOfAKind(cards: Card[]): Card[] {
  const rankCounts = getRankCounts(cards)
  
  for (const [, rankCards] of rankCounts) {
    if (rankCards.length === 4) {
      return rankCards
    }
  }
  
  return []
}

function getFullHouse(cards: Card[]): Card[] {
  const rankCounts = getRankCounts(cards)
  let threeOfAKindCards: Card[] = []
  let pairCards: Card[] = []
  
  for (const [, rankCards] of rankCounts) {
    if (rankCards.length === 3) {
      threeOfAKindCards = rankCards
    } else if (rankCards.length === 2) {
      pairCards = rankCards
    }
  }
  
  if (threeOfAKindCards.length > 0 && pairCards.length > 0) {
    return [...threeOfAKindCards, ...pairCards]
  }
  
  return []
}

function getThreeOfAKind(cards: Card[]): Card[] {
  const rankCounts = getRankCounts(cards)
  
  for (const [, rankCards] of rankCounts) {
    if (rankCards.length === 3) {
      return rankCards
    }
  }
  
  return []
}

function getTwoPair(cards: Card[]): Card[] {
  const rankCounts = getRankCounts(cards)
  const pairs: Card[] = []
  
  for (const [, rankCards] of rankCounts) {
    if (rankCards.length === 2) {
      pairs.push(...rankCards)
    }
  }
  
  return pairs.length === 4 ? pairs : []
}

function getJacksOrBetter(cards: Card[]): Card[] {
  const rankCounts = getRankCounts(cards)
  
  for (const [rank, rankCards] of rankCounts) {
    if (rankCards.length === 2 && isHighCard(rank)) {
      return rankCards
    }
  }
  
  return []
}

function calculatePayout(handType: HandType, bet: number): number {
  const payTable = {
    [HandType.ROYAL_FLUSH]: bet === 5 ? 4000 : 250 * bet,
    [HandType.STRAIGHT_FLUSH]: 50 * bet,
    [HandType.FOUR_OF_A_KIND]: 25 * bet,
    [HandType.FULL_HOUSE]: 9 * bet,
    [HandType.FLUSH]: 6 * bet,
    [HandType.STRAIGHT]: 4 * bet,
    [HandType.THREE_OF_A_KIND]: 3 * bet,
    [HandType.TWO_PAIR]: 2 * bet,
    [HandType.JACKS_OR_BETTER]: 1 * bet,
    [HandType.HIGH_CARD]: 0
  }
  
  return payTable[handType] || 0
}