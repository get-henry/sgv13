import { useState } from "react";
import { Card, Player, GameState } from "@/types/game";
import { PlayerHand } from "./PlayerHand";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { isValidPlay } from "@/utils/gameUtils";
import { PlayingCard } from "./PlayingCard";

interface GameTableProps {
  gameState: GameState;
  onPlay: (cards: Card[]) => void;
  onPass: () => void;
}

export const GameTable = ({ gameState, onPlay, onPass }: GameTableProps) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);

  const handleCardSelect = (cards: Card[]) => {
    setSelectedCards(cards);
    console.log("Selected cards:", cards);
  };

  const validatePlay = (cards: Card[]): string | null => {
    if (!cards.length) {
      return "Please select cards to play";
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
    const error = validatePlay(selectedCards);
    if (error) {
      toast.error(error);
      return;
    }

    console.log("Playing cards:", selectedCards);
    onPlay(selectedCards);
    setSelectedCards([]);
  };

  // Log last play for debugging
  console.log("Last play:", gameState.lastPlay);

  return (
    <div className="relative w-full h-screen bg-table-felt border-8 border-table-border rounded-3xl overflow-hidden">
      {/* Center table area for last play */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 rounded-xl bg-black/10 backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {gameState.lastPlay && (
          <div className="flex gap-2">
            {gameState.lastPlay.cards.map(card => (
              <PlayingCard key={card.id} card={card} isPlayable={false} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Player hands */}
      {gameState.players.map((player, index) => {
        const position = ["bottom", "left", "top", "right"][index] as "bottom" | "left" | "top" | "right";
        const isCurrentPlayer = player.id === gameState.currentPlayerId;
        
        return (
          <div key={player.id} className="relative">
            {/* Current player indicator */}
            {isCurrentPlayer && (
              <motion.div
                className="absolute inset-0 bg-blue-500/20 rounded-xl z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            <PlayerHand
              cards={player.cards}
              isCurrentPlayer={isCurrentPlayer}
              selectedCards={selectedCards}
              onCardSelect={handleCardSelect}
              lastPlay={gameState.lastPlay}
              position={position}
            />
          </div>
        );
      })}

      {/* Action buttons */}
      {currentPlayer && (
        <div className="absolute bottom-48 left-1/2 -translate-x-1/2 flex gap-4 z-10">
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
    </div>
  );
};