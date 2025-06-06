<template>
  <!-- Orientation message for mobile portrait mode -->
  <div v-if="showOrientationMessage" class="orientation-message">
    <div class="orientation-content">
      <div class="rotate-icon">📱↻</div>
      <h2>Better Experience in Landscape</h2>
      <p>Please rotate your device horizontally for the best video poker experience</p>
      <button @click="dismissOrientationMessage" class="dismiss-button">
        Continue Anyway
      </button>
    </div>
  </div>

  <div class="video-poker-machine" :class="{ 'hidden': showOrientationMessage }">
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
        <div
          v-if="gameStore.handResult && gameStore.handResult.payout > 0"
          class="hand-name"
        >
          {{ gameStore.handResult.handType }}
        </div>
        <div
          v-else-if="gameStore.handResult && gameStore.handResult.payout === 0"
          class="game-over-text"
        >
          GAME OVER
        </div>
        <div v-else-if="gameStore.phase === 'betting'" class="game-over-text">
          GAME OVER
        </div>
        <div v-else-if="gameStore.phase === 'holding' && currentHandEvaluation && currentHandEvaluation.payout > 0" class="hand-name">
          {{ currentHandEvaluation.handType }}
        </div>
        <div v-else class="invisible-placeholder">&nbsp;</div>
      </div>
    </div>

    <!-- Cards section -->
    <div class="cards-section">
      <div class="cards-container">
        <div
          v-for="(card, index) in displayHand"
          :key="`${card?.suit}-${card?.rank}-${index}`"
          class="card-wrapper"
        >
          <div
            v-if="
              (gameStore.heldCards[index] && !showOptimalCards) ||
              (showOptimalCards && isPlayerHold(index))
            "
            class="held-label"
          >
            HELD
          </div>
          <PlayingCard
            :card="card"
            :is-held="gameStore.heldCards[index] && !showOptimalCards"
            :show-hold-button="false"
            :is-optimal-hold="isOptimalHold(index)"
            :is-player-hold="isPlayerHold(index)"
            @click="!showOptimalCards ? gameStore.toggleHold(index) : undefined"
          />
        </div>
      </div>
    </div>

    <!-- Controls section -->
    <div class="controls-section">
      <!-- Credits display on its own row -->
      <div class="credits-row">
        <!-- Training feedback on left -->
        <div class="training-feedback-left">
          <div class="feedback-area-fixed">
            <div v-if="gameStore.phase === 'result'">
              <div v-if="gameStore.isOptimalPlay()" class="optimal-play">
                Optimal cards held! (streak: {{ gameStore.consecutiveOptimalPlays }})
              </div>
              <div v-else>
                <button
                  @click="toggleOptimalDisplay"
                  class="show-optimal-button"
                >
                  {{
                    showOptimalCards ? 'Hide optimal cards' : 'Show optimal cards'
                  }}
                </button>
                <div class="new-record-message" :class="{ 'visible': gameStore.showNewRecordMessage }">
                  New longest streak: {{ gameStore.maxOptimalStreak }}!
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="credits-display">
          <div class="credits-amount">{{ gameStore.credits }}</div>
        </div>
      </div>

      <div class="control-row">
        <!-- Left side buttons -->
        <div class="left-controls">
          <div class="speed-dropdown-container">
            <button @click="toggleSpeedDropdown" class="speed-button">
              <span class="speed-text">SPEED</span>
              <span class="speed-arrows" v-html="getSpeedArrows()"></span>
            </button>
            <div v-if="showSpeedDropdown" class="speed-dropdown">
              <div 
                v-for="speed in speedOptions" 
                :key="speed.value"
                @click="selectSpeed(speed.value)"
                class="speed-option"
                :class="{ active: gameStore.animationSpeed === speed.value }"
              >
                {{ speed.label }}
              </div>
            </div>
          </div>
        </div>

        <!-- Center bet display -->
        <div class="bet-display">
          <div class="bet-controls">
            <button
              @click="gameStore.betOne"
              :disabled="!gameStore.canBet"
              class="bet-button bet-up"
              :class="{ disabled: !gameStore.canBet }"
            >
              BET UP
            </button>

            <div class="bet-circle">
              <div class="bet-amount">{{ gameStore.bet }}</div>
            </div>

            <button
              @click="gameStore.betMax"
              :disabled="!gameStore.canBet"
              class="bet-button bet-max"
              :class="{ disabled: !gameStore.canBet }"
            >
              BET MAX
            </button>
          </div>
        </div>

        <!-- Right side buttons -->
        <div class="right-controls">
          <button
            v-if="gameStore.phase === 'betting'"
            @click="handleDeal"
            :disabled="!gameStore.canDeal"
            class="deal-button"
            :class="{ disabled: !gameStore.canDeal }"
          >
            DEAL
          </button>

          <button
            v-else-if="gameStore.phase === 'dealing'"
            class="deal-button disabled"
            disabled
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
            v-else-if="gameStore.phase === 'drawing'"
            class="deal-button disabled"
            disabled
          >
            DRAW
          </button>

          <button
            v-else-if="gameStore.phase === 'result'"
            @click="handleNewHand"
            class="deal-button"
          >
            DEAL
          </button>
        </div>
      </div>

      <!-- Game over section (only when needed) -->
      <div v-if="gameStore.credits <= 0" class="game-over-section">
        <button @click="gameStore.resetCredits" class="reset-button">
          GAME OVER - CLICK TO RESET
        </button>
      </div>
    </div>

    <!-- Feedback area (if needed) -->
    <div
      v-if="gameStore.phase === 'result' && showFeedback"
      class="feedback-area"
    >
      <FeedbackPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { evaluateHand } from '@/utils/handEvaluator';
