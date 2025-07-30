<template>
  <div class="grid grid-cols-6 gap-1 text-center">
    <div v-for="(fields, category) in board" :key="category">
      <div class="text-white font-bold py-4 rounded-lg bg-blue-800 shadow mb-1 text-xl">
        {{ category }}
      </div>
      <div v-for="field in fields" :key="field.points" class="mb-1">
        <button
            class="w-full py-4 text-xl font-semibold rounded-lg shadow text-white transition"
            :class="{
            'bg-blue-500 hover:bg-blue-600': field.status === 'blue',
            'bg-green-500': field.status === 'green'
          }"
            @click="$emit('select-question', { category, points: field.points })"
            :disabled="field.status !== 'blue' || disabled"
        >
          {{ field.points }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  board: {
    type: Object, // 🟢 vorher war es Array
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>
