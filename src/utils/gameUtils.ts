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

export const dealCards = (deck: Card[]): Card[][] => {
  const hands: Card[][] = [[], [], [], []];
  for (let i = 0; i < deck.length; i++) {
    hands[i % 4].push(deck[i]);
  }
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
  
  // Add more play type validations here
  return null;
};

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

export const findStartingPlayer = (hands: Card[][]): number => {
  return hands.findIndex(hand => 
    hand.some(card => card.suit === "diamond" && card.rank === "3")
  );
};