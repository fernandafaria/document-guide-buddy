import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";

interface ProfileData {
  id: string;
  name: string;
  age?: number;
  profession?: string | null;
  photos?: string[] | null;
  about_me?: string | null;
  intentions?: string[] | null;
  alcohol?: string | null;
  education?: string | null;
  religion?: string | null;
  zodiac_sign?: string | null;
}

const ProfileDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeId, setLikeId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fromChat = location.state?.fromChat || false;
  const fromCheckIn = location.state?.fromCheckIn || false;

  useEffect(() => {
    const loadProfile = async () => {
      if (!id || !user) return;
      setLoading(true);
      console.log("Loading profile for ID:", id);
      
      // Load profile data
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, name, age, profession, photos, about_me, intentions, alcohol, education, religion, zodiac_sign"
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
      } else {
        console.log("Profile loaded successfully:", data?.name);
      }
      
      setProfile(data as ProfileData | null);

      // Check if user has already liked this profile
      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq("from_user_id", user.id)
        .eq("to_user_id", id)
        .maybeSingle();

      if (existingLike) {
        setHasLiked(true);
        setLikeId(existingLike.id);
      }
      
      setLoading(false);
    };

    loadProfile();
  }, [id, user]);

  const handleLikeToggle = async () => {
    if (!id || !user) return;
    
    setLoading(true);
    try {
      if (hasLiked && likeId) {
        // Descurtir usando edge function
        const { error } = await supabase.functions.invoke('process-unlike', {
          body: {
            toUserId: id
          }
        });

        if (error) throw error;

        setHasLiked(false);
        setLikeId(null);
        console.log("Like removido com sucesso");
        
        // Navegar de volta para matches após descurtir
        navigate('/matches');
      } else {
        // Curtir - adicionar curtida
        // Get user's current location from profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('current_check_in')
          .eq('id', user.id)
          .maybeSingle();

        const checkIn = userProfile?.current_check_in as any;
        const locationId = checkIn?.location_id || 'unknown';

        const { data, error } = await supabase.functions.invoke('process-like', {
          body: {
            toUserId: id,
            locationId,
            action: 'like'
          }
        });

        if (error) throw error;

        // Buscar o ID da curtida recém criada
        const { data: newLike } = await supabase
          .from("likes")
          .select("id")
          .eq("from_user_id", user.id)
          .eq("to_user_id", id)
          .single();

        // Atualizar estado local
        setHasLiked(true);
        setLikeId(newLike?.id || null);

        // Navegar baseado no resultado
        if (data?.isMatch) {
          // Get match_id to navigate to chat
          const { data: matchData } = await supabase
            .from("matches")
            .select("id")
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .or(`user1_id.eq.${id},user2_id.eq.${id}`)
            .single();
          
          // É um match! Navegar para tela de match com os dados
          navigate("/match", { 
            state: { 
              matchProfile: profile,
              matchId: matchData?.id 
            } 
          });
        } else {
          // Não é match, mas curtida foi registrada
          console.log("Curtida enviada com sucesso, ID:", newLike?.id);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStart === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = dragStart - clientX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentPhoto < photos.length - 1) {
        setCurrentPhoto(prev => prev + 1);
      } else if (diff < 0 && currentPhoto > 0) {
        setCurrentPhoto(prev => prev - 1);
      }
      setDragStart(null);
    }
  };

  const handleDragEnd = () => {
    setDragStart(null);
  };

  const getPhotoUrl = (photoPath: string) => {
    if (!photoPath) return '';
    
    // Se já for uma URL completa, retorna direto
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    
    // Caso contrário, gera a URL pública do storage
    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(photoPath);
    return data.publicUrl;
  };

  const handleBackClick = async () => {
    // If coming from check-in success, go to discovery
    if (fromCheckIn) {
      navigate('/discovery', { replace: true });
      return;
    }

    // If coming from chat, check if match still exists
    if (fromChat && user && id) {
      const { data: matchExists } = await supabase
        .from("matches")
        .select("id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .or(`user1_id.eq.${id},user2_id.eq.${id}`)
        .maybeSingle();

      if (!matchExists) {
        // Match was removed (user unliked), redirect to matches page
        navigate('/matches', { replace: true });
        return;
      }
    }
    
    // Otherwise, go back normally
    navigate(-1);
  };

  const photos = profile?.photos && profile.photos.length > 0
    ? profile.photos.map(getPhotoUrl)
    : [
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          profile?.name || "User"
        )}`,
      ];

  return (
    <div className="min-h-screen bg-white safe-area-bottom">
      {/* Header with Notification Bell */}
      <Header />
      
      {/* Back Button - positioned below safe area */}
      <button
        onClick={handleBackClick}
        className="fixed z-10 w-12 h-12 bg-white rounded-full shadow-elevated flex items-center justify-center active:scale-95 transition-transform"
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 24px)',
          left: '24px',
        }}
        aria-label="Voltar"
      >
        <ArrowLeft className="w-6 h-6 text-black-soft" />
      </button>

      {/* Photo Gallery */}
      <div 
        ref={containerRef}
        className="relative h-[400px] bg-gray-light overflow-hidden select-none"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {loading ? (
          <Skeleton className="w-full h-[400px]" />
        ) : (
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${currentPhoto * 100}%)` }}
          >
            {photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`${profile?.name || "Usuário"} - ${idx + 1}`}
                className="w-full h-[400px] object-cover flex-shrink-0 pointer-events-none"
                loading={idx === 0 ? "eager" : "lazy"}
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || "User")}`;
                }}
              />
            ))}
          </div>
        )}

        {/* Photo Indicators */}
        {!loading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPhoto(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentPhoto ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
                aria-label={`Ir para foto ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !profile ? (
          <div className="text-center py-12">
            <p className="text-gray-medium text-lg">Perfil não encontrado</p>
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="mt-4"
            >
              Voltar
            </Button>
          </div>
        ) : (
          <>
            {/* Basic Info */}
            <div className="pb-4">
              <h1 className="text-[28px] font-bold text-black-soft mb-1">
                {profile?.name}
                {profile?.age ? `, ${profile.age}` : ""}
              </h1>
              {profile?.profession && (
                <p className="text-[17px] text-gray-medium">{profile.profession}</p>
              )}
            </div>

            {/* About Me */}
            {profile?.about_me && (
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-coral to-pink-deep rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl">💬</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-[22px] font-bold text-black-soft mb-2">
                    Sobre mim
                  </h3>
                  <p className="text-[17px] text-gray-dark leading-relaxed">
                    {profile.about_me}
                  </p>
                </div>
              </div>
            )}

            {/* Interests / Intentions */}
            {profile?.intentions && profile.intentions.length > 0 && (
              <div>
                <h3 className="text-[22px] font-bold text-black-soft mb-4">
                  Intenções
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.intentions.map((intent, idx) => (
                    <Badge key={idx} className="px-4 h-9 text-base rounded-[18px] bg-coral text-white">
                      {intent}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Lifestyle */}
            {(profile?.alcohol || profile?.education || profile?.religion || profile?.zodiac_sign) && (
              <div>
                <h3 className="text-[22px] font-bold text-black-soft mb-4">Estilo de vida</h3>
                <div className="grid grid-cols-2 gap-4">
                  {profile?.alcohol && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🍷</span>
                      <span className="text-[17px] text-gray-dark">{profile.alcohol}</span>
                    </div>
                  )}
                  {profile?.education && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎓</span>
                      <span className="text-[17px] text-gray-dark">{profile.education}</span>
                    </div>
                  )}
                  {profile?.religion && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✝️</span>
                      <span className="text-[17px] text-gray-dark">{profile.religion}</span>
                    </div>
                  )}
                  {profile?.zodiac_sign && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">♒</span>
                      <span className="text-[17px] text-gray-dark">{profile.zodiac_sign}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Like Button - apenas se não for o próprio perfil */}
      {user?.id !== id && (
        <div 
          className="fixed bottom-0 left-0 right-0 px-6 pt-4 bg-white border-t border-gray-light"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          }}
        >
          <Button 
            className={`w-full h-14 ${hasLiked ? 'bg-gray-medium hover:bg-gray-dark' : ''}`}
            onClick={handleLikeToggle} 
            disabled={loading}
          >
            <Heart className={`mr-2 ${hasLiked ? 'fill-white' : 'fill-white'}`} />
            {hasLiked ? 'Descurtir' : 'Curtir'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileDetail;
