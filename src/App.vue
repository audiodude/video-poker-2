<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-center mb-8 text-yellow-300 drop-shadow-lg">
        Jacks or Better Video Poker Trainer
      </h1>
      <VideoPokerGame />
    </div>
  </div>
</template>

<script setup lang="ts">
import VideoPokerGame from '@/components/VideoPokerGame.vue'
</script>