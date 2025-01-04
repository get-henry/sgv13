import { useState } from "react";
import { Card, PlayType } from "@/types/game";
import { PlayingCard } from "./PlayingCard";
import { isValidPlay, sortCards } from "@/utils/gameUtils";
import { motion } from "framer-motion";

interface PlayerHandProps {
  cards: Card[];
  isCurrentPlayer: boolean;
  selectedCards: Card[];
  onCardSelect: (cards: Card[]) => void;
  lastPlay: { playType: PlayType; cards: Card[] } | null;
  position: "bottom" | "left" | "top" | "right";
}

export const PlayerHand = ({
  cards,
  isCurrentPlayer,
  selectedCards,
  onCardSelect,
  lastPlay,
  position,
}: PlayerHandProps) => {
  const [localSelectedCards, setLocalSelectedCards] = useState<Card[]>([]);
  // Sort the cards by order before rendering
  const sortedCards = sortCards(cards);

  // Toggles the selection of a card
  const toggleCardSelection = (card: Card) => {
    if (!isCurrentPlayer) return; // Disable selection if it's not the player's turn

    const isAlreadySelected = localSelectedCards.includes(card);
    console.log("Toggling card selection:", card);
    const updatedSelection = isAlreadySelected
      ? localSelectedCards.filter((c) => c !== card)
      : [...localSelectedCards, card];
    console.log("Current selected cards:", updatedSelection);
    
    // Validate the updated selection
    if (isValidPlay(updatedSelection, lastPlay)) {
      console.log("Valid play:", updatedSelection);
      setLocalSelectedCards(updatedSelection);
      onCardSelect(updatedSelection);
    } else {
      console.log("Invalid play attempt:", updatedSelection);
    }
  };

  const containerStyles = {
    bottom: "bottom-4 left-1/2 -translate-x-1/2",
    left: "left-32 top-1/2 -translate-y-1/2 rotate-90",
    top: "top-4 left-1/2 -translate-x-1/2 rotate-180",
    right: "right-32 top-1/2 -translate-y-1/2 -rotate-90",
  }[position];

  const cardSpacing = "gap-2";
  const handWidth = "w-auto max-w-[600px]";

  return (
    <motion.div
      className={`absolute ${containerStyles} flex ${cardSpacing} ${handWidth} overflow-visible`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {sortedCards.map((card, index) => (
        <PlayingCard
          key={card.id}
          card={card}
          isSelected={localSelectedCards.includes(card)}
          isPlayable={isCurrentPlayer}
          onClick={() => toggleCardSelection(card)}
          dealDelay={index * 0.1}
          className={position === "left" || position === "right" ? "rotate-90" : ""}
        />
      ))}
    </motion.div>
  );
};