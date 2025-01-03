import { Card, Suit, Rank, PlayType } from "@/types/game";

const SUITS: Suit[] = ["spade", "club", "diamond", "heart"];
const RANKS: Rank[] = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}`,
      });
    });
  });
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const dealCards = (deck: Card[]): Card[][] => {
  const hands: Card[][] = [[], [], [], []];
  for (let i = 0; i < deck.length; i++) {
    hands[i % 4].push(deck[i]);
  }
  return hands;
};

export const compareCards = (card1: Card, card2: Card): number => {
  const rank1Index = RANKS.indexOf(card1.rank);
  const rank2Index = RANKS.indexOf(card2.rank);
  if (rank1Index !== rank2Index) return rank1Index - rank2Index;
  
  const suit1Index = SUITS.indexOf(card1.suit);
  const suit2Index = SUITS.indexOf(card2.suit);
  return suit1Index - suit2Index;
};

export const isValidPlay = (
  cards: Card[],
  lastPlay: { playType: PlayType; cards: Card[] } | null
): boolean => {
  if (!lastPlay) return true;
  
  // Implement complex validation logic here based on game rules
  // This is a simplified version
  if (cards.length !== lastPlay.cards.length) return false;
  
  const highestNewCard = cards.reduce((prev, curr) => 
    compareCards(prev, curr) > 0 ? prev : curr
  );
  
  const highestLastCard = lastPlay.cards.reduce((prev, curr) =>
    compareCards(prev, curr) > 0 ? prev : curr
  );
  
  return compareCards(highestNewCard, highestLastCard) > 0;
};

export const findStartingPlayer = (hands: Card[][]): number => {
  const lowestCard = { suit: "spade" as Suit, rank: "3" as Rank, id: "spade-3" };
  return hands.findIndex(hand => 
    hand.some(card => card.suit === lowestCard.suit && card.rank === lowestCard.rank)
  );
};