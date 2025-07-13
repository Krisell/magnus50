<template>
    <div class="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <template v-if="!started">
            <div class="bg-white border border-gray-100 shadow-sm p-12 text-center max-w-md w-full">
                <img src="/party-hat.png" alt="Party Hat" class="w-24 h-24 mx-auto mb-6" />
                <h1 class="text-4xl font-light text-gray-900">Magnus 50</h1>
            </div>
        </template>
        
        <template v-else-if="!isNameLocked">
            <div class="bg-white border border-gray-100 shadow-sm p-12 text-center max-w-md w-full">
                <img src="/party-hat.png" alt="Party Hat" class="w-24 h-24 mx-auto mb-6" />
                <h1 class="text-4xl font-light text-gray-900 mb-6">Magnus 50</h1>
                <div class="mb-8">
                    <p class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Kom igång</p>
                    <h2 class="text-xl font-light text-gray-900 mb-6">Ange ditt namn</h2>
                </div>
                <div class="flex">
                    <input
                        type="text"
                        v-model="name"
                        placeholder="Ditt namn"
                        @keydown.enter="lockName"
                        class="flex-1 py-3 px-4 border border-gray-300 border-r-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors duration-200"
                    />
                    <button
                        @click="lockName"
                        class="py-3 px-6 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 border border-gray-900"
                    >
                        Starta
                    </button>
                </div>
            </div>
        </template>
        
        <template v-else>
            <div class="w-full max-w-4xl">
                <GameQuestions @answer="answer" :answers="answers" :name="name" />
            </div>
            <button
                @click="resetSession"
                class="fixed bottom-6 right-6 py-2 px-4 text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 border border-red-600"
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
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore'

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
            // await deleteDoc(doc(db, 'sessions', sessionId))
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

<style>
/* Nordic typography */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    letter-spacing: -0.01em;
}

/* Clean focus states */
button:focus,
input:focus {
    outline: 2px solid #374151;
    outline-offset: 2px;
}

/* Subtle shadows */
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>
