<template>
  <div class="flex flex-col gap-4 items-center justify-center h-screen">
    <template v-if="!started">
      <img src="/party-hat.png" alt="Party Hat" class="w-32 h-32">
      <h1 class="text-4xl">Magnus 50</h1>
    </template>
    <template v-else-if="!isNameLocked">
      <img src="/party-hat.png" alt="Party Hat" class="w-32 h-32">
      <h1 class="text-4xl">Magnus 50</h1>
      <h3 class="text-xl">Ange ditt namn</h3>
      <div class="flex items-center">
        <input 
          type="text" 
          v-model="name" 
          placeholder="Ditt namn" 
          @keydown.enter="lockName"
          class="border p-2 rounded-l w-64 bg-white outline:none focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 border-r-0"
        >
        <button 
          @click="lockName"
          class="bg-[#7ba9d6] hover:bg-[#5482af] cursor-pointer text-white p-2 rounded-r border border-l-0 border-black transition-colors duration-200"
        >
          Starta
        </button>
      </div>
    </template>
    <template v-else>
      <Questions @answer="answer" />
    </template>
  </div>
</template>

<script setup>
import Questions from '@/components/Questions.vue'
import { ref, watch } from 'vue'
import { db } from '@/firebase.js'
import { generateRandomId } from '@/helpers.js'
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const started = ref(false)
const name = ref('')
const isNameLocked = ref(false)

onSnapshot(doc(db, "system", "state"), (doc) => { started.value = doc.data().started })

const lockName = () => {
  isNameLocked.value = true
  
  const sessionId = localStorage.getItem('sessionId')
  setDoc(doc(db, "sessions", sessionId), {
    name: name.value,
    answers: []
  }, { merge: true })
}

const answer = (questionId, answer) => {
  const sessionId = localStorage.getItem('sessionId')
  setDoc(doc(db, "sessions", sessionId), {
    answers: {
      [questionId]: answer
    }
  }, { merge: true })
}

watch(() => started.value, (started) => {
  if (!started) {
    return
  }

  // Check that session id exists, and load progress from database
  const sessionId = localStorage.getItem('sessionId')
  if (!sessionId) {
    localStorage.setItem('sessionId', generateRandomId())
    setDoc(doc(db, "sessions", localStorage.getItem('sessionId')), {
      name: '',
      answers: []
    })
  } else {
    // Load progress from database
    onSnapshot(doc(db, "sessions", sessionId), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        name.value = data.name || ''
        isNameLocked.value = !!data.name
      } else {
        console.error("Session not found in database")
        // Re-generate session?
      }
    })
  }
})

</script>

<style>
</style>
