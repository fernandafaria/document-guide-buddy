import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Filter, MapPin, Heart, User, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDiscovery, DiscoveryFilters } from "@/hooks/useDiscovery";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedFiltersModal, FilterState } from "@/components/AdvancedFiltersModal";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Discovery = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DiscoveryFilters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { users, loading, sendYo, skipUser } = useDiscovery(filters);

  const getPhotoUrl = (photoPath: string) => {
    if (!photoPath) return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(photoPath);
    return data.publicUrl;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "< 1 min";
    if (diffMins < 60) return `${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}min`;
  };

  const handleApplyFilters = (modalFilters: FilterState) => {
    // Convert FilterState to DiscoveryFilters
    const discoveryFilters: DiscoveryFilters = {
      intentions: modalFilters.intentions.map(i => i.toLowerCase()),
      genders: modalFilters.genders,
      minAge: modalFilters.ageRange[0],
      maxAge: modalFilters.ageRange[1],
      education: modalFilters.education[0], // Take first selected education
      alcohol: modalFilters.alcohol[0], // Take first selected alcohol option
      musicalStyles: modalFilters.musicStyles,
      languages: modalFilters.languages,
    };
    
    setFilters(discoveryFilters);
    setFiltersOpen(false);
  };

  // Convert DiscoveryFilters to FilterState for modal
  const getCurrentFiltersForModal = (): Partial<FilterState> => {
    return {
      intentions: filters.intentions?.map(i => i.charAt(0).toUpperCase() + i.slice(1)) || [],
      genders: filters.genders || [],
      ageRange: [filters.minAge || 18, filters.maxAge || 50],
      education: filters.education ? [filters.education] : [],
      alcohol: filters.alcohol ? [filters.alcohol] : [],
      musicStyles: filters.musicalStyles || [],
      languages: filters.languages || [],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pb-20">
        <p className="text-gray-medium">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header />

      {/* Quick Filters */}
      {(filters.intentions || filters.minAge || filters.maxAge) && (
        <div className="px-6 py-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max items-center">
            {filters.intentions?.map((intention) => (
              <Badge key={intention} className="px-4 py-2 bg-coral text-white rounded-full text-base">
                {intention === "date" ? "🔍 Date" : intention === "friends" ? "👋 Amizades" : intention}
              </Badge>
            ))}
            {filters.minAge && filters.maxAge && (
              <Badge className="px-4 py-2 bg-turquoise text-white rounded-full text-base">
                {filters.minAge}-{filters.maxAge} anos
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({})}
              className="text-gray-medium hover:text-black-soft"
            >
              Limpar filtros
            </Button>
          </div>
        </div>
      )}

      {/* User Cards */}
      {users.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-medium text-lg mb-2">
            Nenhum usuário disponível no momento
          </p>
          <p className="text-gray-medium text-sm">
            Faça check-in em um local ou ajuste seus filtros para ver mais pessoas
          </p>
        </div>
      ) : (
        <div className="px-6 space-y-4">
          {users.map((discoveryUser) => {
            const photo = discoveryUser.photos?.[0]
              ? getPhotoUrl(discoveryUser.photos[0])
              : "https://api.dicebear.com/7.x/avataaars/svg?seed=User";

            return (
              <div
                key={discoveryUser.id}
                className="bg-white rounded-2xl shadow-card p-4 flex gap-4 relative"
              >
                {/* Photo */}
                <div
                  onClick={() => navigate(`/profile/${discoveryUser.id}`)}
                  className="cursor-pointer"
                >
                  <img
                    src={photo}
                    alt={discoveryUser.name}
                    className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div onClick={() => navigate(`/profile/${discoveryUser.id}`)} className="cursor-pointer">
                    <h3 className="text-xl font-bold text-black-soft">
                      {discoveryUser.name}, {discoveryUser.age}
                    </h3>
                    {discoveryUser.profession && (
                      <p className="text-gray-medium mb-2">{discoveryUser.profession}</p>
                    )}

                    {/* Interest Tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {discoveryUser.musical_styles?.slice(0, 3).map((style, idx) => (
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
                          {style}
                        </Badge>
                      ))}
                    </div>

                    {/* Lifestyle Icons */}
                    <div className="flex gap-3 text-lg">
                      {discoveryUser.alcohol && <span>🍷</span>}
                      {discoveryUser.education && <span>🎓</span>}
                      {discoveryUser.musical_styles && discoveryUser.musical_styles.length > 0 && <span>🎵</span>}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => skipUser(discoveryUser.id)}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Pular
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => sendYo(discoveryUser.id, discoveryUser.current_check_in?.location_id)}
                      className="flex-1 bg-coral hover:bg-coral/90"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      YO!
                    </Button>
                  </div>
                </div>

                {/* Expiry Badge */}
                {discoveryUser.current_check_in && (
                  <Badge className="absolute top-4 right-4 bg-yellow-soft text-black-soft px-3 py-1 rounded-lg text-xs font-medium">
                    Expira em {getTimeRemaining(discoveryUser.current_check_in.expires_at)}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Filter Button */}
      <Button
        size="icon"
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-elevated"
        onClick={() => setFiltersOpen(true)}
      >
        <Filter />
      </Button>

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        onApply={handleApplyFilters}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Discovery;
