import { Card, Player } from "@/types/game";
import { getRankValue } from "./gameUtils";
import { toast } from "sonner";

export const isValidStraight = (cards: Card[]): boolean => {
  if (cards.length < 3) return false;
  
  const sortedCards = [...cards].sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank));
  
  // Check if ranks are consecutive
  for (let i = 1; i < sortedCards.length; i++) {
    if (getRankValue(sortedCards[i].rank) - getRankValue(sortedCards[i - 1].rank) !== 1) {
      return false;
    }
  }
  
  return true;
};

export const checkForThirteenCardStraight = (player: Player): boolean => {
  if (player.cards.length !== 13) return false;
  
  const sortedCards = [...player.cards].sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank));
  
  // Check if all 13 cards form a straight
  for (let i = 1; i < sortedCards.length; i++) {
    if (getRankValue(sortedCards[i].rank) - getRankValue(sortedCards[i - 1].rank) !== 1) {
      return false;
    }
  }
  
  return true;
};

export const handleThirteenCardStraight = (player: Player): void => {
  if (checkForThirteenCardStraight(player)) {
    toast.success(`🎉 INCREDIBLE! ${player.name} has a 13-card straight! Automatic win!`, {
      duration: 5000,
      style: {
        background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
        color: 'white',
        fontSize: '1.1em'
      }
    });
  }
};