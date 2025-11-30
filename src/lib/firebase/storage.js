import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { storage } from "@/src/lib/firebase/clientApp";

import { updateGameImageReference } from "@/src/lib/firebase/firestore";

export async function updateGameImage(gameId, image) {
    try {
      if (!gameId) {
        throw new Error("No game ID has been provided.");
      }
  
      if (!image || !image.name) {
        throw new Error("A valid image has not been provided.");
      }
  
      const publicImageUrl = await uploadImage(gameId, image);
      await updateGameImageReference(gameId, publicImageUrl);
  
      return publicImageUrl;
    } catch (error) {
      console.error("Error processing request:", error);
    }
  }

  async function uploadImage(gameId, image) {
    const filePath = `images/${gameId}/${image.name}`;
    const newImageRef = ref(storage, filePath);
    await uploadBytesResumable(newImageRef, image);
  
    return await getDownloadURL(newImageRef);
  }
