import { Card, PlayType } from "@/types/game";

export const compareCards = (card1: Card, card2: Card): number => {
  return card1.order - card2.order;
};

export const sortCards = (cards: Card[]): Card[] => {
  return [...cards].sort(compareCards);
};

export const dealCards = (deck: Card[]): Card[][] => {
  const hands: Card[][] = [[], [], [], []];
  for (let i = 0; i < deck.length; i++) {
    hands[i % 4].push(deck[i]);
  }
  return hands.map((hand) => sortCards(hand));
};

export const findStartingPlayer = (hands: Card[][]): number => {
  return hands.findIndex(hand => 
    hand.some(card => card.suit === "spade" && card.rank === "3")
  );
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