import { Button } from "@/components/ui/button";
import { User, Users, Computer, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Intro = () => {
  const navigate = useNavigate();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/game');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleOnlineGame = () => {
    toast.info("Please login first to play online!");
    navigate('/auth');
  };

  const handleLocalGame = () => {
    navigate("/game");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Card Chomp Champions</h1>
          <p className="text-gray-400 mb-8">Choose your game mode</p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-16 text-lg bg-opacity-20 hover:bg-opacity-30 transition-all"
            onClick={handleLogin}
          >
            <User className="mr-2 h-6 w-6" />
            Login
          </Button>

          <Button
            variant="outline"
            className="w-full h-16 text-lg bg-opacity-20 hover:bg-opacity-30 transition-all"
            onClick={handleOnlineGame}
          >
            <Users className="mr-2 h-6 w-6" />
            Play Online
          </Button>

          <Button
            variant="outline"
            className="w-full h-16 text-lg bg-opacity-20 hover:bg-opacity-30 transition-all"
            onClick={handleLocalGame}
          >
            <Computer className="mr-2 h-6 w-6" />
            Play vs Computer
          </Button>

          <Button
            variant="ghost"
            className="w-full h-12 text-lg text-gray-400 hover:text-white transition-all"
            onClick={() => setShowHowToPlay(true)}
          >
            <BookOpen className="mr-2 h-5 w-5" />
            How to Play
          </Button>
        </div>

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
    </div>
  );
};

export default Intro;