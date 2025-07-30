<template>
  <div class="grid grid-cols-4 gap-6 p-6">
    <!-- Linker Bereich: Matrix + Frage + Antworten -->
    <div class="col-span-3 space-y-6">
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

      <p v-if="!question" class="text-gray-500 text-xl">
        Keine Frage ausgewählt.
      </p>

      <div v-if="question" class="bg-white shadow p-6 rounded">
        <h2 class="text-3xl font-bold mb-6">{{ question.text }}</h2>

        <div v-if="showMC && question.choices" class="grid grid-cols-2 gap-4">
          <div
              v-for="(option, index) in question.choices"
              :key="option"
              class="border rounded-lg p-4 text-center text-xl font-medium cursor-pointer transition"
              :class="{
              'bg-green-500 text-white': index === selectedChoiceIndex && wasCorrect === true,
              'bg-red-500 text-white': index === selectedChoiceIndex && wasCorrect === false,
              'bg-gray-100 hover:bg-gray-200': index !== selectedChoiceIndex
            }"
              @click="selectAnswer(index)"
          >
            {{ option }}
          </div>
        </div>

        <div v-if="currentBuzzer && buzzState === 'active'" class="mt-6">
          <div class="text-center">
            <p class="text-3xl text-red-600 font-bold mb-6">
              {{ currentBuzzer }} hat gebuzzert!
            </p>
            <div class="flex justify-center gap-[25px]">
              <button @click="evaluate(true)" class="btn btn-success text-xl px-8 py-4">Richtig</button>
              <button @click="evaluate(false)" class="btn btn-error text-xl px-8 py-4">Falsch</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rechter Bereich -->
    <div class="col-span-1 space-y-6">
      <PlayerList
          :players="players"
          class="shadow p-4 rounded bg-white"
          @kick="kickPlayer"
      />

      <div class="bg-gray-50 shadow p-6 rounded space-y-4">
        <button @click="goToQuestions" class="btn-reload w-full text-xl">
          Fragen bearbeiten
        </button>

        <button
            v-if="isGameStarted"
            @click="showResetConfirm = true"
            class="btn btn-error w-full text-xl"
        >
          Runde zurücksetzen
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
            :disabled="!question || !showLosButton"
            :class="{ 'opacity-50 cursor-not-allowed': !question || !showLosButton }"
        >
          LOS
        </button>
      </div>
    </div>

    <!-- Bestätigungsdialog -->
    <div
        v-if="showResetConfirm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg text-center space-y-6 w-[360px]">
        <p class="text-xl font-semibold">Runde wirklich zurücksetzen?</p>
        <div class="flex justify-center gap-6">
          <button @click="confirmReset" class="btn btn-error px-6 py-2 text-lg">Ja</button>
          <button @click="showResetConfirm = false" class="btn btn-secondary px-6 py-2 text-lg">Nein</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSocket } from '~/composables/useSocket'
import Board from '~/components/Board.vue'
import PlayerList from '~/components/PlayerList.vue'

const router = useRouter()
const goToQuestions = () => router.push('/questions')

const { socket, on, emit } = useSocket()

const board = ref({})
const players = ref([])
const question = ref(null)
const showMC = ref(false)
const showLosButton = ref(true)
const currentBuzzer = ref(null)
const buzzState = ref('inactive')
const showReloadNotice = ref(false)
const showResetConfirm = ref(false)
const selectedChoiceIndex = ref(null)
const wasCorrect = ref(null)

const resetAnswerHighlight = () => {
  selectedChoiceIndex.value = null
  wasCorrect.value = null
}

const boardDisabled = computed(() =>
    question.value !== null && buzzState.value !== 'inactive'
)

const isGameStarted = computed(() =>
    Object.values(board.value).some(category =>
        category.some(field => field.status === 'green')
    )
)

on('boardUpdate', (newBoard) => { board.value = newBoard })
on('players', (newPlayers) => { players.value = newPlayers })
on('question', (q) => {
  question.value = q
  resetAnswerHighlight()
})
on('showMC', (show) => { showMC.value = show })
on('buzzState', (state) => { buzzState.value = state })
on('buzzer', (name) => { currentBuzzer.value = name })
on('showLosButton', (show) => { showLosButton.value = show })
on('questionsReloaded', () => {
  showReloadNotice.value = true
  setTimeout(() => (showReloadNotice.value = false), 2000)
})
on('resetUI', () => {
  question.value = null
  showMC.value = false
  currentBuzzer.value = null
  buzzState.value = 'inactive'
  resetAnswerHighlight()
})

const selectQuestion = ({ category, points }) => emit('selectQuestion', { category, points })
const toggleMC = () => {
  showMC.value = !showMC.value
  if (!showMC.value) resetAnswerHighlight()
}
const selectAnswer = (index) => {
  if (!question.value) return
  selectedChoiceIndex.value = index
  wasCorrect.value = question.value.correctIndex === index
}
const startRound = () => { if (question.value) emit('startRound') }
const evaluate = (correct) => emit('evaluate', { correct })
const confirmReset = () => {
  emit('resetGame')
  showResetConfirm.value = false
}
const kickPlayer = (socketId) => {
  if (confirm('Verbindung wirklich trennen?')) {
    emit('kick', socketId)
  }
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
