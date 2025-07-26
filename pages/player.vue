<template>
  <div class="container mx-auto p-6 flex flex-col items-center justify-center text-center">
    <div v-if="!playerName" class="mb-4">
      <input v-model="nameInput" placeholder="Name eingeben" class="input input-bordered mr-2" />
      <button @click="joinGame" class="btn btn-primary">Beitreten</button>
    </div>

    <div v-else>
      <h2 class="text-3xl font-bold mb-4">{{ 'Hallo ' + playerName }}</h2>

      <Buzzer :buzzState="buzzState" @buzz="buzz" />

      <p v-if="currentBuzzer" class="text-2xl text-red-600 mt-4 font-semibold">
        {{ currentBuzzer }} hat gebuzzert!
      </p>

      <div v-if="showQuestion && question" class="mt-6 p-4 bg-gray-100 rounded shadow w-full max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold">{{ question.text }}</h1>

        <div v-if="showMC" class="grid grid-cols-2 gap-2 mt-4">
          <button v-for="option in question.choices" :key="option" class="btn btn-outline">
            {{ option }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSocket } from '~/composables/useSocket'
import Buzzer from '~/components/Buzzer.vue'

const { socket, on, emit } = useSocket()
const playerName = ref('')
const nameInput = ref('')
const buzzState = ref('inactive')
const question = ref(null)
const showQuestion = ref(false)
const showMC = ref(false)
const currentBuzzer = ref(null)

on('buzzState', (state) => { buzzState.value = state })
on('question', (q) => { question.value = q })
on('showQuestion', (show) => { showQuestion.value = show })
on('showMC', (show) => { showMC.value = show })
on('buzzer', (name) => { currentBuzzer.value = name })

const joinGame = () => {
  if (nameInput.value) {
    playerName.value = nameInput.value
    emit('join', nameInput.value)
  }
}
const buzz = () => emit('buzz')
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded;
}
.input {
  @apply p-2 border rounded;
}
</style>
