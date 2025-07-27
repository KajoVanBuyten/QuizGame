<template>
  <div class="grid grid-cols-4 gap-6 p-6">
    <!-- Linker Bereich: Matrix + Frage + Antworten -->
    <div class="col-span-3 space-y-6">
      <!-- Reload-Hinweis -->
      <div
          v-if="showReloadNotice"
          class="text-center text-white bg-green-600 py-2 rounded shadow text-xl animate-pulse"
      >
        Punkte wurden neu geladen!
      </div>

      <Board
          :board="board"
          :disabled="boardDisabled"
          @select-question="selectQuestion"
      />

      <p v-if="showQuestion && !question" class="text-gray-500 text-xl">
        Keine Frage geladen.
      </p>

      <div
          v-if="showQuestion && question"
          class="bg-white shadow p-6 rounded"
      >
        <h2 class="text-3xl font-bold mb-6">{{ question.text }}</h2>

        <div
            v-if="showMC && question.choices"
            class="grid grid-cols-2 gap-4"
        >
          <div
              v-for="option in question.choices"
              :key="option"
              class="border rounded-lg p-4 bg-gray-100 text-center text-xl font-medium"
          >
            {{ option }}
          </div>
        </div>

        <div
            v-if="currentBuzzer && buzzState === 'active'"
            class="mt-6"
        >
          <p class="text-3xl text-red-600 font-bold text-center">
            {{ currentBuzzer }} hat gebuzzert!
          </p>
        </div>
      </div>
    </div>

    <!-- Rechter Bereich: Spieler + Steuerung -->
    <div class="col-span-1 space-y-6">
      <PlayerList
          :players="players"
          class="shadow p-4 rounded bg-white"
      />

      <div class="bg-gray-50 shadow p-6 rounded space-y-4">
        <button
            @click="toggleQuestion"
            class="btn w-full text-xl"
            :class="showQuestion ? 'btn-active' : 'btn-inactive'"
        >
          Frage {{ showQuestion ? 'ausblenden' : 'einblenden' }}
        </button>

        <button
            @click="toggleMC"
            class="btn w-full text-xl"
            :class="showMC ? 'btn-active' : 'btn-inactive'"
        >
          Antworten {{ showMC ? 'ausblenden' : 'einblenden' }}
        </button>

        <button
            @click="startRound"
            class="btn-matrix w-full text-xl"
            :disabled="!question"
            :class="{ 'opacity-50 cursor-not-allowed': !question }"
        >
          LOS
        </button>

        <div
            v-if="question && currentBuzzer && buzzState === 'active'"
            class="space-y-2"
        >
          <button
              @click="evaluate(true)"
              class="btn btn-success w-full text-xl"
          >
            Richtig
          </button>
          <button
              @click="evaluate(false)"
              class="btn btn-error w-full text-xl"
          >
            Falsch
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSocket } from '~/composables/useSocket'
import Board from '~/components/Board.vue'
import PlayerList from '~/components/PlayerList.vue'

const { socket, on, emit } = useSocket()

const board = ref(Array(6).fill().map(() => Array(6).fill('blue')))
const players = ref([])
const question = ref(null)
const showQuestion = ref(false)
const showMC = ref(false)
const showLosButton = ref(true)
const currentBuzzer = ref(null)
const buzzState = ref('inactive')
const showReloadNotice = ref(false)

// Board ist deaktiviert wenn eine Frage läuft UND die Runde aktiv ist
const boardDisabled = computed(() => question.value !== null && buzzState.value !== 'inactive')

// Socket Events
on('boardUpdate', (newBoard) => { board.value = newBoard })
on('players', (newPlayers) => { players.value = newPlayers })
on('question', (q) => { question.value = q })
on('showQuestion', (show) => { showQuestion.value = show })
on('showMC', (show) => { showMC.value = show })
on('buzzState', (state) => { buzzState.value = state })
on('buzzer', (name) => { currentBuzzer.value = name })
on('showLosButton', (show) => { showLosButton.value = show })

// Automatisch blinkende Benachrichtigung bei Fragen-Reload
on('questionsReloaded', () => {
  showReloadNotice.value = true
  setTimeout(() => (showReloadNotice.value = false), 2000)
})

// Methoden
const selectQuestion = ({ category, points }) => emit('selectQuestion', { category, points })
const toggleQuestion = () => { showQuestion.value = !showQuestion.value }
const toggleMC = () => { showMC.value = !showMC.value }
const startRound = () => { if (question.value) emit('startRound') }
const evaluate = (correct) => emit('evaluate', { correct })
const reloadQuestions = () => {
  console.log('Reloading questions from server...')
  emit('reloadQuestions')
}
</script>

<style scoped>
.btn {
  @apply px-6 py-4 rounded-lg font-semibold shadow text-white transition;
}
.btn-active {
  @apply bg-green-500 hover:bg-green-600;
}
.btn-inactive {
  @apply bg-red-500 hover:bg-red-600;
}
.btn-success {
  @apply bg-green-500 hover:bg-green-600 text-white;
}
.btn-error {
  @apply bg-red-500 hover:bg-red-600 text-white;
}
.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white;
}
.btn-matrix {
  @apply bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-lg shadow;
}
.btn-reload {
  @apply bg-blue-900 hover:bg-blue-800 text-white px-6 py-4 rounded-lg shadow;
}
.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
