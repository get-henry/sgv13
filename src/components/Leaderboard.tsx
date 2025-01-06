import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { GameHistoryEntry } from "@/types/game";

interface LeaderboardProps {
  gameHistory: GameHistoryEntry[];
  onReplayGame: (gameId: string) => void;
  onClose: () => void;
}

export const Leaderboard = ({ gameHistory, onReplayGame, onClose }: LeaderboardProps) => {
  const getPlayerStats = () => {
    const stats = new Map<string, number>();
    gameHistory.forEach(game => {
      const winner = game.players.find(p => p.id === game.winner);
      if (winner) {
        stats.set(winner.name, (stats.get(winner.name) || 0) + 1);
      }
    });
    return Array.from(stats.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, wins]) => ({ name, wins }));
  };

  const lastGame = gameHistory[gameHistory.length - 1];
  const lastWinner = lastGame?.players.find(p => p.id === lastGame.winner);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-2xl font-bold mb-6">Leaderboard</h2>
        
        {lastWinner && (
          <div className="mb-6 p-4 bg-green-100 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Last Game Winner</h3>
            <p className="text-green-700">{lastWinner.name}</p>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">All-Time Wins</h3>
          <div className="space-y-2">
            {getPlayerStats().map(({ name, wins }, index) => (
              <div
                key={name}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span className="font-medium">{name}</span>
                <span className="text-gray-600">{wins} wins</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Game History</h3>
          <ScrollArea className="h-48">
            <div className="space-y-4">
              {gameHistory.map((game, index) => {
                const winner = game.players.find(p => p.id === game.winner);
                return (
                  <div
                    key={game.timestamp}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Game #{gameHistory.length - index}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(game.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-green-600">Winner: {winner?.name}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReplayGame(game.timestamp.toString())}
                      className="w-full"
                    >
                      Replay Game
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </motion.div>
    </motion.div>
  );
};