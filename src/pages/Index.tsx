import { useState, useEffect } from "react";
import { GameState, Card } from "@/types/game";
import { GameTable } from "@/components/GameTable";
import { createDeck, shuffleDeck, dealCards, findStartingPlayer } from "@/utils/gameUtils";
import { toast } from "sonner";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [
      { id: "1", name: "You", cards: [], isCurrentTurn: false, isAI: false },
      { id: "2", name: "AI East", cards: [], isCurrentTurn: false, isAI: true },
      { id: "3", name: "AI North", cards: [], isCurrentTurn: false, isAI: true },
      { id: "4", name: "AI West", cards: [], isCurrentTurn: false, isAI: true },
    ],
    currentPlayerId: "",
    lastPlay: null,
    gameStatus: "waiting",
    winner: null,
  });

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck);
    const startingPlayerIndex = findStartingPlayer(hands);
    
    // Rearrange the hands so that if the human player has the starting hand,
    // they stay at position 0 (bottom). Otherwise, rotate the positions until
    // the human player is at the bottom.
    const rotateToBottom = (arr: any[], startIndex: number) => {
      if (startIndex === 0) return arr;
      const rotated = [...arr];
      while (rotated[0].isAI) {
        rotated.push(rotated.shift());
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

    setGameState(prev => ({
      ...prev,
      players: arrangedPlayers,
      currentPlayerId: arrangedPlayers[startingPlayerIndex].id,
      lastPlay: null,
      gameStatus: "playing",
      winner: null,
    }));

    toast.success("New game started!");
  };

  const handlePlay = (cards: Card[]) => {
    setGameState(prev => {
      const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.currentPlayerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % 4;

      const updatedPlayers = prev.players.map(player => {
        if (player.id === prev.currentPlayerId) {
          const remainingCards = player.cards.filter(
            card => !cards.find(c => c.id === card.id)
          );
          return {
            ...player,
            cards: remainingCards,
            isCurrentTurn: false,
          };
        }
        if (player.id === prev.players[nextPlayerIndex].id) {
          return { ...player, isCurrentTurn: true };
        }
        return player;
      });

      const winner = updatedPlayers.find(p => p.cards.length === 0)?.id || null;

      return {
        ...prev,
        players: updatedPlayers,
        currentPlayerId: prev.players[nextPlayerIndex].id,
        lastPlay: { playType: "single", cards }, // Simplified for now
        gameStatus: winner ? "finished" : "playing",
        winner,
      };
    });
  };

  const handlePass = () => {
    setGameState(prev => {
      const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.currentPlayerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % 4;

      return {
        ...prev,
        players: prev.players.map((player, index) => ({
          ...player,
          isCurrentTurn: index === nextPlayerIndex,
        })),
        currentPlayerId: prev.players[nextPlayerIndex].id,
      };
    });

    toast.info("Player passed");
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      <GameTable
        gameState={gameState}
        onPlay={handlePlay}
        onPass={handlePass}
      />
    </div>
  );
};

export default Index;