<template>
  <div class="grid grid-cols-6 gap-1 text-center">
    <div v-for="(category, catIndex) in categories" :key="category">
      <!-- Kategorie-Header wie Button -->
      <div class="text-white font-bold py-4 rounded-lg bg-blue-500 shadow mb-1 text-xl">
        {{ category }}
      </div>
      <div
          v-for="points in [100, 200, 300, 400, 500, 600]"
          :key="points"
          class="mb-1"
      >
        <button
            class="w-full py-4 text-xl font-semibold rounded-lg shadow text-white transition"
            :class="{
            'bg-blue-500 hover:bg-blue-600': board[catIndex][points / 100 - 1] === 'blue',
            'bg-green-500': board[catIndex][points / 100 - 1] === 'green'
          }"
            @click="$emit('select-question', { category, points })"
            :disabled="board[catIndex][points / 100 - 1] !== 'blue' || disabled"
        >
          {{ points }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  board: {
    type: Array,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const categories = ['Sport', 'Geschichte', 'Wissenschaft', 'Film', 'Geographie', 'Literatur']
</script>
