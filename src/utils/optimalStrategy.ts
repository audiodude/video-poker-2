import { Card, Rank, Suit } from '@/types/card'
import { isHighCard } from './deck'

export interface StrategyResult {
  holdIndices: number[]
  strategyName: string
  description: string
}

export function getOptimalHold(cards: Card[]): StrategyResult {
  if (cards.length !== 5) {
    throw new Error('Must provide exactly 5 cards')
  }

  const strategies = [
    { check: isRoyalFlush, name: 'Royal flush', description: 'Hold all cards' },
    { check: isStraightFlush, name: 'Straight flush', description: 'Hold all cards' },
    { check: isFourOfAKind, name: 'Four of a kind', description: 'Hold all four cards' },
    { check: isFourToRoyalFlush, name: '4 to a royal flush', description: 'Hold the four royal flush cards' },
    { check: isFullHouse, name: 'Full house', description: 'Hold all cards' },
    { check: isFlush, name: 'Flush', description: 'Hold all cards' },
    { check: isStraight, name: 'Straight', description: 'Hold all cards' },
    { check: isThreeOfAKind, name: 'Three of a kind', description: 'Hold the three matching cards' },
    { check: isFourToStraightFlush, name: '4 to a straight flush', description: 'Hold the four straight flush cards' },
    { check: isTwoPair, name: 'Two pair', description: 'Hold both pairs' },
    { check: isHighPair, name: 'High pair', description: 'Hold the pair of Jacks or better' },
    { check: isThreeToRoyalFlush, name: '3 to a royal flush', description: 'Hold the three royal flush cards' },
    { check: isFourToFlush, name: '4 to a flush', description: 'Hold the four suited cards' },
    { check: isLowPair, name: 'Low pair', description: 'Hold the pair' },
    { check: isFourToOutsideStraight, name: '4 to an outside straight', description: 'Hold the four straight cards' },
    { check: isTwoSuitedHighCards, name: '2 suited high cards', description: 'Hold the two suited high cards' },
    { check: isThreeToStraightFlush, name: '3 to a straight flush', description: 'Hold the three straight flush cards' },
    { check: isTwoUnsuitedHighCards, name: '2 unsuited high cards', description: 'Hold the two high cards' },
    { check: isSuitedTenWithFaceCard, name: 'Suited 10/J, 10/Q, or 10/K', description: 'Hold the suited ten and face card' },
    { check: isOneHighCard, name: 'One high card', description: 'Hold the high card' },
    { check: () => ({ holdIndices: [], strategyName: 'Discard everything', description: 'Draw 5 new cards' }), name: 'Discard everything', description: 'Draw 5 new cards' }
  ]

  for (const strategy of strategies) {
    const result = strategy.check(cards)
    if (result && result.holdIndices.length > 0) {
      return result
    } else if (result && result.holdIndices.length === 0 && strategy.name === 'Discard everything') {
      return result
    }
  }

  return { holdIndices: [], strategyName: 'Discard everything', description: 'Draw 5 new cards' }
}

function getRankCounts(cards: Card[]): Map<Rank, number[]> {
  const counts = new Map<Rank, number[]>()
  
  cards.forEach((card, index) => {
    if (!counts.has(card.rank)) {
      counts.set(card.rank, [])
    }
    counts.get(card.rank)!.push(index)
  })
  
  return counts
}

function getSuitCounts(cards: Card[]): Map<Suit, number[]> {
  const counts = new Map<Suit, number[]>()
  
  cards.forEach((card, index) => {
    if (!counts.has(card.suit)) {
      counts.set(card.suit, [])
    }
    counts.get(card.suit)!.push(index)
  })
  
  return counts
}

function isRoyalFlush(cards: Card[]): StrategyResult | null {
  const suitCounts = getSuitCounts(cards)
  
  for (const [suit, indices] of suitCounts) {
    if (indices.length === 5) {
      const ranks = indices.map(i => cards[i].rank)
      const royalRanks = [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE]
      
      if (royalRanks.every(rank => ranks.includes(rank))) {
        return { holdIndices: [0, 1, 2, 3, 4], strategyName: 'Royal flush', description: 'Hold all cards' }
      }
    }
  }
  
  return null
}

