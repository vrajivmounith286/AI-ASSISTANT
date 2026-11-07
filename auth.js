// ===== Firebase Authentication =====
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Check for redirect result on page load (in case redirect sign-in was used)
if (typeof auth !== 'undefined' && auth && auth.getRedirectResult) {
    auth.getRedirectResult().then(result => {
        if (result && result.user) {
            window.location.href = 'chat.html';
        }
    }).catch(error => {
        console.error('Redirect sign-in error:', error);
    });
}

// Sign in with Google (Popup with automatic fallback to Redirect)
async function signInWithGoogle() {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        localStorage.removeItem('app_mode');
        if (result && result.user) {
            window.location.href = 'chat.html';
        }
        return result.user;
    } catch (error) {
        console.error('Google sign-in error:', error);
        // If popup was blocked, closed, or cancelled, automatically switch to full-page redirect
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
            console.warn('Popup blocked or closed, automatically redirecting...');
            await auth.signInWithRedirect(googleProvider);
            return;
        }
        if (error.code === 'auth/operation-not-allowed') {
            throw new Error('Google Sign-In is NOT enabled in your Firebase Console yet! Go to Firebase Console → Authentication → Sign-in method → Enable Google.');
        }
        if (error.code === 'auth/unauthorized-domain') {
            throw new Error(`Domain (${window.location.hostname}) is NOT authorized in Firebase! Go to Firebase Console → Authentication → Settings → Authorized domains → Add "${window.location.hostname}".`);
        }
        if (error.code === 'auth/network-request-failed') {
            throw new Error('Network error. Check your internet connection.');
        }
        throw new Error(error.message || 'Sign-in failed. Please try again.');
    }
}

// Sign in with Google (Direct Redirect - no popup needed)
async function signInWithGoogleRedirect() {
    try {
        await auth.signInWithRedirect(googleProvider);
    } catch (error) {
        console.error('Google redirect error:', error);
        if (error.code === 'auth/unauthorized-domain') {
            throw new Error(`Domain (${window.location.hostname}) is NOT authorized in Firebase! Go to Firebase Console → Authentication → Settings → Authorized domains → Add "${window.location.hostname}".`);
        }
        throw new Error(error.message || 'Redirect failed.');
    }
}

// Sign in with Email & Password
async function signInWithEmail(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        localStorage.removeItem('app_mode');
        if (result && result.user) {
            window.location.href = 'chat.html';
        }
        return result.user;
    } catch (error) {
        console.error('Email sign-in error:', error);
        if (error.code === 'auth/operation-not-allowed') {
            throw new Error('Email/Password is NOT enabled in Firebase Console → Authentication → Sign-in method.');
        }
        if (error.code === 'auth/user-not-found') throw new Error('No account found with this email.');
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') throw new Error('Incorrect password. Please try again.');
        if (error.code === 'auth/invalid-email') throw new Error('Invalid email address.');
        if (error.code === 'auth/too-many-requests') throw new Error('Too many attempts. Try again later.');
        throw new Error(error.message || 'Sign-in failed.');
    }
}

// Register with Email & Password
async function registerWithEmail(email, password) {
    try {
        window._skipAuthRedirect = true;
        const result = await auth.createUserWithEmailAndPassword(email, password);
        // Sign out immediately — user must log in manually
        await auth.signOut();
        window._skipAuthRedirect = false;
        return result.user;
    } catch (error) {
        window._skipAuthRedirect = false;
        console.error('Registration error:', error);
        if (error.code === 'auth/email-already-in-use') throw new Error('An account already exists with this email.');
        if (error.code === 'auth/weak-password') throw new Error('Password too weak. Use at least 6 characters.');
        if (error.code === 'auth/invalid-email') throw new Error('Invalid email address.');
        throw new Error(error.message || 'Registration failed.');
    }
}

// Reset Password
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
    } catch (error) {
        console.error('Password reset error:', error);
        if (error.code === 'auth/user-not-found') throw new Error('No account found with this email.');
        if (error.code === 'auth/invalid-email') throw new Error('Invalid email address.');
        throw new Error(error.message || 'Failed to send reset email.');
    }
}

// Sign out
async function signOutUser() {
    try {
        localStorage.removeItem('app_mode');
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Sign-out error:', error);
        window.location.href = 'index.html';
    }
}
window.signOutUser = signOutUser;

// Get current user's ID token
async function getIdToken() {
    const user = auth.currentUser;
    if (!user) return null;
    try { 
        return await user.getIdToken(); 
    } catch (e) { 
        console.error('Token error:', e); 
        return null; 
    }
}

// Auth guard — redirect to login if not signed in
function requireAuth(callback) {
    auth.onAuthStateChanged((user) => {
        if (user) {
            callback(user);
        } else {
            window.location.href = 'index.html';
        }
    });
}

// Redirect if already logged in (for login page)
function redirectIfLoggedIn() {
    auth.onAuthStateChanged((user) => {
        if (user && !window._skipAuthRedirect) {
            window.location.href = 'chat.html';
        }
    });
}
