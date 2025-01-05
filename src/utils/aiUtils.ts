import { Card, PlayType, GameState } from "@/types/game";
import { getPlayType, isValidPlay } from "./gameUtils";

// Helper function to group cards by rank
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

// Find all possible plays for the current game state
const findPossiblePlays = (cards: Card[], lastPlay: GameState['lastPlay']): Card[][] => {
  console.log('AI - Finding possible plays', { cards, lastPlay });
  const possiblePlays: Card[][] = [];
  const groups = groupCardsByRank(cards);

  // If it's the first play, find plays containing 3 of Spades
  if (!lastPlay) {
    const threeOfSpades = cards.find(card => card.suit === "spade" && card.rank === "3");
    if (!threeOfSpades) return [];

    // Add single play
    possiblePlays.push([threeOfSpades]);

    // Add pairs containing 3 of Spades
    Object.values(groups).forEach(group => {
      if (group.length >= 2 && group.some(card => card.suit === "spade" && card.rank === "3")) {
        possiblePlays.push(group.slice(0, 2));
      }
    });

    return possiblePlays;
  }

  // For subsequent plays, find valid combinations
  Object.values(groups).forEach(group => {
    // Try single cards
    group.forEach(card => {
      const play = [card];
      if (isValidPlay(play, lastPlay)) {
        possiblePlays.push(play);
      }
    });

    // Try pairs if the last play was a pair
    if (lastPlay.playType === "pair" && group.length >= 2) {
      const play = group.slice(0, 2);
      if (isValidPlay(play, lastPlay)) {
        possiblePlays.push(play);
      }
    }
  });

  console.log('AI - Found possible plays:', possiblePlays);
  return possiblePlays;
};

// Main AI function to determine the next play
export const determineAIPlay = (gameState: GameState, playerId: string): Card[] | null => {
  console.log('AI - Determining play for player:', playerId);
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return null;

  const possiblePlays = findPossiblePlays(player.cards, gameState.lastPlay);
  
  if (possiblePlays.length === 0) {
    console.log('AI - No valid plays available, will pass');
    return null;
  }

  // Simple strategy: Play the lowest valid combination
  const selectedPlay = possiblePlays[0];
  console.log('AI - Selected play:', selectedPlay);
  return selectedPlay;
};