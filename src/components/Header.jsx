// This directive tells Next.js that this file is a **Client Component**.
// Client Components can use hooks like useEffect and interact with the browser.
"use client";

// Import React and useEffect hook for managing side effects
import React, { useEffect } from "react";

// Import Next.js Link component for client-side navigation
import Link from "next/link";

// Import Firebase authentication helpers for Google sign-in, sign-out, and token monitoring
import {
  signInWithGoogle,
  signOut,
  onIdTokenChanged,
} from "@/src/lib/firebase/auth.js";

// Import a helper to add fake restaurants and reviews (for demo/testing)
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";

// Import cookie management functions from cookies-next
import { setCookie, deleteCookie } from "cookies-next";

// Custom React hook to manage the user session
function useUserSession(initialUser) {
  // useEffect runs after the component mounts
  useEffect(() => {
    // Listen for Firebase authentication token changes
    return onIdTokenChanged(async (user) => {
      if (user) {
        // If a user is signed in, get their ID token
        const idToken = await user.getIdToken();
        // Store the token in a cookie called "__session"
        await setCookie("__session", idToken);
      } else {
        // If no user, delete the session cookie
        await deleteCookie("__session");
      }

      // If the current user hasn't changed, do nothing
      if (initialUser?.uid === user?.uid) {
        return;
      }

      // Otherwise, reload the page to reflect the new authentication state
      window.location.reload();
    });
  }, [initialUser]); // Only re-run effect if initialUser changes

  // Return the current user object for use in the component
  return initialUser;
}

// Default export: Header component
// Accepts an initialUser prop (from server-side or parent component)
export default function Header({ initialUser }) {
  // Use the custom hook to get the current user
  const user = useUserSession(initialUser);

  // Handle sign-out action
  const handleSignOut = (event) => {
    event.preventDefault(); // Prevent default link behavior
    signOut(); // Call Firebase sign-out function
  };

  // Handle sign-in action
  const handleSignIn = (event) => {
    event.preventDefault(); // Prevent default link behavior
    signInWithGoogle(); // Call Firebase Google sign-in function
  };

  return (
    <header>
      {/* Logo link to home page */}
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        Friendly Eats
      </Link>

      {/* If user is signed in */}
      {user ? (
        <>
          <div className="profile">
            <p>
              {/* Display user's profile image or a placeholder */}
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              />
              {/* Display user's display name */}
              {user.displayName}
            </p>

            {/* Dropdown menu for user actions */}
            <div className="menu">
              ...
              <ul>
                <li>{user.displayName}</li>

                {/* Add fake restaurants for testing */}
                <li>
                  <a href="#" onClick={addFakeRestaurantsAndReviews}>
                    Add sample restaurants
                  </a>
                </li>

                {/* Sign out link */}
                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        // If no user is signed in, show sign-in link
        <div className="profile">
          <a href="#" onClick={handleSignIn}>
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}
