import { useState, useEffect } from "react";
import { Card, Player, GameState, PlayType } from "@/types/game";
import { PlayerHand } from "./PlayerHand";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { isValidPlay, getPlayType } from "@/utils/gameUtils";
import { PlayingCard } from "./PlayingCard";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface GameTableProps {
  gameState: GameState;
  onPlay: (cards: Card[]) => void;
  onPass: () => void;
}

export const GameTable = ({ gameState, onPlay, onPass }: GameTableProps) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [animatingCards, setAnimatingCards] = useState<Card[]>([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const navigate = useNavigate();
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const isFirstGame = gameState.completedGames.length === 0;
  const isFirstPlay = isFirstGame && gameState.gameHistory.length === 0;

  useEffect(() => {
    // Clear selected cards when current player changes
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

  const validateChompPlay = (cards: Card[], lastPlay: GameState['lastPlay']): boolean => {
    if (!lastPlay) return false;
    
    const lastPlayCards = lastPlay.cards;
    if (!lastPlayCards.every(card => card.rank === "2")) return false;

    const playType = getPlayType(cards);
    if (!playType) return false;

    // Single 2 can be chomped by consecutive pairs 3,3,4,4,5,5
    if (lastPlayCards.length === 1 && playType === "Consecutive-pairs" && cards.length === 6) {
      return true;
    }

    // Pair of 2s can be chomped by consecutive pairs 3,3,4,4,5,5,6,6 or four of a kind
    if (lastPlayCards.length === 2) {
      if (playType === "Consecutive-pairs" && cards.length === 8) return true;
      if (playType === "Four" && cards.length === 4) return true;
    }

    // Triple 2s can be chomped by consecutive pairs 3,3,4,4,5,5,6,6,7,7
    if (lastPlayCards.length === 3 && playType === "Consecutive-pairs" && cards.length === 10) {
      return true;
    }

    return false;
  };

  const handlePlay = () => {
    //console.log("Attempting to play cards:", selectedCards);
    const error = validatePlay(selectedCards);
    if (error) {
      toast.error(error);
      return;
    }

    setAnimatingCards(selectedCards);
    
    // Delay the actual play until animation completes
    setTimeout(() => {
      onPlay(selectedCards);
      setSelectedCards([]);
      setAnimatingCards([]);
    }, 500); // Match this with animation duration
  };

  return (
    <div className="relative w-full h-screen bg-table-felt border-8 border-table-border rounded-3xl overflow-hidden">
      {/* Navigation buttons */}
      <div className="absolute top-4 left-4 z-30 flex gap-2">
        <Button
          variant="ghost"
          className="text-white/80 hover:text-white hover:bg-white/10"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
        <Button
          variant="ghost"
          className="text-white/80 hover:text-white hover:bg-white/10"
          onClick={() => setShowHowToPlay(true)}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          How to Play
        </Button>
      </div>

      {/* Action buttons - Repositioned above player's hand */}
      {currentPlayer && gameState.gameStatus === "playing" && (
        <div className="absolute bottom-56 left-1/2 -translate-x-1/2 flex gap-4 z-30">
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
        {(gameState.lastPlay || animatingCards.length > 0) && (
          <div className="text-white mb-4 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg">
            Current Play: {gameState.lastPlay?.playType || getPlayType(animatingCards)} by {
              gameState.players.find(p => p.id === (gameState.lastPlayerId || gameState.currentPlayerId))?.name
            }
          </div>
        )}
        <motion.div
          className="p-8 rounded-xl bg-black/10 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {(gameState.lastPlay || animatingCards.length > 0) && (
              <motion.div 
                className="flex gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {(animatingCards.length > 0 ? animatingCards : gameState.lastPlay?.cards || []).map(card => (
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
            hasPassed={player.hasPassed || false}
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

      <Dialog open={showHowToPlay} onOpenChange={setShowHowToPlay}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>How to Play Card Chomp Champions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-left">
            <p>Card Chomp Champions is a trick-taking card game where the goal is to be the first player to get rid of all your cards.</p>
            
            <h3 className="font-semibold text-lg">Basic Rules:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>The game starts with the player holding the 3 of Spades.</li>
              <li>Players must play cards that are higher in value than the previous play.</li>
              <li>You can play singles, pairs, three of a kind, straights, and other combinations.</li>
              <li>If you cannot beat the current play, you must pass.</li>
              <li>When all players pass, the last player who made a valid play starts the next round.</li>
            </ul>

            <h3 className="font-semibold text-lg">Special Rules:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>2s are special cards that can be played on any combination.</li>
              <li>When 2s are played, they can be "chomped" by specific combinations:
                <ul className="list-disc pl-6 mt-2">
                  <li>Single 2: Can be chomped by three consecutive pairs (e.g., 3,3,4,4,5,5)</li>
                  <li>Pair of 2s: Can be chomped by four consecutive pairs or four of a kind</li>
                  <li>Three 2s: Can be chomped by five consecutive pairs</li>
                </ul>
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
