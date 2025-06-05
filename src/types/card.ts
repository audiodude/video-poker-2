export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades'
}

export enum Rank {
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A'
}

export interface Card {
  suit: Suit
  rank: Rank
  value: number
  shortName: string
}

export interface Hand {
  cards: Card[]
}

export interface GameState {
  currentHand: Card[]
  heldCards: boolean[]
  credits: number
  bet: number
  phase: 'betting' | 'holding' | 'drawn' | 'result'
  lastWinAmount: number
  optimalHold?: boolean[]
  playerHold?: boolean[]
}

export enum HandType {
  HIGH_CARD = 'High Card',
  JACKS_OR_BETTER = 'Jacks or Better',
  TWO_PAIR = 'Two Pair',
  THREE_OF_A_KIND = 'Three of a Kind',
  STRAIGHT = 'Straight',
  FLUSH = 'Flush',
  FULL_HOUSE = 'Full House',
  FOUR_OF_A_KIND = 'Four of a Kind',
  STRAIGHT_FLUSH = 'Straight Flush',
  ROYAL_FLUSH = 'Royal Flush'
}

export interface HandResult {
  handType: HandType
  payout: number
  winningCards?: Card[]
}