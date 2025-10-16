import { MapPin, Heart, User, Users } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Matches = () => {
  const navigate = useNavigate();
  const { matches, loading } = useChat();

  const getPhotoUrl = (photoPath: string) => {
    if (!photoPath) return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-medium">Carregando matches...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header />

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-medium text-lg">
            Você ainda não tem matches
          </p>
          <p className="text-gray-medium text-sm mt-2">
            Faça check-in em locais e envie YO's para começar a conversar!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-light">
          {matches.map((match) => {
            const photo = match.otherUser.photos?.[0] 
              ? getPhotoUrl(match.otherUser.photos[0])
              : "https://api.dicebear.com/7.x/avataaars/svg?seed=User";

            return (
              <div
                key={match.id}
                onClick={() => navigate(`/chat/${match.id}`)}
                className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-light/50 transition-colors"
              >
                {/* Photo */}
                <div className="relative">
                  <img
                    src={photo}
                    alt={match.otherUser.name}
                    className="w-16 h-16 rounded-full object-cover"
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
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-black-soft">
                    {match.otherUser.name}
                  </h3>
                  <p
                    className={`text-base truncate ${
                      !match.lastMessage
                        ? "text-gray-medium"
                        : match.lastMessage.type === "yo"
                        ? "text-coral font-medium"
                        : "text-black-soft"
                    }`}
                  >
                    {getLastMessageText(match)}
                  </p>
                </div>

                {/* Time */}
                {match.last_activity && (
                  <span className="text-sm text-gray-medium whitespace-nowrap">
                    {formatTime(match.last_activity)}
                  </span>
                )}
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
