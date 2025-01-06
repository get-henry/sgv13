import { Card, PlayType, GameState } from "@/types/game";
import { getPlayType, isValidPlay } from "./gameUtils";
import { RANKS } from "./cardUtils";

const findLowestSingle = (cards: Card[]): Card | null => {
  return [...cards].sort((a, b) => a.order - b.order)[0] || null;
};

const findHighestValidPlay = (cards: Card[], lastPlay: GameState['lastPlay']): Card[] | null => {
  if (!lastPlay) return null;
  
  const possiblePlays = findPossiblePlays(cards, lastPlay);
  return possiblePlays.length > 0 ? possiblePlays[possiblePlays.length - 1] : null;
};

const findBestStraight = (cards: Card[]): Card[] | null => {
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);
  let bestStraight: Card[] = [];
  
  for (let i = 0; i < sortedCards.length - 2; i++) {
    let currentStraight = [sortedCards[i]];
    for (let j = i + 1; j < sortedCards.length; j++) {
      const lastCard = currentStraight[currentStraight.length - 1];
      if (sortedCards[j].order === lastCard.order + 1) {
        currentStraight.push(sortedCards[j]);
      }
    }
    if (currentStraight.length > bestStraight.length && currentStraight.length >= 3) {
      bestStraight = currentStraight;
    }
  }
  
  return bestStraight.length >= 3 ? bestStraight : null;
};

const findPossiblePlays = (cards: Card[], lastPlay: GameState['lastPlay']): Card[][] => {
  const possiblePlays: Card[][] = [];
  const groups = groupCardsByRank(cards);
  
  // Try singles
  cards.forEach(card => {
    const play = [card];
    if (!lastPlay || isValidPlay(play, lastPlay)) {
      possiblePlays.push(play);
    }
  });
  
  // Try pairs and other combinations
  Object.values(groups).forEach(group => {
    if (group.length >= 2) {
      const play = group.slice(0, 2);
      if (!lastPlay || isValidPlay(play, lastPlay)) {
        possiblePlays.push(play);
      }
    }
  });
  
  // Try straights
  const straight = findBestStraight(cards);
  if (straight && (!lastPlay || isValidPlay(straight, lastPlay))) {
    possiblePlays.push(straight);
  }
  
  return possiblePlays;
};

const groupCardsByRank = (cards: Card[]) => {
  const groups: { [key: string]: Card[] } = {};
  cards.forEach(card => {
    if (!groups[card.rank]) {
      groups[card.rank] = [];
    }
    groups[card.rank].push(card);
  });
  return groups;
};

export const determineAIPlay = (gameState: GameState, playerId: string): Card[] | null => {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player || player.hasPassed) return null;
  
  const cards = player.cards;
  const lastPlay = gameState.lastPlay;
  
  // If we can win this round, do it
  const winningPlay = findHighestValidPlay(cards, lastPlay);
  if (winningPlay) {
    // If we have few cards left, try to win to control next round
    if (cards.length <= 4) return winningPlay;
  }
  
  // If starting a new round (no last play)
  if (!lastPlay) {
    // Try to play a straight if possible
    const straight = findBestStraight(cards);
    if (straight) return straight;
    
    // Otherwise play lowest single
    const lowestSingle = findLowestSingle(cards);
    if (lowestSingle) return [lowestSingle];
    
    return null;
  }
  
  // If we must follow a play type
  const possiblePlays = findPossiblePlays(cards, lastPlay);
  if (possiblePlays.length === 0) return null;
  
  // Play lowest valid combination
  return possiblePlays[0];
};
