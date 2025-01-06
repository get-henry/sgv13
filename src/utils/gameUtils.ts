import { Card, PlayType } from "@/types/game";
import { RANKS } from "./cardUtils";

export const isValidPlay = (
  selectedCards: Card[],
  lastPlay: { playType: PlayType; cards: Card[] } | null
): boolean => {
  if (!lastPlay) return true;
  
  const playType = getPlayType(selectedCards);
  if (!playType || playType !== lastPlay.playType) return false;
  
  const highestNewCard = selectedCards.reduce((prev, curr) => 
    compareCards(prev, curr) > 0 ? prev : curr
  );
  
  const highestLastCard = lastPlay.cards.reduce((prev, curr) =>
    compareCards(prev, curr) > 0 ? prev : curr
  );
  
  return compareCards(highestNewCard, highestLastCard) > 0;
};

export const getPlayType = (cards: Card[]): PlayType | null => {
  if (!cards.length) return null;
  
  if (cards.length === 1) return "single";
  
  if (cards.length === 2 && cards[0].rank === cards[1].rank) {
    return "pair";
  }
  
  if (cards.length === 3 && cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank) {
    return "triple";
  }
  
  if (cards.length === 4 && cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank && cards[2].rank === cards[3].rank) {
    return "four";
  }

  // Check for straight (3 or more consecutive cards)
  if (cards.length >= 3) {
    const sortedCards = [...cards].sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank));
    let isConsecutive = true;
    for (let i = 1; i < sortedCards.length; i++) {
      const prevRankIndex = RANKS.indexOf(sortedCards[i - 1].rank);
      const currentRankIndex = RANKS.indexOf(sortedCards[i].rank);
      if (currentRankIndex - prevRankIndex !== 1) {
        isConsecutive = false;
        break;
      }
    }
    if (isConsecutive) return "straight";
  }
  
  return null;
};

export const compareCards = (card1: Card, card2: Card): number => {
  return card1.order - card2.order;
};