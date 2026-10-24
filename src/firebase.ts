/// <reference types="vite/client" />

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDtzOcdjDPQSgiRyZ7A1MLLQ0FViFi5tfw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "evolvy-8fc9a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "evolvy-8fc9a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "evolvy-8fc9a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "15839757458",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:15839757458:web:4f524427f6619f8ee9924b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
