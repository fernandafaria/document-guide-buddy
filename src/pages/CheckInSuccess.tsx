import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { NearbyUsersCard } from "@/components/NearbyUsersCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut } from "lucide-react";
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
    <div className="min-h-screen bg-background flex flex-col animate-fade-in">
      <div className="flex-1 overflow-y-auto">
        {/* Header with improved animation */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-8 animate-slide-down">
          <div className="text-center space-y-4">
            <div className="text-7xl mb-3 animate-bounce-in">🎉</div>
            <h1 className="text-4xl font-bold animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Check-in realizado!
            </h1>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-xl font-semibold opacity-95 mb-1">{locationName}</p>
              {users.length > 0 && (
                <div className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="w-2 h-2 rounded-full bg-mint-green animate-pulse-soft"></span>
                  <span className="text-sm font-medium">
                    {users.length} {users.length === 1 ? 'pessoa' : 'pessoas'} aqui agora
                  </span>
                </div>
              )}
            </div>
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
