<template>
  <div class="p-6 space-y-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Fragen bearbeiten</h1>
      <button @click="goBack" class="btn btn-secondary">
        Zurück zur Moderation
      </button>
    </div>

    <!-- Kategorie-Matrix -->
    <div class="grid grid-cols-6 gap-2">
      <div
          v-for="(category, catIndex) in categories"
          :key="`category-${catIndex}`"
          class="text-white font-bold text-center py-2 rounded"
          :class="catIndex === selectedCategoryIndex ? 'bg-blue-700' : 'bg-blue-500 cursor-pointer'"
          @click="selectCategory(catIndex)"
      >
        {{ categoryNames[catIndex] }}
      </div>

      <div
          v-for="catIndex in 6"
          :key="`cat-${catIndex}`"
          class="grid grid-rows-6 gap-2"
      >
        <div
            v-for="rowIndex in 6"
            :key="`cell-${catIndex}-${rowIndex}`"
            class="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 text-center rounded cursor-pointer"
            @click="selectQuestion(catIndex - 1, rowIndex - 1)"
        >
          {{ questions[categories[catIndex - 1]][rowIndex - 1]?.points ?? '' }}
        </div>
      </div>
    </div>

    <!-- Kategorie bearbeiten -->
    <div v-if="selectedCategoryIndex !== null" class="space-y-4">
      <div class="bg-white shadow p-4 rounded">
        <h2 class="text-2xl font-bold mb-2">Kategorie bearbeiten</h2>
        <div class="flex items-center gap-4">
          <input
              v-model="categoryNames[selectedCategoryIndex]"
              class="input w-full max-w-md"
          />
          <button
              class="btn btn-success"
              :disabled="categoryNames[selectedCategoryIndex] === categories[selectedCategoryIndex]"
              @click="saveCategoryName"
          >
            Speichern
          </button>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div
            v-for="(question, qIndex) in questions[categories[selectedCategoryIndex]]"
            :key="qIndex"
            class="bg-white shadow p-4 rounded space-y-2"
        >
          <label class="block font-semibold">Fragetext:</label>
          <input v-model="question.text" class="input w-full" />

          <label class="block font-semibold mt-2">Punkte:</label>
          <input v-model.number="question.points" type="number" class="input w-24" />

          <label class="block font-semibold mt-2">Antworten:</label>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="(choice, i) in question.choices" :key="i" class="flex items-center gap-2">
              <input v-model="question.choices[i]" class="input w-full" />
              <input type="radio" :value="i" v-model="question.correctIndex" />
            </div>
          </div>

          <button
              class="btn btn-success mt-2"
              :disabled="!unsavedQuestions[qIndex]"
              @click="saveQuestion(qIndex)"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>

    <!-- Einzelne Frage bearbeiten -->
    <div v-else-if="selectedQuestion" class="space-y-4 bg-white shadow p-4 rounded">
      <h2 class="text-2xl font-bold">Frage bearbeiten: {{ selectedQuestion.points }} Punkte</h2>

      <label class="block font-semibold">Fragetext:</label>
      <input v-model="selectedQuestion.text" class="input w-full max-w-2xl" />

      <label class="block font-semibold mt-2">Punkte:</label>
      <input v-model.number="selectedQuestion.points" type="number" class="input w-24" />

      <label class="block font-semibold mt-2">Antworten:</label>
      <div class="grid grid-cols-2 gap-2">
        <div v-for="(choice, i) in selectedQuestion.choices" :key="i" class="flex items-center gap-2">
          <input v-model="selectedQuestion.choices[i]" class="input w-full" />
          <input type="radio" :value="i" v-model="selectedQuestion.correctIndex" />
        </div>
      </div>

      <button class="btn btn-success mt-2" @click="saveSelectedQuestion">Speichern</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import questionsData from '~/data/questions.json'
import { useRouter } from 'vue-router'
const router = useRouter()

const goBack = () => {
  router.push('/moderator')
}

const questions = ref(structuredClone(questionsData))
const categories = ref(Object.keys(questions.value))
const categoryNames = ref([...categories.value])
const selectedQuestion = ref(null)
const selectedCategoryIndex = ref(null)
const unsavedQuestions = reactive({})

function selectCategory(index) {
  selectedCategoryIndex.value = index
  selectedQuestion.value = null
}

function selectQuestion(catIndex, qIndex) {
  selectedQuestion.value = questions.value[categories.value[catIndex]][qIndex]
  selectedCategoryIndex.value = null
}

function saveCategoryName() {
  const index = selectedCategoryIndex.value
  const oldKey = categories.value[index]
  const newKey = categoryNames.value[index]?.trim()

  if (!newKey || oldKey === newKey) return

  const updated = {}
  for (let i = 0; i < categories.value.length; i++) {
    const key = categories.value[i]
    updated[i === index ? newKey : key] = questions.value[key]
  }

  questions.value = updated
  categories.value[index] = newKey

  selectedCategoryIndex.value = categories.value.findIndex(c => c === newKey) // bleibt offen

  saveToServer()
}

function saveQuestion(qIndex) {
  unsavedQuestions[qIndex] = false
  saveToServer()
}

function saveSelectedQuestion() {
  saveToServer()
}

async function saveToServer() {
  try {
    const res = await fetch('/api/save-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questions.value)
    })
    const json = await res.json()
    if (!json.success) {
      console.error('❌ Fehler beim Speichern:', json.error)
    }
  } catch (e) {
    console.error('❌ Fehler beim Speichern der Fragen:', e)
  }
}

watch(
    () => JSON.stringify(questions.value),
    () => {
      if (selectedCategoryIndex.value !== null) {
        const qList = questions.value[categories.value[selectedCategoryIndex.value]]
        qList.forEach((_, i) => {
          unsavedQuestions[i] = true
        })
      }
    }
)
</script>

<style scoped>
.input {
  @apply border rounded px-2 py-1;
}
.btn {
  @apply px-4 py-2 rounded text-white shadow;
}
.btn-success {
  @apply bg-green-500 hover:bg-green-600 disabled:opacity-40;
}
.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white;
}
</style>