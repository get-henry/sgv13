import { Card, PlayType } from "@/types/game";
import { motion, AnimatePresence } from "framer-motion";
import { PlayingCard } from "../PlayingCard";
import { getPlayType } from "@/utils/gameUtils";

interface PlayingFieldProps {
  lastPlay: { playType: PlayType; cards: Card[]; playerId: string } | null;
  animatingCards: Card[];
  currentPlayerId: string;
  lastPlayerId: string | null;
  getPlayerName: (id: string) => string;
}

export const PlayingField = ({ 
  lastPlay, 
  animatingCards, 
  currentPlayerId, 
  lastPlayerId,
  getPlayerName 
}: PlayingFieldProps) => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] flex flex-col items-center justify-center">
      {(lastPlay || animatingCards.length > 0) && (
        <div className="text-white mb-4 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg">
          Current Play: {lastPlay?.playType || getPlayType(animatingCards)} by {
            getPlayerName(lastPlayerId || currentPlayerId)
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
          {(lastPlay || animatingCards.length > 0) && (
            <motion.div 
              className="flex gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {(animatingCards.length > 0 ? animatingCards : lastPlay?.cards || []).map(card => (
                <PlayingCard key={card.id} card={card} isPlayable={false} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};