import { Input } from "@/components/ui/input";
import { Search, MapPin, LogOut, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapView } from "@/components/MapView";
import { CheckInConfirmDialog } from "@/components/CheckInConfirmDialog";
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
  type?: string;
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

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedLocationForCheckIn, setSelectedLocationForCheckIn] = useState<Location | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  const handleCheckInRequest = (location: Location) => {
    console.log('handleCheckInRequest called with location:', location);
    setSelectedLocationForCheckIn(location);
    setConfirmDialogOpen(true);
    console.log('Dialog should open now');
  };

  const handleCheckInConfirm = async () => {
    if (!selectedLocationForCheckIn || !latitude || !longitude) {
      toast({
        title: "Erro",
        description: "Localização não disponível",
        variant: "destructive",
      });
      return;
    }

    try {
      setCheckingIn(true);
      const { data, error } = await supabase.functions.invoke('check-in', {
        body: {
          latitude: selectedLocationForCheckIn.latitude,
          longitude: selectedLocationForCheckIn.longitude,
          name: selectedLocationForCheckIn.name,
          address: selectedLocationForCheckIn.address,
        },
      });

      if (error) throw error;

      toast({
        title: "✨ Check-in realizado!",
        description: `Você está em ${selectedLocationForCheckIn.name}`,
      });

      setIsCheckedIn(true);
      setConfirmDialogOpen(false);
      
      // Small delay for better UX
      setTimeout(() => {
        navigate("/check-in-success");
      }, 300);
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer check-in. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCheckingIn(false);
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
      <div className="px-6 py-4 bg-gradient-header shadow-elevated border-b-0 relative z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">YO!</h1>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar local..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white/90 backdrop-blur-sm border-white/20 text-gray-dark placeholder:text-gray-medium focus:bg-white"
            />
          </div>
        </div>
        {isCheckedIn && (
          <div className="mt-3 flex items-center justify-between bg-white/20 backdrop-blur-sm p-3 rounded-lg border border-white/30">
            <span className="text-sm font-medium text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mint-green animate-pulse-soft"></span>
              Check-in ativo
            </span>
            <Button onClick={handleCheckOut} variant="secondary" size="sm" className="shadow-button">
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
            onCheckIn={handleCheckInRequest}
          />
        )}
        
        {/* Check-in Confirmation Dialog */}
        {selectedLocationForCheckIn && (
          <CheckInConfirmDialog
            open={confirmDialogOpen}
            onOpenChange={setConfirmDialogOpen}
            onConfirm={handleCheckInConfirm}
            locationName={selectedLocationForCheckIn.name}
            locationAddress={selectedLocationForCheckIn.address}
            activeUsersCount={selectedLocationForCheckIn.active_users_count}
            locationType={selectedLocationForCheckIn.type}
            isLoading={checkingIn}
          />
        )}
      </div>

      {/* Tab Bar */}
      <div className="h-16 bg-background border-t shadow-card flex items-center justify-around px-6">
        <button className="flex flex-col items-center gap-1 text-primary transition-transform hover:scale-110">
          <MapPin className="w-6 h-6" />
          <span className="text-xs font-medium">Mapa</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-muted-foreground transition-all hover:scale-110 hover:text-primary"
          onClick={() => navigate("/active-checkins")}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Check-ins</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-muted-foreground transition-all hover:scale-110 hover:text-primary"
          onClick={() => navigate("/matches")}
        >
          <span className="text-2xl">❤️</span>
          <span className="text-xs font-medium">Matches</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-muted-foreground transition-all hover:scale-110 hover:text-primary"
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