function isStraightFlush(cards: Card[]): StrategyResult | null {
  const suitCounts = getSuitCounts(cards)
  
  for (const [suit, indices] of suitCounts) {
    if (indices.length === 5) {
      const values = indices.map(i => cards[i].value).sort((a, b) => a - b)
      
      let isStraight = true
      for (let i = 1; i < values.length; i++) {
        if (values[i] !== values[i - 1] + 1) {
          if (!(values[0] === 2 && values[4] === 14 && values[1] === 3 && values[2] === 4 && values[3] === 5)) {
            isStraight = false
            break
          }
        }
      }
      
      if (isStraight) {
        const ranks = indices.map(i => cards[i].rank)
        const royalRanks = [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE]
        
        if (!royalRanks.every(rank => ranks.includes(rank))) {
          return { holdIndices: [0, 1, 2, 3, 4], strategyName: 'Straight flush', description: 'Hold all cards' }
        }
      }
    }
  }
  
  return null
}

function isFourOfAKind(cards: Card[]): StrategyResult | null {
  const rankCounts = getRankCounts(cards)
  
  for (const [rank, indices] of rankCounts) {
    if (indices.length === 4) {
      return { holdIndices: indices, strategyName: 'Four of a kind', description: 'Hold all four cards' }
    }
  }
  
  return null
}

function isFourToRoyalFlush(cards: Card[]): StrategyResult | null {
  const suitCounts = getSuitCounts(cards)
  
  for (const [suit, indices] of suitCounts) {
    if (indices.length >= 4) {
      const royalRanks = [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE]
      const suitedCards = indices.map(i => cards[i])
      
      const royalCards = suitedCards.filter(card => royalRanks.includes(card.rank))
      
      if (royalCards.length === 4) {
        const holdIndices = royalCards.map(card => cards.indexOf(card))
        return { holdIndices, strategyName: '4 to a royal flush', description: 'Hold the four royal flush cards' }
      }
    }
  }
  
  return null
}

function isFullHouse(cards: Card[]): StrategyResult | null {
  const rankCounts = getRankCounts(cards)
  let hasThree = false
  let hasTwo = false
  
  for (const [rank, indices] of rankCounts) {
    if (indices.length === 3) hasThree = true
    if (indices.length === 2) hasTwo = true
  }
  
  if (hasThree && hasTwo) {
    return { holdIndices: [0, 1, 2, 3, 4], strategyName: 'Full house', description: 'Hold all cards' }
  }
  
  return null
}

function isFlush(cards: Card[]): StrategyResult | null {
  const suitCounts = getSuitCounts(cards)
  
  for (const [suit, indices] of suitCounts) {
    if (indices.length === 5) {
      const values = indices.map(i => cards[i].value).sort((a, b) => a - b)
      
      let isStraight = true
      for (let i = 1; i < values.length; i++) {
        if (values[i] !== values[i - 1] + 1) {
          if (!(values[0] === 2 && values[4] === 14 && values[1] === 3 && values[2] === 4 && values[3] === 5)) {
            isStraight = false
            break
          }
        }
      }
      
      if (!isStraight) {
        return { holdIndices: [0, 1, 2, 3, 4], strategyName: 'Flush', description: 'Hold all cards' }
      }
    }
  }
  
  return null
}

function isStraight(cards: Card[]): StrategyResult | null {
  const values = cards.map(card => card.value).sort((a, b) => a - b)
  
  let isStraight = true
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1] + 1) {
      if (!(values[0] === 2 && values[4] === 14 && values[1] === 3 && values[2] === 4 && values[3] === 5)) {
        isStraight = false
        break
      }
    }
  }
  
  if (isStraight) {
    const suitCounts = getSuitCounts(cards)
    let isFlush = false
    
    for (const [suit, indices] of suitCounts) {
      if (indices.length === 5) {
        isFlush = true
        break
      }
    }
    
    if (!isFlush) {
      return { holdIndices: [0, 1, 2, 3, 4], strategyName: 'Straight', description: 'Hold all cards' }
    }
  }
  
  return null
}

function isThreeOfAKind(cards: Card[]): StrategyResult | null {
  const rankCounts = getRankCounts(cards)
  
  for (const [rank, indices] of rankCounts) {
    if (indices.length === 3) {
      const hasFullHouse = Array.from(rankCounts.values()).some(indexArray => indexArray.length === 2)
      
      if (!hasFullHouse) {
        return { holdIndices: indices, strategyName: 'Three of a kind', description: 'Hold the three matching cards' }
      }
    }
  }
  
  return null
}

