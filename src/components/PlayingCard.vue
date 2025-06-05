<template>
  <div 
    class="playing-card"
    :class="cardClasses"
    @click="$emit('click')"
  >
    <div v-if="card" class="card-content">
      <div class="card-corner top-left">
        <div class="card-rank" :class="suitColorClass">{{ card.rank }}</div>
        <div class="card-suit-small" :class="suitColorClass">{{ suitSymbol }}</div>
      </div>
      <div class="card-center">
        <div class="rank-large" :class="suitColorClass">{{ card.rank }}</div>
        <div class="suit-large" :class="suitColorClass">{{ suitSymbol }}</div>
      </div>
      <div class="card-corner bottom-right">
        <div class="card-rank rotated" :class="suitColorClass">{{ card.rank }}</div>
        <div class="card-suit-small rotated" :class="suitColorClass">{{ suitSymbol }}</div>
      </div>
    </div>
    <div v-else class="card-back">
      <div class="back-pattern"></div>
    </div>
    
    <div v-if="isHeld" class="held-indicator">
      HELD
    </div>
    
    <button 
      v-if="showHoldButton && card"
      @click.stop="$emit('toggle-hold')"
      class="hold-button"
      :class="{ 'held': isHeld }"
    >
      {{ isHeld ? 'RELEASE' : 'HOLD' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, Suit } from '@/types/card'
import { getSuitSymbol } from '@/utils/deck'

interface Props {
  card?: Card
  isHeld?: boolean
  showHoldButton?: boolean
  isOptimalHold?: boolean
  isPlayerHold?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isHeld: false,
  showHoldButton: false,
  isOptimalHold: false,
  isPlayerHold: false
})

defineEmits<{
  click: []
  'toggle-hold': []
}>()

const suitSymbol = computed(() => {
  return props.card ? getSuitSymbol(props.card.suit) : ''
})

const suitColorClass = computed(() => {
  if (!props.card) return ''
  return props.card.suit === Suit.HEARTS || props.card.suit === Suit.DIAMONDS 
    ? 'text-red-500' 
    : 'text-black'
})

const cardClasses = computed(() => [
  'cursor-pointer',
  {
    'ring-4 ring-yellow-400 shadow-2xl': props.isHeld,
    'ring-3 ring-green-400 shadow-green-400/50': props.isOptimalHold && !props.isPlayerHold,
    'ring-3 ring-red-400 shadow-red-400/50': props.isPlayerHold && !props.isOptimalHold,
  }
])
</script>

<style scoped>
.playing-card {
  @apply relative w-36 h-48 bg-white rounded-xl border-2 border-gray-300 shadow-xl flex flex-col;
}

.card-content {
  @apply h-full relative p-2;
}

.card-corner {
  @apply absolute flex flex-col items-center leading-none;
}

.card-corner.top-left {
  @apply top-2 left-2;
}

.card-corner.bottom-right {
  @apply bottom-2 right-2;
}

.card-rank {
  @apply text-lg font-bold leading-none;
}

.card-suit-small {
  @apply text-sm leading-none mt-1;
}

.rotated {
  @apply transform rotate-180;
}

.card-center {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

.rank-large {
  @apply text-5xl font-bold leading-none mb-2;
}

.suit-large {
  @apply text-4xl leading-none;
}

.card-back {
  @apply h-full bg-blue-800 rounded-md m-1 flex items-center justify-center;
}

.back-pattern {
  @apply w-full h-full bg-gradient-to-br from-blue-600 to-blue-900 rounded;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.1) 2px,
    rgba(255, 255, 255, 0.1) 4px
  );
}

.held-indicator {
  @apply absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-lg font-bold px-4 py-3 rounded-lg shadow-lg animate-pulse;
}

.hold-button {
  @apply absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold px-3 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg;
}

.hold-button.held {
  @apply bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800;
}
</style>