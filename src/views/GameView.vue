<template>
  <div class="flex flex-col gap-4 items-center justify-center h-screen">
    <template v-if="state === 'pending'">
      <img src="/party-hat.png" alt="Party Hat" class="w-32 h-32">
      <h1 class="text-4xl">Magnus 50</h1>
      <h3 class="text-xl">Ange ditt namn</h3>
      <div class="flex items-center">
        <input 
          type="text" 
          v-model="name" 
          :disabled="isNameLocked"
          placeholder="Ditt namn" 
          class="border p-2 rounded-l w-64 bg-white outline:none focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 border-r-0"
        >
        <button 
          @click="toggleNameLock"
          class="bg-[#7ba9d6] hover:bg-[#5482af] cursor-pointer text-white p-2 rounded-r border border-l-0 border-black transition-colors duration-200"
        >
          {{ isNameLocked ? 'Ändra' : 'Välj' }}
        </button>
      </div>
      <p v-if="isNameLocked" class="mt-2 text-black text-lg">Välkommen {{ name }}!</p>
      <p v-if="isNameLocked" class=" text-black text-lg">Snart drar vi igång!</p>
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
const isNameLocked = ref(false)

const toggleNameLock = () => {
  isNameLocked.value = !isNameLocked.value
}

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
