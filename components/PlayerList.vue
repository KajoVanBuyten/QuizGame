<template>
  <div>
    <h2 class="text-xl mb-2">Spieler</h2>
    <ul class="space-y-1">
      <li
          v-for="player in players"
          :key="player.id"
          class="flex justify-between items-center border-b pb-1"
      >
        <span>{{ player.name }}: {{ player.points }} Punkte</span>
        <button
            @click="$emit('kick', player.id)"
            class="text-red-500 hover:text-red-700 text-lg"
            title="Verbindung trennen"
        >
          ❌
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps(['players'])
defineEmits(['kick'])
</script>