<template>
  <div class="grid grid-cols-4 gap-6">
    <!-- Linker Bereich: Frage & Antworten -->
    <div class="col-span-3 bg-white shadow p-6 rounded">
      <h2 class="text-3xl font-bold mb-6" v-if="showQuestion && question">
        {{ question.text }}
      </h2>

      <div v-if="showMC && question?.choices" class="grid grid-cols-2 gap-4">
        <div
            v-for="option in question.choices"
            :key="option"
            class="border rounded-lg p-4 bg-gray-100 text-center text-xl font-medium"
        >
          {{ option }}
        </div>
      </div>
    </div>

    <!-- Rechter Bereich: Steuerung -->
    <div class="col-span-1 bg-gray-50 shadow p-6 rounded space-y-4">
      <button @click="emit('toggle-question')" class="btn btn-primary w-full text-xl">
        {{ showQuestion ? 'Frage ausblenden' : 'Frage einblenden' }}
      </button>

      <button @click="emit('toggle-mc')" class="btn btn-secondary w-full text-xl">
        {{ showMC ? 'MC ausblenden' : 'MC einblenden' }}
      </button>

      <button
          v-if="showLosButton"
          @click="emit('start-round')"
          class="btn btn-success w-full text-xl"
          :disabled="!question"
          :class="{ 'opacity-50 cursor-not-allowed': !question }"
      >
        LOS
      </button>

      <div v-if="question && currentBuzzer && buzzState === 'active'" class="space-y-2">
        <button @click="emit('evaluate', true)" class="btn btn-success w-full text-xl">Richtig</button>
        <button @click="emit('evaluate', false)" class="btn btn-error w-full text-xl">Falsch</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['toggle-question', 'toggle-mc', 'start-round', 'evaluate'])

defineProps([
  'question',
  'showQuestion',
  'showMC',
  'showLosButton',
  'currentBuzzer',
  'buzzState'
])
</script>

<style scoped>
.btn {
  @apply px-6 py-4 rounded-lg font-semibold shadow text-white;
}
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-600;
}
.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700;
}
.btn-success {
  @apply bg-green-500 hover:bg-green-600;
}
.btn-error {
  @apply bg-red-500 hover:bg-red-600;
}
</style>
