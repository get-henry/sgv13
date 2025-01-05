import { Card, Suit, Rank } from "@/types/game";

export const SUITS: Suit[] = ["spade", "club", "diamond", "heart"];
export const RANKS: Rank[] = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  RANKS.forEach((rank, rankIndex) => {
    SUITS.forEach((suit, suitIndex) => {
      deck.push({
        suit,
        rank,
        id: `${rank}-${suit}`,
        order: rankIndex * 4 + suitIndex,
      });
    });
  });
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const sortCards = (cards: Card[]): Card[] => {
  return [...cards].sort((a, b) => a.order - b.order);
};

export const compareCards = (card1: Card, card2: Card): number => {
  const rank1Index = RANKS.indexOf(card1.rank);
  const rank2Index = RANKS.indexOf(card2.rank);
  if (rank1Index !== rank2Index) return rank1Index - rank2Index;
  
  const suit1Index = SUITS.indexOf(card1.suit);
  const suit2Index = SUITS.indexOf(card2.suit);
  return suit1Index - suit2Index;
};