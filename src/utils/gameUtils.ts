import { Card, Suit, Rank, PlayType } from "@/types/game";

const SUITS: Suit[] = ["spade", "club", "diamond", "heart"];
const RANKS: Rank[] = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];

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
  console.log("Created deck:", deck);
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  console.log("Shuffled deck:", shuffled);
  return shuffled;
};

export const sortCards = (cards: Card[]): Card[] => {
  console.log("Sorting cards:", cards);
  return [...cards].sort((a, b) => a.order - b.order);
};

export const dealCards = (deck: Card[]): Card[][] => {
  const hands: Card[][] = [[], [], [], []];
  for (let i = 0; i < deck.length; i++) {
    hands[i % 4].push(deck[i]);
  }
  // Sort each hand by order
  return hands.map((hand) => sortCards(hand));
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
  selectedCards: Card[],
  lastPlay: { playType: PlayType; cards: Card[] } | null
): boolean => {
  if (!lastPlay) return true;
  
  if (selectedCards.length !== lastPlay.cards.length) return false;
  
  const highestNewCard = selectedCards.reduce((prev, curr) => 
    compareCards(prev, curr) > 0 ? prev : curr
  );
  
  const highestLastCard = lastPlay.cards.reduce((prev, curr) =>
    compareCards(prev, curr) > 0 ? prev : curr
  );
  
  const isValid = compareCards(highestNewCard, highestLastCard) > 0;
  console.log("Validating play:", { selectedCards, lastPlay, isValid });
  return isValid;
};

export const findStartingPlayer = (hands: Card[][]): number => {
  // Find the player with the 3 of diamonds
  return hands.findIndex(hand => 
    hand.some(card => card.suit === "diamond" && card.rank === "3")
  );
};