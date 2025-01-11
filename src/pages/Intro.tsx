import { Button } from "@/components/ui/button";
import { User, Users, Computer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Intro = () => {
  const navigate = useNavigate();

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
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Play against AI or challenge real players online
        </p>
      </div>
    </div>
  );
};

export default Intro;