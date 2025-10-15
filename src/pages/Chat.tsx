import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

const Chat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");

  const mockMessages = [
    {
      id: 1,
      sender: "them",
      type: "yo",
      text: "Ana sent a YO! 👋",
      time: "10:30",
    },
    {
      id: 2,
      sender: "them",
      type: "text",
      text: "Oi! Como você está?",
      time: "10:31",
    },
    {
      id: 3,
      sender: "me",
      type: "text",
      text: "Tudo ótimo! E você?",
      time: "10:32",
    },
    {
      id: 4,
      sender: "them",
      type: "text",
      text: "Também! Adorei seu perfil 😊",
      time: "10:33",
    },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: Implement send message
    console.log("Sending message:", message);
    setMessage("");
  };

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
        
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
          alt="Ana"
          className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
        />
        
        <h2 className="text-lg font-bold text-white flex-1">Ana</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
        {mockMessages.map((msg) => (
          <div key={msg.id}>
            {msg.type === "yo" ? (
              <div className="flex justify-center">
                <div className="bg-yellow-soft px-6 py-3 rounded-2xl max-w-xs text-center">
                  <span className="text-2xl">👋</span>
                  <p className="text-sm text-black-soft font-medium mt-1">
                    {msg.text}
                  </p>
                </div>
              </div>
            ) : (
              <div className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] px-5 py-3 rounded-2xl ${
                    msg.sender === "me"
                      ? "bg-coral text-white rounded-tr-sm"
                      : "bg-gray-light text-black-soft rounded-tl-sm"
                  }`}
                >
                  <p className="text-base leading-relaxed">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "me" ? "text-white/70" : "text-gray-medium"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white border-t border-gray-light">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 h-12 bg-gray-light border-0 rounded-full px-5"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim()}
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
