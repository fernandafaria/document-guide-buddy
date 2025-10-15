import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Discovery = () => {
  const navigate = useNavigate();

  const mockUsers = [
    {
      id: 1,
      name: "Carlos",
      age: 32,
      profession: "Engineer",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      interests: ["Music", "Travel", "Sports"],
      expiresIn: "25 min",
    },
    {
      id: 2,
      name: "Ana",
      age: 28,
      profession: "Designer",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      interests: ["Art", "Coffee", "Reading"],
      expiresIn: "18 min",
    },
    {
      id: 3,
      name: "Rafael",
      age: 30,
      profession: "Developer",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rafael",
      interests: ["Tech", "Gaming", "Food"],
      expiresIn: "12 min",
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-light">
        <h1 className="text-3xl font-bold text-black-soft">Descobrir</h1>
      </div>

      {/* Quick Filters */}
      <div className="px-6 py-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <Badge className="px-4 py-2 bg-coral text-white rounded-full text-base">
            Date
          </Badge>
          <Badge className="px-4 py-2 bg-gray-light text-gray-dark rounded-full text-base">
            Amizade
          </Badge>
          <Badge className="px-4 py-2 bg-gray-light text-gray-dark rounded-full text-base">
            25-35 anos
          </Badge>
        </div>
      </div>

      {/* User Cards */}
      <div className="px-6 space-y-4">
        {mockUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => navigate(`/profile/${user.id}`)}
            className="bg-white rounded-2xl shadow-card p-4 flex gap-4 cursor-pointer hover:shadow-elevated transition-shadow relative"
          >
            {/* Photo */}
            <img
              src={user.photo}
              alt={user.name}
              className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
            />

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-black-soft">
                  {user.name}, {user.age}
                </h3>
                <p className="text-gray-medium mb-2">{user.profession}</p>
                
                {/* Interest Tags */}
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, idx) => (
                    <Badge
                      key={idx}
                      className={`px-3 py-1 text-sm ${
                        idx === 0
                          ? "bg-coral"
                          : idx === 1
                          ? "bg-turquoise"
                          : "bg-lavender"
                      } text-white`}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Icons */}
              <div className="flex gap-3 text-lg">
                <span>🍷</span>
                <span>🎓</span>
                <span>🎵</span>
              </div>
            </div>

            {/* Expiry Badge */}
            <Badge className="absolute top-4 right-4 bg-yellow-soft text-black-soft px-3 py-1 rounded-lg text-xs font-medium">
              Expira em {user.expiresIn}
            </Badge>
          </div>
        ))}
      </div>

      {/* Floating Filter Button */}
      <Button
        size="icon"
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-elevated"
        onClick={() => console.log("Open filters")}
      >
        <Filter />
      </Button>

      {/* Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-light flex items-center justify-around px-6">
        <button
          className="flex flex-col items-center gap-1 text-gray-medium"
          onClick={() => navigate("/map")}
        >
          <MapPin className="w-6 h-6" />
          <span className="text-xs font-medium">Mapa</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-coral">
          <span className="text-2xl">❤️</span>
          <span className="text-xs font-medium">Descobrir</span>
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

export default Discovery;
