import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import welcomeMap from "@/assets/welcome-street-map.jpg";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo Header */}
      <div className="w-full py-6 flex flex-col items-center justify-center border-b border-gray-light">
        <h1 className="text-[80px] font-fredoka font-bold text-coral tracking-tight">
          Yo!
        </h1>
        <p className="text-xl text-gray-medium font-medium mt-2 px-6 text-center">
          Conexões reais começam aqui
        </p>
      </div>

      {/* Map with Heart Marker */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[300px] aspect-square rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src={welcomeMap} 
          alt="Mapa com marcador de coração" 
          className="w-full h-full object-cover"
        />
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-md space-y-4 px-6 pb-12">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/login")}
        >
          Entrar
        </Button>
        <Button
          variant="default"
          className="w-full"
          onClick={() => navigate("/login")}
        >
          Cadastrar
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
