<template>
    <div class="min-h-screen px-6 py-12">
        <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Grading Section -->
            <div class="lg:col-span-1 space-y-6">
                <div v-if="currentQuestion" class="bg-white border border-gray-100 shadow-sm">
                    <div class="p-8">
                        <div class="mb-8">
                            <p class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Fråga {{ currentQuestionIndex + 1 }} av {{ questions.length }}
                            </p>
                            <h1 class="text-2xl font-light text-gray-900 leading-relaxed">
                                {{ currentQuestion.question }}
                            </h1>
                        </div>
                        
                        <div class="space-y-3 mb-8">
                            <div
                                v-for="option in currentQuestion.options"
                                :key="option.id"
                                @click="setCorrectAnswer(currentQuestion.id, option.id)"
                                :class="[
                                    'p-4 border cursor-pointer transition-all duration-200 ease-in-out',
                                    correctAnswers[currentQuestion.id] === option.id
                                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700',
                                ]"
                            >
                                <div class="flex items-center gap-3">
                                    <div :class="[
                                        'w-4 h-4 border-2 rounded-full transition-all duration-200',
                                        correctAnswers[currentQuestion.id] === option.id
                                            ? 'border-emerald-500 bg-emerald-500'
                                            : 'border-gray-300'
                                    ]">
                                        <div v-if="correctAnswers[currentQuestion.id] === option.id" 
                                             class="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                    </div>
                                    <span class="font-normal">{{ option.text }}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex gap-3">
                            <button
                                @click="prevQuestion"
                                :disabled="currentQuestionIndex === 0"
                                class="flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-white"
                            >
                                Föregående
                            </button>
                            <button
                                @click="nextQuestion"
                                :disabled="currentQuestionIndex === questions.length - 1"
                                class="flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gray-900 text-white hover:bg-gray-800 disabled:hover:bg-gray-900"
                            >
                                Nästa
                            </button>
                        </div>
                    </div>
                </div>
                
                <div v-else class="bg-white border border-gray-100 shadow-sm">
                    <div class="p-8 text-center">
                        <div class="mb-6">
                            <h1 class="text-3xl font-light text-gray-900 mb-3">Lycka till!</h1>
                            <p class="text-gray-600 leading-relaxed">
                                När alla är klara så rättar vi – Magnus har svaren!
                            </p>
                        </div>
                        <button
                            @click="startGrading"
                            class="inline-block py-3 px-8 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200"
                        >
                            Starta rättning
                        </button>
                    </div>
                </div>
            </div>

            <!-- High Score Section -->
            <div class="lg:col-span-2 bg-white border border-gray-100 shadow-sm">
                <div class="p-8">
                    <div class="mb-8 text-center">
                        <h2 class="text-3xl font-light text-gray-900">Resultat</h2>
                        <div class="w-16 h-px bg-gray-300 mx-auto mt-4"></div>
                    </div>
                    
                    <div class="space-y-1">
                        <TransitionGroup name="list" tag="div">
                            <div
                                v-for="(player, index) in highScore"
                                :key="player.id"
                                :class="[
                                    'flex items-center justify-between py-4 px-6 transition-all duration-300',
                                    getPlayerAnswerClass(player),
                                ]"
                                :style="{ '--i': index }"
                            >
                                <div class="flex items-center gap-6">
                                    <div :class="[
                                        'w-8 h-8 flex items-center justify-center text-sm font-medium',
                                        getPositionClass(player.position)
                                    ]">
                                        {{ player.position }}
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <span class="text-lg font-normal text-gray-900">{{ player.name }}</span>
                                            <span class="text-lg">{{ getMedal(player.position) }}</span>
                                        </div>
                                        <div class="text-sm text-gray-500 mt-1">
                                            {{ player.answeredQuestions }} besvarade frågor
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xl font-light text-gray-900">{{ player.score }}</div>
                                    <div class="text-sm text-gray-500">poäng</div>
                                </div>
                            </div>
                        </TransitionGroup>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase.js'
import { collection, query, onSnapshot, doc, setDoc, orderBy } from 'firebase/firestore'

const questions = ref([])
const sessions = ref([])
const correctAnswers = ref({})
const currentQuestionIndex = ref(-1)

