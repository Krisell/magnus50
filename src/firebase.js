import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: 'AIzaSyA0a3N7Q_JDx4znHi-6eQfsW3r9BSwdrLQ',
    authDomain: 'magnuskrisell50.firebaseapp.com',
    projectId: 'magnuskrisell50',
    storageBucket: 'magnuskrisell50.firebasestorage.app',
    messagingSenderId: '379450567076',
    appId: '1:379450567076:web:01c46409ec28c7ba2db931',
    measurementId: 'G-9X4NH5Z4W8',
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
