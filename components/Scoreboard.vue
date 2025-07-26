<template>
  <div>
    <h2 class="text-xl mb-2">Punktestand</h2>
    <ul class="list-disc pl-5">
      <li v-for="player in players" :key="player.id" class="mb-1">
        {{ player.name }}: {{ player.points }} Punkte
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps(['players'])
</script>