import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import welcomeMap from "@/assets/welcome-street-map.jpg";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between px-6 py-12">
      {/* Logo */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-[80px] font-fredoka font-bold text-coral tracking-tight">
          Yo!
        </h1>
      </div>

      {/* Map with Heart Marker */}
      <div className="w-full max-w-[300px] aspect-square mb-12 rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src={welcomeMap} 
          alt="Mapa com marcador de coração" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Buttons */}
      <div className="w-full max-w-md space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/login")}
        >
          Login
        </Button>
        <Button
          variant="default"
          className="w-full"
          onClick={() => navigate("/login")}
        >
          Sign Up
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
