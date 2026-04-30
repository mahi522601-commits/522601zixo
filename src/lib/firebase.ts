import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseInfo = {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
};

export const app = initializeApp(firebaseConfig);

// Connect to a specific database if provided, otherwise fallback to the (default) database
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
