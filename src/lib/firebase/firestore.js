// Import a helper function to generate fake games and reviews for testing
import { generateFakeGamesAndReviews } from "@/src/lib/fakeGames.js";

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
// Function to update the photo URL of a game
export async function updateGameImageReference(
  gameId,             // ID of the game document
  publicImageUrl      // URL of the new image
) {
  const gameRef = doc(collection(db, "games"), gameId); // Get doc reference
  if (gameRef) {
    await updateDoc(gameRef, { photo: publicImageUrl }); // Update the photo field
  }
}

const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  const game = await transaction.get(docRef);
  const data = game.data();
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

export async function addReviewToGame(db, gameId, review) {
  if (!gameId) {
    throw new Error("No game ID has been provided.");
  }

  if (!review) {
    throw new Error("A valid review has not been provided.");
  }

  try {
    const docRef = doc(collection(db, "games"), gameId);
    const newRatingDocument = doc(
      collection(db, `games/${gameId}/ratings`)
    );

    // corrected line
    await runTransaction(db, transaction =>
      updateWithRating(transaction, docRef, newRatingDocument, review)
    );
  } catch (error) {
    console.error(
      "There was an error adding the rating to the game",
      error
    );
    throw error;
  }
}

// Apply query filters based on search parameters
function applyQueryFilters(q, { genre, platform, price, sort }) {
  if (genre) {
    q = query(q, where("genre", "==", genre)); // Filter by genre
  }
  if (platform) {
    q = query(q, where("platform", "==", platform)); // Filter by platform
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
// Fetch games from Firestore based on filters
export async function getGames(db = db, filters = {}) {
  let q = query(collection(db, "games")); // Base query: all games
  q = applyQueryFilters(q, filters);      // Apply filters
  const results = await getDocs(q);       // Execute query
  return results.docs.map((doc) => {
    return {
      id: doc.id,                              // Include document ID
      ...doc.data(),                           // Include all document fields
      timestamp: doc.data().timestamp.toDate(), // Convert Firestore timestamp to JS Date
    };
  });
}

// ----------------------
// Real-time snapshot listener for games
export function getGamesSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  let q = query(collection(db, "games")); // Base query
  q = applyQueryFilters(q, filters);      // Apply filters

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
// Fetch a single game by ID
export async function getGameById(db, gameId) {
  if (!gameId) {
    console.log("Error: Invalid ID received: ", gameId);
    return;
  }
  const docRef = doc(db, "games", gameId); // Get doc reference
  const docSnap = await getDoc(docRef);    // Fetch document
  return {
    ...docSnap.data(),                              // Spread document fields
    timestamp: docSnap.data().timestamp.toDate(),   // Convert timestamp
  };
}

// Real-time snapshot listener for a single game
export function getGameSnapshotById(gameId, cb) {
  if (!gameId) {
    console.log("Error: Invalid ID received: ", gameId);
    return;
  }

  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  const docRef = doc(db, "games", gameId);
  return onSnapshot(docRef, (docSnap) => {
    cb({
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp.toDate(),
    });
  });
}

// ----------------------
// Fetch all reviews for a game
export async function getReviewsByGameId(db, gameId) {
  if (!gameId) {
    console.log("Error: Invalid gameId received: ", gameId);
    return;
  }

  // Query the "ratings" subcollection for the game, ordered by timestamp
  const q = query(
    collection(db, "games", gameId, "ratings"),
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

// Real-time listener for reviews of a game
export function getReviewsSnapshotByGameId(gameId, cb) {
  if (!gameId) {
    console.log("Error: Invalid gameId received: ", gameId);
    return;
  }

  const q = query(
    collection(db, "games", gameId, "ratings"),
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
// Add fake games and reviews to Firestore (for testing/demo purposes)
export async function addFakeGamesAndReviews() {
  const data = await generateFakeGamesAndReviews(); // Generate sample data
  for (const { gameData, ratingsData } of data) {
    try {
      // Add game document
      const docRef = await addDoc(
        collection(db, "games"),
        gameData
      );

      // Add ratings subcollection for each game
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "games", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