onMounted(() => {
    onSnapshot(query(collection(db, 'questions'), orderBy('order')), (querySnapshot) => {
        const firestoreQuestions = []
        querySnapshot.forEach((doc) => {
            firestoreQuestions.push({ firestoreId: doc.id, ...doc.data() })
        })
        questions.value = firestoreQuestions
    })

    onSnapshot(query(collection(db, 'sessions')), (querySnapshot) => {
        const firestoreSessions = []
        querySnapshot.forEach((doc) => {
            firestoreSessions.push({ id: doc.id, ...doc.data() })
        })
        sessions.value = firestoreSessions
    })

    const correctAnswersRef = doc(db, 'system', 'correctAnswers')
    onSnapshot(correctAnswersRef, (docSnap) => {
        if (docSnap.exists()) {
            correctAnswers.value = docSnap.data()
        } else {
            setDoc(correctAnswersRef, {})
        }
    })
})

const startGrading = () => {
    currentQuestionIndex.value = 0
}

const currentQuestion = computed(() => {
    if (currentQuestionIndex.value === -1) {
        return null
    }
    return questions.value[currentQuestionIndex.value]
})

const getPlayerAnswerClass = (player) => {
    if (!currentQuestion.value) return ''
    
    const playerAnswer = (player.answers || []).find(
        answer => answer.questionId === currentQuestion.value.id
    )
    
    if (playerAnswer && correctAnswers.value[currentQuestion.value.id] === playerAnswer.answerId) {
        return 'bg-emerald-50'
    }
    
    return ''
}

const getPositionClass = (position) => {
    switch (position) {
        case 1:
            return 'bg-amber-100 text-amber-800'
        case 2:
            return 'bg-slate-100 text-slate-800'
        case 3:
            return 'bg-orange-100 text-orange-800'
        default:
            return 'bg-gray-100 text-gray-600'
    }
}

const getMedal = (position) => {
    switch (position) {
        case 1:
            return '🥇'
        case 2:
            return '🥈'
        case 3:
            return '🥉'
        default:
            return ''
    }
}

const highScore = computed(() => {
    const sortedPlayers = sessions.value
        .filter((session) => session.name)
        .map((session) => {
            const score = (session.answers || []).reduce((acc, answer) => {
                if (correctAnswers.value[answer.questionId] === answer.answerId) {
                    return acc + 1
                }
                return acc
            }, 0)
            const answeredQuestions = (session.answers || []).length
            return { ...session, score, answeredQuestions }
        })
        .sort((a, b) => b.score - a.score)

    const rankedPlayers = []
    for (let i = 0; i < sortedPlayers.length; i++) {
        if (i > 0 && sortedPlayers[i].score === sortedPlayers[i - 1].score) {
            rankedPlayers.push({ ...sortedPlayers[i], position: rankedPlayers[i - 1].position })
        } else {
            rankedPlayers.push({ ...sortedPlayers[i], position: i + 1 })
        }
    }
    return rankedPlayers
})

const setCorrectAnswer = async (questionId, optionId) => {
    const correctAnswersRef = doc(db, 'system', 'correctAnswers')
    const newCorrectAnswers = { ...correctAnswers.value, [questionId]: optionId }
    await setDoc(correctAnswersRef, newCorrectAnswers)
}

const nextQuestion = () => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++
    }
}

const prevQuestion = () => {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--
    }
}
</script>

<style>
.list-move,
.list-enter-active,
.list-leave-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.list-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.list-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.list-enter-active {
    transition-delay: calc(var(--i) * 0.05s);
}

.list-leave-active {
    position: absolute;
    right: 0;
    left: 0;
}

/* Nordic typography */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    letter-spacing: -0.01em;
}

/* Clean focus states */
button:focus,
div[role="button"]:focus {
    outline: 2px solid #374151;
    outline-offset: 2px;
}

/* Subtle shadows */
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Minimal scrollbar */
.space-y-1::-webkit-scrollbar {
    width: 6px;
}

.space-y-1::-webkit-scrollbar-track {
    background: transparent;
}

.space-y-1::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

.space-y-1::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}
</style>
