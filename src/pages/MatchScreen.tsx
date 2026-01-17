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
  const [matchData, setMatchData] = useState<any>(null);
  const [otherProfile, setOtherProfile] = useState<any>(null);

  useEffect(() => {
    // If no match data, redirect to discovery
    if (!matchProfile) {
      navigate("/discovery");
      return;
    }

    // Fetch current user's profile to get their photo and gender
    const fetchMyProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("photos, gender")
        .eq("id", user.id)
        .single();
      
      setMyProfile(data);
    };

    // Fetch match data to check conversation status
    const fetchMatchData = async () => {
      if (!matchId) return;
      
      const { data } = await supabase
        .from("matches")
        .select("conversation_started, first_message_by")
        .eq("id", matchId)
        .single();
      
      setMatchData(data);
    };

    fetchMyProfile();
    fetchMatchData();
  }, [matchProfile, navigate, user, matchId]);

  // Ensure other user's profile is fully loaded (gender/photos)
  useEffect(() => {
    const loadOther = async () => {
      if (!user || !matchId) return;
      try {
        const { data: matchRow } = await supabase
          .from("matches")
          .select("user1_id, user2_id")
          .eq("id", matchId)
          .single();
        if (!matchRow) return;
        const otherId = matchRow.user1_id === user.id ? matchRow.user2_id : matchRow.user1_id;
        const { data } = await supabase
          .from("profiles")
          .select("name, photos, gender")
          .eq("id", otherId)
          .single();
        if (data) setOtherProfile(data);
      } catch (e) {
        console.error("Error fetching other profile", e);
      }
    };
    loadOther();
  }, [user, matchId]);

  // Auto-redirect to chat for all cases except explicit man-woman pairs
  useEffect(() => {
    if (!myProfile || !matchId) return;

    const norm = (g?: string) => g?.toLowerCase()?.trim();
    const isMale = (g?: string) => ["homem", "masculino", "male", "m", "masc"].includes(norm(g) || "");
    const isFemale = (g?: string) => ["mulher", "feminino", "female", "f", "fem"].includes(norm(g) || "");

    const myG = myProfile.gender;
    const otherG = (otherProfile?.gender ?? matchProfile?.gender);

    const isHetero = (isMale(myG) && isFemale(otherG)) || (isFemale(myG) && isMale(otherG));

    if (!isHetero) {
      setTimeout(() => {
        navigate(`/chat/${matchId}`);
      }, 2000);
    }
  }, [myProfile, otherProfile, matchProfile, matchId, navigate]);

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
    
  const other = otherProfile || matchProfile;

  const matchPhoto = other?.photos?.[0] 
    ? getPhotoUrl(other.photos[0]) 
    : "https://api.dicebear.com/7.x/avataaars/svg?seed=Match";

  const norm = (g?: string) => g?.toLowerCase()?.trim();
  const isMale = (g?: string) => ["homem", "masculino", "male", "m", "masc"].includes(norm(g) || "");
  const isFemale = (g?: string) => ["mulher", "feminino", "female", "f", "fem"].includes(norm(g) || "");

  const myG = myProfile?.gender;
  const otherG = other?.gender;

  const isHetero = (isMale(myG) && isFemale(otherG)) || (isFemale(myG) && isMale(otherG));
  const canDirectChat = !isHetero;
  const isWoman = isFemale(myG);
  const conversationStarted = matchData?.conversation_started || false;

  const handleSendMessage = () => {
    // Only women can start conversation, men must wait
    if (!isWoman && !conversationStarted) {
      return; // Block access for men if no conversation yet
    }
    
    if (matchId) {
      navigate(`/chat/${matchId}`);
    } else {
      navigate("/matches");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 relative overflow-hidden safe-area-all">
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
              alt={other?.name || "Match"}
              loading="lazy"
              className="w-36 h-36 rounded-full object-cover ring-4 ring-white shadow-elevated"
            />
          </div>
        </div>
      </div>

      {/* Match Text */}
      <h2 className="text-4xl font-bold text-black-soft mb-2">É um Match!</h2>
      <p className="text-lg text-gray-medium text-center mb-12 max-w-sm">
        Você e {other?.name || "essa pessoa"} deram like um no outro!
      </p>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-4">
        {canDirectChat ? (
          <div className="w-full p-6 bg-coral/10 rounded-2xl text-center">
            <p className="text-lg text-coral font-medium mb-2">
              🎉 Redirecionando para o chat...
            </p>
            <p className="text-sm text-gray-medium">
              Vocês já podem conversar!
            </p>
          </div>
        ) : isWoman ? (
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
