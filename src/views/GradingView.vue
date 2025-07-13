<template>
    <div class="p-8">
        <div v-if="currentQuestion" class="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 class="text-2xl font-semibold mb-4">
                Fråga {{ currentQuestionIndex + 1 }} av {{ questions.length }}
            </h2>
            <p class="text-lg mb-4">{{ currentQuestion.question }}</p>
            <div class="grid grid-cols-2 gap-4">
                <div
                    v-for="option in currentQuestion.options"
                    :key="option.id"
                    @click="setCorrectAnswer(currentQuestion.id, option.id)"
                    :class="[
                        'p-4 rounded-lg cursor-pointer border-2',
                        correctAnswers[currentQuestion.id] === option.id
                            ? 'bg-green-200 border-green-500'
                            : 'bg-gray-100 hover:bg-gray-200 border-gray-300',
                    ]"
                >
                    {{ option.text }}
                </div>
            </div>
            <div class="flex justify-between mt-6">
                <button
                    @click="prevQuestion"
                    :disabled="currentQuestionIndex === 0"
                    class="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg cursor-pointer disabled:bg-gray-300"
                >
                    Föregående
                </button>
                <button
                    @click="nextQuestion"
                    :disabled="currentQuestionIndex === questions.length - 1"
                    class="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg cursor-pointer disabled:bg-gray-300"
                >
                    Nästa
                </button>
            </div>
        </div>
        <div v-else class="bg-white p-6 rounded-lg shadow-md mb-8 text-center">
            <h2 class="text-2xl font-semibold mb-4">Lycka till!</h2>
            <p class="text-lg mb-4">När alla är klara så rättar vi – Magnus har svaren!</p>
            <button
                @click="startGrading"
                class="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg cursor-pointer"
            >
                Starta rättning
            </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-semibold mb-4 text-center">High score</h2>
            <TransitionGroup name="list" tag="ul">
                <li
                    v-for="(player, index) in highScore"
                    :key="player.id"
                    :class="[
                        'flex items-center justify-between p-4 mb-2 border border-gray-200 rounded-lg',
                        getPlayerClass(player),
                    ]"
                    :style="{ '--i': index }"
                >
                    <div class="flex items-center gap-4">
                        <span class="text-lg font-bold w-8">{{ player.position }}.</span>
                        <span class="text-lg"
                            ><span class="text-3xl">{{ getMedal(player.position) }}</span>
                            {{ player.name }}</span
                        >
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="text-sm text-gray-600"
                            >({{ player.answeredQuestions }} besvarade frågor)</span
                        >
                        <span class="text-lg font-bold">{{ player.score }} poäng</span>
                    </div>
                </li>
            </TransitionGroup>
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

const getPlayerClass = (player) => {
    if (!currentQuestion.value) {
        return ''
    }
    const correctAnswer = correctAnswers.value[currentQuestion.value.id]
    if (!correctAnswer) {
        return ''
    }
    const playerAnswer = (player.answers || []).find(
        (answer) => answer.questionId === currentQuestion.value.id
    )
    if (playerAnswer && playerAnswer.answerId === correctAnswer) {
        return 'bg-green-200'
    }
    return ''
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
    transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
.list-leave-active {
    position: absolute;
}
</style>
