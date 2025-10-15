import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, MapPin, Edit, User, Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  intentions: string[];
  photos: string[];
  profession?: string;
  education?: string;
  city?: string;
  state?: string;
  languages?: string[];
  musical_styles?: string[];
  alcohol?: string;
  religion?: string;
  zodiac_sign?: string;
  about_me?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          // Perfil não existe, redirecionar para completar cadastro
          console.log("Profile not found, redirecting to signup");
          navigate("/signup-info");
          return;
        }

        setProfile(data as UserProfile);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o perfil",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-coral mb-4">YO!</h1>
          <p className="text-gray-medium">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-medium">Perfil não encontrado</p>
        </div>
      </div>
    );
  }

  const getPhotoUrl = (photoPath: string) => {
    if (!photoPath) return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(photoPath);
    return data.publicUrl;
  };

  const mainPhoto = profile.photos?.[0] 
    ? getPhotoUrl(profile.photos[0])
    : "https://api.dicebear.com/7.x/avataaars/svg?seed=User";

  const getIntentionLabel = (intention: string) => {
    const labels: { [key: string]: string } = {
      date: "🔍 Date",
      friends: "👋 Amizades",
      networking: "💼 Networking",
      travel: "✈️ Viagens"
    };
    return labels[intention] || intention;
  };

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

      {/* Profile Photos */}
      <div className="px-6 mb-6">
        <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-card">
          <img
            src={mainPhoto}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          <button 
            onClick={() => navigate("/settings")}
            className="absolute bottom-4 right-4 w-12 h-12 bg-coral rounded-full flex items-center justify-center shadow-button hover:scale-105 transition-transform"
          >
            <Edit className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="px-6 mb-6">
        <h2 className="text-3xl font-bold text-black-soft mb-1">
          {profile.name}, {profile.age}
        </h2>
        {profile.profession && (
          <p className="text-lg text-gray-medium">{profile.profession}</p>
        )}
        {profile.city && profile.state && (
          <p className="text-base text-gray-medium flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {profile.city}, {profile.state}
          </p>
        )}
      </div>

      {/* About Me */}
      {profile.about_me && (
        <div className="px-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-coral to-pink-deep rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">💬</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-black-soft mb-2">
                Sobre mim
              </h3>
              <p className="text-gray-dark leading-relaxed">
                {profile.about_me}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Looking For */}
      {profile.intentions && profile.intentions.length > 0 && (
        <div className="px-6 mb-8">
          <h3 className="text-xl font-bold text-black-soft mb-4">
            Procurando por
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.intentions.map((intention) => (
              <Badge 
                key={intention} 
                className="px-4 py-2 bg-pink-deep text-white text-base"
              >
                {getIntentionLabel(intention)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Musical Styles */}
      {profile.musical_styles && profile.musical_styles.length > 0 && (
        <div className="px-6 mb-8">
          <h3 className="text-xl font-bold text-black-soft mb-4">
            🎵 Estilos Musicais
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.musical_styles.map((style) => (
              <Badge 
                key={style} 
                className="px-4 py-2 bg-lavender text-white text-base"
              >
                {style}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {profile.languages && profile.languages.length > 0 && (
        <div className="px-6 mb-8">
          <h3 className="text-xl font-bold text-black-soft mb-4">
            🌍 Idiomas
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((language) => (
              <Badge 
                key={language} 
                className="px-4 py-2 bg-turquoise text-white text-base"
              >
                {language}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle */}
      <div className="px-6 mb-8">
        <h3 className="text-xl font-bold text-black-soft mb-4">Estilo de Vida</h3>
        <div className="grid grid-cols-2 gap-4">
          {profile.alcohol && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍷</span>
              <span className="text-gray-dark">{profile.alcohol}</span>
            </div>
          )}
          {profile.education && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <span className="text-gray-dark">{profile.education}</span>
            </div>
          )}
          {profile.religion && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">✝️</span>
              <span className="text-gray-dark">{profile.religion}</span>
            </div>
          )}
          {profile.zodiac_sign && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">♒</span>
              <span className="text-gray-dark">{profile.zodiac_sign}</span>
            </div>
          )}
        </div>
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
        <button
          className="flex flex-col items-center gap-1 text-gray-medium transition-all hover:scale-110 hover:text-coral"
          onClick={() => navigate("/matches")}
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs font-medium">YO's</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-coral">
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
