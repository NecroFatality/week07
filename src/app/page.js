// Import the RestaurantListings component from your components folder
// This component will render the list of restaurants on the page
import RestaurantListings from "@/src/components/RestaurantListings.jsx";

// Import a helper function that fetches restaurants from Firestore
import { getRestaurants } from "@/src/lib/firebase/firestore.js";

// Import a helper to get a server-side authenticated Firebase app
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";

// Import Firestore functions from the Firebase SDK
import { getFirestore } from "firebase/firestore";

// Force Next.js to treat this route as server-side rendered (SSR)
// Without this, Next.js might pre-render a static HTML file at build time
export const dynamic = "force-dynamic";

// Another option to force SSR is to disable revalidation (commented out here)
// export const revalidate = 0;

// Default export: the Home page component, defined as an async function
// This is a Server Component because it fetches data on the server
export default async function Home(props) {
  // Extract query parameters from the URL, provided by Next.js
  // Example URL: /?city=London&category=Indian&sort=Review
  const searchParams = await props.searchParams;

  // Get a Firebase app instance authenticated for the current user
  const { firebaseServerApp } = await getAuthenticatedAppForUser();

  // Fetch restaurants from Firestore using the authenticated app and search parameters
  const restaurants = await getRestaurants(
    getFirestore(firebaseServerApp), // get Firestore instance for the app
    searchParams                     // pass query parameters to filter results
  );

  // Render the main page
  return (
    <main className="main__home">
      {/* Render the RestaurantListings component with initial data */}
      <RestaurantListings
        initialRestaurants={restaurants} // pass fetched restaurants
        searchParams={searchParams}      // pass search parameters for filtering
      />
    </main>
  );
}
