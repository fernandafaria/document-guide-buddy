import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";

const LikeSent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profileName = location.state?.profileName || "essa pessoa";

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Heart Animation */}
        <div className="relative mb-8">
          <div className="absolute w-32 h-32 bg-coral/20 rounded-full animate-ping"></div>
          <div className="relative w-32 h-32 bg-gradient-to-br from-coral to-pink-deep rounded-full flex items-center justify-center animate-scale-in shadow-2xl">
            <Heart className="w-20 h-20 text-white fill-white animate-pulse-soft" strokeWidth={2} />
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-4 max-w-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl font-fredoka font-bold text-gray-dark">
            Curtida enviada!
          </h1>
          <p className="text-lg text-gray-medium leading-relaxed">
            Você curtiu <span className="font-semibold text-coral">{profileName}</span>!
          </p>
          <p className="text-base text-gray-medium">
            Agora é só aguardar. Se {profileName} também curtir você, vocês terão um match! ✨
          </p>
        </div>

        {/* Illustration */}
        <div className="mt-8 text-8xl animate-bounce-in" style={{ animationDelay: '0.4s' }}>
          ⏳
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 bg-background border-t space-y-3">
        <Button
          onClick={() => navigate("/discovery")}
          className="w-full h-14 text-base font-semibold shadow-button hover:shadow-elevated transition-all hover:scale-[1.02]"
        >
          Continuar descobrindo
        </Button>
        <Button
          onClick={() => navigate("/map")}
          variant="outline"
          className="w-full h-14 text-base font-semibold border-2 hover:bg-gray-50 transition-all hover:scale-[1.02]"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar ao mapa
        </Button>
      </div>
    </div>
  );
};

export default LikeSent;
