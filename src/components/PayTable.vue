<template>
  <div class="paytable">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b-2 border-yellow-400">
            <th class="text-left py-1 text-yellow-400 font-bold text-3xl">CREDITS</th>
            <th class="text-center px-2 py-1 text-yellow-400 font-bold text-3xl" :class="getBetColumnHeaderClass(1)">1</th>
            <th class="text-center px-2 py-1 text-yellow-400 font-bold text-3xl" :class="getBetColumnHeaderClass(2)">2</th>
            <th class="text-center px-2 py-1 text-yellow-400 font-bold text-3xl" :class="getBetColumnHeaderClass(3)">3</th>
            <th class="text-center px-2 py-1 text-yellow-400 font-bold text-3xl" :class="getBetColumnHeaderClass(4)">4</th>
            <th class="text-center px-2 py-1 text-yellow-400 font-bold text-3xl" :class="getBetColumnHeaderClass(5)">5</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(hand, index) in payouts" 
            :key="index"
            class="border-b border-gray-600"
            :class="getRowClass(hand.type)"
          >
            <td class="py-1 font-medium text-2xl">{{ hand.name }}</td>
            <td class="text-center px-2 py-1 text-2xl" :class="getBetColumnCellClass(1)">{{ hand.payouts[0] }}</td>
            <td class="text-center px-2 py-1 text-2xl" :class="getBetColumnCellClass(2)">{{ hand.payouts[1] }}</td>
            <td class="text-center px-2 py-1 text-2xl" :class="getBetColumnCellClass(3)">{{ hand.payouts[2] }}</td>
            <td class="text-center px-2 py-1 text-2xl" :class="getBetColumnCellClass(4)">{{ hand.payouts[3] }}</td>
            <td class="text-center px-2 py-1 text-2xl" :class="getBetColumnCellClass(5)">
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
  
  // Removed the red color for Royal Flush 4000 payout
  
  return classes.join(' ')
}

function getBetColumnHeaderClass(columnBet: number) {
  const classes = []
  
  if (columnBet === props.currentBet) {
    classes.push('bg-yellow-400', 'bg-opacity-30')
  }
  
  return classes.join(' ')
}

function getBetColumnCellClass(columnBet: number) {
  const classes = []
  
  if (columnBet === props.currentBet) {
    classes.push('bg-yellow-400', 'bg-opacity-20')
  }
  
  return classes.join(' ')
}
</script>

<style scoped>
.paytable {
  @apply bg-blue-800 border border-yellow-400 rounded;
}

th {
  @apply font-bold;
  font-size: 1.875rem !important; /* 30px */
}

td {
  font-size: 1.5rem !important; /* 24px */
}

.bet-highlight {
  @apply bg-yellow-400 text-black font-bold;
}
</style>