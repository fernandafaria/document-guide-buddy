import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const MatchScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { matchProfile, matchId } = location.state || {};
  const [myProfile, setMyProfile] = useState<any>(null);

  useEffect(() => {
    // If no match data, redirect to discovery
    if (!matchProfile) {
      navigate("/discovery");
      return;
    }

    // Fetch current user's profile to get their photo
    const fetchMyProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("photos, gender")
        .eq("id", user.id)
        .single();
      
      setMyProfile(data);
    };

    fetchMyProfile();
  }, [matchProfile, navigate, user]);

  const getPhotoUrl = (photoPath: string) => {
    if (!photoPath) return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
    // Se já for uma URL completa, retorna direto
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(photoPath);
    return data.publicUrl;
  };

  const myPhoto = myProfile?.photos?.[0]
    ? getPhotoUrl(myProfile.photos[0])
    : "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
    
  const matchPhoto = matchProfile?.photos?.[0] 
    ? getPhotoUrl(matchProfile.photos[0]) 
    : "https://api.dicebear.com/7.x/avataaars/svg?seed=Match";

  const isWoman = myProfile?.gender?.toLowerCase() === 'mulher' || myProfile?.gender?.toLowerCase() === 'feminino';

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
      <h1 className="text-7xl font-fredoka font-bold text-coral tracking-tight mb-12">
        Yo!
      </h1>

      {/* Photos */}
      <div className="relative mb-8">
        <div className="flex items-center justify-center gap-4">
          {/* My Photo */}
          <div className="relative animate-scale-in">
            <img
              src={myPhoto}
              alt="Você"
              loading="lazy"
              className="w-36 h-36 rounded-full object-cover ring-4 ring-white shadow-elevated"
            />
          </div>
          
          {/* Heart Icon */}
          <div className="z-10 mx-4">
            <div className="w-20 h-20 bg-pink-soft rounded-full flex items-center justify-center animate-bounce-in shadow-elevated">
              <span className="text-5xl">💕</span>
            </div>
          </div>
          
          {/* Match Photo */}
          <div className="relative animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <img
              src={matchPhoto}
              alt={matchProfile?.name || "Match"}
              loading="lazy"
              className="w-36 h-36 rounded-full object-cover ring-4 ring-white shadow-elevated"
            />
          </div>
        </div>
      </div>

      {/* Match Text */}
      <h2 className="text-4xl font-bold text-black-soft mb-2">É um Match!</h2>
      <p className="text-lg text-gray-medium text-center mb-12 max-w-sm">
        Você e {matchProfile?.name || "essa pessoa"} deram like um no outro!
      </p>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-4">
        {isWoman ? (
          <Button
            className="w-full h-14 bg-coral hover:bg-coral/90 text-lg font-semibold"
            onClick={handleSendMessage}
          >
            <span className="mr-2">👋</span>
            Enviar um Yo!
          </Button>
        ) : (
          <div className="w-full p-6 bg-gray-light rounded-2xl text-center">
            <p className="text-lg text-gray-dark font-medium mb-2">
              ⏳ Aguarde ela dar o primeiro passo
            </p>
            <p className="text-sm text-gray-medium">
              No YO!, as mulheres têm o poder de iniciar a conversa
            </p>
          </div>
        )}
        
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
