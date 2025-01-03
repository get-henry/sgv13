import { Card } from "@/types/game";
import { PlayingCard } from "./PlayingCard";
import { motion } from "framer-motion";

interface PlayerHandProps {
  cards: Card[];
  isCurrentPlayer: boolean;
  selectedCards: Card[];
  onCardSelect: (card: Card) => void;
  position: "bottom" | "left" | "top" | "right";
}

export const PlayerHand = ({
  cards,
  isCurrentPlayer,
  selectedCards,
  onCardSelect,
  position,
}: PlayerHandProps) => {
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
      {cards.map((card, index) => (
        <PlayingCard
          key={card.id}
          card={card}
          isSelected={selectedCards.includes(card)}
          isPlayable={isCurrentPlayer}
          onClick={() => isCurrentPlayer && onCardSelect(card)}
          dealDelay={index * 0.1}
          className={position === "left" || position === "right" ? "rotate-90" : ""}
        />
      ))}
    </motion.div>
  );
};