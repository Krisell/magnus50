<template>
    <div class="relative flex flex-col gap-4 items-center justify-center h-screen">
        <template v-if="!started">
            <img src="/party-hat.png" alt="Party Hat" class="w-32 h-32" />
            <h1 class="text-4xl">Magnus 50</h1>
        </template>
        <template v-else-if="!isNameLocked">
            <img src="/party-hat.png" alt="Party Hat" class="w-32 h-32" />
            <h1 class="text-4xl">Magnus 50</h1>
            <h3 class="text-xl">Ange ditt namn</h3>
            <div class="flex items-center">
                <input
                    type="text"
                    v-model="name"
                    placeholder="Ditt namn"
                    @keydown.enter="lockName"
                    class="border p-2 rounded-l w-64 bg-white outline:none focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 border-r-0"
                />
                <button
                    @click="lockName"
                    class="bg-primary hover:bg-primary-dark cursor-pointer text-white p-2 rounded-r border border-l-0 border-black transition-colors duration-200"
                >
                    Starta
                </button>
            </div>
        </template>
        <template v-else>
            <GameQuestions @answer="answer" :answers="answers" :name="name" />
            <button
                @click="resetSession"
                class="absolute bottom-4 right-4 text-xs bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
            >
                Börja om
            </button>
        </template>
    </div>
</template>

<script setup>
import GameQuestions from '@/components/GameQuestions.vue'
import { ref, watch } from 'vue'
import { db } from '@/firebase.js'
import { generateRandomId } from '@/helpers.js'
import { doc, onSnapshot, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'

const started = ref(false)
const name = ref('')
const isNameLocked = ref(false)
const answers = ref([])

onSnapshot(doc(db, 'system', 'state'), (doc) => {
    started.value = doc.data().started
})

const lockName = () => {
    isNameLocked.value = true

    const sessionId = localStorage.getItem('sessionId')
    setDoc(
        doc(db, 'sessions', sessionId),
        {
            name: name.value,
            answers: [],
        },
        { merge: true },
    )
}

const resetSession = async () => {
    if (confirm('Är du säker på att du vill börja om? All din data kommer att raderas.')) {
        const sessionId = localStorage.getItem('sessionId')
        if (sessionId) {
            await deleteDoc(doc(db, 'sessions', sessionId))
            localStorage.removeItem('sessionId')
        }
        window.location.reload()
    }
}

const answer = async (questionId, answerId) => {
    const sessionId = localStorage.getItem('sessionId')
    const sessionRef = doc(db, 'sessions', sessionId)

    const docSnap = await getDoc(sessionRef)
    if (docSnap.exists()) {
        const sessionData = docSnap.data()
        const answers = sessionData.answers || []

        const existingAnswerIndex = answers.findIndex((a) => a.questionId === questionId)

        if (existingAnswerIndex > -1) {
            answers[existingAnswerIndex].answerId = answerId
        } else {
            answers.push({ questionId, answerId })
        }

        await updateDoc(sessionRef, { answers })
    } else {
        console.error('Session not found!')
    }
}

watch(
    () => started.value,
    (started) => {
        if (!started) {
            return
        }

        // Check that session id exists, and load progress from database
        const sessionId = localStorage.getItem('sessionId')
        if (!sessionId) {
            localStorage.setItem('sessionId', generateRandomId())
            setDoc(doc(db, 'sessions', localStorage.getItem('sessionId')), {
                name: '',
                answers: [],
            })
        } else {
            // Load progress from database
            onSnapshot(doc(db, 'sessions', sessionId), (doc) => {
                if (doc.exists()) {
                    const data = doc.data()
                    name.value = data.name || ''
                    isNameLocked.value = !!data.name
                    answers.value = data.answers || []
                } else {
                    console.error('Session not found in database')
                    // Re-generate session?
                }
            })
        }
    },
)
</script>

<style></style>
