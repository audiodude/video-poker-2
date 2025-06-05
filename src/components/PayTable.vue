<template>
  <div class="paytable">
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-yellow-400">
            <th class="text-left py-1 text-yellow-400 font-bold">HAND</th>
            <th class="text-center px-1 py-1 text-yellow-400 font-bold">1</th>
            <th class="text-center px-1 py-1 text-yellow-400 font-bold">2</th>
            <th class="text-center px-1 py-1 text-yellow-400 font-bold">3</th>
            <th class="text-center px-1 py-1 text-yellow-400 font-bold">4</th>
            <th class="text-center px-1 py-1 text-yellow-400 font-bold">5</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(hand, index) in payouts" 
            :key="index"
            class="border-b border-gray-600"
            :class="getRowClass(hand.type)"
          >
            <td class="py-0.5 font-medium text-xs">{{ hand.name }}</td>
            <td class="text-center px-1 py-0.5 text-xs">{{ hand.payouts[0] }}</td>
            <td class="text-center px-1 py-0.5 text-xs">{{ hand.payouts[1] }}</td>
            <td class="text-center px-1 py-0.5 text-xs">{{ hand.payouts[2] }}</td>
            <td class="text-center px-1 py-0.5 text-xs">{{ hand.payouts[3] }}</td>
            <td class="text-center px-1 py-0.5 text-xs font-bold" :class="getBetColumnClass(hand.type, 4)">
              {{ hand.payouts[4] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { HandType } from '@/types/card'

interface Props {
  currentBet?: number
  winningHand?: HandType
}

const props = withDefaults(defineProps<Props>(), {
  currentBet: 1
})

const payouts = [
  {
    name: 'Royal Flush',
    type: 'ROYAL_FLUSH',
    payouts: [250, 500, 750, 1000, 4000]
  },
  {
    name: 'Straight Flush',
    type: 'STRAIGHT_FLUSH',
    payouts: [50, 100, 150, 200, 250]
  },
  {
    name: 'Four of a Kind',
    type: 'FOUR_OF_A_KIND',
    payouts: [25, 50, 75, 100, 125]
  },
  {
    name: 'Full House',
    type: 'FULL_HOUSE',
    payouts: [9, 18, 27, 36, 45]
  },
  {
    name: 'Flush',
    type: 'FLUSH',
    payouts: [6, 12, 18, 24, 30]
  },
  {
    name: 'Straight',
    type: 'STRAIGHT',
    payouts: [4, 8, 12, 16, 20]
  },
  {
    name: 'Three of a Kind',
    type: 'THREE_OF_A_KIND',
    payouts: [3, 6, 9, 12, 15]
  },
  {
    name: 'Two Pair',
    type: 'TWO_PAIR',
    payouts: [2, 4, 6, 8, 10]
  },
  {
    name: 'Jacks or Better',
    type: 'JACKS_OR_BETTER',
    payouts: [1, 2, 3, 4, 5]
  }
]

function getRowClass(handType: string) {
  const classes = []
  
  if (props.winningHand && handType === props.winningHand) {
    classes.push('bg-yellow-400', 'text-black', 'font-bold')
  }
  
  return classes.join(' ')
}

function getBetColumnClass(handType: string, columnIndex: number) {
  const classes = []
  
  if (handType === 'ROYAL_FLUSH' && columnIndex === 4) {
    classes.push('text-red-400')
  }
  
  return classes.join(' ')
}
</script>

<style scoped>
.paytable {
  @apply bg-blue-800 border border-yellow-400 rounded;
}

th {
  @apply font-bold text-xs;
}

td {
  @apply text-xs;
}

.bet-highlight {
  @apply bg-yellow-400 text-black font-bold;
}
</style>