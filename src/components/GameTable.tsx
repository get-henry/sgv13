import { useState, useEffect } from "react";
import { Card, Player, GameState } from "@/types/game";
import { PlayerHand } from "./PlayerHand";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isValidPlay } from "@/utils/gameUtils";
import { GameStatus } from "./GameStatus";
import { PlayArea } from "./PlayArea";
import { GameControls } from "./GameControls";

interface GameTableProps {
  gameState: GameState;
  onPlay: (cards: Card[]) => void;
  onPass: () => void;
}

export const GameTable = ({ gameState, onPlay, onPass }: GameTableProps) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [animatingCards, setAnimatingCards] = useState<Card[]>([]);
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  
  useEffect(() => {
    setSelectedCards([]);
  }, [gameState.currentPlayerId]);

  const handleCardSelect = (cards: Card[]) => {
    if (currentPlayer?.hasPassed) return;
    setSelectedCards(cards);
  };

  const validatePlay = (cards: Card[]): string | null => {
    if (!cards.length) return "Please select cards to play";
    if (currentPlayer?.hasPassed) return "You have passed this round";
    
    const playType = getPlayType(cards);
    if (!playType) {
      return "Invalid card combination";
    }

    // Check if it's the first play of the first game and contains 3 of Spades
    if (isFirstPlay) {
      const hasThreeOfSpades = cards.some(card => card.suit === "spade" && card.rank === "3");
      if (!hasThreeOfSpades) {
        return "First play must include 3 of Spades";
      }
    } else if (gameState.lastPlay && gameState.lastPlay.playType !== playType) {
      // Check if it's a valid chomp of 2s
      const isChompingTwos = gameState.lastPlay.cards.every(card => card.rank === "2");
      if (!isChompingTwos) {
        return `Must play the same type as the last play (${gameState.lastPlay.playType})`;
      }
      
      const isValidChomp = validateChompPlay(cards, gameState.lastPlay);
      if (!isValidChomp) {
        return "Invalid chomp play";
      }
    }

    // Only validate against last play if there is one
    if (gameState.lastPlay && !isValidPlay(cards, gameState.lastPlay)) {
      return "Selected cards must be stronger than the last play";
    }

    return null;
  };

  const handlePlay = () => {
    const error = validatePlay(selectedCards);
    if (error) {
      toast.error(error);
      return;
    }

    setAnimatingCards(selectedCards);
    setTimeout(() => {
      onPlay(selectedCards);
      setSelectedCards([]);
      setAnimatingCards([]);
    }, 500);
  };

  return (
    <div className="relative w-full h-screen bg-table-felt border-8 border-table-border rounded-3xl overflow-hidden">
      <GameControls
        isCurrentPlayer={currentPlayer?.id === gameState.currentPlayerId}
        gameStatus={gameState.gameStatus}
        onPlay={handlePlay}
        onPass={onPass}
      />

      <PlayArea
        lastPlay={gameState.lastPlay}
        animatingCards={animatingCards}
        currentPlayerId={gameState.currentPlayerId}
        players={gameState.players}
      />

      {gameState.players.map((player, index) => {
        const position = ["bottom", "left", "top", "right"][index] as "bottom" | "left" | "top" | "right";
        const isCurrentPlayer = player.id === gameState.currentPlayerId;
        
        return (
          <div key={player.id} className="relative">
            <GameStatus
              player={player}
              isCurrentPlayer={isCurrentPlayer}
              hasPassed={player.hasPassed || false}
            />
            <PlayerHand
              cards={player.cards}
              isCurrentPlayer={isCurrentPlayer}
              selectedCards={selectedCards}
              onCardSelect={handleCardSelect}
              lastPlay={gameState.lastPlay}
              position={position}
              playerName={player.name}
            />
          </div>
        );
      })}

      {gameState.gameStatus === "finished" && (
        <motion.div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="bg-white rounded-xl p-8 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4">
              Game Over!
            </h2>
            <p className="text-lg mb-6">
              {gameState.winner && `${gameState.players.find(p => p.id === gameState.winner)?.name} wins!`}
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Play Again
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
