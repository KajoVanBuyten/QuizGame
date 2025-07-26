<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl mb-4">Quiz-Spiel</h1>
    <NuxtLink to="/player" class="btn btn-primary mr-2">Als Spieler beitreten</NuxtLink>
    <NuxtLink to="/moderator" class="btn btn-secondary">Als Moderator beitreten</NuxtLink>
  </div>
</template>

<style scoped>
.btn {
  @apply px-4 py-2 rounded text-white;
}
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-600;
}
.btn-secondary {
  @apply bg-green-500 hover:bg-green-600;
}
</style>