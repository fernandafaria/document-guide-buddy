import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Chat = () => {
  const navigate = useNavigate();
  const { id: matchId } = useParams();
  const { user } = useAuth();
  const { messages, matches, sending, sendMessage } = useChat(matchId);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Find the current match
  const currentMatch = matches.find((m) => m.id === matchId);
  
  // Conditional rendering if match not found
  if (!currentMatch || !currentMatch.otherUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="space-y-3 w-full max-w-md px-6">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-light rounded-full" />
            <div className="h-6 bg-gray-light rounded w-32" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className="animate-pulse bg-gray-light rounded-2xl h-16 w-48" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const otherUser = currentMatch.otherUser;
  const receiverId = currentMatch.user1_id === user?.id 
    ? currentMatch.user2_id 
    : currentMatch.user1_id;

  const getPhotoUrl = (photoPath: string) => {
    if (!photoPath) return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
    // If already a full URL, return as is. Otherwise, build public URL from storage.
    if (/^https?:\/\//i.test(photoPath)) return photoPath;
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(photoPath);
    return data.publicUrl;
  };

  const handleSend = async () => {
    if (!message.trim() || !matchId || !receiverId) return;
    
    await sendMessage(matchId, receiverId, message);
    setMessage("");
  };

  const formatTime = (date: string) => {
    return format(new Date(date), "HH:mm", { locale: ptBR });
  };


  const photo = otherUser.photos?.[0] 
    ? getPhotoUrl(otherUser.photos[0])
    : "https://api.dicebear.com/7.x/avataaars/svg?seed=User";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-header px-6 py-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => navigate(`/profile/${otherUser.id}`, { state: { fromChat: true } })}
          className="flex items-center gap-3 flex-1 hover:opacity-90 transition-opacity"
        >
          <img
            src={photo}
            alt={otherUser.name}
            loading="lazy"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white transition-transform duration-200 hover:scale-110"
          />
          
          <h2 className="text-lg font-bold text-white">{otherUser.name}</h2>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full animate-fade-in">
            <p className="text-gray-medium text-center">
              Envie a primeira mensagem para começar a conversa!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={msg.id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 20}ms` }}
            >
              {msg.type === "yo" ? (
                <div className="flex justify-center">
                  <div className="bg-yellow-soft px-6 py-3 rounded-2xl max-w-xs text-center animate-bounce-in">
                    <span className="text-2xl">👋</span>
                    <p className="text-sm text-black-soft font-medium mt-1">
                      {msg.sender_id === user?.id ? "Você enviou" : otherUser.name} enviou um YO!
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] px-5 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] ${
                      msg.sender_id === user?.id
                        ? "bg-coral text-white rounded-tr-sm"
                        : "bg-gray-light text-black-soft rounded-tl-sm"
                    }`}
                  >
                    <p className="text-base leading-relaxed">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender_id === user?.id ? "text-white/70" : "text-gray-medium"
                      }`}
                    >
                      {formatTime(msg.sent_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white border-t border-gray-light">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
            disabled={false}
            className="flex-1 h-12 bg-gray-light border-0 rounded-full px-5"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="w-12 h-12 rounded-full"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
