// Enforce that this code can **only run on the server**
import "server-only";

import { cookies } from "next/headers";
import { initializeServerApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase config - same as clientApp
const firebaseConfig = {
  apiKey: "AIzaSyB0Kidx_9T5F9gqFLvRWykqP-Efoy3e-6U",
  authDomain: "friendlygames-codelabs.firebaseapp.com",
  projectId: "friendlygames-codelabs",
  storageBucket: "friendlygames-codelabs.firebasestorage.app",
  messagingSenderId: "214640590410",
  appId: "1:214640590410:web:6a281d8fda03abb4abf0b3"
};

// Function to get a Firebase app authenticated for the current user
export async function getAuthenticatedAppForUser() {
  const authIdToken = (await cookies()).get("__session")?.value;

  const firebaseServerApp = initializeServerApp(
    firebaseConfig,
    {
      authIdToken,
    }
  );

  const auth = getAuth(firebaseServerApp);
  await auth.authStateReady();

  return { firebaseServerApp, currentUser: auth.currentUser };
}
