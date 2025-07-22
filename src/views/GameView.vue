<template>
    <div class="min-h-screen flex flex-col items-center justify-center px-1 py-6">
        <template v-if="loading">
            <div class="bg-white/70 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl p-12 text-center max-w-md w-full">
                <div class="animate-bounce">
                    <img src="/party-hat.png" alt="Party Hat" class="w-32 h-32 mx-auto mb-8 drop-shadow-lg" />
                </div>
                <h1 class="text-5xl font-extralight text-gray-800 tracking-tight">Magnus 50</h1>
                <p class="text-gray-600 text-lg mt-6">Väntar på att spelet ska starta</p>
            </div>
        </template>

        <template v-else-if="gradingStarted">
            <div class="bg-white/70 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl p-12 text-center max-w-md w-full">
                <div class="relative">
                    <img src="/party-hat.png" alt="Party Hat" class="w-28 h-28 mx-auto mb-8 drop-shadow-lg" />
                </div>
                <h1 class="text-4xl font-extralight text-gray-800 mb-6 tracking-tight">Rättningen har påbörjats!</h1>
                <p class="text-gray-600 leading-relaxed text-lg">Nu är det för sent att ge nya svar.</p>
            </div>
        </template>

        <template v-else-if="!isNameLocked">
            <div class="bg-white/70 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl p-12 text-center max-w-md w-full">
                <div class="relative mb-8">
                    <img src="/party-hat.png" alt="Party Hat" class="w-32 h-32 mx-auto drop-shadow-lg" />
                </div>
                <h1 class="text-5xl font-extralight text-gray-800 mb-8 tracking-tight">Magnus 50</h1>
                <div class="mb-8">
                    <h2 class="text-xl font-light text-gray-700 mb-6">Ange ert lagnamn</h2>
                </div>
                <div class="flex rounded-2xl overflow-hidden shadow-lg">
                    <input
                        type="text"
                        v-model="name"
                        required
                        placeholder="Lagnamn 🥳"
                        @keydown.enter="lockName"
                        class="flex-1 py-4 px-6 border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/90 text-lg"
                    />
                    <button
                        @click="lockName"
                        class="cursor-pointer py-4 px-8 text-sm font-medium bg-primary text-white"
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
                class="mt-8 py-3 px-6 text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
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
const gradingStarted = ref(false)
const name = ref('')
const isNameLocked = ref(false)
const answers = ref([])
const loading = ref(true)

onSnapshot(doc(db, 'system', 'state'), (doc) => {
    started.value = doc.data().started
    gradingStarted.value = doc.data().gradingStarted || false
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
            loading.value = false
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
            loading.value = false
        } else {
            onSnapshot(doc(db, 'sessions', sessionId), (doc) => {
                if (doc.exists()) {
                    const data = doc.data()
                    name.value = data.name || ''
                    isNameLocked.value = !!data.name
                    answers.value = data.answers || []
                } else {
                    console.error('Session not found in database')
                }

                loading.value = false
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
</style>
