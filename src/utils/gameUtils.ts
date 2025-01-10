import { Card, PlayType, Player } from "@/types/game";

export const isValidPlay = (
  selectedCards: Card[],
  lastPlay: { playType: PlayType; cards: Card[] } | null
): boolean => {
  if (!lastPlay) return true;
  
  const playType = getPlayType(selectedCards);
  if (!playType || playType !== lastPlay.playType) return false;

  if (playType === "Straight") {
    const selectedHighestRank = Math.max(...selectedCards.map(c => getRankValue(c.rank)));
    const lastPlayHighestRank = Math.max(...lastPlay.cards.map(c => getRankValue(c.rank)));
    return selectedHighestRank > lastPlayHighestRank;
  }
  
  const highestNewCard = selectedCards.reduce((prev, curr) => 
    compareCards(prev, curr) > 0 ? prev : curr
  );
  
  const highestLastCard = lastPlay.cards.reduce((prev, curr) =>
    compareCards(prev, curr) > 0 ? prev : curr
  );
  
  return compareCards(highestNewCard, highestLastCard) > 0;
};

import { isValidStraight } from "./straightUtils";

export const getPlayType = (cards: Card[]): PlayType | null => {
  if (!cards.length) return null;
  
  if (cards.length === 1) return "Single";
  
  if (cards.length === 2 && cards[0].rank === cards[1].rank) {
    return "Pair";
  }
  
  if (cards.length === 3 && cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank) {
    return "Triple";
  }
  
  if (cards.length === 4 && cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank && cards[2].rank === cards[3].rank) {
    return "Four";
  }

  // Use the new straight validation
  if (cards.length >= 3 && isValidStraight(cards)) {
    return "Straight";
  }

  // Check for consecutive pairs
  if (cards.length >= 6 && cards.length % 2 === 0) {
    const sortedByRank = [...cards].sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank));
    let isConsecutivePairs = true;
    
    for (let i = 0; i < sortedByRank.length; i += 2) {
      if (i + 1 >= sortedByRank.length || sortedByRank[i].rank !== sortedByRank[i + 1].rank) {
        isConsecutivePairs = false;
        break;
      }
      
      if (i + 2 < sortedByRank.length) {
        const currentRankValue = getRankValue(sortedByRank[i].rank);
        const nextRankValue = getRankValue(sortedByRank[i + 2].rank);
        if (nextRankValue - currentRankValue !== 1) {
          isConsecutivePairs = false;
          break;
        }
      }
    }
    
    if (isConsecutivePairs) return "Consecutive-pairs";
  }
  
  return null;
};

export const getRankValue = (rank: string): number => {
  const rankOrder = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];
  return rankOrder.indexOf(rank);
};

export const compareCards = (card1: Card, card2: Card): number => {
  return card1.order - card2.order;
};

export const dealCards = (deck: Card[]): Card[][] => {
  const hands: Card[][] = [[], [], [], []];
  deck.forEach((card, index) => {
    hands[index % 4].push(card);
  });
  return hands;
};

export const findStartingPlayer = (hands: Card[][]): number => {
  for (let i = 0; i < hands.length; i++) {
    if (hands[i].some(card => card.suit === "spade" && card.rank === "3")) {
      return i;
    }
  }
  return 0;
};

export const validateChompPlay = (cards: Card[], lastPlay: { playType: PlayType; cards: Card[] } | null): boolean => {
  if (!lastPlay) return false;
  
  const lastPlayCards = lastPlay.cards;
  if (!lastPlayCards.every(card => card.rank === "2")) return false;

  const playType = getPlayType(cards);
  if (!playType) return false;

  // Single 2 can be chomped by consecutive pairs 3,3,4,4,5,5
  if (lastPlayCards.length === 1 && playType === "Consecutive-pairs" && cards.length === 6) {
    return true;
  }

  // Pair of 2s can be chomped by consecutive pairs 3,3,4,4,5,5,6,6 or four of a kind
  if (lastPlayCards.length === 2) {
    if (playType === "Consecutive-pairs" && cards.length === 8) return true;
    if (playType === "Four" && cards.length === 4) return true;
  }

  // Triple 2s can be chomped by consecutive pairs 3,3,4,4,5,5,6,6,7,7
  if (lastPlayCards.length === 3 && playType === "Consecutive-pairs" && cards.length === 10) {
    return true;
  }

  return false;
};

export const findNextActivePlayer = (players: Player[], currentPlayerIndex: number): number => {
  let nextIndex = currentPlayerIndex;
  let loopCount = 0;
  
  // Loop through players until we find one who hasn't passed or we've checked everyone
  do {
    nextIndex = (nextIndex + 1) % players.length;
    loopCount++;
    
    // If we've checked all players, return the current player
    if (loopCount >= players.length) {
      return currentPlayerIndex;
    }
  } while (players[nextIndex].hasPassed);
  
  return nextIndex;
};