function isFourToStraightFlush(cards: Card[]): StrategyResult | null {
  const suitCounts = getSuitCounts(cards)
  
  for (const [suit, indices] of suitCounts) {
    if (indices.length >= 4) {
      const suitedCards = indices.map(i => cards[i]).sort((a, b) => a.value - b.value)
      
      for (let i = 0; i <= suitedCards.length - 4; i++) {
        const fourCards = suitedCards.slice(i, i + 4)
        const values = fourCards.map(card => card.value)
        
        let consecutiveCount = 1
        let maxConsecutive = 1
        let startIndex = 0
        let bestStartIndex = 0
        
        for (let j = 1; j < values.length; j++) {
          if (values[j] === values[j - 1] + 1) {
            consecutiveCount++
            if (consecutiveCount > maxConsecutive) {
              maxConsecutive = consecutiveCount
              bestStartIndex = startIndex
            }
          } else {
            consecutiveCount = 1
            startIndex = j
          }
        }
        
        if (maxConsecutive >= 3) {
          const holdIndices = fourCards.map(card => cards.indexOf(card))
          return { holdIndices, strategyName: '4 to a straight flush', description: 'Hold the four straight flush cards' }
        }
      }
    }
  }
  
  return null
}

function isTwoPair(cards: Card[]): StrategyResult | null {
  const rankCounts = getRankCounts(cards)
  const pairs: number[] = []
  
  for (const [rank, indices] of rankCounts) {
    if (indices.length === 2) {
      pairs.push(...indices)
    }
  }
  
  if (pairs.length === 4) {
    return { holdIndices: pairs, strategyName: 'Two pair', description: 'Hold both pairs' }
  }
  
  return null
}

function isHighPair(cards: Card[]): StrategyResult | null {
  const rankCounts = getRankCounts(cards)
  
  for (const [rank, indices] of rankCounts) {
    if (indices.length === 2 && isHighCard(rank)) {
      const hasAnotherPair = Array.from(rankCounts.values()).filter(indexArray => indexArray.length === 2).length > 1
      
      if (!hasAnotherPair) {
        return { holdIndices: indices, strategyName: 'High pair', description: 'Hold the pair of Jacks or better' }
      }
    }
  }
  
  return null
}

function isThreeToRoyalFlush(cards: Card[]): StrategyResult | null {
  const suitCounts = getSuitCounts(cards)
  
  for (const [suit, indices] of suitCounts) {
    if (indices.length >= 3) {
      const royalRanks = [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE]
      const suitedCards = indices.map(i => cards[i])
      
      const royalCards = suitedCards.filter(card => royalRanks.includes(card.rank))
      
      if (royalCards.length >= 3) {
        const holdIndices = royalCards.slice(0, 3).map(card => cards.indexOf(card))
        return { holdIndices, strategyName: '3 to a royal flush', description: 'Hold the three royal flush cards' }
      }
    }
  }
  
  return null
}

function isFourToFlush(cards: Card[]): StrategyResult | null {
  const suitCounts = getSuitCounts(cards)
  
  for (const [suit, indices] of suitCounts) {
    if (indices.length === 4) {
      return { holdIndices: indices, strategyName: '4 to a flush', description: 'Hold the four suited cards' }
    }
  }
  
  return null
}

function isLowPair(cards: Card[]): StrategyResult | null {
  const rankCounts = getRankCounts(cards)
  
  for (const [rank, indices] of rankCounts) {
    if (indices.length === 2 && !isHighCard(rank)) {
      const hasMultiplePairs = Array.from(rankCounts.values()).filter(indexArray => indexArray.length === 2).length > 1
      
      if (!hasMultiplePairs) {
        return { holdIndices: indices, strategyName: 'Low pair', description: 'Hold the pair' }
      }
    }
  }
  
  return null
}

