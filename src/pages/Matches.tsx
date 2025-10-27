import { MapPin, Heart, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";

const Matches = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { matches, loading } = useChat();
  const [myGender, setMyGender] = useState<string>("");

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("gender")
        .eq("id", user.id)
        .single();
      setMyGender(data?.gender || "");
    };
    fetchMyProfile();
  }, [user]);

  const getPhotoUrl = (photoPath: string) => {
    if (!photoPath) return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
    // If already a full URL, return as is. Otherwise, build public URL from storage.
    if (/^https?:\/\//i.test(photoPath)) return photoPath;
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(photoPath);
    return data.publicUrl;
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  };

  const getLastMessageText = (match: typeof matches[0]) => {
    if (!match.lastMessage) {
      return "Aguardando você começar a conversa";
    }
    
    if (match.lastMessage.type === "yo") {
      return "Enviou um YO! 👋";
    }
    
    return match.lastMessage.message || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <Header />
        <div className="divide-y divide-gray-light">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header />

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="px-6 py-12 text-center animate-fade-in">
          <p className="text-gray-medium text-lg">
            Você ainda não tem matches
          </p>
          <p className="text-gray-medium text-sm mt-2">
            Faça check-in em locais e envie YO's para começar a conversar!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-light">
          {matches.map((match, index) => {
            const photo = match.otherUser.photos?.[0] 
              ? getPhotoUrl(match.otherUser.photos[0])
              : "https://api.dicebear.com/7.x/avataaars/svg?seed=User";

            const myGenderLower = myGender?.toLowerCase();
            const otherGenderLower = match.otherUser.gender?.toLowerCase();

            const norm = (g?: string) => g?.trim();
            const isMale = (g?: string) => ["homem", "masculino", "male", "m", "masc"].includes(norm(g || ""));
            const isFemale = (g?: string) => ["mulher", "feminino", "female", "f", "fem"].includes(norm(g || ""));

            const heteroPair = (isMale(myGenderLower) && isFemale(otherGenderLower)) || (isFemale(myGenderLower) && isMale(otherGenderLower));

            // Chat liberado para qualquer caso que não seja homem-mulher; mulheres sempre podem iniciar em hetero
            const canOpenChat = !heteroPair || isFemale(myGenderLower) || match.conversation_started;

            return (
              <div
                key={match.id}
                className="px-6 py-4 flex items-center gap-4 transition-all duration-200 animate-scale-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Photo */}
                <div className="relative">
                  <img
                    src={photo}
                    alt={match.otherUser.name}
                    loading="lazy"
                    className="w-16 h-16 rounded-full object-cover transition-transform duration-200 hover:scale-110"
                  />
                  {match.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-coral rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {match.unreadCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    if (canOpenChat) {
                      navigate(`/chat/${match.id}`);
                    }
                  }}
                >
                  <h3 className="text-lg font-bold text-black-soft">
                    {match.otherUser.name}
                  </h3>
                  <p
                    className={`text-base truncate ${
                      !match.lastMessage
                        ? "text-gray-medium italic"
                        : match.lastMessage.type === "yo"
                        ? "text-coral font-medium"
                        : "text-black-soft"
                    }`}
                  >
                    {!canOpenChat && !match.conversation_started 
                      ? "⏳ Aguardando iniciar..." 
                      : getLastMessageText(match)}
                  </p>
                </div>

                {/* Action Button or Time */}
                {!canOpenChat && !match.conversation_started ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/profile/${match.otherUser.id}`)}
                    className="whitespace-nowrap"
                  >
                    Ver Perfil
                  </Button>
                ) : match.last_activity ? (
                  <span className="text-sm text-gray-medium whitespace-nowrap">
                    {formatTime(match.last_activity)}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Matches;
