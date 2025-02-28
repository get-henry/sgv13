export type Suit = "spade" | "club" | "diamond" | "heart";
export type Rank = "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A" | "2";

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
  order: number;
}

export interface Player {
  id: string;
  name: string;
  cards: Card[];
  isCurrentTurn: boolean;
  isAI: boolean;
  gamesWon: number;
  hasPassed?: boolean;
}

export type PlayType = "Single" | "Pair" | "Triple" | "Four" | "Straight" | "Consecutive-pairs";

export interface GameState {
  players: Player[];
  currentPlayerId: string;
  lastPlay: {
    playType: PlayType;
    cards: Card[];
    playerId: string;
  } | null;
  gameStatus: "waiting" | "playing" | "finished" | "replay";
  winner: string | null;
  gameHistory: {
    playerId: string;
    cards: Card[];
    playType: PlayType;
    timestamp: number;
  }[];
  consecutivePasses: number;
  lastPlayerId: string | null;
  completedGames: GameHistoryEntry[];
}

export interface GameHistoryEntry {
  winner: string;
  players: Player[];
  plays: {
    playerId: string;
    cards: Card[];
    playType: PlayType;
    timestamp: number;
  }[];
  timestamp: number;
}
