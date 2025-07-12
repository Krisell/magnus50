<template>
    <div class="flex flex-col items-center justify-center h-screen p-4 max-w-4xl mx-auto">
        <!-- Question Header -->
        <div class="text-center mb-8">
            <h1 class="text-3xl md:text-4xl font-bold mb-2">Magnus 50</h1>
            <p class="text-lg md:text-xl text-gray-600">
                Fråga {{ currentQuestionIndex + 1 }} av {{ questions.length }}
            </p>
        </div>

        <!-- Progress Bar -->
        <div class="w-full max-w-md mb-8">
            <div class="bg-gray-200 rounded-full h-2">
                <div
                    class="bg-primary h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }"
                ></div>
            </div>
        </div>

        <!-- Question Card -->
        <div
            v-if="currentQuestion"
            class="bg-white rounded-lg shadow-lg p-6 md:p-8 w-full max-w-2xl mb-8"
        >
            <h2 class="text-xl md:text-2xl font-semibold text-center mb-8">
                {{ currentQuestion.question }}
            </h2>

            <!-- Answer Buttons -->
            <div class="flex flex-col md:flex-row gap-4 md:gap-6">
                <button
                    v-for="option in currentQuestion.options"
                    :key="option.id"
                    @click="selectAnswer(option)"
                    :class="[
                        'cursor-alias hover:cursor-pointer',
                        'flex-1 p-4 md:p-6 rounded-lg border-2 transition-all duration-200 text-center',
                        'hover:bg-primary hover:text-white hover:border-primary',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                        selectedAnswer === option.id
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-800 border-gray-300',
                    ]"
                >
                    <span class="text-lg md:text-xl font-medium">{{ option.text }}</span>
                </button>
            </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between items-center w-full max-w-2xl mb-4">
            <!-- Previous Button -->
            <button
                @click="previousQuestion"
                :disabled="currentQuestionIndex === 0"
                :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                    currentQuestionIndex === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900',
                ]"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                <span>Föregående</span>
            </button>

            <!-- Next Button -->
            <button
                @click="nextQuestion"
                :disabled="currentQuestionIndex === questions.length - 1 || selectedAnswer === null"
                :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                    currentQuestionIndex === questions.length - 1 || selectedAnswer === null
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dark text-white',
                ]"
            >
                <span>{{ currentQuestionIndex === questions.length - 1 ? 'Klar' : 'Nästa' }}</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </div>

        <!-- Navigation Hint -->
        <p class="text-sm text-gray-500 text-center">
            Använd vänster/höger piltangenter för att navigera • Svara på frågan för att gå vidare
        </p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase.js'
import { collection, query, onSnapshot } from 'firebase/firestore'

const emits = defineEmits(['answer'])

const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)

const questions = ref([])

const currentQuestion = computed(() => {
    return questions.value[currentQuestionIndex.value]
})

const selectAnswer = (option) => {
    selectedAnswer.value = option.id
    emits('answer', currentQuestion.value.id, option.id)
}

const nextQuestion = () => {
    if (currentQuestionIndex.value < questions.value.length - 1 && selectedAnswer.value !== null) {
        currentQuestionIndex.value++
        selectedAnswer.value = null
    }
}

const previousQuestion = () => {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--
        selectedAnswer.value = null
    }
}

console.log('here')
onMounted(() => {
    console.log('2here')
    const q = query(collection(db, 'questions'))
    onSnapshot(q, (querySnapshot) => {
        const firestoreQuestions = []
        querySnapshot.forEach((doc) => {
            console.log(doc.id, ' => ', doc.data())
            firestoreQuestions.push(doc.data())
        })

        questions.value = firestoreQuestions
    })
})
</script>

<style scoped>
/* Additional mobile-specific styles if needed */
@media (max-width: 768px) {
    .question-card {
        margin: 1rem;
    }
}
</style>
