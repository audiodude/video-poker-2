<template>
  <div class="video-poker-machine">
    <!-- Paytable at top -->
    <div class="paytable-section">
      <PayTable 
        :current-bet="gameStore.bet" 
        :winning-hand="gameStore.handResult?.handType"
      />
    </div>

    <!-- Hand result display - always reserves space -->
    <div class="hand-result-display">
      <div class="hand-result-content">
        <div v-if="gameStore.handResult && gameStore.handResult.payout > 0" class="hand-name">{{ gameStore.handResult.handType }}</div>
        <div v-else-if="gameStore.handResult && gameStore.handResult.payout === 0" class="game-over-text">GAME OVER</div>
        <div v-else-if="gameStore.phase === 'betting'" class="game-over-text">GAME OVER</div>
        <div v-else class="invisible-placeholder">&nbsp;</div>
      </div>
    </div>

    <!-- Cards section -->
    <div class="cards-section">
      <div class="cards-container">
        <div 
          v-for="(card, index) in gameStore.currentHand"
          :key="`${card?.suit}-${card?.rank}-${index}`"
          class="card-wrapper"
        >
          <div v-if="gameStore.heldCards[index]" class="held-label">HELD</div>
          <PlayingCard
            :card="card"
            :is-held="gameStore.heldCards[index]"
            :show-hold-button="false"
            :is-optimal-hold="isOptimalHold(index)"
            :is-player-hold="isPlayerHold(index)"
            @click="gameStore.toggleHold(index)"
          />
        </div>
      </div>
    </div>

    <!-- Controls section -->
    <div class="controls-section">
      <div class="control-row">
        <!-- Left side buttons -->
        <div class="left-controls">
          <button class="menu-button">MENU</button>
          <button class="options-button">OPTIONS</button>
          <button class="speed-button">SPEED</button>
        </div>

        <!-- Center bet display -->
        <div class="bet-display">
          <div class="bet-circle">
            <div class="bet-amount">{{ gameStore.bet }}</div>
            <div class="bet-label">BET {{ gameStore.bet }}</div>
          </div>
        </div>

        <!-- Right side buttons -->
        <div class="right-controls">
          <button
            @click="gameStore.betOne"
            :disabled="!gameStore.canBet"
            class="bet-button"
            :class="{ 'disabled': !gameStore.canBet }"
          >
            BET UP
          </button>
          
          <button
            @click="gameStore.betMax"
            :disabled="!gameStore.canBet"
            class="bet-button"
            :class="{ 'disabled': !gameStore.canBet }"
          >
            BET MAX
          </button>
          
          <button
            v-if="gameStore.phase === 'betting'"
            @click="handleDeal"
            :disabled="!gameStore.canDeal"
            class="deal-button"
            :class="{ 'disabled': !gameStore.canDeal }"
          >
            DEAL
          </button>
          
          <button
            v-else-if="gameStore.phase === 'holding'"
            @click="gameStore.draw"
            class="deal-button"
          >
            DRAW
          </button>
          
          <button
            v-else-if="gameStore.phase === 'result'"
            @click="gameStore.newHand"
            class="deal-button"
          >
            DEAL
          </button>
        </div>

        <!-- Credits display -->
        <div class="credits-display">
          <div class="credits-amount">{{ gameStore.credits }}</div>
          <div class="credits-label">CREDITS</div>
        </div>
      </div>

      <!-- Game info bar -->
      <div class="info-bar">
        <div class="game-name">JACKS OR BETTER</div>
        <div v-if="gameStore.credits <= 0" class="game-over">
          <button @click="gameStore.resetCredits" class="reset-button">GAME OVER - CLICK TO RESET</button>
        </div>
      </div>
    </div>

    <!-- Feedback area (if needed) -->
    <div v-if="gameStore.phase === 'result' && showFeedback" class="feedback-area">
      <FeedbackPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import PlayingCard from './PlayingCard.vue'
import PayTable from './PayTable.vue'
import FeedbackPanel from './FeedbackPanel.vue'

const gameStore = useGameStore()
const showFeedback = ref(false)

function handleDeal() {
  if (gameStore.bet === 5) {
    gameStore.betMax()
  }
  gameStore.deal()
}

function isOptimalHold(index: number): boolean {
  return gameStore.showOptimalFeedback && 
         gameStore.optimalHold?.holdIndices.includes(index) === true
}

function isPlayerHold(index: number): boolean {
  return gameStore.showOptimalFeedback && 
         gameStore.playerHold[index] === true &&
         !isOptimalHold(index)
}

gameStore.initializeGame()
</script>

<style scoped>
.video-poker-machine {
  @apply max-w-4xl mx-auto bg-blue-900 text-white border-4 border-yellow-400 rounded-lg overflow-hidden;
}

.paytable-section {
  @apply p-4 bg-blue-800;
}

.hand-result-display {
  @apply bg-blue-900 text-center py-3;
  min-height: 3.5rem;
}

.hand-result-content {
  @apply flex items-center justify-center h-full;
}

.hand-name {
  @apply text-2xl font-bold text-yellow-300;
}

.game-over-text {
  @apply text-2xl font-bold text-red-400 animate-pulse;
}

.invisible-placeholder {
  @apply text-2xl font-bold opacity-0;
}

.cards-section {
  @apply bg-blue-800 py-8;
}

.cards-container {
  @apply flex justify-center gap-4;
}

.card-wrapper {
  @apply relative;
}

.held-label {
  @apply absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black text-sm font-bold px-3 py-1 rounded z-10;
}

.controls-section {
  @apply bg-blue-900 p-4;
}

.control-row {
  @apply flex items-center justify-between mb-4;
}

.left-controls {
  @apply flex gap-2;
}

.menu-button, .options-button, .speed-button {
  @apply bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 text-sm rounded;
}

.bet-display {
  @apply flex-1 flex justify-center;
}

.bet-circle {
  @apply bg-yellow-500 text-black rounded-full w-20 h-20 flex flex-col items-center justify-center font-bold;
}

.bet-amount {
  @apply text-2xl;
}

.bet-label {
  @apply text-xs;
}

.right-controls {
  @apply flex gap-2;
}

.bet-button {
  @apply bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 text-sm rounded;
}

.deal-button {
  @apply bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 text-lg rounded;
}

.bet-button.disabled, .deal-button.disabled {
  @apply bg-gray-600 cursor-not-allowed opacity-50;
}

.credits-display {
  @apply text-right;
}

.credits-amount {
  @apply text-2xl font-bold text-yellow-300;
}

.credits-label {
  @apply text-sm text-gray-300;
}

.info-bar {
  @apply flex justify-between items-center text-sm;
}

.game-name {
  @apply font-bold text-yellow-300;
}

.reset-button {
  @apply bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-xs rounded;
}

.feedback-area {
  @apply p-4 bg-blue-800;
}
</style>