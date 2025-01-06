import { Card } from "@/types/game";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PlayingCardProps {
  card: Card;
  isSelected?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
  className?: string;
  dealDelay?: number;
}

export const PlayingCard = ({
  card,
  isSelected = false,
  isPlayable = true,
  onClick,
  className,
  dealDelay = 0,
}: PlayingCardProps) => {
  const { suit, rank } = card;
  
  const suitSymbol = {
    spade: "♠",
    club: "♣",
    diamond: "♦",
    heart: "♥",
  }[suit];

  return (
    <motion.div
      initial={{ x: -1000, rotate: -540, opacity: 0 }}
      animate={{ x: 0, rotate: 0, opacity: 1 }}
      transition={{ delay: dealDelay, duration: 0.5 }}
      onClick={isPlayable ? onClick : undefined}
      className={cn(
        "relative w-24 h-36 rounded-lg bg-white shadow-lg transition-transform duration-300",
        isSelected ? "border-4 border-blue-500 transform -translate-y-4" : "",
        isPlayable ? "cursor-pointer" : "cursor-default",
        className
      )}
    >
      <div
        className={cn(
          "absolute top-2 left-2 text-lg font-bold",
          (suit === "heart" || suit === "diamond") ? "text-card-heart" : "text-card-spade"
        )}
      >
        {rank}
      </div>
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl",
          (suit === "heart" || suit === "diamond") ? "text-card-heart" : "text-card-spade"
        )}
      >
        {suitSymbol}
      </div>
      <div
        className={cn(
          "absolute bottom-2 right-2 text-lg font-bold rotate-180",
          (suit === "heart" || suit === "diamond") ? "text-card-heart" : "text-card-spade"
        )}
      >
        {rank}
      </div>
    </motion.div>
  );
};