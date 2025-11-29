import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, type Auth, type User } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  // Force account selection every time
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

export { auth, googleProvider };

/**
 * Sign in with Google OAuth
 * @returns User object with email, displayName, photoURL, uid
 */
export const signInWithGoogle = async (): Promise<User> => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase not initialized. Please check your .env configuration.');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log('✅ Google sign-in successful:', {
      email: user.email,
      name: user.displayName,
      uid: user.uid
    });
    
    return user;
  } catch (error: any) {
    console.error('❌ Google sign-in error:', error);
    
    // User-friendly error messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized. Please configure Firebase authorized domains.');
    } else {
      throw new Error(error.message || 'Failed to sign in with Google.');
    }
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase not initialized.');
  }
  
  try {
    await auth.signOut();
    console.log('✅ Sign-out successful');
  } catch (error) {
    console.error('❌ Sign-out error:', error);
    throw error;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return auth?.currentUser || null;
};

/**
 * Generate deterministic seed phrase from Google user ID
 * This ensures the same wallet is created every time the user logs in
 */
export const generateSeedFromUserId = (userId: string): string => {
  // In production, you should use a more secure method like:
  // 1. PBKDF2 with salt
  // 2. Store encrypted seed in your backend
  // 3. Use HSM (Hardware Security Module)
  
  // For demo purposes, we'll use a simple deterministic generation
  // WARNING: This is NOT cryptographically secure for production!
  
  const hash = Array.from(userId).reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0);
  }, 0);
  
  // Generate 12 word seed phrase (BIP39 wordlist simulation)
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual'
  ];
  
  const seedWords: string[] = [];
  let currentHash = Math.abs(hash);
  
  for (let i = 0; i < 12; i++) {
    const index = currentHash % words.length;
    seedWords.push(words[index]);
    currentHash = Math.floor(currentHash / words.length) + i * 1000;
  }
  
  return seedWords.join(' ');
};

export default { signInWithGoogle, signOut, getCurrentUser, generateSeedFromUserId };
