<template>
  <div class="playing-card" :class="cardClasses" @click="$emit('click')">
    <div
      v-if="card"
      :class="[
        'card-content',
        `c-${card.rank == '10' ? 'T' : card.rank}${card.suit[0]}`,
      ]"
    ></div>
    <div v-else class="card-back">
      <div class="back-pattern"></div>
    </div>

    <div v-if="isHeld" class="held-indicator">HELD</div>

    <button
      v-if="showHoldButton && card"
      @click.stop="$emit('toggle-hold')"
      class="hold-button"
      :class="{ held: isHeld }"
    >
      {{ isHeld ? 'RELEASE' : 'HOLD' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Card, Suit } from '@/types/card';
import { getSuitSymbol } from '@/utils/deck';

interface Props {
  card?: Card;
  isHeld?: boolean;
  showHoldButton?: boolean;
  isOptimalHold?: boolean;
  isPlayerHold?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isHeld: false,
  showHoldButton: false,
  isOptimalHold: false,
  isPlayerHold: false,
});

defineEmits<{
  click: [];
  'toggle-hold': [];
}>();

const suitSymbol = computed(() => {
  return props.card ? getSuitSymbol(props.card.suit) : '';
});

const suitColorClass = computed(() => {
  if (!props.card) return '';
  return props.card.suit === Suit.HEARTS || props.card.suit === Suit.DIAMONDS
    ? 'text-red-500'
    : 'text-black';
});

const cardClasses = computed(() => [
  'cursor-pointer',
  {
    'ring-4 ring-yellow-400 shadow-2xl': props.isHeld && !props.isOptimalHold,
    'ring-8 ring-green-700 shadow-2xl shadow-green-700/50': props.isOptimalHold,
  },
]);
</script>

<style lang="scss">
@use '../styles/cards';

.playing-card {
  @apply relative w-36 h-[13.1rem] bg-white rounded-xl border-2 border-gray-300 shadow-xl overflow-hidden flex flex-col;
  transition: all 0.3s ease-in-out;
}

.card-content {
  @apply h-full relative;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
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

/* Mobile responsive styles for cards */
@media screen and (max-width: 1000px) {
  .playing-card {
    width: clamp(60px, 18vw, 80px);
    height: clamp(87px, 26vw, 116px);
  }

  .rank-large {
    @apply text-2xl mb-1;
  }

  .suit-large {
    @apply text-xl;
  }

  .card-rank-small, .card-suit-small {
    @apply text-xs;
  }

  .held-indicator {
    @apply -top-8 text-sm px-2 py-1;
  }

  .hold-button {
    @apply -bottom-8 text-xs px-2 py-1;
  }
}

/* Mobile landscape - larger cards to fill screen */
@media screen and (max-width: 1000px) and (orientation: landscape) {
  .playing-card {
    width: clamp(80px, 16vw, 120px);
    height: clamp(116px, 23vw, 174px);
  }

  .rank-large {
    @apply text-3xl mb-1;
  }

  .suit-large {
    @apply text-2xl;
  }

  .card-rank-small, .card-suit-small {
    @apply text-sm;
  }

  .held-indicator {
    @apply -top-8 text-sm px-2 py-1;
  }

  .hold-button {
    @apply -bottom-8 text-sm px-2 py-1;
  }
}

@media screen and (max-width: 480px) {
  .playing-card {
    width: clamp(50px, 19vw, 65px);
    height: clamp(73px, 27vw, 94px);
  }

  .rank-large {
    @apply text-xl mb-0;
  }

  .suit-large {
    @apply text-lg;
  }

  .card-rank-small, .card-suit-small {
    @apply text-xs;
  }

  .held-indicator {
    @apply -top-6 text-xs px-1 py-1;
  }

  .hold-button {
    @apply -bottom-6 text-xs px-1 py-1;
  }
}
</style>
