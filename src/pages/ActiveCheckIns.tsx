import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Users, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/BottomNav";
import { useGeolocation } from "@/hooks/useGeolocation";

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

interface Location {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  active_users_count: number;
  distance?: number;
  type?: string;
}

const ActiveCheckIns = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationUsers, setLocationUsers] = useState<Record<string, CheckIn[]>>({});
  const { latitude, longitude } = useGeolocation();

  useEffect(() => {
    if (user && latitude && longitude) {
      fetchNearbyLocations();
    }
  }, [user, latitude, longitude]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to realtime updates on profiles table
    const channel = supabase
      .channel('popular-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          if (latitude && longitude) {
            fetchNearbyLocations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, latitude, longitude]);

  const fetchNearbyLocations = async () => {
    if (!latitude || !longitude) return;

    try {
      setLoading(true);
      
      // Fetch nearby locations
      const { data, error } = await supabase.functions.invoke('get-nearby-locations', {
        body: { latitude, longitude, radius: 10 },
      });

      if (error) throw error;

      const allLocations: Location[] = data.locations || [];
      
      // Filter and sort by active users count, get top 5
      const topLocations = allLocations
        .filter(loc => loc.active_users_count > 0)
        .sort((a, b) => b.active_users_count - a.active_users_count)
        .slice(0, 5);

      setLocations(topLocations);

      // Fetch users for each location
      const usersData: Record<string, CheckIn[]> = {};
      
      for (const location of topLocations) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, photos, current_check_in')
          .not('current_check_in', 'is', null);

        if (profilesError) throw profilesError;

        const locationCheckIns: CheckIn[] = profiles
          ?.filter(profile => {
            const checkInData = profile.current_check_in as any;
            return checkInData?.location_id === location.id;
          })
          .map(profile => {
            const checkInData = profile.current_check_in as any;
            return {
              id: `${profile.id}-${checkInData.location_id}`,
              location_id: checkInData.location_id || '',
              location_name: checkInData.location_name || location.name,
              user_id: profile.id,
              user_name: profile.name || 'Usuário',
              user_photo: profile.photos?.[0] || null,
              checked_in_at: checkInData.checked_in_at || new Date().toISOString(),
              latitude: checkInData.latitude || location.latitude,
              longitude: checkInData.longitude || location.longitude,
            };
          }) || [];

        if (locationCheckIns.length > 0) {
          usersData[location.id] = locationCheckIns;
        }
      }

      setLocationUsers(usersData);
    } catch (error: any) {
      console.error('Error fetching nearby locations:', error);
      toast({
        title: "Erro ao carregar locais",
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 pb-24">
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
      <Header />
      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-24">

        {locations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum local popular</h3>
              <p className="text-muted-foreground mb-4">
                Não há locais com check-ins ativos próximos a você no momento.
              </p>
              <Button onClick={() => navigate('/map')}>
                <MapPin className="w-4 h-4 mr-2" />
                Ver Mapa
              </Button>
            </CardContent>
          </Card>
        ) : (
          locations.map((location, index) => {
            const users = locationUsers[location.id] || [];
            
            return (
              <Card key={location.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="bg-gradient-primary p-4 text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold">#{index + 1}</span>
                          <h3 className="font-semibold text-lg">{location.name}</h3>
                        </div>
                        {location.address && (
                          <p className="text-sm opacity-90 mb-2">{location.address}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm opacity-90">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{location.active_users_count} {location.active_users_count === 1 ? 'pessoa' : 'pessoas'}</span>
                          </div>
                          {location.distance !== undefined && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {location.distance < 1000 
                                  ? `${Math.round(location.distance)}m de você` 
                                  : `${(location.distance / 1000).toFixed(1)}km de você`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {users.length > 0 && (
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
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ActiveCheckIns;
