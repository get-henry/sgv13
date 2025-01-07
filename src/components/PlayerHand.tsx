import { useState, useEffect } from "react";
import { Card, PlayType } from "@/types/game";
import { PlayingCard } from "./PlayingCard";
import { motion } from "framer-motion";
import { GameStatus } from "./GameStatus";
import { cn } from "@/lib/utils";

interface PlayerHandProps {
  cards: Card[];
  isCurrentPlayer: boolean;
  selectedCards: Card[];
  onCardSelect: (cards: Card[]) => void;
  lastPlay: { playType: PlayType; cards: Card[] } | null;
  position: "bottom" | "left" | "top" | "right";
  playerName: string;
  hasPassed: boolean;
  className?: string;
}

export const PlayerHand = ({
  cards,
  isCurrentPlayer,
  selectedCards,
  onCardSelect,
  lastPlay,
  position,
  playerName,
  hasPassed,
  className,
}: PlayerHandProps) => {
  const [localSelectedCards, setLocalSelectedCards] = useState<Card[]>([]);
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!isCurrentPlayer) {
      setLocalSelectedCards([]);
    }
  }, [isCurrentPlayer]);

  const toggleCardSelection = (card: Card) => {
    if (!isCurrentPlayer || hasPassed) return;

    const isAlreadySelected = localSelectedCards.includes(card);
    const updatedSelection = isAlreadySelected
      ? localSelectedCards.filter(c => c !== card)
      : [...localSelectedCards, card];

    setLocalSelectedCards(updatedSelection);
    onCardSelect(updatedSelection);
  };

  const containerStyles = {
    bottom: "bottom-16 left-1/2 -translate-x-1/2",
    left: "left-16 top-1/2 -translate-y-1/2 rotate-90",
    top: "top-16 left-1/2 -translate-x-1/2 rotate-180",
    right: "right-16 top-1/2 -translate-y-1/2 -rotate-90",
  }[position];

  const nameStyles = {
    bottom: "bottom-4 left-1/2 -translate-x-1/2",
    left: "left-4 top-1/2 -translate-y-1/2",
    top: "top-4 left-1/2 -translate-x-1/2",
    right: "right-4 top-1/2 -translate-y-1/2",
  }[position];

  return (
    <>
      <motion.div
        className={`absolute ${nameStyles} z-20`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <GameStatus 
          playerName={playerName}
          hasPassed={hasPassed}
          isCurrentPlayer={isCurrentPlayer}
        />
      </motion.div>
      <motion.div
        className={cn(
          `absolute ${containerStyles} flex gap-2 w-auto max-w-[600px] overflow-visible z-10`,
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {sortedCards.map((card, index) => (
          <PlayingCard
            key={card.id}
            card={card}
            isSelected={localSelectedCards.includes(card)}
            isPlayable={isCurrentPlayer && !hasPassed}
            onClick={() => toggleCardSelection(card)}
            dealDelay={index * 0.1}
            className={position === "left" || position === "right" ? "rotate-90" : ""}
          />
        ))}
      </motion.div>
    </>
  );
};