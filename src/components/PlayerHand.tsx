import { useState, useEffect } from "react";
import { Card, PlayType } from "@/types/game";
import { PlayingCard } from "./PlayingCard";
import { motion } from "framer-motion";

interface PlayerHandProps {
  cards: Card[];
  isCurrentPlayer: boolean;
  selectedCards: Card[];
  onCardSelect: (cards: Card[]) => void;
  lastPlay: { playType: PlayType; cards: Card[] } | null;
  position: "bottom" | "left" | "top" | "right";
  playerName: string;
}

export const PlayerHand = ({
  cards,
  isCurrentPlayer,
  selectedCards,
  onCardSelect,
  lastPlay,
  position,
  playerName,
}: PlayerHandProps) => {
  const [localSelectedCards, setLocalSelectedCards] = useState<Card[]>([]);

  useEffect(() => {
    if (!isCurrentPlayer) {
      setLocalSelectedCards([]);
    }
  }, [isCurrentPlayer]);

  const toggleCardSelection = (card: Card) => {
    if (!isCurrentPlayer) return;

    const isAlreadySelected = localSelectedCards.includes(card);
    const updatedSelection = isAlreadySelected
      ? localSelectedCards.filter(c => c !== card)
      : [...localSelectedCards, card];

    setLocalSelectedCards(updatedSelection);
    onCardSelect(updatedSelection);
  };

  const containerStyles = {
    bottom: "bottom-4 md:bottom-16 left-1/2 -translate-x-1/2",
    left: "left-4 md:left-16 top-1/2 -translate-y-1/2 rotate-90",
    top: "top-4 md:top-16 left-1/2 -translate-x-1/2 rotate-180",
    right: "right-4 md:right-16 top-1/2 -translate-y-1/2 -rotate-90",
  }[position];

  const cardScale = position === "bottom" ? "scale-75 md:scale-100" : "scale-50 md:scale-75";

  return (
    <motion.div
      className={`absolute ${containerStyles} flex gap-1 md:gap-2 w-auto max-w-[80vw] md:max-w-[600px] overflow-visible z-10`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {cards.map((card, index) => (
        <div key={card.id} className={cardScale}>
          <PlayingCard
            card={card}
            isSelected={localSelectedCards.includes(card)}
            isPlayable={isCurrentPlayer}
            onClick={() => toggleCardSelection(card)}
            dealDelay={index * 0.1}
            className={position === "left" || position === "right" ? "rotate-90" : ""}
          />
        </div>
      ))}
    </motion.div>
  );
};