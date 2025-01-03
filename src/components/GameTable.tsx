import { useState } from "react";
import { Card, Player, GameState } from "@/types/game";
import { PlayerHand } from "./PlayerHand";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { isValidPlay } from "@/utils/gameUtils";

interface GameTableProps {
  gameState: GameState;
  onPlay: (cards: Card[]) => void;
  onPass: () => void;
}

export const GameTable = ({ gameState, onPlay, onPass }: GameTableProps) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);

  const handleCardSelect = (card: Card) => {
    setSelectedCards(prev => 
      prev.includes(card)
        ? prev.filter(c => c.id !== card.id)
        : [...prev, card]
    );
  };

  const handlePlay = () => {
    if (!selectedCards.length) {
      toast.error("Please select cards to play");
      return;
    }

    if (!isValidPlay(selectedCards, gameState.lastPlay)) {
      toast.error("Invalid play");
      return;
    }

    onPlay(selectedCards);
    setSelectedCards([]);
  };

  return (
    <div className="relative w-full h-screen bg-table-felt border-8 border-table-border rounded-3xl overflow-hidden">
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

      {gameState.players.map((player, index) => {
        const position = ["bottom", "left", "top", "right"][index] as "bottom" | "left" | "top" | "right";
        return (
          <PlayerHand
            key={player.id}
            cards={player.cards}
            isCurrentPlayer={player.id === gameState.currentPlayerId}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
            position={position}
          />
        );
      })}

      {currentPlayer && (
        <div className="absolute bottom-48 left-1/2 -translate-x-1/2 flex gap-4">
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