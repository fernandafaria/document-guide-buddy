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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-6">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-2">🎉</div>
            <h1 className="text-3xl font-bold">Check-in realizado!</h1>
            <p className="text-lg opacity-90">{locationName}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <NearbyUsersCard users={users} />
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 bg-background border-t space-y-3">
        <Button
          onClick={() => navigate("/discovery")}
          className="w-full h-14"
        >
          Ver Todos os Perfis
        </Button>
        <Button
          onClick={handleCheckOut}
          variant="outline"
          className="w-full h-14"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Fazer Check-out
        </Button>
      </div>
    </div>
  );
};

export default CheckInSuccess;
