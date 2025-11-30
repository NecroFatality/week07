"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase config for local development
// In Firebase App Hosting, this is auto-injected
const firebaseConfig = {
  apiKey: "AIzaSyB0Kidx_9T5F9gqFLvRWykqP-Efoy3e-6U",
  authDomain: "friendlygames-codelabs.firebaseapp.com",
  projectId: "friendlygames-codelabs",
  storageBucket: "friendlygames-codelabs.firebasestorage.app",
  messagingSenderId: "214640590410",
  appId: "1:214640590410:web:6a281d8fda03abb4abf0b3"
};

// Initialize Firebase only if it hasn't been initialized yet
export const firebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
