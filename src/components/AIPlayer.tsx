import { useEffect } from "react";
import { GameState } from "@/types/game";
import { determineAIPlay } from "@/utils/aiUtils";

interface AIPlayerProps {
  gameState: GameState;
  onPlay: (cards: any[]) => void;
  onPass: () => void;
}

export const AIPlayer = ({ gameState, onPlay, onPass }: AIPlayerProps) => {
  useEffect(() => {
    if (gameState.gameStatus !== "playing") return;
    
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
    if (!currentPlayer?.isAI) return;

    const timeoutId = setTimeout(() => {
      console.log(`[AI Turn] ${currentPlayer.name}'s turn after reset`);
      const aiPlay = determineAIPlay(gameState, currentPlayer.id);
      
      if (aiPlay) {
        console.log(`[AI] ${currentPlayer.name} is playing:`, aiPlay.map(card => card.id).join(', '));
        onPlay(aiPlay);
      } else {
        console.log(`[AI] ${currentPlayer.name} is passing`);
        onPass();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [gameState.currentPlayerId, gameState.gameStatus, gameState.lastPlay]);

  return null;
};