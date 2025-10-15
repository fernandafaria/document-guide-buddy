import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-black-soft">YO!</h1>
        <button
          onClick={() => navigate("/settings")}
          className="text-gray-medium hover:text-black-soft transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Profile Photo */}
      <div className="flex justify-center py-6">
        <div className="relative">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
          <button className="absolute bottom-0 right-0 w-10 h-10 bg-coral rounded-full flex items-center justify-center shadow-button">
            <span className="text-white text-xl">📷</span>
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-black-soft mb-1">Ana, 28</h2>
        <p className="text-lg text-gray-medium">Designer</p>
      </div>

      {/* Edit Button */}
      <div className="px-6 mb-8">
        <Button variant="outline" className="w-3/5 mx-auto block">
          Edit Profile
        </Button>
      </div>

      {/* About Me */}
      <div className="px-6 mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-coral to-pink-deep rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-4xl">☕</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-black-soft mb-2">
              About me
            </h3>
            <p className="text-gray-dark leading-relaxed">
              Love exploring new places and meeting interesting people. Always
              up for good conversation over coffee! ☕✨
            </p>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="px-6 mb-8">
        <h3 className="text-xl font-bold text-black-soft mb-4">Interests</h3>
        <div className="flex flex-wrap gap-2">
          <Badge className="px-4 py-2 bg-coral text-white text-base">
            Music
          </Badge>
          <Badge className="px-4 py-2 bg-turquoise text-white text-base">
            Travel
          </Badge>
          <Badge className="px-4 py-2 bg-lavender text-white text-base">
            Design
          </Badge>
          <Badge className="px-4 py-2 bg-mint text-white text-base">
            Coffee
          </Badge>
        </div>
      </div>

      {/* Lifestyle */}
      <div className="px-6 mb-8">
        <h3 className="text-xl font-bold text-black-soft mb-4">Lifestyle</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍷</span>
            <span className="text-gray-dark">Socialmente</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-gray-dark">Superior</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✝️</span>
            <span className="text-gray-dark">Católica</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">♒</span>
            <span className="text-gray-dark">Aquário</span>
          </div>
        </div>
      </div>

      {/* Looking For */}
      <div className="px-6 mb-8">
        <h3 className="text-xl font-bold text-black-soft mb-4">
          Procurando por
        </h3>
        <div className="flex gap-2">
          <Badge className="px-4 py-2 bg-pink-deep text-white text-base">
            🔍 Date
          </Badge>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-light flex items-center justify-around px-6">
        <button
          className="flex flex-col items-center gap-1 text-gray-medium"
          onClick={() => navigate("/map")}
        >
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
        <button className="flex flex-col items-center gap-1 text-coral">
          <span className="text-2xl">👤</span>
          <span className="text-xs font-medium">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
