import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const MatchScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { matchProfile, matchId } = location.state || {};

  useEffect(() => {
    // If no match data, redirect to discovery
    if (!matchProfile) {
      navigate("/discovery");
    }
  }, [matchProfile, navigate]);

  const getPhotoUrl = (photoPath: string) => {
    if (!photoPath) return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(photoPath);
    return data.publicUrl;
  };

  const myPhoto = user ? getPhotoUrl("") : "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
  const matchPhoto = matchProfile?.photos?.[0] 
    ? getPhotoUrl(matchProfile.photos[0]) 
    : "https://api.dicebear.com/7.x/avataaars/svg?seed=Match";

  const handleSendMessage = () => {
    if (matchId) {
      navigate(`/chat/${matchId}`);
    } else {
      navigate("/matches");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated Confetti */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <span className="text-2xl">
              {['🎉', '✨', '💫', '⭐', '💕'][Math.floor(Math.random() * 5)]}
            </span>
          </div>
        ))}
      </div>

      {/* Logo */}
      <h1 className="text-5xl font-fredoka font-bold text-coral mb-12">YO!</h1>

      {/* Photos */}
      <div className="relative mb-8">
        <div className="flex items-center gap-8">
          <img
            src={myPhoto}
            alt="Você"
            className="w-36 h-36 rounded-full object-cover ring-4 ring-white shadow-elevated"
          />
          
          {/* Heart Icon */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-24 h-24 bg-pink-soft rounded-full flex items-center justify-center animate-pulse shadow-elevated">
              <span className="text-6xl">💕</span>
            </div>
          </div>
          
          <img
            src={matchPhoto}
            alt={matchProfile?.name || "Match"}
            className="w-36 h-36 rounded-full object-cover ring-4 ring-white shadow-elevated"
          />
        </div>
      </div>

      {/* Match Text */}
      <h2 className="text-4xl font-bold text-black-soft mb-2">É um Match!</h2>
      <p className="text-lg text-gray-medium text-center mb-12 max-w-sm">
        Você e {matchProfile?.name || "essa pessoa"} deram like um no outro!
      </p>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-4">
        <Button
          className="w-full h-14 bg-coral hover:bg-coral/90"
          onClick={handleSendMessage}
        >
          <span className="mr-2">💬</span>
          Enviar Mensagem
        </Button>
        <Button
          variant="outline"
          className="w-full h-14"
          onClick={() => navigate("/matches")}
        >
          Ver Matches
        </Button>
      </div>

      {/* Skip Button */}
      <button
        onClick={() => navigate("/discovery")}
        className="mt-8 text-gray-medium hover:text-black-soft transition-colors"
      >
        Continuar explorando
      </button>
    </div>
  );
};

export default MatchScreen;
