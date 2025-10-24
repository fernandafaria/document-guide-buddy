import { MapPin, Users, Compass, Heart, User, Hand } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/map", icon: MapPin, label: "Mapa" },
    { path: "/active-checkins", icon: Users, label: "Check-ins" },
    { path: "/discovery", icon: Compass, label: "Descobrir" },
    { path: "/likes", icon: Heart, label: "Curtidas" },
    { path: "/matches", icon: Hand, label: "YO's" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-light flex items-center justify-around px-2 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <button
            key={item.path}
            className={`flex flex-col items-center gap-1 transition-all hover:scale-110 ${
              active ? "text-coral" : "text-gray-medium hover:text-coral"
            }`}
            onClick={() => navigate(item.path)}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
