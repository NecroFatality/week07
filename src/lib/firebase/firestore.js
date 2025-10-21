// Import a helper function to generate fake restaurants and reviews for testing
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

// Import various Firestore functions for interacting with the database
import {
  collection,    // Reference a Firestore collection
  onSnapshot,    // Listen to real-time updates
  query,         // Create queries with filters/order
  getDocs,       // Fetch all documents for a query
  doc,           // Reference a specific document
  getDoc,        // Fetch a single document
  updateDoc,     // Update a document's fields
  orderBy,       // Order query results
  Timestamp,     // Firebase timestamp type
  runTransaction,// Run atomic transactions
  where,         // Add filtering conditions to queries
  addDoc,        // Add a new document to a collection
  getFirestore,  // Get a Firestore instance
} from "firebase/firestore";

// Import the initialized Firestore database instance from the client app
import { db } from "@/src/lib/firebase/clientApp";

// ----------------------
// Function to update the photo URL of a restaurant
export async function updateRestaurantImageReference(
  restaurantId,       // ID of the restaurant document
  publicImageUrl      // URL of the new image
) {
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId); // Get doc reference
  if (restaurantRef) {
    await updateDoc(restaurantRef, { photo: publicImageUrl }); // Update the photo field
  }
}

const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  const restaurant = await transaction.get(docRef);
  const data = restaurant.data();
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  const newAverage = newSumRating / newNumRatings;

  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
  });

  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};

export async function addReviewToRestaurant(db, restaurantId, review) {
  if (!restaurantId) {
          throw new Error("No restaurant ID has been provided.");
  }

  if (!review) {
          throw new Error("A valid review has not been provided.");
  }

  try {
          const docRef = doc(collection(db, "restaurants"), restaurantId);
          const newRatingDocument = doc(
                  collection(db, `restaurants/${restaurantId}/ratings`)
          );

          // corrected line
          await runTransaction(db, transaction =>
                  updateWithRating(transaction, docRef, newRatingDocument, review)
          );
  } catch (error) {
          console.error(
                  "There was an error adding the rating to the restaurant",
                  error
          );
          throw error;
  }
}

// Apply query filters based on search parameters
function applyQueryFilters(q, { category, city, price, sort }) {
  if (category) {
    q = query(q, where("category", "==", category)); // Filter by category
  }
  if (city) {
    q = query(q, where("city", "==", city)); // Filter by city
  }
  if (price) {
    q = query(q, where("price", "==", price.length)); // Filter by price (length?)
  }
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc")); // Sort by average rating descending
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc")); // Sort by number of reviews descending
  }
  return q; // Return the filtered query
}

// ----------------------
// Fetch restaurants from Firestore based on filters
export async function getRestaurants(db = db, filters = {}) {
  let q = query(collection(db, "restaurants")); // Base query: all restaurants
  q = applyQueryFilters(q, filters);           // Apply filters
  const results = await getDocs(q);           // Execute query
  return results.docs.map((doc) => {
    return {
      id: doc.id,                              // Include document ID
      ...doc.data(),                           // Include all document fields
      timestamp: doc.data().timestamp.toDate(), // Convert Firestore timestamp to JS Date
    };
  });
}

// ----------------------
// Real-time snapshot listener for restaurants
export function getRestaurantsSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  let q = query(collection(db, "restaurants")); // Base query
  q = applyQueryFilters(q, filters);           // Apply filters

  // Listen to real-time updates
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(), // Convert Firestore timestamp to JS Date
      };
    });

    cb(results); // Call the callback with updated data
  });
}

// ----------------------
// Fetch a single restaurant by ID
export async function getRestaurantById(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }
  const docRef = doc(db, "restaurants", restaurantId); // Get doc reference
  const docSnap = await getDoc(docRef);              // Fetch document
  return {
    ...docSnap.data(),                                // Spread document fields
    timestamp: docSnap.data().timestamp.toDate(),    // Convert timestamp
  };
}

// Placeholder for getting real-time snapshot of a single restaurant
export function getRestaurantSnapshotById(restaurantId, cb) {
  return; // Function not implemented yet
}

// ----------------------
// Fetch all reviews for a restaurant
export async function getReviewsByRestaurantId(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Query the "ratings" subcollection for the restaurant, ordered by timestamp
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  const results = await getDocs(q); // Fetch documents
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Real-time listener for reviews of a restaurant
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  // Listen to real-time updates and pass results to callback
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    cb(results);
  });
}

// ----------------------
// Add fake restaurants and reviews to Firestore (for testing/demo purposes)
export async function addFakeRestaurantsAndReviews() {
  const data = await generateFakeRestaurantsAndReviews(); // Generate sample data
  for (const { restaurantData, ratingsData } of data) {
    try {
      // Add restaurant document
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      // Add ratings subcollection for each restaurant
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
