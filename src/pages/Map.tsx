import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Map = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCheckIn = () => {
    navigate("/check-in-success");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-black-soft">YO!</h1>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-medium w-5 h-5" />
            <Input
              type="text"
              placeholder="Search event, bar, place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white border border-gray-light rounded-xl shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-light via-white to-mint/10">
        {/* Placeholder Map */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-4">🗺️</div>
            <p className="text-gray-medium text-lg">Map will load here</p>
            
            {/* Sample Location Markers */}
            <div className="mt-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-3 bg-white rounded-2xl shadow-card">
                <span className="text-4xl">👋</span>
                <div className="text-left">
                  <p className="font-semibold text-black-soft">Beach Bar</p>
                  <p className="text-sm text-gray-medium">3 pessoas ativas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Check-in Button */}
      <div className="p-6 bg-white border-t border-gray-light">
        <Button
          className="w-full h-14"
          onClick={handleCheckIn}
        >
          <MapPin className="mr-2" />
          Check-in
        </Button>
      </div>

      {/* Tab Bar */}
      <div className="h-16 bg-white border-t border-gray-light flex items-center justify-around px-6">
        <button className="flex flex-col items-center gap-1 text-coral">
          <MapPin className="w-6 h-6" />
          <span className="text-xs font-medium">Mapa</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-gray-medium"
          onClick={() => navigate("/matches")}
        >
          <span className="text-2xl">❤️</span>
          <span className="text-xs font-medium">Matches</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-gray-medium"
          onClick={() => navigate("/profile")}
        >
          <span className="text-2xl">👤</span>
          <span className="text-xs font-medium">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Map;