import PlayingCard from './PlayingCard.vue';
import PayTable from './PayTable.vue';
import FeedbackPanel from './FeedbackPanel.vue';

const gameStore = useGameStore();
const showFeedback = ref(false);
const showOptimalCards = ref(false);
const showOrientationMessage = ref(false);
const showSpeedDropdown = ref(false);

const speedOptions = [
  { value: 'slow' as const, label: 'Slow' },
  { value: 'normal' as const, label: 'Normal' },
  { value: 'fast' as const, label: 'Fast' },
  { value: 'none' as const, label: 'No Animations' }
];

function checkOrientation() {
  const isMobile = window.innerWidth <= 1000;
  const isPortrait = window.innerHeight > window.innerWidth;
  showOrientationMessage.value = isMobile && isPortrait;
}

function dismissOrientationMessage() {
  showOrientationMessage.value = false;
}

onMounted(() => {
  checkOrientation();
  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', () => {
    setTimeout(checkOrientation, 100);
  });
  
  document.addEventListener('click', (event) => {
    const speedContainer = document.querySelector('.speed-dropdown-container');
    if (speedContainer && !speedContainer.contains(event.target as Node)) {
      showSpeedDropdown.value = false;
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', checkOrientation);
  window.removeEventListener('orientationchange', checkOrientation);
});

const displayHand = computed(() => {
  return showOptimalCards.value && gameStore.initialHand.length > 0
    ? gameStore.initialHand
    : gameStore.currentHand;
});

const currentHandEvaluation = computed(() => {
  if (gameStore.phase === 'holding' && gameStore.currentHand.length === 5 && gameStore.currentHand.every(card => card)) {
    return evaluateHand(gameStore.currentHand, gameStore.bet);
  }
  return null;
});

function handleDeal() {
  if (gameStore.bet === 5) {
    gameStore.betMax();
  }
  gameStore.deal();
}

function isOptimalHold(index: number): boolean {
  return (
    gameStore.showOptimalFeedback &&
    gameStore.optimalHold?.holdIndices.includes(index) === true
  );
}

function isPlayerHold(index: number): boolean {
  return gameStore.showOptimalFeedback && gameStore.playerHold[index] === true;
}

function toggleOptimalDisplay() {
  showOptimalCards.value = !showOptimalCards.value;
  if (showOptimalCards.value) {
    gameStore.showOptimalStrategy();
  } else {
    gameStore.hideOptimalStrategy();
  }
}

function handleNewHand() {
  // Reset optimal cards display when starting new hand
  showOptimalCards.value = false;
  gameStore.hideOptimalStrategy();
  gameStore.newHand();
}

function toggleSpeedDropdown() {
  showSpeedDropdown.value = !showSpeedDropdown.value;
}

function selectSpeed(speed: 'slow' | 'normal' | 'fast' | 'none') {
  gameStore.setAnimationSpeed(speed);
  showSpeedDropdown.value = false;
}

function getSpeedArrows() {
  const redArrow = '<span class="text-red-600">❯</span>'
  const yellowArrow = '<span class="text-yellow-400">❯</span>'
  const noSymbol = '<span class="text-red-600 text-2xl">⊘</span>'
  
  switch (gameStore.animationSpeed) {
    case 'slow': return redArrow + yellowArrow + yellowArrow
    case 'normal': return redArrow + redArrow + yellowArrow
    case 'fast': return redArrow + redArrow + redArrow
    case 'none': return noSymbol
    default: return redArrow + redArrow + yellowArrow
  }
}

gameStore.initializeGame();
</script>

<style scoped>
.video-poker-machine {
  @apply max-w-7xl mx-auto bg-blue-900 text-white rounded-lg overflow-hidden;
}

.paytable-section {
  @apply p-6 bg-blue-800;
}

.hand-result-display {
  @apply bg-blue-900 text-center py-2;
  min-height: 2.5rem;
}

.hand-result-content {
  @apply flex items-center justify-center h-full;
}

.hand-name {
  @apply text-2xl font-bold text-yellow-300 uppercase;
}

.game-over-text {
  @apply text-2xl font-bold text-red-400 animate-pulse;
}

.invisible-placeholder {
  @apply text-2xl font-bold opacity-0;
}

.cards-section {
  @apply bg-blue-800 py-12;
}

.cards-container {
  @apply flex justify-center gap-8 px-4;
}

.card-wrapper {
  @apply relative;
}

.held-label {
  @apply absolute -top-12 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black text-lg font-bold px-4 py-2 rounded z-10;
}

.controls-section {
  @apply bg-blue-900 pt-8 px-8 pb-4;
}

.credits-row {
  @apply flex justify-between items-center mb-4;
}

.training-feedback-left {
  @apply flex items-center;
}

.feedback-area-fixed {
  height: 3rem;
  @apply flex items-start justify-start;
}

.control-row {
  @apply flex items-center justify-between mb-6;
}

.left-controls {
  @apply flex flex-col items-center;
}

.speed-dropdown-container {
  @apply relative;
}

.speed-button {
  @apply bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 text-base rounded flex items-center justify-center gap-2;
}

.speed-text {
  @apply text-white font-bold;
}

.speed-arrows {
  @apply text-lg flex items-center justify-center;
  min-width: 3rem;
}

.speed-dropdown {
  @apply absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-600 rounded shadow-lg z-50 min-w-max;
}

.speed-option {
  @apply px-4 py-2 hover:bg-gray-700 cursor-pointer text-white whitespace-nowrap;
}

.speed-option.active {
  @apply bg-yellow-600 text-black;
}

.bet-display {
  @apply flex-1 flex justify-center;
}

.bet-controls {
  @apply flex items-center gap-4;
}

.bet-circle {
  @apply bg-yellow-500 text-black rounded-full w-16 h-16 flex items-center justify-center font-bold;
}

.bet-amount {
  @apply text-2xl;
}

.bet-button {
  @apply bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 text-base rounded;
}

.right-controls {
  @apply flex items-center;
}

.deal-button {
  @apply bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-xl rounded;
  width: 6rem;
}

.bet-button.disabled,
.deal-button.disabled {
  @apply bg-gray-600 cursor-not-allowed opacity-50;
}

.deal-section {
  @apply flex flex-col items-center gap-2;
}

.credits-display {
  @apply text-right;
}

.credits-amount {
  @apply text-4xl font-bold text-yellow-300;
}

.info-bar {
  @apply flex justify-between items-center text-base;
}

.game-name {
  @apply font-bold text-yellow-300 text-lg;
}

.optimal-play {
  @apply text-green-400 font-semibold;
}

.show-optimal-button {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 text-xs rounded;
}

.new-record-message {
  @apply text-yellow-400 font-bold text-sm mt-1;
  visibility: hidden;
}

.new-record-message.visible {
  visibility: visible;
}

.game-over-section {
  @apply text-center py-4;
}

.reset-button {
  @apply bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 text-sm rounded;
}

.feedback-area {
  @apply p-6 bg-blue-800;
}

.orientation-message {
  @apply fixed inset-0 bg-blue-900 flex items-center justify-center z-50;
}

.orientation-content {
  @apply text-center text-white p-8 max-w-sm;
}

.rotate-icon {
  @apply text-6xl mb-4;
}

.orientation-content h2 {
  @apply text-2xl font-bold mb-4 text-yellow-400;
}

.orientation-content p {
  @apply text-lg mb-6 text-gray-200;
}

.dismiss-button {
  @apply bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-500 transition-colors duration-200;
}

.hidden {
  @apply invisible;
}

/* Mobile responsive styles */
@media screen and (max-width: 1000px) {
  .video-poker-machine {
    @apply max-w-full mx-0 rounded-none;
    min-height: 100vh;
    padding: 0.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .paytable-section {
    @apply p-0;
    flex-shrink: 0;
  }

  .hand-result-display {
    @apply py-0;
    flex-shrink: 0;
  }

  .hand-name, .game-over-text {
    @apply text-base;
  }

  .cards-section {
    @apply py-1;
    flex-shrink: 0;
  }

  .cards-container {
    @apply gap-1 px-1;
  }

  .controls-section {
    @apply p-1 gap-1;
    flex-shrink: 0;
  }

  .credits-row, .control-row {
    @apply gap-1;
  }

  .bet-controls {
    @apply gap-1;
  }

  .deal-button, .reset-button {
    @apply py-1 px-2 text-xs;
  }

  .show-optimal-button {
    @apply py-0.5 px-1 text-xs;
  }

  .feedback-area {
    @apply p-2;
  }
}

/* Landscape mobile - fill screen */
@media screen and (max-width: 1000px) and (orientation: landscape) {
  .video-poker-machine {
    padding: 0.5rem;
    max-height: 100vh;
    height: 100vh;
    overflow: hidden;
    max-width: 100vw;
    width: 100vw;
  }

  .paytable-section {
    @apply hidden;
  }

  .hand-result-display {
    @apply py-1;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hand-name, .game-over-text {
    @apply text-base leading-tight;
  }

  .cards-section {
    @apply py-2;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cards-container {
    @apply gap-3 px-2;
  }

  /* Smaller held banner */
  .held-label {
    @apply -top-6 text-xs px-2 py-1;
  }

  .controls-section {
    @apply p-0.5 gap-0.5;
    max-height: 20vh;
  }

  .credits-row, .control-row {
    @apply gap-0.5 mb-1;
  }

  /* Larger buttons - 20% bigger */
  .deal-button {
    @apply py-2 text-base;
    width: 4rem;
  }

  .bet-button {
    @apply py-2 px-3 text-sm;
  }

  .speed-button {
    @apply py-2 px-3 text-sm;
  }

  .speed-text {
    @apply text-sm;
  }

  .speed-arrows {
    @apply text-base;
    min-width: 2.5rem;
  }

  .speed-dropdown {
    @apply text-sm;
  }

  .speed-option {
    @apply px-2 py-1;
  }

  .reset-button {
    @apply py-1 px-2 text-sm;
  }

  /* Smaller bet circle and credits */
  .bet-circle {
    @apply w-10 h-10;
  }

  .bet-amount {
    @apply text-sm;
  }

  .credits-amount {
    @apply text-xl;
  }

  /* More spacing in bet controls */
  .bet-controls {
    @apply gap-8;
  }

  /* Add spacing between credits and bet controls */
  .control-row {
    @apply justify-between;
  }

  .bet-display {
    @apply px-8;
  }

  .feedback-area {
    @apply p-1;
  }

  /* Smaller optimal play elements */
  .optimal-play {
    @apply text-xs;
  }

  .show-optimal-button {
    @apply py-0.5 px-1 text-xs;
  }

  .feedback-area-fixed {
    height: 2rem;
  }

  /* Compact game over section */
  .game-over-section {
    @apply py-1;
  }

  /* Reduce spacing in credits and control rows */
  .credits-row {
    @apply mb-0.5;
  }

  .control-row {
    @apply mb-1;
  }
}

@media screen and (max-width: 480px) {
  .video-poker-machine {
    padding: 0.25rem;
  }

  .cards-container {
    @apply gap-0.5;
  }

  .controls-section {
    @apply p-1 gap-1;
  }

  .deal-button, .reset-button {
    @apply py-1 px-1 text-xs;
  }
}
</style>
