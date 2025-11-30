"use client";

// This component shows one individual game
// It receives data from src/app/game/[id]/page.jsx

import { React, useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { getGameSnapshotById } from "@/src/lib/firebase/firestore.js";
import { useUser } from "@/src/lib/getUser";
import GameDetails from "@/src/components/GameDetails.jsx";
import { updateGameImage } from "@/src/lib/firebase/storage.js";

const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

export default function Game({
  id,
  initialGame,
  initialUserId,
  children,
}) {
  const [gameDetails, setGameDetails] = useState(initialGame);
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  const userId = useUser()?.uid || initialUserId;
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });

  const onChange = (value, name) => {
    setReview({ ...review, [name]: value });
  };

  async function handleGameImage(target) {
    const image = target.files ? target.files[0] : null;
    if (!image) {
      return;
    }

    const imageURL = await updateGameImage(id, image);
    setGameDetails({ ...gameDetails, photo: imageURL });
  }

  const handleClose = () => {
    setIsOpen(false);
    setReview({ rating: 0, text: "" });
  };

  useEffect(() => {
    return getGameSnapshotById(id, (data) => {
      setGameDetails(data);
    });
  }, [id]);

  return (
    <>
      <GameDetails
        game={gameDetails}
        userId={userId}
        handleGameImage={handleGameImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </GameDetails>
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}

