import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Users, Clock, Heart, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/BottomNav";

interface CheckIn {
  id: string;
  location_id: string;
  location_name: string;
  user_id: string;
  user_name: string;
  user_photo: string | null;
  checked_in_at: string;
  latitude: number;
  longitude: number;
}

const ActiveCheckIns = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActiveCheckIns();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to realtime updates on profiles table for check-ins
    const channel = supabase
      .channel('active-checkins')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchActiveCheckIns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchActiveCheckIns = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles with active check-ins
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name, photos, current_check_in')
        .not('current_check_in', 'is', null);

      if (error) throw error;

      const activeCheckIns: CheckIn[] = profiles
        ?.filter(profile => profile.current_check_in)
        .map(profile => {
          const checkInData = profile.current_check_in as any;
          return {
            id: `${profile.id}-${checkInData.location_id}`,
            location_id: checkInData.location_id || '',
            location_name: checkInData.location_name || 'Local desconhecido',
            user_id: profile.id,
            user_name: profile.name || 'Usuário',
            user_photo: profile.photos?.[0] || null,
            checked_in_at: checkInData.checked_in_at || new Date().toISOString(),
            latitude: checkInData.latitude || 0,
            longitude: checkInData.longitude || 0,
          };
        }) || [];

      console.log('Active check-ins loaded:', activeCheckIns.length);

      setCheckIns(activeCheckIns);
    } catch (error: any) {
      console.error('Error fetching active check-ins:', error);
      toast({
        title: "Erro ao carregar check-ins",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeSinceCheckIn = (checkedInAt: string) => {
    const now = new Date();
    const checkInTime = new Date(checkedInAt);
    const diffMs = now.getTime() - checkInTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `${diffMins} min atrás`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    return "Há mais de 1 dia";
  };

  const groupedCheckIns = checkIns.reduce((acc, checkIn) => {
    if (!acc[checkIn.location_id]) {
      acc[checkIn.location_id] = {
        location_name: checkIn.location_name,
        users: [],
      };
    }
    acc[checkIn.location_id].users.push(checkIn);
    return acc;
  }, {} as Record<string, { location_name: string; users: CheckIn[] }>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Check-ins Ativos</h1>
            <p className="text-sm text-muted-foreground">
              {checkIns.length} {checkIns.length === 1 ? 'pessoa' : 'pessoas'} ativa{checkIns.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {checkIns.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum check-in ativo</h3>
              <p className="text-muted-foreground mb-4">
                Seja o primeiro a fazer check-in em um local!
              </p>
              <Button onClick={() => navigate('/map')}>
                <MapPin className="w-4 h-4 mr-2" />
                Ver Mapa
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedCheckIns).map(([locationId, { location_name, users }]) => (
            <Card key={locationId} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="bg-gradient-primary p-4 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{location_name}</h3>
                      <div className="flex items-center gap-2 text-sm opacity-90">
                        <Users className="w-4 h-4" />
                        <span>{users.length} {users.length === 1 ? 'pessoa' : 'pessoas'}</span>
                      </div>
                    </div>
                    <MapPin className="w-5 h-5 opacity-80" />
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {users.map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <Avatar className="w-12 h-12 border-2 border-primary">
                        <AvatarImage src={checkIn.user_photo || undefined} alt={checkIn.user_name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {checkIn.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{checkIn.user_name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{getTimeSinceCheckIn(checkIn.checked_in_at)}</span>
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/profile/${checkIn.user_id}`)}
                      >
                        Ver Perfil
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ActiveCheckIns;
