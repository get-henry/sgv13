import { Player } from "@/types/game";

interface GameStatusProps {
  playerName: string;
  hasPassed: boolean;
  isCurrentPlayer: boolean;
}

export const GameStatus = ({ playerName, hasPassed, isCurrentPlayer }: GameStatusProps) => {
  return (
    <div className="px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg text-white">
      {playerName}
      {isCurrentPlayer && (
        <span className="ml-2 px-2 py-1 bg-blue-500 rounded-full text-xs">
          Your Turn
        </span>
      )}
      {hasPassed && (
        <span className="ml-2 px-2 py-1 bg-red-500 rounded-full text-xs">
          Passed
        </span>
      )}
    </div>
  );
};