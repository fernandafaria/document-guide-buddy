import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Clock, Award, History } from "lucide-react";
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

interface CheckInHistoryItem {
  location_id: string;
  location_name: string;
  checked_in_at: string;
  checked_out_at: string | null;
  latitude: number;
  longitude: number;
}

const ActiveCheckIns = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationUsers, setLocationUsers] = useState<Record<string, CheckIn[]>>({});
  const [history, setHistory] = useState<CheckInHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCheckIns: 0,
    uniqueLocations: 0,
    favoriteLocation: '',
  });
  const { latitude, longitude } = useGeolocation();

  useEffect(() => {
    if (user && latitude && longitude) {
      fetchNearbyLocations();
    }
  }, [user, latitude, longitude]);

  useEffect(() => {
    if (user) {
      fetchCheckInHistory();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

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
      
      const [locationsResponse, profilesResponse] = await Promise.all([
        supabase.functions.invoke('get-nearby-locations', {
          body: { latitude, longitude, radius: 10 },
        }),
        supabase
          .from('profiles')
          .select('id, name, photos, current_check_in')
          .not('current_check_in', 'is', null)
      ]);

      if (locationsResponse.error) throw locationsResponse.error;
      if (profilesResponse.error) throw profilesResponse.error;

      const allLocations: Location[] = locationsResponse.data.locations || [];
      const allProfiles = profilesResponse.data || [];
      
      const topLocations = allLocations
        .filter(loc => loc.active_users_count > 0)
        .sort((a, b) => b.active_users_count - a.active_users_count)
        .slice(0, 5);

      setLocations(topLocations);

      const usersData: Record<string, CheckIn[]> = {};
      
      for (const location of topLocations) {
        const locationCheckIns: CheckIn[] = allProfiles
          .filter(profile => {
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
          });

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

  const fetchCheckInHistory = async () => {
    try {
      setHistoryLoading(true);
      
      // Simular histórico (em produção, você teria uma tabela check_in_history)
      const mockHistory: CheckInHistoryItem[] = [
        {
          location_id: '1',
          location_name: "D'Villas Bar",
          checked_in_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          checked_out_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          latitude: -23.5590986,
          longitude: -46.7815891,
        },
      ];

      setHistory(mockHistory);
      
      const uniqueLocs = new Set(mockHistory.map(h => h.location_id)).size;
      setStats({
        totalCheckIns: mockHistory.length,
        uniqueLocations: uniqueLocs,
        favoriteLocation: mockHistory[0]?.location_name || 'Nenhum',
      });
    } catch (error: any) {
      console.error('Error fetching check-in history:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
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

  const formatDuration = (checkedIn: string, checkedOut: string | null) => {
    if (!checkedOut) return 'Em andamento';
    
    const duration = new Date(checkedOut).getTime() - new Date(checkedIn).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) return 'Hoje';
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
    
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const renderActiveLocations = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (locations.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum local popular</h3>
            <p className="text-muted-foreground mb-4">
              Não há locais com check-in ativos próximos a você no momento.
            </p>
            <Button onClick={() => navigate('/map')}>
              <MapPin className="w-4 h-4 mr-2" />
              Ver Mapa
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {locations.map((location, index) => {
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
        })}
      </div>
    );
  };

  const renderHistory = () => {
    if (historyLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalCheckIns}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.uniqueLocations}</div>
              <div className="text-xs text-muted-foreground">Locais</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
              <div className="text-xs text-muted-foreground">Explorador</div>
            </CardContent>
          </Card>
        </div>

        {/* Local Favorito */}
        {stats.favoriteLocation && stats.favoriteLocation !== 'Nenhum' && (
          <Card className="bg-gradient-primary text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">
                Local Mais Visitado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold">{stats.favoriteLocation}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Últimos Check-ins</h2>
          
          {history.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum check-in ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Faça seu primeiro check-in para começar seu histórico!
                </p>
                <Button onClick={() => navigate('/map')}>
                  Ir para o Mapa
                </Button>
              </CardContent>
            </Card>
          ) : (
            history.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.location_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(item.checked_in_at)}</span>
                        <span>•</span>
                        <span>{formatDuration(item.checked_in_at, item.checked_out_at)}</span>
                      </div>
                    </div>
                    {!item.checked_out_at && (
                      <Badge variant="default" className="bg-green-500">
                        Ativo
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-2xl mx-auto p-4 pb-bottom-nav">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Locais Ativos
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Meu Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-0">
            {renderActiveLocations()}
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            {renderHistory()}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default ActiveCheckIns;