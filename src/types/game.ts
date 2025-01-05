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
}

export type PlayType = "single" | "pair" | "triple" | "four" | "straight" | "consecutive-pairs";

export interface GameState {
  players: Player[];
  currentPlayerId: string;
  lastPlay: {
    playType: PlayType;
    cards: Card[];
    playerId: string;
  } | null;
  gameStatus: "waiting" | "playing" | "finished";
  winner: string | null;
  gameHistory: {
    playerId: string;
    cards: Card[];
    playType: PlayType;
    timestamp: number;
  }[];
  consecutivePasses: number;
  lastPlayerId: string | null;
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