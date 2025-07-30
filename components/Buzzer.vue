<template>
  <button
      :disabled="disabled"
      @click="buzz"
      class="btn btn-error text-4xl h-64 w-64 rounded-full"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
  >
    BUZZER
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  buzzState: String,
  disabled: Boolean
})
const emit = defineEmits(['buzz'])

const buzz = () => {
  emit('buzz')
}
</script>

<style scoped>
.btn-error {
  @apply bg-red-500 hover:bg-red-600 text-white;
}
</style>