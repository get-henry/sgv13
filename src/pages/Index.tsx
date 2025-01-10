import { useState } from "react";
import { GameState, Card, GameHistoryEntry } from "@/types/game";
import { GameTable } from "@/components/GameTable";
import { Leaderboard } from "@/components/Leaderboard";
import { GameInitializer } from "@/components/GameInitializer";
import { AIPlayer } from "@/components/AIPlayer";
import { getPlayType, findNextActivePlayer } from "@/utils/gameUtils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [
      { id: "1", name: "You", cards: [], isCurrentTurn: false, isAI: false, gamesWon: 0 },
      { id: "2", name: "AI East", cards: [], isCurrentTurn: false, isAI: true, gamesWon: 0 },
      { id: "3", name: "AI North", cards: [], isCurrentTurn: false, isAI: true, gamesWon: 0 },
      { id: "4", name: "AI West", cards: [], isCurrentTurn: false, isAI: true, gamesWon: 0 },
    ],
    currentPlayerId: "",
    lastPlay: null,
    gameStatus: "waiting",
    winner: null,
    gameHistory: [],
    consecutivePasses: 0,
    lastPlayerId: null,
    completedGames: [],
  });

  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handlePlay = (cards: Card[]) => {
    setGameState(prev => {
      const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.currentPlayerId);
      const currentPlayer = prev.players[currentPlayerIndex];
      const nextPlayerIndex = findNextActivePlayer(prev.players, currentPlayerIndex);
      
      if (!currentPlayer?.isAI) {
        console.log(`[Player] ${currentPlayer?.name} is playing:`, cards.map(card => card.id).join(', '));
      }
      
      const updatedPlayers = prev.players.map(player => {
        if (player.id === prev.currentPlayerId) {
          const remainingCards = player.cards.filter(
            card => !cards.find(c => c.id === card.id)
          );
          return {
            ...player,
            cards: remainingCards,
            isCurrentTurn: false,
            hasPassed: false,
          };
        }
        if (player.id === prev.players[nextPlayerIndex].id) {
          return { ...player, isCurrentTurn: true };
        }
        return player;
      });

      const winner = updatedPlayers.find(p => p.cards.length === 0)?.id || null;
      const playType = getPlayType(cards);
      
      if (!playType) return prev;

      const newPlay = {
        playType,
        cards,
        playerId: prev.currentPlayerId,
      };

      const newGameHistory = [...prev.gameHistory, { ...newPlay, timestamp: Date.now() }];

      if (winner) {
        const gameHistoryEntry: GameHistoryEntry = {
          winner,
          players: updatedPlayers,
          plays: newGameHistory,
          timestamp: Date.now(),
        };
        return {
          ...prev,
          players: updatedPlayers.map(p => ({
            ...p,
            gamesWon: p.id === winner ? p.gamesWon + 1 : p.gamesWon,
            hasPassed: false,
          })),
          currentPlayerId: prev.players[nextPlayerIndex].id,
          lastPlay: newPlay,
          gameStatus: "finished",
          winner,
          gameHistory: newGameHistory,
          consecutivePasses: 0,
          lastPlayerId: prev.currentPlayerId,
          completedGames: [...prev.completedGames, gameHistoryEntry],
        };
      }

      return {
        ...prev,
        players: updatedPlayers,
        currentPlayerId: prev.players[nextPlayerIndex].id,
        lastPlay: newPlay,
        gameStatus: "playing",
        winner: null,
        gameHistory: newGameHistory,
        consecutivePasses: 0,
        lastPlayerId: prev.currentPlayerId,
      };
    });
  };

  const handlePass = () => {
    setGameState(prev => {
      const currentPlayer = prev.players.find(p => p.id === prev.currentPlayerId);
      if (!currentPlayer?.isAI) {
        console.log(`[Player] ${currentPlayer?.name} passed their turn - will be skipped until reset`);
      }
      
      const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.currentPlayerId);
      const nextPlayerIndex = findNextActivePlayer(prev.players, currentPlayerIndex);

      const updatedPlayers = prev.players.map(player => {
        if (player.id === prev.currentPlayerId) {
          return { ...player, hasPassed: true, isCurrentTurn: false };
        }
        if (player.id === prev.players[nextPlayerIndex].id) {
          return { ...player, isCurrentTurn: true };
        }
        return player;
      });

      const passedPlayersCount = updatedPlayers.filter(p => p.hasPassed).length;
      
      if (passedPlayersCount >= prev.players.length - 1) {
        console.log(`All players have passed - Resetting turn to last player who played: ${prev.players.find(p => p.id === prev.lastPlayerId)?.name}`);
        
        return {
          ...prev,
          players: prev.players.map(player => ({
            ...player,
            isCurrentTurn: player.id === prev.lastPlayerId,
            hasPassed: false
          })),
          currentPlayerId: prev.lastPlayerId || prev.currentPlayerId,
          lastPlay: null,
          consecutivePasses: 0,
          lastPlayerId: null
        };
      }

      return {
        ...prev,
        players: updatedPlayers,
        currentPlayerId: prev.players[nextPlayerIndex].id,
        consecutivePasses: prev.consecutivePasses + 1,
      };
    });

    toast.info("Player passed");
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      <Button
        variant="outline"
        className="fixed top-4 right-4 z-50"
        onClick={() => setShowLeaderboard(true)}
      >
        View Leaderboard
      </Button>
      
      <GameInitializer gameState={gameState} setGameState={setGameState} />
      <AIPlayer gameState={gameState} onPlay={handlePlay} onPass={handlePass} />
      
      <GameTable
        gameState={gameState}
        onPlay={handlePlay}
        onPass={handlePass}
      />

      {showLeaderboard && (
        <Leaderboard
          gameHistory={gameState.completedGames}
          onReplayGame={(gameId) => {
            toast.info("Replay functionality coming soon!");
          }}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
};

export default Index;