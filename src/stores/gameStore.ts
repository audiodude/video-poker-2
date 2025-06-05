import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Card, HandResult } from '@/types/card'
import { createDeck, shuffleDeck, dealCards } from '@/utils/deck'
import { evaluateHand } from '@/utils/handEvaluator'
import { getOptimalHold, StrategyResult } from '@/utils/optimalStrategy'

export const useGameStore = defineStore('game', () => {
  const credits = ref(100)
  const bet = ref(1)
  const currentHand = ref<Card[]>([])
  const heldCards = ref<boolean[]>([false, false, false, false, false])
  const phase = ref<'betting' | 'holding' | 'drawn' | 'result'>('betting')
  const lastWinAmount = ref(0)
  const deck = ref<Card[]>([])
  const optimalHold = ref<StrategyResult | null>(null)
  const playerHold = ref<boolean[]>([])
  const handResult = ref<HandResult | null>(null)
  const showOptimalFeedback = ref(false)
  const initialHand = ref<Card[]>([])

  const canBet = computed(() => (phase.value === 'betting' || phase.value === 'result') && credits.value >= 1)
  const canDeal = computed(() => (phase.value === 'betting' || phase.value === 'result') && credits.value >= bet.value)
  const canHold = computed(() => phase.value === 'holding')
  const canDraw = computed(() => phase.value === 'holding')

  function initializeGame() {
    credits.value = 100
    bet.value = 1
    phase.value = 'betting'
    resetHand()
    showRandomCards()
  }

  function resetHand() {
    heldCards.value = [false, false, false, false, false]
    lastWinAmount.value = 0
    optimalHold.value = null
    playerHold.value = []
    handResult.value = null
    showOptimalFeedback.value = false
    initialHand.value = []
    deck.value = shuffleDeck(createDeck())
    showRandomCards()
  }

  function setBet(amount: number) {
    if ((phase.value === 'betting' || phase.value === 'result') && amount >= 1 && amount <= 5 && credits.value >= amount) {
      bet.value = amount
    }
  }

  function betOne() {
    if (phase.value === 'betting' || phase.value === 'result') {
      const newBet = bet.value < 5 ? bet.value + 1 : 1
      if (credits.value >= newBet) {
        bet.value = newBet
      }
    }
  }

  function betMax() {
    if ((phase.value === 'betting' || phase.value === 'result') && credits.value >= 5) {
      bet.value = 5
      // If we're in betting phase (not in an active hand), auto-deal
      if (phase.value === 'betting') {
        deal()
      }
    }
  }

  function deal() {
    if (!canDeal.value) return

    credits.value -= bet.value
    clearHandResult()
    
    // Reset hold states but keep using current deck if available
    heldCards.value = [false, false, false, false, false]
    lastWinAmount.value = 0
    
    if (deck.value.length < 5) {
      deck.value = shuffleDeck(createDeck())
    }
    
    const { dealtCards, remainingDeck } = dealCards(deck.value, 5)
    currentHand.value = dealtCards
    initialHand.value = [...dealtCards] // Store the initial hand for optimal display
    deck.value = remainingDeck
    
    // Calculate optimal hold for the dealt hand - this is THE optimal hold for this round
    optimalHold.value = getOptimalHold(currentHand.value)
    phase.value = 'holding'
  }

  function toggleHold(index: number) {
    if (canHold.value && index >= 0 && index < 5) {
      heldCards.value[index] = !heldCards.value[index]
    }
  }

  function holdCard(index: number) {
    if (canHold.value && index >= 0 && index < 5) {
      heldCards.value[index] = true
    }
  }

  function unholdCard(index: number) {
    if (canHold.value && index >= 0 && index < 5) {
      heldCards.value[index] = false
    }
  }

  function draw() {
    if (!canDraw.value) return

    playerHold.value = [...heldCards.value]
    
    const cardsToReplace = heldCards.value
      .map((held, index) => held ? null : index)
      .filter(index => index !== null) as number[]
    
    if (cardsToReplace.length > 0) {
      // Ensure we have enough cards in the deck
      if (deck.value.length < cardsToReplace.length) {
        deck.value = shuffleDeck(createDeck())
        // Remove cards already in hand from new deck
        const cardsInHand = currentHand.value.filter(card => card)
        deck.value = deck.value.filter(deckCard => 
          !cardsInHand.some(handCard => 
            handCard && deckCard.suit === handCard.suit && deckCard.rank === handCard.rank
          )
        )
      }
      
      const { dealtCards, remainingDeck } = dealCards(deck.value, cardsToReplace.length)
      deck.value = remainingDeck
      
      cardsToReplace.forEach((cardIndex, replaceIndex) => {
        if (dealtCards[replaceIndex]) {
          currentHand.value[cardIndex] = dealtCards[replaceIndex]
        }
      })
    }
    
    handResult.value = evaluateHand(currentHand.value, bet.value)
    
    if (handResult.value.payout > 0) {
      credits.value += handResult.value.payout
      lastWinAmount.value = handResult.value.payout
    }
    
    phase.value = 'result'
  }

  function newHand() {
    if (phase.value === 'result') {
      if (credits.value <= 0) {
        initializeGame()
      } else if (credits.value >= bet.value) {
        // Immediately deal next hand with same bet
        credits.value -= bet.value
        clearHandResult()
        
        // Reset hold states
        heldCards.value = [false, false, false, false, false]
        lastWinAmount.value = 0
        
        if (deck.value.length < 5) {
          deck.value = shuffleDeck(createDeck())
        }
        
        const { dealtCards, remainingDeck } = dealCards(deck.value, 5)
        currentHand.value = dealtCards
        initialHand.value = [...dealtCards] // Store the initial hand for optimal display
        deck.value = remainingDeck
        
        // Calculate optimal hold for the dealt hand - this is THE optimal hold for this round
        optimalHold.value = getOptimalHold(currentHand.value)
        phase.value = 'holding'
      } else {
        // Not enough credits for same bet, go to betting phase
        resetHand()
        phase.value = 'betting'
      }
    }
  }

  function clearHandResult() {
    handResult.value = null
    playerHold.value = []
    showOptimalFeedback.value = false
    // Don't clear optimalHold here - it should persist for showing optimal strategy
  }

  function showOptimalStrategy() {
    showOptimalFeedback.value = true
  }

  function hideOptimalStrategy() {
    showOptimalFeedback.value = false
  }

  function isOptimalPlay(): boolean {
    if (!optimalHold.value || !playerHold.value) return false
    
    return playerHold.value.every((held, index) => 
      held === (optimalHold.value?.holdIndices.includes(index) ?? false)
    )
  }

  function resetCredits() {
    credits.value = 100
    phase.value = 'betting'
    resetHand()
  }

  function showRandomCards() {
    const shuffledDeck = shuffleDeck(createDeck())
    const { dealtCards } = dealCards(shuffledDeck, 5)
    // Ensure we always have exactly 5 cards
    currentHand.value = [...dealtCards]
    // Fill any missing slots with placeholder (shouldn't happen, but safety check)
    while (currentHand.value.length < 5) {
      currentHand.value.push(dealtCards[0]) // duplicate first card as fallback
    }
  }

  return {
    credits,
    bet,
    currentHand,
    initialHand,
    heldCards,
    phase,
    lastWinAmount,
    optimalHold,
    playerHold,
    handResult,
    showOptimalFeedback,
    canBet,
    canDeal,
    canHold,
    canDraw,
    initializeGame,
    resetHand,
    setBet,
    betOne,
    betMax,
    deal,
    toggleHold,
    holdCard,
    unholdCard,
    draw,
    newHand,
    showOptimalStrategy,
    hideOptimalStrategy,
    isOptimalPlay,
    resetCredits,
    showRandomCards
  }
})