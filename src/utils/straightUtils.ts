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

export const handleThirteenCardStraight = (player: Player): boolean => {
  console.log("Checking for 13-card straight in player's hand:", player.cards);
  if (checkForThirteenCardStraight(player)) {
    console.log("13-card straight found!");
    // Show multiple toasts in sequence for dramatic effect
    toast.success("🎲 CHECKING HAND...", { duration: 1000 });
    
    setTimeout(() => {
      toast.success("🃏 INCREDIBLE HAND DETECTED!", { duration: 2000 });
    }, 1000);
    
    setTimeout(() => {
      toast.success(`🎉 AMAZING! ${player.name} has a 13-card straight!`, {
        duration: 5000,
        style: {
          background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
          color: 'white',
          fontSize: '1.2em',
          fontWeight: 'bold'
        }
      });
    }, 2000);
    
    setTimeout(() => {
      toast.success("👑 AUTOMATIC WIN!", {
        duration: 5000,
        style: {
          background: 'linear-gradient(to right, #fbbf24, #d97706)',
          color: 'white',
          fontSize: '1.2em',
          fontWeight: 'bold'
        }
      });
    }, 3000);
    
    return true;
  }
  return false;
};