function isFourToOutsideStraight(cards: Card[]): StrategyResult | null {
  const sortedCards = [...cards].sort((a, b) => a.value - b.value)
  
  for (let i = 0; i <= sortedCards.length - 4; i++) {
    const fourCards = sortedCards.slice(i, i + 4)
    const values = fourCards.map(card => card.value)
    
    const isConsecutive = values.every((val, index) => index === 0 || val === values[index - 1] + 1)
    
    if (isConsecutive && values[0] > 2 && values[3] < 14) {
      const holdIndices = fourCards.map(card => cards.indexOf(card))
      return { holdIndices, strategyName: '4 to an outside straight', description: 'Hold the four straight cards' }
    }
  }
  
  return null
}

function isTwoSuitedHighCards(cards: Card[]): StrategyResult | null {
  const suitCounts = getSuitCounts(cards)
  
  for (const [suit, indices] of suitCounts) {
    const suitedHighCards = indices.filter(i => isHighCard(cards[i].rank))
    
    if (suitedHighCards.length >= 2) {
      const holdIndices = suitedHighCards.slice(0, 2)
      return { holdIndices, strategyName: '2 suited high cards', description: 'Hold the two suited high cards' }
    }
  }
  
  return null
}

function isThreeToStraightFlush(cards: Card[]): StrategyResult | null {
  const suitCounts = getSuitCounts(cards)
  
  for (const [suit, indices] of suitCounts) {
    if (indices.length >= 3) {
      const suitedCards = indices.map(i => cards[i]).sort((a, b) => a.value - b.value)
      
      for (let i = 0; i <= suitedCards.length - 3; i++) {
        const threeCards = suitedCards.slice(i, i + 3)
        const values = threeCards.map(card => card.value)
        
        const gaps = []
        for (let j = 1; j < values.length; j++) {
          gaps.push(values[j] - values[j - 1])
        }
        
        const totalGap = values[values.length - 1] - values[0]
        
        if (totalGap <= 4) {
          const holdIndices = threeCards.map(card => cards.indexOf(card))
          return { holdIndices, strategyName: '3 to a straight flush', description: 'Hold the three straight flush cards' }
        }
      }
    }
  }
  
  return null
}

function isTwoUnsuitedHighCards(cards: Card[]): StrategyResult | null {
  const highCardIndices = cards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => isHighCard(card.rank))
    .map(({ index }) => index)
  
  if (highCardIndices.length >= 2) {
    const firstTwoCards = [cards[highCardIndices[0]], cards[highCardIndices[1]]]
    
    if (firstTwoCards[0].suit !== firstTwoCards[1].suit) {
      if (highCardIndices.length === 2) {
        return { holdIndices: highCardIndices.slice(0, 2), strategyName: '2 unsuited high cards', description: 'Hold the two high cards' }
      } else {
        const sortedHighCards = highCardIndices
          .map(i => cards[i])
          .sort((a, b) => a.value - b.value)
        
        const lowestTwoIndices = sortedHighCards
          .slice(0, 2)
          .map(card => cards.indexOf(card))
        
        return { holdIndices: lowestTwoIndices, strategyName: '2 unsuited high cards', description: 'Hold the two high cards' }
      }
    }
  }
  
  return null
}

function isSuitedTenWithFaceCard(cards: Card[]): StrategyResult | null {
  const suitCounts = getSuitCounts(cards)
  
  for (const [suit, indices] of suitCounts) {
    const suitedCards = indices.map(i => cards[i])
    
    const hasTen = suitedCards.some(card => card.rank === Rank.TEN)
    const faceCards = suitedCards.filter(card => 
      card.rank === Rank.JACK || card.rank === Rank.QUEEN || card.rank === Rank.KING
    )
    
    if (hasTen && faceCards.length > 0) {
      const tenIndex = indices.find(i => cards[i].rank === Rank.TEN)!
      const faceCardIndex = indices.find(i => 
        cards[i].rank === Rank.JACK || cards[i].rank === Rank.QUEEN || cards[i].rank === Rank.KING
      )!
      
      return { 
        holdIndices: [tenIndex, faceCardIndex], 
        strategyName: 'Suited 10/J, 10/Q, or 10/K', 
        description: 'Hold the suited ten and face card' 
      }
    }
  }
  
  return null
}

function isOneHighCard(cards: Card[]): StrategyResult | null {
  const highCardIndex = cards.findIndex(card => isHighCard(card.rank))
  
  if (highCardIndex !== -1) {
    return { holdIndices: [highCardIndex], strategyName: 'One high card', description: 'Hold the high card' }
  }
  
  return null
}