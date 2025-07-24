<template>
    <div class="min-h-screen  flex flex-col items-center justify-center px-2 py-6">
        <div class="w-full max-w-2xl bg-white border border-gray-100 shadow-sm">
            <div class="p-8">
                <!-- Header -->
                <div class="text-center mb-6">
                    <h1 class="text-2xl font-light text-gray-900 mb-4">
                        Magnus 50 - fråga {{ currentQuestionIndex + 1 }} av {{ questions.length }}
                    </h1>
                </div>

                <!-- Progress Bar -->
                <div class="mb-6">
                    <div class="bg-gray-200 h-1 mb-4">
                        <div
                            class="bg-gray-900 h-1 transition-all duration-300"
                            :style="{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }"
                        ></div>
                    </div>
                </div>

                <!-- Question Content -->
                <Transition :name="transitionName" mode="out-in">
                    <div v-if="currentQuestion" :key="currentQuestion.id" class="mb-6">
                        <div v-if="quizFinished" class="text-center py-8">
                            <h2 class="text-2xl font-light text-gray-900 mb-4">Tack {{ name }}!</h2>
                            <p class="text-gray-600 leading-relaxed">
                                Dina svar är registrerade. Vi rättar så snart alla är klara.
                            </p>
                        </div>
                        <div v-else>
                            <div class="bg-gray-50 p-6 mb-6 border-l-4 border-gray-300">
                                <h2 class="text-xl font-light text-gray-900 leading-relaxed">
                                    {{ currentQuestion.question }}
                                </h2>
                            </div>

                            <div class="space-y-3">
                                <button
                                    v-for="(option, index) in currentQuestion.options"
                                    :key="`${index}-${option.id}`"
                                    @click="selectAnswer(option)"
                                    :data-testid="`answer-${index}`"
                                    :class="[
                                        'w-full p-4 border text-left transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer',
                                        selectedAnswer === option.id
                                            ? 'border-gray-900 bg-gray-100 text-gray-900'
                                            : 'border-gray-200 bg-white text-gray-700',
                                    ]"
                                >
                                    <div class="flex items-center gap-3">
                                        <div :class="[
                                            'w-4 h-4 border-2 transition-all duration-200',
                                            selectedAnswer === option.id
                                                ? 'border-gray-900 bg-gray-900'
                                                : 'border-gray-300'
                                        ]">
                                            <div v-if="selectedAnswer === option.id" 
                                                 class="w-2 h-2 bg-white m-0.5"></div>
                                        </div>
                                        <span class="font-normal">{{ option.text }}</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>

                <!-- Navigation -->
                <div class="flex justify-between items-center">
                    <button
                        @click="previousQuestion"
                        :disabled="currentQuestionIndex === 0"
                        class="flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-white cursor-pointer"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Föregående</span>
                    </button>

                    <button
                        v-if="currentQuestionIndex < questions.length - 1"
                        @click="nextQuestion"
                        :disabled="selectedAnswer === null"
                        class="flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gray-900 text-white hover:bg-gray-800 disabled:hover:bg-gray-900 cursor-pointer"
                    >
                        <span>Nästa</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <button
                        v-if="currentQuestionIndex === questions.length - 1 && !quizFinished"
                        @click="finishQuiz"
                        :disabled="selectedAnswer === null"
                        class="py-3 px-6 text-sm font-medium transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gray-900 text-white hover:bg-gray-800 disabled:hover:bg-gray-900 cursor-pointer"
                    >
                        Klar!
                    </button>
                </div>

                <!-- Help Text -->
                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-500">
                        Välj ditt svar och tryck "Nästa" för att fortsätta. Du kan gå tillbaka och ändra dina svar.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { db } from '@/firebase.js'
import { collection, query, onSnapshot } from 'firebase/firestore'

const props = defineProps({
    answers: {
        type: Array,
        default: () => [],
    },
    name: {
        type: String,
        default: '',
    },
})

const emits = defineEmits(['answer'])

const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const transitionName = ref('slide-left')
const quizFinished = ref(false)

const questions = ref([])

const currentQuestion = computed(() => {
    return questions.value[currentQuestionIndex.value]
})

watch(currentQuestion, (newQuestion) => {
    if (newQuestion) {
        const answer = props.answers.find((a) => a.questionId === newQuestion.id)
        selectedAnswer.value = answer ? answer.answerId : null
    }
})

const selectAnswer = (option) => {
    selectedAnswer.value = option.id
    emits('answer', currentQuestion.value.id, option.id)
}

const answeredQuestions = computed(() => {
    return props.answers.map((answer) => answer.questionId)
})

const finishQuiz = () => {
    if (selectedAnswer.value !== null) {
        quizFinished.value = true
    }
}

const nextQuestion = () => {
    if (currentQuestionIndex.value < questions.value.length - 1 && selectedAnswer.value !== null) {
        transitionName.value = 'slide-left'
        currentQuestionIndex.value++
    }
}

const previousQuestion = () => {
    if (quizFinished.value) {
        quizFinished.value = false
        return
    }
    if (currentQuestionIndex.value > 0) {
        transitionName.value = 'slide-right'
        currentQuestionIndex.value--
    }
}

onMounted(() => {
    const q = query(collection(db, 'questions'))
    onSnapshot(q, (querySnapshot) => {
        const fetchedQuestions = []
        querySnapshot.forEach((doc) => {
            fetchedQuestions.push({ id: doc.id, ...doc.data() })
        })
        questions.value = fetchedQuestions.sort((a, b) => a.order - b.order)

        const answer = props.answers.find((a) => a.questionId === currentQuestion.value.id)
        selectedAnswer.value = answer ? answer.answerId : null
    })
})
</script>

<style>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-left-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.slide-left-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.slide-right-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.slide-right-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

/* Nordic typography */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    letter-spacing: -0.01em;
}

/* Clean focus states */
button:focus {
    outline: 2px solid #374151;
    outline-offset: 2px;
}

/* Subtle shadows */
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>
