import { useState, useEffect } from "react";
import { Card, Player, GameState, PlayType } from "@/types/game";
import { PlayerHand } from "./PlayerHand";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { isValidPlay, getPlayType } from "@/utils/gameUtils";
import { PlayingCard } from "./PlayingCard";

interface GameTableProps {
  gameState: GameState;
  onPlay: (cards: Card[]) => void;
  onPass: () => void;
}

export const GameTable = ({ gameState, onPlay, onPass }: GameTableProps) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);

  useEffect(() => {
    // Clear selected cards when current player changes
    setSelectedCards([]);
  }, [gameState.currentPlayerId]);

  const handleCardSelect = (cards: Card[]) => {
    console.log("Selected cards:", cards);
    setSelectedCards(cards);
  };

  const validatePlay = (cards: Card[]): string | null => {
    console.log("Validating play:", cards);
    
    if (!cards.length) {
      return "Please select cards to play";
    }

    const playType = getPlayType(cards);
    console.log("Play type detected:", playType);
    
    if (!playType) {
      return "Invalid card combination";
    }

    // Check if it's the first play and contains 3 of Spades
    if (!gameState.lastPlay) {
      const hasThreeOfSpades = cards.some(card => card.suit === "spade" && card.rank === "3");
      if (!hasThreeOfSpades) {
        return "First play must include 3 of Spades";
      }
    }

    if (!isValidPlay(cards, gameState.lastPlay)) {
      if (gameState.lastPlay) {
        return "Selected cards must be stronger than the last play";
      }
      return "Invalid card combination";
    }

    return null;
  };

  const handlePlay = () => {
    console.log("Attempting to play cards:", selectedCards);
    const error = validatePlay(selectedCards);
    if (error) {
      toast.error(error);
      return;
    }

    onPlay(selectedCards);
    setSelectedCards([]);
  };

  return (
    <div className="relative w-full h-screen bg-table-felt border-8 border-table-border rounded-3xl overflow-hidden">
      {/* Action buttons - Moved higher up */}
      {currentPlayer && gameState.gameStatus === "playing" && (
        <div className="absolute bottom-48 left-1/2 -translate-x-1/2 flex gap-4 z-30">
          <Button
            variant="secondary"
            onClick={handlePlay}
            className="px-8 py-4 text-lg font-semibold bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            Play
          </Button>
          <Button
            variant="ghost"
            onClick={onPass}
            className="px-8 py-4 text-lg font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Pass
          </Button>
        </div>
      )}

      {/* Center playing field */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] flex flex-col items-center justify-center">
        {gameState.lastPlay && (
          <div className="text-white mb-4 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg">
            Current Play: {gameState.lastPlay.playType}
          </div>
        )}
        <motion.div
          className="p-8 rounded-xl bg-black/10 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {gameState.lastPlay && (
              <motion.div 
                className="flex gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {gameState.lastPlay.cards.map(card => (
                  <PlayingCard key={card.id} card={card} isPlayable={false} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Player hands */}
      {gameState.players.map((player, index) => {
        const position = ["bottom", "left", "top", "right"][index] as "bottom" | "left" | "top" | "right";
        const isCurrentPlayer = player.id === gameState.currentPlayerId;
        
        return (
          <PlayerHand
            key={player.id}
            cards={player.cards}
            isCurrentPlayer={isCurrentPlayer}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
            lastPlay={gameState.lastPlay}
            position={position}
            playerName={player.name}
          />
        );
      })}

      {/* Game over overlay */}
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