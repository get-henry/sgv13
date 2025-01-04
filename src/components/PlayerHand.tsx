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
  const sortedCards = sortCards(cards);

  const toggleCardSelection = (card: Card) => {
    if (!isCurrentPlayer) return;

    const isAlreadySelected = localSelectedCards.includes(card);
    const updatedSelection = isAlreadySelected
      ? localSelectedCards.filter(c => c !== card)
      : [...localSelectedCards, card];

    console.log("Updated selection:", updatedSelection);
    
    setLocalSelectedCards(updatedSelection);
    onCardSelect(updatedSelection);
  };

  const containerStyles = {
    bottom: "bottom-4 left-1/2 -translate-x-1/2",
    left: "left-32 top-1/2 -translate-y-1/2 rotate-90",
    top: "top-4 left-1/2 -translate-x-1/2 rotate-180",
    right: "right-32 top-1/2 -translate-y-1/2 -rotate-90",
  }[position];

  return (
    <motion.div
      className={`absolute ${containerStyles} flex gap-2 w-auto max-w-[600px] overflow-visible z-10`}
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