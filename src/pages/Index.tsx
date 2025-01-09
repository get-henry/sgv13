import { useState, useEffect } from "react";
import { GameState, Card, GameHistoryEntry } from "@/types/game";
import { GameTable } from "@/components/GameTable";
import { Leaderboard } from "@/components/Leaderboard";
import { createDeck, shuffleDeck } from "@/utils/cardUtils";
import { dealCards, findStartingPlayer, getPlayType, findNextActivePlayer } from "@/utils/gameUtils";
import { determineAIPlay } from "@/utils/aiUtils";
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

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (gameState.gameStatus !== "playing") return;
    
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
    if (!currentPlayer?.isAI) return;

    const timeoutId = setTimeout(() => {
      // console.log('AI Turn - Processing move for:', currentPlayer.name);
      const aiPlay = determineAIPlay(gameState, currentPlayer.id);
      
      if (aiPlay) {
        console.log('[AI] ${currentPlayer?.name} is playing:', aiPlay.id);
        handlePlay(aiPlay);
      } else {
        console.log('[AI] ${currentPlayer?.name} is passing');
        handlePass();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [gameState.currentPlayerId, gameState.gameStatus]);

  const startNewGame = () => {
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck);
    
    // If it's not the first game, the winner starts
    let startingPlayerIndex = gameState.completedGames.length === 0 
      ? findStartingPlayer(hands)
      : gameState.players.findIndex(p => p.id === gameState.winner);
    
    if (startingPlayerIndex === -1) startingPlayerIndex = 0;

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
      gameHistory: [],
      consecutivePasses: 0,
      lastPlayerId: null,
    }));

    toast.success("New game started!");
  };

  const handlePlay = (cards: Card[]) => {
    console.log('Processing play:', cards.id);
    setGameState(prev => {
      const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.currentPlayerId);
      const nextPlayerIndex = findNextActivePlayer(prev.players, currentPlayerIndex);

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

      const newPlay = {
        playType: getPlayType(cards) || "single",
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

      // Reset all passes when a play is made
      return {
        ...prev,
        players: updatedPlayers.map(p => ({ ...p, hasPassed: false })),
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
      if (!currentPlayer?.isAI) console.log(`[Player] ${currentPlayer?.name} passed their turn`);
      
      
      const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.currentPlayerId);
      const nextPlayerIndex = findNextActivePlayer(prev.players, currentPlayerIndex);
      const newConsecutivePasses = prev.consecutivePasses + 1;

      // If everyone has passed except the last player who played
      if (newConsecutivePasses >= prev.players.length - 1) {
        console.log('All players have passed - Resetting turn to last player:', prev.lastPlayerId.name);
        // Reset all players' pass status and start new round
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
        };
      }

      // Mark current player as passed and move to next player
      return {
        ...prev,
        players: prev.players.map(player => {
          if (player.id === prev.currentPlayerId) {
            return { ...player, hasPassed: true, isCurrentTurn: false };
          }
          if (player.id === prev.players[nextPlayerIndex].id) {
            return { ...player, isCurrentTurn: true };
          }
          return player;
        }),
        currentPlayerId: prev.players[nextPlayerIndex].id,
        consecutivePasses: newConsecutivePasses,
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
      
      <GameTable
        gameState={gameState}
        onPlay={handlePlay}
        onPass={handlePass}
      />

      {showLeaderboard && (
        <Leaderboard
          gameHistory={gameState.completedGames}
          onReplayGame={(gameId) => {
            // TODO: Implement replay functionality
            toast.info("Replay functionality coming soon!");
          }}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
};

export default Index;
