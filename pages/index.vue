<template>
  <div class="h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
      <h1 class="text-2xl font-bold text-center">Quiz-Zugang</h1>

      <input
          v-model="password"
          type="password"
          class="input w-full"
          placeholder="Passwort eingeben"
          @keyup.enter="submit"
      />

      <button @click="submit" class="btn btn-primary w-full">Login</button>

      <p v-if="error" class="text-red-500 text-center">{{ error }}</p>
    </div>
  </div>
</template>

// ~/pages/index.vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const password = ref('')
const error = ref('')
const router = useRouter()

// Direktweiterleitung falls bereits authentifiziert
onMounted(() => {
  const cookies = document.cookie.split(';').map(c => c.trim())
  const roleCookie = cookies.find(c => c.startsWith('role='))
  const role = roleCookie?.split('=')[1]

  if (role === 'moderator') {
    router.push('/moderator')
  } else if (role === 'player') {
    const token = localStorage.getItem('playerToken')
    router.push(token ? '/player/buzzer' : '/player')
  }
})

async function submit() {
  error.value = ''
  const res = await fetch('/api/check-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: password.value })
  })

  const json = await res.json()
  if (!json.success) {
    error.value = 'Falsches Passwort'
    return
  }

  // Cookie setzen
  document.cookie = `role=${json.role}; path=/; max-age=86400`

  if (json.role === 'moderator') {
    router.push('/moderator')
  } else if (json.role === 'player') {
    const token = localStorage.getItem('playerToken')
    router.push(token ? '/player/buzzer' : '/player')
  }
}
</script>


<style scoped>
.input {
  @apply border rounded px-3 py-2 shadow-sm;
}
.btn {
  @apply bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded shadow;
}
</style>
