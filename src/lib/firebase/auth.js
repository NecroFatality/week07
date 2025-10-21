// Import necessary Firebase authentication functions
import {
  GoogleAuthProvider,          // Used to create a Google sign-in provider
  signInWithPopup,             // Used to sign in a user with a popup window
  onAuthStateChanged as _onAuthStateChanged, // Listen to auth state changes
  onIdTokenChanged as _onIdTokenChanged,     // Listen to ID token changes
} from "firebase/auth";

// Import the initialized Firebase Auth instance from your client app
import { auth } from "@/src/lib/firebase/clientApp";

// Wrap Firebase's onAuthStateChanged to use your app's auth instance
export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb); // Call the original Firebase function
}

// Wrap Firebase's onIdTokenChanged to use your app's auth instance
export function onIdTokenChanged(cb) {
  return _onIdTokenChanged(auth, cb); // Call the original Firebase function
}

// Function to sign in a user with Google
export async function signInWithGoogle() {
  // Create a new Google sign-in provider instance
  const provider = new GoogleAuthProvider();

  try {
    // Open a popup for the user to sign in with Google
    await signInWithPopup(auth, provider);
  } catch (error) {
    // Log any errors that occur during sign-in
    console.error("Error signing in with Google", error);
  }
}

// Function to sign out the currently signed-in user
export async function signOut() {
  try {
    // Call Firebase Auth's signOut method
    return auth.signOut();
  } catch (error) {
    // Log any errors that occur during sign-out
    console.error("Error signing out with Google", error);
  }
}
