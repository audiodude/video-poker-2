<template>
  <div class="feedback-panel bg-gradient-to-r from-blue-900 to-blue-800 bg-opacity-95 rounded-xl p-8 border-2 border-blue-400 shadow-2xl">
    <h3 class="text-2xl font-bold text-center mb-6 text-blue-300">
      Strategy Analysis
    </h3>
    
    <div class="feedback-content">
      <!-- Show if play was optimal or not -->
      <div class="play-assessment mb-4 text-center">
        <div v-if="isOptimalPlay" class="optimal-play">
          <div class="text-green-400 text-lg font-bold mb-2">
            ✓ Correct Hold!
          </div>
          <p class="text-green-300">
            You chose the best cards to hold.
          </p>
        </div>
        
        <div v-else class="suboptimal-play">
          <div class="text-red-400 text-lg font-bold mb-2">
            ✗ Suboptimal Play
          </div>
          <p class="text-red-300 mb-3">
            There was a better play available.
          </p>
        </div>
      </div>

      <!-- Show optimal strategy -->
      <div class="optimal-strategy mb-4">
        <h4 class="text-blue-300 font-bold mb-2">Optimal Strategy:</h4>
        <div class="strategy-description bg-blue-800 bg-opacity-50 p-3 rounded">
          <div class="font-semibold text-blue-200">{{ optimalStrategy?.strategyName }}</div>
          <div class="text-sm text-blue-300 mt-1">{{ optimalStrategy?.description }}</div>
        </div>
      </div>

      <!-- Show comparison if play was suboptimal -->
      <div v-if="!isOptimalPlay" class="play-comparison mb-4">
        <h4 class="text-red-300 font-bold mb-2">Your Play vs. Optimal:</h4>
        <div class="comparison-grid grid grid-cols-2 gap-4">
          <div class="your-play">
            <div class="text-sm font-semibold text-red-200 mb-1">You held:</div>
            <div class="held-cards text-xs">
              {{ getPlayerHoldDescription() }}
            </div>
          </div>
          <div class="optimal-play">
            <div class="text-sm font-semibold text-green-200 mb-1">Should hold:</div>
            <div class="held-cards text-xs">
              {{ getOptimalHoldDescription() }}
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="action-buttons flex justify-center gap-4">
        <button
          @click="toggleOptimalDisplay"
          class="action-button"
          :class="{ 'active': gameStore.showOptimalFeedback }"
        >
          {{ gameStore.showOptimalFeedback ? 'Hide' : 'Show' }} Optimal Cards
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const isOptimalPlay = computed(() => gameStore.isOptimalPlay())

const optimalStrategy = computed(() => gameStore.optimalHold)

function toggleOptimalDisplay() {
  if (gameStore.showOptimalFeedback) {
    gameStore.hideOptimalStrategy()
  } else {
    gameStore.showOptimalStrategy()
  }
}

function getPlayerHoldDescription(): string {
  if (!gameStore.playerHold || !gameStore.currentHand.length) {
    return 'No cards held'
  }
  
  const heldCards = gameStore.playerHold
    .map((held, index) => held ? gameStore.currentHand[index] : null)
    .filter(card => card !== null)
  
  if (heldCards.length === 0) {
    return 'No cards held (draw 5 new)'
  }
  
  return heldCards.map(card => `${card!.rank}${card!.suit[0].toUpperCase()}`).join(', ')
}

function getOptimalHoldDescription(): string {
  if (!optimalStrategy.value || !gameStore.currentHand.length) {
    return 'No cards'
  }
  
  if (optimalStrategy.value.holdIndices.length === 0) {
    return 'No cards (draw 5 new)'
  }
  
  const optimalCards = optimalStrategy.value.holdIndices
    .map(index => gameStore.currentHand[index])
  
  return optimalCards.map(card => `${card.rank}${card.suit[0].toUpperCase()}`).join(', ')
}
</script>

<style scoped>
.action-button {
  @apply bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg;
}

.action-button.active {
  @apply bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800;
}

.comparison-grid {
  @apply text-gray-300;
}

.held-cards {
  @apply bg-gray-800 bg-opacity-50 p-2 rounded font-mono;
}
</style>