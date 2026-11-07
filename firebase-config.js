// ===== Firebase Configuration =====
// Configured for Project: ai-assistant-86e01

const firebaseConfig = {
    apiKey: "AIzaSyDSzs_gJc0HSf0ryXBAPXuL7WtXj0k-8P4",
    authDomain: "ai-assistant-86e01.firebaseapp.com",
    projectId: "ai-assistant-86e01",
    storageBucket: "ai-assistant-86e01.firebasestorage.app",
    messagingSenderId: "148093602335",
    appId: "1:148093602335:web:fc4d4c5667d4c4022da32a",
    measurementId: "G-0S0FC1D2VD"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
window.auth = auth;
window.firebaseConfig = firebaseConfig;

// Ensure local persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
    console.warn('Auth persistence warning:', err);
});

// Firestore is only available on pages that load the Firestore SDK (chat.html)
const db = typeof firebase.firestore === 'function' ? firebase.firestore() : null;
window.db = db;

// Enable offline persistence for Firestore (chat history works offline too)
if (db) {
    db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Firestore persistence: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
            console.warn('Firestore persistence: Browser not supported');
        }
    });
}
