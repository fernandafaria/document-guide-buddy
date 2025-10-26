import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import welcomeMap from "@/assets/welcome-map-hand.png";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col overflow-hidden">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
        {/* Logo */}
        <h1 className="text-7xl font-fredoka font-bold text-coral tracking-tight mb-2">
          Yo!
        </h1>
        
        {/* Slogan */}
        <p className="text-lg text-gray-700 font-semibold mb-1 text-center max-w-md">
          Conexões reais começam aqui
        </p>
        
        {/* Subtitle */}
        <p className="text-sm text-gray-medium mb-6 text-center max-w-sm px-4">
          Encontre pessoas incríveis nos lugares que você frequenta
        </p>

        {/* Map Image */}
        <div className="w-full max-w-[280px] aspect-square rounded-3xl overflow-hidden shadow-xl mb-6 ring-4 ring-coral/10">
          <img 
            src={welcomeMap} 
            alt="Mapa com marcador de coração" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full max-w-md mx-auto space-y-3 px-6 pb-8">
        <Button
          variant="default"
          className="w-full h-12 text-base font-semibold"
          onClick={() => navigate("/login")}
        >
          Cadastrar
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base font-semibold"
          onClick={() => navigate("/login")}
        >
          Entrar
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
