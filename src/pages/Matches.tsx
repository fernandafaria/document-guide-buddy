import { MapPin, Heart, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Matches = () => {
  const navigate = useNavigate();

  const mockMatches = [
    {
      id: 1,
      name: "Ana",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      lastMessage: "Sent a YO! 👋",
      time: "2m",
      unread: 1,
      isYo: true,
    },
    {
      id: 2,
      name: "Sofia",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
      lastMessage: "Oi! Tudo bem?",
      time: "1h",
      unread: 0,
      isYo: false,
    },
    {
      id: 3,
      name: "Julia",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julia",
      lastMessage: "Waiting for you to start",
      time: "2d",
      unread: 0,
      isYo: false,
      waiting: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="px-6 py-6">
        <h1 className="text-3xl font-bold text-black-soft">YO's</h1>
      </div>

      {/* Matches List */}
      <div className="divide-y divide-gray-light">
        {mockMatches.map((match) => (
          <div
            key={match.id}
            onClick={() => navigate(`/chat/${match.id}`)}
            className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-light/50 transition-colors"
          >
            {/* Photo */}
            <div className="relative">
              <img
                src={match.photo}
                alt={match.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              {match.unread > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-coral rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {match.unread}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-black-soft">
                {match.name}
              </h3>
              <p
                className={`text-base ${
                  match.waiting
                    ? "text-gray-medium"
                    : match.isYo
                    ? "text-coral font-medium"
                    : "text-black-soft"
                }`}
              >
                {match.lastMessage}
              </p>
            </div>

            {/* Time */}
            <span className="text-sm text-gray-medium">{match.time}</span>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-light flex items-center justify-around px-6">
        <button
          className="flex flex-col items-center gap-1 text-gray-medium transition-all hover:scale-110 hover:text-coral"
          onClick={() => navigate("/map")}
        >
          <MapPin className="w-6 h-6" />
          <span className="text-xs font-medium">Mapa</span>
        </button>
        <button
          className="flex flex-col items-center gap-1 text-gray-medium transition-all hover:scale-110 hover:text-coral"
          onClick={() => navigate("/active-checkins")}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Check-ins</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-coral">
          <Heart className="w-6 h-6" />
          <span className="text-xs font-medium">YO's</span>
        </button>
        <button
          className="flex flex-col items-center gap-1 text-gray-medium transition-all hover:scale-110 hover:text-coral"
          onClick={() => navigate("/profile")}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Matches;
