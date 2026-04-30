import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const docRef = await addDoc(collection(db, "products"), {
      name: "Test",
      category: "Test",
      price: 100,
      details: "Test",
      imageUrl: "https://i.ibb.co/test.jpg",
      imageHost: "imgbb",
      createdAt: serverTimestamp(),
    });
    console.log("Success! Doc ID:", docRef.id);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
