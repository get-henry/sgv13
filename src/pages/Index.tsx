import { useState, useEffect } from "react";
import { GameState, Card } from "@/types/game";
import { GameTable } from "@/components/GameTable";
import { createDeck, shuffleDeck, dealCards, findStartingPlayer } from "@/utils/gameUtils";
import { toast } from "sonner";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [
      { id: "1", name: "Player 1", cards: [], isCurrentTurn: false },
      { id: "2", name: "Player 2", cards: [], isCurrentTurn: false },
      { id: "3", name: "Player 3", cards: [], isCurrentTurn: false },
      { id: "4", name: "Player 4", cards: [], isCurrentTurn: false },
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

    setGameState(prev => ({
      ...prev,
      players: prev.players.map((player, index) => ({
        ...player,
        cards: hands[index],
        isCurrentTurn: index === startingPlayerIndex,
      })),
      currentPlayerId: prev.players[startingPlayerIndex].id,
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