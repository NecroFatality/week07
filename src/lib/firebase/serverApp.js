// Enforce that this code can **only run on the server**
// Prevents accidental inclusion in client-side bundles
// See Next.js docs for server-only code: 
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import "server-only";

// Import the cookies helper from Next.js for server-side access to cookies
import { cookies } from "next/headers";

// Import Firebase app initialization functions
import { initializeServerApp, initializeApp } from "firebase/app";

// Import Firebase Auth for authentication
import { getAuth } from "firebase/auth";

// ----------------------
// Function to get a Firebase app authenticated for the current user
// This is intended for use in Server Side Rendering (SSR) or Static Site Generation (SSG)
export async function getAuthenticatedAppForUser() {
  // Read the "__session" cookie from the incoming request
  // This cookie contains the Firebase ID token for the signed-in user
  const authIdToken = (await cookies()).get("__session")?.value;

  // Initialize a Firebase Server App using the token from the client
  // This allows server-side code to access Firebase resources as the authenticated user
  // `initializeServerApp` is a server-specific SDK feature
  const firebaseServerApp = initializeServerApp(
    // Initialize a new Firebase App instance
    initializeApp(),
    {
      authIdToken, // Pass the ID token from the cookie
    }
  );

  // Get an Auth instance for the server app
  const auth = getAuth(firebaseServerApp);

  // Wait for the authentication state to be fully initialized
  await auth.authStateReady();

  // Return both the server app and the authenticated user object
  return { firebaseServerApp, currentUser: auth.currentUser };
}
