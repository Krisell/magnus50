<template>
    <div class="p-8">
        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 class="text-2xl font-semibold mb-4">Spelstatus</h2>
            <div class="flex items-center gap-4">
                <button
                    @click="toggleGameState"
                    :class="[
                        'px-6 py-3 text-white rounded-lg cursor-pointer',
                        gameStarted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
                    ]"
                >
                    {{ gameStarted ? 'Stoppa spelet' : 'Starta spelet' }}
                </button>
                <p class="text-lg">
                    Spelet är:
                    <span
                        :class="[
                            'font-bold',
                            gameStarted ? 'text-green-600' : 'text-red-600',
                        ]"
                        >{{ gameStarted ? 'Startat' : 'Stoppat' }}</span
                    >
                </p>
            </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 class="text-2xl font-semibold mb-4">
                {{ editingQuestionId ? 'Ändra' : 'Lägg till' }}
            </h2>
            <form @submit.prevent="saveQuestion">
                <div class="mb-4">
                    <label for="question-text" class="block text-gray-700 font-medium mb-2"
                        >Frågetext</label
                    >
                    <input
                        type="text"
                        id="question-text"
                        v-model="newQuestion.question"
                        class="w-full p-3 border border-gray-300 rounded-lg"
                        required
                    />
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 font-medium mb-2">Alternativ</label>
                    <div
                        v-for="(option, index) in newQuestion.options"
                        :key="index"
                        class="flex items-center mb-2"
                    >
                        <input
                            type="text"
                            v-model="option.text"
                            class="w-full p-3 border border-gray-300 rounded-lg"
                            required
                        />
                        <button
                            type="button"
                            @click="removeOption(index)"
                            class="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                        >
                            <svg
                                class="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                            </svg>
                        </button>
                    </div>
                    <button
                        type="button"
                        @click="addOption"
                        class="mt-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg cursor-pointer"
                    >
                        Lägg till alternativ
                    </button>
                </div>
                <div class="flex justify-end gap-4">
                    <button
                        type="button"
                        @click="cancelEdit"
                        v-if="editingQuestionId"
                        class="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 cursor-pointer"
                    >
                        Ångra
                    </button>
                    <button
                        type="submit"
                        class="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg cursor-pointer"
                    >
                        {{ editingQuestionId ? 'Ändra fråga' : 'Lägg till fråga' }}
                    </button>
                </div>
            </form>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 class="text-2xl font-semibold mb-4">Inlagda frågor</h2>
            <ul>
                <li
                    v-for="(question, index) in questions"
                    :key="question.id"
                    class="flex items-center justify-between p-4 mb-2 border border-gray-200 rounded-lg"
                >
                    <div class="flex-grow">
                        <p class="font-semibold">{{ question.question }}</p>
                        <ul class="list-disc list-inside pl-4 text-gray-600">
                            <li v-for="option in question.options" :key="option.id">
                                {{ option.text }}
                            </li>
                        </ul>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="flex flex-col">
                            <button
                                @click="moveQuestion(index, -1)"
                                :disabled="index === 0"
                                class="px-2 py-1 text-gray-600 disabled:text-gray-300 hover:text-gray-900 cursor-pointer"
                            >
                                <svg
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M5 15l7-7 7 7"
                                    ></path>
                                </svg>
                            </button>
                            <button
                                @click="moveQuestion(index, 1)"
                                :disabled="index === questions.length - 1"
                                class="px-2 py-1 text-gray-600 disabled:text-gray-300 hover:text-gray-900 cursor-pointer"
                            >
                                <svg
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                        <button
                            @click="editQuestion(question)"
                            class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg cursor-pointer"
                        >
                            Ändra
                        </button>
                        <button
                            @click="deleteQuestion(question)"
                            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                        >
                            Radera
                        </button>
                    </div>
                </li>
            </ul>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-semibold mb-4">Användarsessioner</h2>
            <ul>
                <li
                    v-for="session in sessions"
                    :key="session.firestoreId"
                    class="flex items-center justify-between p-4 mb-2 border border-gray-200 rounded-lg"
                >
                    <div class="flex-grow">
                        <p class="font-semibold">{{ session.name }}</p>
                        <p class="text-gray-600">
                            Antal svar: {{ session.answers ? session.answers.length : 0 }}
                        </p>
                    </div>
                    <button
                        @click="deleteSession(session)"
                        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                    >
                        Radera
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase.js'
import {
    collection,
    query,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    addDoc,
    orderBy,
    setDoc,
} from 'firebase/firestore'

const questions = ref([])
const sessions = ref([])
const newQuestion = ref({ question: '', options: [{ text: '' }, { text: '' }] })
const editingQuestionId = ref(null)
const gameStarted = ref(false)

onMounted(() => {
    const stateRef = doc(db, 'system', 'state')
    onSnapshot(stateRef, (docSnap) => {
        if (docSnap.exists()) {
            gameStarted.value = docSnap.data().started
        } else {
            setDoc(stateRef, { started: false })
            gameStarted.value = false
        }
    })

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
            firestoreSessions.push({ firestoreId: doc.id, ...doc.data() })
        })
        sessions.value = firestoreSessions
    })
})

const toggleGameState = async () => {
    const stateRef = doc(db, 'system', 'state')
    await updateDoc(stateRef, {
        started: !gameStarted.value,
    })
}

const addOption = () => {
    newQuestion.value.options.push({ text: '' })
}

const removeOption = (index) => {
    newQuestion.value.options.splice(index, 1)
}

const resetForm = () => {
    newQuestion.value = {
        question: '',
        options: [{ text: '' }, { text: '' }],
    }
    editingQuestionId.value = null
}

const saveQuestion = async () => {
    const questionData = {
        question: newQuestion.value.question,
        options: newQuestion.value.options.map((opt, index) => ({ id: index + 1, text: opt.text })),
    }

    if (editingQuestionId.value) {
        const questionRef = doc(db, 'questions', editingQuestionId.value)
        await updateDoc(questionRef, questionData)
    } else {
        questionData.order = questions.value.length
        questionData.id = Math.max(...questions.value.map((q) => q.id), 0) + 1

        await addDoc(collection(db, 'questions'), questionData)
    }

    resetForm()
}

const editQuestion = (question) => {
    editingQuestionId.value = question.firestoreId
    newQuestion.value = {
        question: question.question,
        options: question.options.map((opt) => ({ text: opt.text })),
    }
    window.scrollTo(0, 0)
}

const cancelEdit = () => {
    resetForm()
}

const deleteQuestion = (question) => {
    if (!confirm(`Är du säker på att du vill radera denna fråga? ${question.question}`)) {
        return
    }

    deleteDoc(doc(db, 'questions', question.firestoreId))
}

const deleteSession = (session) => {
    if (!confirm(`Är du säker på att du vill radera sessionen för ${session.name}?`)) {
        return
    }
    deleteDoc(doc(db, 'sessions', session.firestoreId))
}

const moveQuestion = async (index, direction) => {
    const questionsInCurrentOrder = [...questions.value].sort((a, b) => a.order - b.order)
    const questionToMove = questionsInCurrentOrder[index]
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= questionsInCurrentOrder.length) return

    questionsInCurrentOrder.splice(index, 1)
    questionsInCurrentOrder.splice(newIndex, 0, questionToMove)

    questionsInCurrentOrder.forEach((q, idx) => {
        q.order = idx
    })

    questionsInCurrentOrder.forEach(async (q) => {
        const questionRef = doc(db, 'questions', q.firestoreId)
        await updateDoc(questionRef, { order: q.order })
    })
}
</script>
