import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  isCurrentPlayer: boolean;
  gameStatus: string;
  onPlay: () => void;
  onPass: () => void;
}

export const ActionButtons = ({ isCurrentPlayer, gameStatus, onPlay, onPass }: ActionButtonsProps) => {
  if (!isCurrentPlayer || gameStatus !== "playing") return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-30 md:bottom-64">
      <Button
        variant="secondary"
        onClick={onPlay}
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
  );
};