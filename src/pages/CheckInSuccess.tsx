import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { NearbyUsersCard } from "@/components/NearbyUsersCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NearbyUser {
  id: string;
  name: string;
  age: number;
  profession: string | null;
  photos: string[];
}

interface CheckInData {
  location_id: string;
  location_name: string;
  checked_in_at: string;
}

const CheckInSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("");
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCheckInInfo();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to realtime updates on profiles table
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchCheckInInfo();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchCheckInInfo = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's current check-in
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_check_in')
        .eq('id', user.id)
        .single();

      if (!profile?.current_check_in) {
        navigate("/map");
        return;
      }

      const checkInData = profile.current_check_in as unknown as CheckInData;
      const locationId = checkInData.location_id;
      setLocationName(checkInData.location_name);

      // Get users at the same location
      const { data, error } = await supabase.functions.invoke('get-users-at-location', {
        body: { locationId },
      });

      if (error) throw error;

      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching check-in info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      const { error } = await supabase.functions.invoke('checkout');

      if (error) throw error;

      toast({
        title: "Check-out realizado!",
        description: "Você saiu do local",
      });

      navigate("/map");
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer check-out.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Confetti Animation - Reduzido e mais rápido */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-[fall_1.5s_ease-in-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                fontSize: `${Math.random() * 15 + 10}px`,
              }}
            >
              {['🎉', '🎊', '✨'][Math.floor(Math.random() * 3)]}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Success Animation Header */}
        <div className="bg-gradient-to-br from-coral via-pink-deep to-coral/80 text-white p-8">
          <div className="text-center space-y-6">
            {/* Check Icon with Animation - Otimizado */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute w-32 h-32 bg-white/20 rounded-full animate-[ping_1s_ease-out]"></div>
              <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center animate-scale-in shadow-2xl">
                <Check className="w-20 h-20 text-coral" strokeWidth={4} />
              </div>
            </div>
            
            <div className="animate-fade-in">
              <h1 className="text-5xl font-fredoka font-bold mb-3">
                Check!
              </h1>
              <p className="text-xl font-medium opacity-95 max-w-md mx-auto leading-relaxed">
                Agora, você pode ver quem está no mesmo local que você.
              </p>
            </div>
          </div>
            
            {/* Location Badge */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30">
                <span className="text-lg font-semibold">{locationName}</span>
              </div>
              {users.length > 0 && (
                <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full">
                  <span className="w-2 h-2 rounded-full bg-mint-green animate-pulse-soft"></span>
                  <span className="text-sm font-medium">
                    {users.length} {users.length === 1 ? 'pessoa' : 'pessoas'} aqui agora
                  </span>
                </div>
              )}
            </div>
          </div>

        {/* Content with stagger animation */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-dark">
                  Pessoas por perto
                </h2>
                <div className="px-3 py-1 bg-primary/10 rounded-full">
                  <span className="text-sm font-semibold text-primary">
                    {users.length} {users.length === 1 ? 'perfil' : 'perfis'}
                  </span>
                </div>
              </div>
              <NearbyUsersCard users={users} />
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-5xl mb-4">👋</div>
              <h3 className="text-xl font-semibold text-gray-dark mb-2">
                Você é o primeiro aqui!
              </h3>
              <p className="text-gray-medium">
                Outras pessoas aparecerão quando fizerem check-in
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions with improved styling */}
      <div className="p-6 bg-background border-t shadow-elevated space-y-3">
        <Button
          onClick={() => navigate("/discovery")}
          className="w-full h-14 text-base font-semibold shadow-button hover:shadow-elevated transition-all hover:scale-[1.02]"
        >
          🔍 Descobrir Mais Perfis
        </Button>
        <Button
          onClick={handleCheckOut}
          variant="outline"
          className="w-full h-14 text-base font-semibold border-2 hover:bg-gray-50 transition-all hover:scale-[1.02]"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Fazer Check-out
        </Button>
      </div>
    </div>
  );
};

export default CheckInSuccess;
