<template>
  <div class="flex flex-col gap-4 items-center justify-center h-screen">
    <template v-if="state === 'pending'">
      <h1 class="text-4xl">Magnus 50</h1>
      <h2 class="text-2xl">Snart börjar det</h2>
      <h3 class="text-xl">Ange ditt namn medan du väntar</h3>
      <input type="text" v-model="name" placeholder="Ditt namn" class="border p-2 rounded w-64 bg-white">
      <img src="/party-hat.png" alt="Party Hat" class="w-32 h-32 ml-4">
    </template>
    <template v-else>
      <h1 class="text-4xl">Magnus 50</h1>
      <h2 class="text-2xl">Välj ett namn</h2>
      <button class="bg-blue-500 text-white p-2 rounded mt-4">Starta spelet</button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const state = ref('pending')
const name = ref('')

// Allow right and left arrow keys to switch state
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    state.value = state.value === 'pending' ? 'name' : 'pending'
  } else if (event.key === 'ArrowLeft') {
    state.value = state.value === 'name' ? 'pending' : 'name'
  }
})
</script>

<style>
</style>
