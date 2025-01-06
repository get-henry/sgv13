import { Card, PlayType, GameState } from "@/types/game";
import { getPlayType, isValidPlay } from "./gameUtils";
import { RANKS } from "./cardUtils";

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

const findPossiblePlays = (cards: Card[], lastPlay: GameState['lastPlay'], isFirstGame: boolean): Card[][] => {
  const possiblePlays: Card[][] = [];
  const groups = groupCardsByRank(cards);

  // If it's the first play of the first game, find plays containing 3 of Spades
  if (!lastPlay && isFirstGame) {
    const threeOfSpades = cards.find(card => card.suit === "spade" && card.rank === "3");
    if (!threeOfSpades) return [];
    possiblePlays.push([threeOfSpades]);
    return possiblePlays;
  }

  // For subsequent plays, find valid combinations
  // First try singles (prefer lower cards)
  const sortedCards = [...cards].sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank));
  sortedCards.forEach(card => {
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
  for (let length = 3; length <= 7; length++) {
    for (let i = 0; i <= cards.length - length; i++) {
      const potentialStraight = cards.slice(i, i + length);
      if (getPlayType(potentialStraight) === "straight") {
        if (!lastPlay || isValidPlay(potentialStraight, lastPlay)) {
          possiblePlays.push(potentialStraight);
        }
      }
    }
  }

  return possiblePlays;
};

export const determineAIPlay = (gameState: GameState, playerId: string): Card[] | null => {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return null;

  const isFirstGame = gameState.completedGames.length === 0;
  const possiblePlays = findPossiblePlays(player.cards, gameState.lastPlay, isFirstGame);
  
  if (possiblePlays.length === 0) {
    return null;
  }

  // Prefer lower value plays when possible
  return possiblePlays[0];
};