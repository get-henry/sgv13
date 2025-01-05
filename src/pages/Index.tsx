import { useState, useEffect } from "react";
import { GameState, Card, GameHistoryEntry } from "@/types/game";
import { GameTable } from "@/components/GameTable";
import { Leaderboard } from "@/components/Leaderboard";
import { createDeck, shuffleDeck } from "@/utils/cardUtils";
import { dealCards, findStartingPlayer, getPlayType } from "@/utils/gameUtils";
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
  });

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [completedGames, setCompletedGames] = useState<GameHistoryEntry[]>([]);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (gameState.gameStatus !== "playing") return;
    
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
    if (!currentPlayer?.isAI) return;

    const timeoutId = setTimeout(() => {
      console.log('AI Turn - Processing move for:', currentPlayer.name);
      const aiPlay = determineAIPlay(gameState, currentPlayer.id);
      
      if (aiPlay) {
        console.log('AI is playing:', aiPlay);
        handlePlay(aiPlay);
      } else {
        console.log('AI is passing');
        handlePass();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [gameState.currentPlayerId, gameState.gameStatus]);

  const startNewGame = () => {
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck);
    const startingPlayerIndex = findStartingPlayer(hands);
    
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
    console.log('Processing play:', cards);
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

      const newPlay = {
        playType: getPlayType(cards) || "single",
        cards,
        playerId: prev.currentPlayerId,
      };

      const newGameHistory = [...prev.gameHistory, { ...newPlay, timestamp: Date.now() }];

      // If game is finished, save it to completed games
      if (winner) {
        const gameHistoryEntry: GameHistoryEntry = {
          winner,
          players: updatedPlayers,
          plays: newGameHistory,
          timestamp: Date.now(),
        };
        setCompletedGames(prev => [...prev, gameHistoryEntry]);
      }

      return {
        ...prev,
        players: updatedPlayers,
        currentPlayerId: prev.players[nextPlayerIndex].id,
        lastPlay: newPlay,
        gameStatus: winner ? "finished" : "playing",
        winner,
        gameHistory: newGameHistory,
        consecutivePasses: 0,
        lastPlayerId: prev.currentPlayerId,
      };
    });
  };

  const handlePass = () => {
    console.log('Player passing turn');
    setGameState(prev => {
      const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.currentPlayerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % 4;
      const newConsecutivePasses = prev.consecutivePasses + 1;

      if (newConsecutivePasses === 3) {
        const playerToStart = prev.lastPlayerId || prev.currentPlayerId;
        return {
          ...prev,
          players: prev.players.map((player, index) => ({
            ...player,
            isCurrentTurn: player.id === playerToStart,
          })),
          currentPlayerId: playerToStart,
          lastPlay: null,
          consecutivePasses: 0,
        };
      }

      return {
        ...prev,
        players: prev.players.map((player, index) => ({
          ...player,
          isCurrentTurn: index === nextPlayerIndex,
        })),
        currentPlayerId: prev.players[nextPlayerIndex].id,
        consecutivePasses: newConsecutivePasses,
      };
    });

    toast.info("Player passed");
  };

  const handleReplayGame = (gameId: string) => {
    // TODO: Implement replay functionality
    toast.info("Replay functionality coming soon!");
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
          gameHistory={completedGames}
          onReplayGame={handleReplayGame}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
};

export default Index;