import { Input } from "@/components/ui/input";
import { Search, MapPin, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapView } from "@/components/MapView";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Location {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  active_users_count: number;
  distance?: number;
}

const Map = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    if (geoError) {
      toast({
        title: "Localização desativada",
        description: "Mostrando locais próximos de São Paulo. Ative sua localização para ver locais perto de você.",
      });
    }
  }, [geoError]);

  useEffect(() => {
    if (user) {
      // Fetch locations even without geolocation
      if (latitude && longitude) {
        fetchNearbyLocations();
      } else {
        // Use default location (São Paulo) if geolocation is not available
        fetchNearbyLocationsDefault();
      }
      checkUserCheckInStatus();
    }
  }, [latitude, longitude, user]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to realtime updates on locations table
    const channel = supabase
      .channel('locations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'locations',
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

  const checkUserCheckInStatus = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('current_check_in')
      .eq('id', user.id)
      .single();

    setIsCheckedIn(!!profile?.current_check_in);
  };

  const fetchNearbyLocations = async () => {
    if (!latitude || !longitude) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-nearby-locations', {
        body: { latitude, longitude, radius: 10 },
      });

      if (error) throw error;

      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os locais próximos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyLocationsDefault = async () => {
    // Use São Paulo coordinates as default
    const defaultLat = -23.5505;
    const defaultLng = -46.6333;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-nearby-locations', {
        body: { latitude: defaultLat, longitude: defaultLng, radius: 50 },
      });

      if (error) throw error;

      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os locais próximos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (location: Location) => {
    if (!latitude || !longitude) {
      toast({
        title: "Erro",
        description: "Localização não disponível",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-in', {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
          address: location.address,
        },
      });

      if (error) throw error;

      toast({
        title: "Check-in realizado!",
        description: `Você fez check-in em ${location.name}`,
      });

      setIsCheckedIn(true);
      navigate("/check-in-success");
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer check-in. Tente novamente.",
        variant: "destructive",
      });
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

      setIsCheckedIn(false);
      fetchNearbyLocations();
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer check-out. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-background shadow-sm border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold">YO!</h1>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar local..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
        {isCheckedIn && (
          <div className="mt-3 flex items-center justify-between bg-primary/10 p-3 rounded-lg">
            <span className="text-sm font-medium">Você está com check-in ativo</span>
            <Button onClick={handleCheckOut} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Check-out
            </Button>
          </div>
        )}
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        {geoLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <MapView
            locations={filteredLocations}
            userLocation={latitude && longitude ? { latitude, longitude } : null}
            onCheckIn={handleCheckIn}
          />
        )}
      </div>

      {/* Tab Bar */}
      <div className="h-16 bg-background border-t flex items-center justify-around px-6">
        <button className="flex flex-col items-center gap-1 text-primary">
          <MapPin className="w-6 h-6" />
          <span className="text-xs font-medium">Mapa</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-muted-foreground"
          onClick={() => navigate("/matches")}
        >
          <span className="text-2xl">❤️</span>
          <span className="text-xs font-medium">Matches</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-muted-foreground"
          onClick={() => navigate("/profile")}
        >
          <span className="text-2xl">👤</span>
          <span className="text-xs font-medium">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Map;
