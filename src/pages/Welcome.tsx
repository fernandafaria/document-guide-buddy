import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import welcomeMap from "@/assets/welcome-street-map.jpg";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
        {/* Logo */}
        <h1 className="text-[96px] font-fredoka font-bold text-coral tracking-tight mb-4">
          Yo!
        </h1>
        
        {/* Slogan */}
        <p className="text-2xl text-gray-700 font-semibold mb-3 text-center max-w-md">
          Conexões reais começam aqui
        </p>
        
        {/* Subtitle */}
        <p className="text-base text-gray-medium mb-12 text-center max-w-sm px-4">
          Encontre pessoas incríveis nos lugares que você frequenta
        </p>

        {/* Map Image */}
        <div className="w-full max-w-[340px] aspect-square rounded-[32px] overflow-hidden shadow-xl mb-8 ring-4 ring-coral/10">
          <img 
            src={welcomeMap} 
            alt="Mapa com marcador de coração" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full max-w-md mx-auto space-y-3 px-6 pb-12">
        <Button
          variant="default"
          size="lg"
          className="w-full h-14 text-lg font-semibold"
          onClick={() => navigate("/login")}
        >
          Cadastrar
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full h-14 text-lg font-semibold"
          onClick={() => navigate("/login")}
        >
          Entrar
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
