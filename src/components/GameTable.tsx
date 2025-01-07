import { useState, useEffect } from "react";
import { Card, Player, GameState, PlayType } from "@/types/game";
import { PlayerHand } from "./PlayerHand";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { isValidPlay, getPlayType } from "@/utils/gameUtils";
import { ActionButtons } from "./game/ActionButtons";
import { PlayingField } from "./game/PlayingField";

interface GameTableProps {
  gameState: GameState;
  onPlay: (cards: Card[]) => void;
  onPass: () => void;
}

export const GameTable = ({ gameState, onPlay, onPass }: GameTableProps) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [animatingCards, setAnimatingCards] = useState<Card[]>([]);
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const isFirstGame = gameState.completedGames.length === 0;
  const isFirstPlay = isFirstGame && gameState.gameHistory.length === 0;

  useEffect(() => {
    setSelectedCards([]);
  }, [gameState.currentPlayerId]);

  const handleCardSelect = (cards: Card[]) => {
    console.log("Selected cards:", cards);
    setSelectedCards(cards);
  };

  const validatePlay = (cards: Card[]): string | null => {
    if (!cards.length) {
      return "Please select cards to play";
    }

    const playType = getPlayType(cards);
    if (!playType) {
      return "Invalid card combination";
    }

    if (isFirstPlay) {
      const hasThreeOfSpades = cards.some(card => card.suit === "spade" && card.rank === "3");
      if (!hasThreeOfSpades) {
        return "First play must include 3 of Spades";
      }
    } else if (gameState.lastPlay && gameState.lastPlay.playType !== playType) {
      const isChompingTwos = gameState.lastPlay.cards.every(card => card.rank === "2");
      if (!isChompingTwos) {
        return `Must play the same type as the last play (${gameState.lastPlay.playType})`;
      }
      
      const isValidChomp = validateChompPlay(cards, gameState.lastPlay);
      if (!isValidChomp) {
        return "Invalid chomp play";
      }
    }

    if (gameState.lastPlay && !isValidPlay(cards, gameState.lastPlay)) {
      return "Selected cards must be stronger than the last play";
    }

    return null;
  };

  const validateChompPlay = (cards: Card[], lastPlay: GameState['lastPlay']): boolean => {
    if (!lastPlay) return false;
    
    const lastPlayCards = lastPlay.cards;
    if (!lastPlayCards.every(card => card.rank === "2")) return false;

    const playType = getPlayType(cards);
    if (!playType) return false;

    // Single 2 can be chomped by consecutive pairs 3,3,4,4,5,5
    if (lastPlayCards.length === 1 && playType === "consecutive-pairs" && cards.length === 6) {
      return true;
    }

    // Pair of 2s can be chomped by consecutive pairs 3,3,4,4,5,5,6,6 or four of a kind
    if (lastPlayCards.length === 2) {
      if (playType === "consecutive-pairs" && cards.length === 8) return true;
      if (playType === "four" && cards.length === 4) return true;
    }

    // Triple 2s can be chomped by consecutive pairs 3,3,4,4,5,5,6,6,7,7
    if (lastPlayCards.length === 3 && playType === "consecutive-pairs" && cards.length === 10) {
      return true;
    }

    return false;
  };

  const handlePlay = () => {
    console.log("Attempting to play cards:", selectedCards);
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

  const getPlayerName = (playerId: string): string => {
    return gameState.players.find(p => p.id === playerId)?.name || "";
  };

  return (
    <div className="relative w-full h-screen bg-table-felt border-8 border-table-border rounded-3xl overflow-hidden">
      <ActionButtons
        isCurrentPlayer={!!currentPlayer}
        gameStatus={gameState.gameStatus}
        onPlay={handlePlay}
        onPass={onPass}
      />

      <PlayingField
        lastPlay={gameState.lastPlay}
        animatingCards={animatingCards}
        currentPlayerId={gameState.currentPlayerId}
        lastPlayerId={gameState.lastPlayerId}
        getPlayerName={getPlayerName}
      />

      {gameState.players.map((player, index) => {
        const position = ["bottom", "left", "top", "right"][index] as "bottom" | "left" | "top" | "right";
        const isCurrentPlayer = player.id === gameState.currentPlayerId;
        
        // Skip player's turn if they have passed
        if (player.hasPassed && gameState.consecutivePasses < 3) {
          return null;
        }

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
            hasPassed={player.hasPassed || false}
            className={`
              ${position === 'left' ? 'md:left-16 left-4' : ''}
              ${position === 'right' ? 'md:right-16 right-4' : ''}
            `}
          />
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
