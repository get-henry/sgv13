import { useEffect } from "react";
import { GameState, Player } from "@/types/game";
import { createDeck, shuffleDeck } from "@/utils/cardUtils";
import { dealCards, findStartingPlayer } from "@/utils/gameUtils";
import { handleThirteenCardStraight } from "@/utils/straightUtils";
import { toast } from "sonner";

interface GameInitializerProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const GameInitializer = ({ gameState, setGameState }: GameInitializerProps) => {
  const startNewGame = () => {
    // Create and shuffle the deck
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck);
    
    let startingPlayerIndex = gameState.completedGames.length === 0 
      ? findStartingPlayer(hands)
      : gameState.players.findIndex(p => p.id === gameState.winner);
    
    if (startingPlayerIndex === -1) startingPlayerIndex = 0;

    const rotateToBottom = (arr: Player[], startIndex: number) => {
      if (startIndex === 0) return arr;
      const rotated = [...arr];
      while (rotated[0].isAI) {
        rotated.push(rotated.shift()!);
      }
      return rotated;
    };

    const arrangedPlayers = rotateToBottom(
      gameState.players.map((player, index) => ({
        ...player,
        cards: hands[index],
        isCurrentTurn: index === startingPlayerIndex,
      })),
      startingPlayerIndex
    );

    // Check for 13-card straight in any player's hand
    arrangedPlayers.forEach(player => {
      if (handleThirteenCardStraight(player)) {
        // Set the game state to finished with this player as winner
        setGameState(prev => ({
          ...prev,
          players: arrangedPlayers,
          currentPlayerId: arrangedPlayers[startingPlayerIndex].id,
          lastPlay: null,
          gameStatus: "finished",
          winner: player.id,
          gameHistory: [],
          consecutivePasses: 0,
          lastPlayerId: null,
        }));
        return;
      }
    });

    // Only set normal game state if no 13-card straight was found
    setGameState(prev => ({
      ...prev,
      players: arrangedPlayers,
      currentPlayerId: arrangedPlayers[startingPlayerIndex].id,
      lastPlay: null,
      gameStatus: "playing",
      winner: null,
      gameHistory: [],
      consecutivePasses: 0,
      lastPlayerId: null,
    }));

    toast.success("New game started!");
  };

  useEffect(() => {
    startNewGame();
  }, []);

  return null;
};